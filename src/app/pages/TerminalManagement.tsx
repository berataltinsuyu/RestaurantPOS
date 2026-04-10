import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { AccessDeniedState } from '../components/enterprise/AccessDeniedState';
import { EmptyState } from '../components/enterprise/EmptyState';
import { LoadingSkeleton } from '../components/enterprise/LoadingSkeleton';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import {
  Terminal,
  Wifi,
  WifiOff,
  Activity,
  Search,
  RefreshCw,
  Star,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  MonitorCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { terminalsApi } from '../lib/api';
import { getErrorMessage, isForbiddenError } from '../lib/error-utils';
import { formatCurrency, formatDateTime, localizeText, toUiTerminalStatus } from '../lib/mappers';
import type { PosTerminalDto } from '../types/api';

const formatRelativeTime = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return 'Şimdi';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} dakika önce`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} saat önce`;
  }

  return formatDateTime(value);
};

const getStatusClass = (status: PosTerminalDto['status']) => {
  switch (status) {
    case 'Bagli':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Islemde':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Cevrimdisi':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'Mesgul':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status: PosTerminalDto['status']) => {
  switch (status) {
    case 'Bagli':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'Islemde':
      return <Activity className="h-4 w-4 animate-pulse" />;
    case 'Cevrimdisi':
      return <WifiOff className="h-4 w-4" />;
    case 'Mesgul':
      return <Clock className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

export default function TerminalManagement() {
  const { session } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [registerFilter, setRegisterFilter] = useState('all');
  const [selectedTerminal, setSelectedTerminal] = useState<PosTerminalDto | null>(null);
  const [testingConnection, setTestingConnection] = useState<number | null>(null);
  const [terminals, setTerminals] = useState<PosTerminalDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForbidden, setIsForbidden] = useState(false);

  const branchId = session?.branch.id;

  const loadTerminals = useCallback(async () => {
    if (!branchId) {
      return;
    }

    setIsLoading(true);
    setIsForbidden(false);
    setErrorMessage('');

    try {
      const response = await terminalsApi.getByBranch(branchId);
      setTerminals(response);
    } catch (error) {
      if (isForbiddenError(error)) {
        setIsForbidden(true);
        setErrorMessage('Terminal yönetimi ekranına erişim yetkiniz bulunmuyor.');
      } else {
        setErrorMessage(getErrorMessage(error, 'Terminal verileri alınamadı.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    loadTerminals();
  }, [loadTerminals]);

  const registerOptions = useMemo(
    () => Array.from(new Set(terminals.map((terminal) => localizeText(terminal.cashRegisterName)).filter(Boolean))),
    [terminals],
  );

  const filteredTerminals = useMemo(
    () =>
      terminals.filter((terminal) => {
        const registerName = localizeText(terminal.cashRegisterName);
        const matchesSearch =
          terminal.terminalNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          localizeText(terminal.deviceName).toLowerCase().includes(searchQuery.toLowerCase()) ||
          registerName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || terminal.status === statusFilter;
        const matchesRegister = registerFilter === 'all' || registerName === registerFilter;

        return matchesSearch && matchesStatus && matchesRegister;
      }),
    [registerFilter, searchQuery, statusFilter, terminals],
  );

  const stats = useMemo(
    () => ({
      total: terminals.length,
      active: terminals.filter((terminal) => terminal.status !== 'Cevrimdisi').length,
      offline: terminals.filter((terminal) => terminal.status === 'Cevrimdisi').length,
      transactionsToday: terminals.reduce((sum, terminal) => sum + terminal.totalTransactionsToday, 0),
    }),
    [terminals],
  );

  const offlineTerminals = terminals.filter((terminal) => terminal.status === 'Cevrimdisi');

  const handleTestConnection = async (terminalId: number) => {
    setTestingConnection(terminalId);
    try {
      const response = await terminalsApi.testConnection(terminalId);
      toast.success(response.message);
      await loadTerminals();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Terminal bağlantı testi başarısız oldu.'));
    } finally {
      setTestingConnection(null);
    }
  };

  const handleSetDefault = async (terminalId: number) => {
    try {
      await terminalsApi.setDefault(terminalId);
      toast.success('Varsayılan terminal güncellendi.');
      await loadTerminals();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Varsayılan terminal güncellenemedi.'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">Terminal Yönetimi</h1>
            <p className="mt-1 text-xs text-gray-600 lg:text-sm">VakıfBank POS terminallerini izleyin ve yönetin</p>
          </div>

          {offlineTerminals.length > 0 && !isLoading ? (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 lg:mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <div className="flex-1">
                  <h3 className="mb-1 text-sm font-semibold text-amber-900">Terminal Bağlantı Uyarısı</h3>
                  <p className="text-xs text-amber-800">
                    {offlineTerminals.length} terminal çevrimdışı durumda. Lütfen bağlantıları kontrol edin:{' '}
                    <span className="font-semibold">{offlineTerminals.map((terminal) => terminal.terminalNo).join(', ')}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {errorMessage && !isLoading && !isForbidden ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {errorMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
                <LoadingSkeleton type="card" count={4} />
              </div>
              <LoadingSkeleton type="table" count={5} />
            </div>
          ) : isForbidden ? (
            <div className="mx-auto max-w-4xl">
              <AccessDeniedState
                onBack={() => window.history.length > 1 ? window.history.back() : undefined}
                onHome={() => window.location.assign('/dashboard')}
              />
            </div>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-4 lg:gap-6">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                  <div className="mb-3 flex items-center justify-between lg:mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 lg:h-12 lg:w-12">
                      <Terminal className="h-5 w-5 text-blue-600 lg:h-6 lg:w-6" />
                    </div>
                  </div>
                  <div className="mb-1 text-xl font-bold text-gray-900 lg:text-2xl">{stats.total}</div>
                  <div className="text-xs text-gray-600 lg:text-sm">Toplam Terminal</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                  <div className="mb-3 flex items-center justify-between lg:mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 lg:h-12 lg:w-12">
                      <Wifi className="h-5 w-5 text-green-600 lg:h-6 lg:w-6" />
                    </div>
                    <div className="text-xs font-medium text-green-600">
                      {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(0) : '0'}%
                    </div>
                  </div>
                  <div className="mb-1 text-xl font-bold text-gray-900 lg:text-2xl">{stats.active}</div>
                  <div className="text-xs text-gray-600 lg:text-sm">Aktif Terminal</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                  <div className="mb-3 flex items-center justify-between lg:mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 lg:h-12 lg:w-12">
                      <WifiOff className="h-5 w-5 text-red-600 lg:h-6 lg:w-6" />
                    </div>
                    {stats.offline > 0 ? <div className="text-xs font-medium text-red-600">Uyarı</div> : null}
                  </div>
                  <div className="mb-1 text-xl font-bold text-gray-900 lg:text-2xl">{stats.offline}</div>
                  <div className="text-xs text-gray-600 lg:text-sm">Çevrimdışı Terminal</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                  <div className="mb-3 flex items-center justify-between lg:mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 lg:h-12 lg:w-12">
                      <TrendingUp className="h-5 w-5 text-purple-600 lg:h-6 lg:w-6" />
                    </div>
                  </div>
                  <div className="mb-1 text-xl font-bold text-gray-900 lg:text-2xl">{stats.transactionsToday}</div>
                  <div className="text-xs text-gray-600 lg:text-sm">Bugünkü İşlem Sayısı</div>
                </div>
              </div>

              <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:mb-6 lg:p-6">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Terminal ara..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Durum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Durumlar</SelectItem>
                      <SelectItem value="Bagli">Bağlı</SelectItem>
                      <SelectItem value="Islemde">İşlemde</SelectItem>
                      <SelectItem value="Cevrimdisi">Çevrimdışı</SelectItem>
                      <SelectItem value="Mesgul">Meşgul</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={registerFilter} onValueChange={setRegisterFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kasa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Kasalar</SelectItem>
                      {registerOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" className="w-full" onClick={loadTerminals}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Yenile
                  </Button>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 lg:mb-6 lg:grid-cols-3 lg:gap-6">
                <div className="lg:col-span-2">
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-4 lg:p-6">
                      <h2 className="text-base font-semibold text-gray-900 lg:text-lg">Terminal Listesi</h2>
                      <p className="mt-1 text-xs text-gray-600 lg:text-sm">{filteredTerminals.length} terminal gösteriliyor</p>
                    </div>

                    {filteredTerminals.length === 0 ? (
                      <div className="p-8 text-center">
                        <Terminal className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">Kriterlere uygun terminal bulunamadı</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 lg:px-6">Terminal</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 lg:px-6">Kasa</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 lg:px-6">Durum</th>
                              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-600 lg:table-cell lg:px-6">Başarı Oranı</th>
                              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-600 md:table-cell lg:px-6">Son Bağlantı</th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 lg:px-6">İşlemler</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredTerminals.map((terminal) => (
                              <tr key={terminal.id} className="transition-colors hover:bg-gray-50">
                                <td className="px-4 py-4 lg:px-6">
                                  <div className="flex items-center gap-3">
                                    {terminal.isDefault ? <Star className="h-4 w-4 flex-shrink-0 fill-[#d4a017] text-[#d4a017]" /> : null}
                                    <div>
                                      <div className="text-sm font-semibold text-gray-900">{terminal.terminalNo}</div>
                                      <div className="text-xs text-gray-500">{localizeText(terminal.deviceName)}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 lg:px-6">
                                  <div className="text-sm text-gray-900">{localizeText(terminal.cashRegisterName)}</div>
                                </td>
                                <td className="px-4 py-4 lg:px-6">
                                  <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(terminal.status)}`}>
                                    {getStatusIcon(terminal.status)}
                                    {toUiTerminalStatus(terminal.status)}
                                  </div>
                                </td>
                                <td className="hidden px-4 py-4 lg:table-cell lg:px-6">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 max-w-[80px] flex-1 rounded-full bg-gray-200">
                                      <div
                                        className={`h-2 rounded-full ${
                                          terminal.successRate >= 98 ? 'bg-green-500' :
                                          terminal.successRate >= 95 ? 'bg-amber-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${terminal.successRate}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700">{terminal.successRate.toFixed(1)}%</span>
                                  </div>
                                </td>
                                <td className="hidden px-4 py-4 text-xs text-gray-600 md:table-cell lg:px-6">
                                  {formatRelativeTime(terminal.lastConnectionAt)}
                                </td>
                                <td className="px-4 py-4 lg:px-6">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleTestConnection(terminal.id)}
                                      disabled={testingConnection === terminal.id}
                                      className="text-xs"
                                    >
                                      {testingConnection === terminal.id ? (
                                        <>
                                          <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                                          Test
                                        </>
                                      ) : (
                                        <>
                                          <MonitorCheck className="mr-1 h-3 w-3" />
                                          Test
                                        </>
                                      )}
                                    </Button>
                                    {!terminal.isDefault ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSetDefault(terminal.id)}
                                        className="hidden text-xs md:inline-flex"
                                      >
                                        Varsayılan Yap
                                      </Button>
                                    ) : null}
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedTerminal(terminal)} className="text-xs">
                                      Detay
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-gray-700" />
                      <h2 className="text-base font-semibold text-gray-900">Terminal Sağlık Durumu</h2>
                    </div>

                    <div className="space-y-3">
                      {terminals.slice(0, 3).map((terminal) => (
                        <div key={terminal.id} className="rounded-lg bg-gray-50 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-900">{terminal.terminalNo}</span>
                            <div className={`flex items-center gap-1 text-xs ${
                              terminal.successRate >= 98 ? 'text-green-600' :
                              terminal.successRate >= 95 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              <Activity className="h-3 w-3" />
                              {terminal.successRate.toFixed(1)}%
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>Bugün {terminal.totalTransactionsToday} işlem</span>
                            <span>{formatCurrency(terminal.totalAmountToday)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">İşletme Bilgileri</h3>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-gray-600">İş Yeri:</span>
                        <div className="mt-0.5 font-semibold text-gray-900">{localizeText(session?.branch.name)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">İş Yeri Kodu:</span>
                        <div className="mt-0.5 font-semibold text-gray-900">{session?.branch.code}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Üye İşyeri No:</span>
                        <div className="mt-0.5 font-semibold text-gray-900">{session?.branch.merchantNumber}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={!!selectedTerminal} onOpenChange={(open) => !open && setSelectedTerminal(null)}>
        <DialogContent className="max-h-[90vh] max-w-[540px] overflow-y-auto rounded-[28px] border border-[#e4e7ec] p-0 shadow-[0_24px_64px_rgba(15,23,42,0.2)]">
          <DialogHeader className="px-6 pb-0 pt-6">
            <DialogTitle className="flex items-center gap-2 text-[1.05rem] font-bold text-[#202633]">
              <Terminal className="h-5 w-5 text-[#344054]" />
              Terminal Detayları
            </DialogTitle>
          </DialogHeader>

          {selectedTerminal ? (
            <div className="px-6 pb-6 pt-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-2xl bg-[#f8fafc] px-5 py-4">
                  <div className="flex items-center gap-3">
                    {selectedTerminal.isDefault ? <Star className="h-5 w-5 fill-[#d4a017] text-[#d4a017]" /> : null}
                    <div>
                      <div className="text-[1.15rem] font-bold tracking-[-0.02em] text-[#202633]">{selectedTerminal.terminalNo}</div>
                      <div className="text-sm text-[#667085]">{localizeText(selectedTerminal.deviceName)}</div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${getStatusClass(selectedTerminal.status)}`}>
                    {getStatusIcon(selectedTerminal.status)}
                    {toUiTerminalStatus(selectedTerminal.status)}
                  </div>
                </div>

                <section>
                  <h3 className="mb-4 text-[1.05rem] font-bold text-[#202633]">Cihaz Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <div className="text-sm text-[#667085]">Terminal No</div>
                      <div className="mt-1 text-[1.05rem] font-semibold text-[#202633]">{selectedTerminal.terminalNo}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#667085]">Cihaz Adı</div>
                      <div className="mt-1 text-[1.05rem] font-semibold text-[#202633]">{localizeText(selectedTerminal.deviceName)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#667085]">Model</div>
                      <div className="mt-1 text-[1.05rem] font-semibold text-[#202633]">{localizeText(selectedTerminal.model)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#667085]">Firmware Sürümü</div>
                      <div className="mt-1 text-[1.05rem] font-semibold text-[#202633]">{selectedTerminal.firmwareVersion || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#667085]">IP Adresi</div>
                      <div className="mt-1 text-[1.05rem] font-semibold text-[#202633]">{selectedTerminal.ipAddress || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#667085]">Eşleştirilmiş Kasa</div>
                      <div className="mt-1 text-[1.05rem] font-semibold text-[#202633]">{localizeText(selectedTerminal.cashRegisterName)}</div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-[1.05rem] font-bold text-[#202633]">Bağlantı Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <div className="text-sm text-[#667085]">Son Bağlantı</div>
                      <div className="mt-1 text-[1.05rem] font-semibold text-[#202633]">{formatRelativeTime(selectedTerminal.lastConnectionAt)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#667085]">Son Başarılı İşlem</div>
                      <div className="mt-1 text-[1.05rem] font-semibold text-[#202633]">{formatRelativeTime(selectedTerminal.lastSuccessfulTransactionAt)}</div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-[1.05rem] font-bold text-[#202633]">Performans</h3>
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-[#667085]">İşlem Başarı Oranı</span>
                    <span className="text-[1.75rem] font-bold leading-none tracking-[-0.03em] text-[#202633]">
                      {selectedTerminal.successRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-[#e5e7eb]">
                    <div
                      className={`h-3 rounded-full ${
                        selectedTerminal.successRate >= 98 ? 'bg-[#4ad66d]' :
                        selectedTerminal.successRate >= 95 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'
                      }`}
                      style={{ width: `${selectedTerminal.successRate}%` }}
                    />
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-4 border-t border-[#eaecf0] pt-6">
                  <div className="rounded-2xl bg-[#eef4ff] px-4 py-4">
                    <div className="text-sm font-medium text-[#4a6cf7]">Bugünkü İşlem</div>
                    <div className="mt-1 text-[2rem] font-bold tracking-[-0.03em] text-[#2445c6]">{selectedTerminal.totalTransactionsToday}</div>
                  </div>
                  <div className="rounded-2xl bg-[#effaf3] px-4 py-4">
                    <div className="text-sm font-medium text-[#4d8f5d]">Bugünkü Ciro</div>
                    <div className="mt-1 text-[2rem] font-bold tracking-[-0.03em] text-[#2b6d3a]">{formatCurrency(selectedTerminal.totalAmountToday)}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
