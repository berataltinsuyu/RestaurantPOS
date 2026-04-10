import { useState, useMemo } from 'react';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
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
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

type TerminalStatus = 'connected' | 'processing' | 'offline' | 'busy';

interface TerminalData {
  id: string;
  terminalNo: string;
  deviceName: string;
  assignedRegister: string;
  status: TerminalStatus;
  lastConnection: string;
  lastSuccessfulTransaction: string;
  successRate: number;
  isDefault: boolean;
  ipAddress: string;
  model: string;
  firmwareVersion: string;
  totalTransactionsToday: number;
  totalAmountToday: number;
}

export default function TerminalManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [registerFilter, setRegisterFilter] = useState('all');
  const [selectedTerminal, setSelectedTerminal] = useState<TerminalData | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const terminals: TerminalData[] = [
    {
      id: '1',
      terminalNo: 'VKB-TRM-01',
      deviceName: 'Ana Kasa POS 1',
      assignedRegister: 'Kasa 1',
      status: 'connected',
      lastConnection: '2 dakika önce',
      lastSuccessfulTransaction: '5 dakika önce',
      successRate: 98.5,
      isDefault: true,
      ipAddress: '192.168.1.101',
      model: 'VakıfBank SmartPOS Pro',
      firmwareVersion: 'v4.2.1',
      totalTransactionsToday: 127,
      totalAmountToday: 42850,
    },
    {
      id: '2',
      terminalNo: 'VKB-TRM-02',
      deviceName: 'Garson POS 1',
      assignedRegister: 'Kasa 2',
      status: 'connected',
      lastConnection: '1 dakika önce',
      lastSuccessfulTransaction: '12 dakika önce',
      successRate: 97.2,
      isDefault: false,
      ipAddress: '192.168.1.102',
      model: 'VakıfBank MobilPOS',
      firmwareVersion: 'v4.2.1',
      totalTransactionsToday: 89,
      totalAmountToday: 28450,
    },
    {
      id: '3',
      terminalNo: 'VKB-TRM-03',
      deviceName: 'Ana Kasa POS 2',
      assignedRegister: 'Kasa 1',
      status: 'processing',
      lastConnection: 'Şimdi',
      lastSuccessfulTransaction: '2 dakika önce',
      successRate: 99.1,
      isDefault: false,
      ipAddress: '192.168.1.103',
      model: 'VakıfBank SmartPOS Pro',
      firmwareVersion: 'v4.2.1',
      totalTransactionsToday: 94,
      totalAmountToday: 31200,
    },
    {
      id: '4',
      terminalNo: 'VKB-TRM-04',
      deviceName: 'Yedek Terminal',
      assignedRegister: 'Atanmadı',
      status: 'offline',
      lastConnection: '2 saat önce',
      lastSuccessfulTransaction: '2 saat önce',
      successRate: 95.8,
      isDefault: false,
      ipAddress: '192.168.1.104',
      model: 'VakıfBank SmartPOS',
      firmwareVersion: 'v4.1.8',
      totalTransactionsToday: 0,
      totalAmountToday: 0,
    },
    {
      id: '5',
      terminalNo: 'VKB-TRM-05',
      deviceName: 'Kat Servisi POS',
      assignedRegister: 'Kasa 3',
      status: 'busy',
      lastConnection: 'Şimdi',
      lastSuccessfulTransaction: '8 dakika önce',
      successRate: 96.4,
      isDefault: false,
      ipAddress: '192.168.1.105',
      model: 'VakıfBank MobilPOS',
      firmwareVersion: 'v4.2.0',
      totalTransactionsToday: 56,
      totalAmountToday: 18900,
    },
  ];

  const filteredTerminals = useMemo(() => {
    return terminals.filter(t => {
      const matchesSearch = 
        t.terminalNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignedRegister.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesRegister = registerFilter === 'all' || t.assignedRegister === registerFilter;
      
      return matchesSearch && matchesStatus && matchesRegister;
    });
  }, [searchQuery, statusFilter, registerFilter, terminals]);

  const stats = {
    total: terminals.length,
    active: terminals.filter(t => t.status === 'connected' || t.status === 'processing' || t.status === 'busy').length,
    offline: terminals.filter(t => t.status === 'offline').length,
    transactionsToday: terminals.reduce((sum, t) => sum + t.totalTransactionsToday, 0),
  };

  const offlineTerminals = terminals.filter(t => t.status === 'offline');

  const getStatusColor = (status: TerminalStatus) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'offline':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'busy':
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status: TerminalStatus) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'processing':
        return <Activity className="w-4 h-4 animate-pulse" />;
      case 'offline':
        return <WifiOff className="w-4 h-4" />;
      case 'busy':
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: TerminalStatus) => {
    switch (status) {
      case 'connected':
        return 'Bağlı';
      case 'processing':
        return 'İşlemde';
      case 'offline':
        return 'Çevrimdışı';
      case 'busy':
        return 'Meşgul';
    }
  };

  const handleTestConnection = (terminalId: string) => {
    setTestingConnection(terminalId);
    setTimeout(() => {
      setTestingConnection(null);
    }, 2000);
  };

  const handleSetDefault = (terminalId: string) => {
    console.log('Set default terminal:', terminalId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="pt-16 p-4 lg:p-6">
          {/* Header */}
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Terminal Yönetimi</h1>
            <p className="text-xs lg:text-sm text-gray-600 mt-1">VakıfBank POS terminallerini izleyin ve yönetin</p>
          </div>

          {/* Warning Banner for Offline Terminals */}
          {offlineTerminals.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 lg:mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-900 mb-1">Terminal Bağlantı Uyarısı</h3>
                  <p className="text-xs text-amber-800">
                    {offlineTerminals.length} terminal çevrimdışı durumda. Lütfen bağlantıları kontrol edin:{' '}
                    <span className="font-semibold">
                      {offlineTerminals.map(t => t.terminalNo).join(', ')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Terminal className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
              <div className="text-xs lg:text-sm text-gray-600">Toplam Terminal</div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Wifi className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
                <div className="text-xs text-green-600 font-medium">
                  {((stats.active / stats.total) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{stats.active}</div>
              <div className="text-xs lg:text-sm text-gray-600">Aktif Terminal</div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <WifiOff className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
                </div>
                {stats.offline > 0 && (
                  <div className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Uyarı
                  </div>
                )}
              </div>
              <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{stats.offline}</div>
              <div className="text-xs lg:text-sm text-gray-600">Çevrimdışı Terminal</div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                </div>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{stats.transactionsToday}</div>
              <div className="text-xs lg:text-sm text-gray-600">Bugünkü İşlem Sayısı</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 mb-4 lg:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Terminal ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="connected">Bağlı</SelectItem>
                  <SelectItem value="processing">İşlemde</SelectItem>
                  <SelectItem value="offline">Çevrimdışı</SelectItem>
                  <SelectItem value="busy">Meşgul</SelectItem>
                </SelectContent>
              </Select>

              <Select value={registerFilter} onValueChange={setRegisterFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Kasa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kasalar</SelectItem>
                  <SelectItem value="Kasa 1">Kasa 1</SelectItem>
                  <SelectItem value="Kasa 2">Kasa 2</SelectItem>
                  <SelectItem value="Kasa 3">Kasa 3</SelectItem>
                  <SelectItem value="Atanmadı">Atanmadı</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenile
              </Button>
            </div>
          </div>

          {/* Terminal Health Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
            <div className="lg:col-span-2">
              {/* Terminal List */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900">Terminal Listesi</h2>
                  <p className="text-xs lg:text-sm text-gray-600 mt-1">
                    {filteredTerminals.length} terminal gösteriliyor
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left text-xs font-semibold text-gray-600 px-4 lg:px-6 py-3">Terminal</th>
                        <th className="text-left text-xs font-semibold text-gray-600 px-4 lg:px-6 py-3">Kasa</th>
                        <th className="text-left text-xs font-semibold text-gray-600 px-4 lg:px-6 py-3">Durum</th>
                        <th className="text-left text-xs font-semibold text-gray-600 px-4 lg:px-6 py-3 hidden lg:table-cell">Başarı Oranı</th>
                        <th className="text-left text-xs font-semibold text-gray-600 px-4 lg:px-6 py-3 hidden md:table-cell">Son Bağlantı</th>
                        <th className="text-right text-xs font-semibold text-gray-600 px-4 lg:px-6 py-3">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredTerminals.map((terminal) => (
                        <tr key={terminal.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 lg:px-6 py-4">
                            <div className="flex items-center gap-3">
                              {terminal.isDefault && (
                                <Star className="w-4 h-4 text-[#d4a017] fill-[#d4a017] flex-shrink-0" />
                              )}
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{terminal.terminalNo}</div>
                                <div className="text-xs text-gray-500">{terminal.deviceName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className="text-sm text-gray-900">{terminal.assignedRegister}</div>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(terminal.status)}`}>
                              {getStatusIcon(terminal.status)}
                              {getStatusText(terminal.status)}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                                <div
                                  className={`h-2 rounded-full ${
                                    terminal.successRate >= 98 ? 'bg-green-500' :
                                    terminal.successRate >= 95 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${terminal.successRate}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-700">
                                {terminal.successRate.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 hidden md:table-cell">
                            <div className="text-xs text-gray-600">{terminal.lastConnection}</div>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
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
                                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                    Test
                                  </>
                                ) : (
                                  <>
                                    <MonitorCheck className="w-3 h-3 mr-1" />
                                    Test
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTerminal(terminal)}
                                className="text-xs"
                              >
                                Detay
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredTerminals.length === 0 && (
                  <div className="p-8 text-center">
                    <Terminal className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">Kriterlere uygun terminal bulunamadı</p>
                  </div>
                )}
              </div>
            </div>

            {/* Terminal Health Widget */}
            <div className="space-y-4 lg:space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-gray-700" />
                  <h2 className="text-base font-semibold text-gray-900">Terminal Sağlık Durumu</h2>
                </div>

                <div className="space-y-3">
                  {terminals.slice(0, 3).map((terminal) => (
                    <div key={terminal.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-900">{terminal.terminalNo}</span>
                        <div className={`flex items-center gap-1 text-xs ${
                          terminal.successRate >= 98 ? 'text-green-600' :
                          terminal.successRate >= 95 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          <Activity className="w-3 h-3" />
                          {terminal.successRate.toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Bugün {terminal.totalTransactionsToday} işlem</span>
                        <span>₺{terminal.totalAmountToday.toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">İşletme Bilgileri</h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-600">İş Yeri:</span>
                    <div className="font-semibold text-gray-900 mt-0.5">Vakıf Lezzet Restoran</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Şube:</span>
                    <div className="font-semibold text-gray-900 mt-0.5">Beşiktaş Şubesi</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Üye İşyeri No:</span>
                    <div className="font-semibold text-gray-900 mt-0.5">8472651</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Detail Modal */}
      <Dialog open={!!selectedTerminal} onOpenChange={() => setSelectedTerminal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-gray-700" />
              Terminal Detayları
            </DialogTitle>
          </DialogHeader>

          {selectedTerminal && (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedTerminal.isDefault && (
                    <Star className="w-5 h-5 text-[#d4a017] fill-[#d4a017]" />
                  )}
                  <div>
                    <div className="text-lg font-bold text-gray-900">{selectedTerminal.terminalNo}</div>
                    <div className="text-sm text-gray-600">{selectedTerminal.deviceName}</div>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(selectedTerminal.status)}`}>
                  {getStatusIcon(selectedTerminal.status)}
                  {getStatusText(selectedTerminal.status)}
                </div>
              </div>

              {/* Terminal Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Cihaz Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Terminal No</label>
                    <div className="text-sm font-semibold text-gray-900 mt-1">{selectedTerminal.terminalNo}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Cihaz Adı</label>
                    <div className="text-sm font-semibold text-gray-900 mt-1">{selectedTerminal.deviceName}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Model</label>
                    <div className="text-sm font-semibold text-gray-900 mt-1">{selectedTerminal.model}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Firmware Sürümü</label>
                    <div className="text-sm font-semibold text-gray-900 mt-1">{selectedTerminal.firmwareVersion}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">IP Adresi</label>
                    <div className="text-sm font-semibold text-gray-900 mt-1">{selectedTerminal.ipAddress}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Eşleştirilmiş Kasa</label>
                    <div className="text-sm font-semibold text-gray-900 mt-1">{selectedTerminal.assignedRegister}</div>
                  </div>
                </div>
              </div>

              {/* Connection Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Bağlantı Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Son Bağlantı</label>
                    <div className="text-sm font-semibold text-gray-900 mt-1">{selectedTerminal.lastConnection}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Son Başarılı İşlem</label>
                    <div className="text-sm font-semibold text-gray-900 mt-1">{selectedTerminal.lastSuccessfulTransaction}</div>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Performans</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-600">İşlem Başarı Oranı</label>
                      <span className="text-sm font-bold text-gray-900">{selectedTerminal.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          selectedTerminal.successRate >= 98 ? 'bg-green-500' :
                          selectedTerminal.successRate >= 95 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedTerminal.successRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-600 mb-1">Bugünkü İşlem</div>
                      <div className="text-lg font-bold text-blue-900">{selectedTerminal.totalTransactionsToday}</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-xs text-green-600 mb-1">Bugünkü Ciro</div>
                      <div className="text-lg font-bold text-green-900">
                        ₺{selectedTerminal.totalAmountToday.toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                {!selectedTerminal.isDefault && (
                  <Button
                    onClick={() => handleSetDefault(selectedTerminal.id)}
                    className="flex-1 bg-[#d4a017] hover:bg-[#b8860b] text-white"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Varsayılan Terminal Yap
                  </Button>
                )}
                <Button
                  onClick={() => handleTestConnection(selectedTerminal.id)}
                  variant="outline"
                  className="flex-1"
                >
                  <MonitorCheck className="w-4 h-4 mr-2" />
                  Test Bağlantısı
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
