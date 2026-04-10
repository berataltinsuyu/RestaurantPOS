import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import {
  Calendar,
  TrendingUp,
  CreditCard,
  Banknote,
  Split,
  XCircle,
  RotateCcw,
  FileText,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Terminal,
  Eye,
  Building2,
  Clock,
} from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';
import { AccessDeniedState } from '../components/enterprise/AccessDeniedState';
import { EmptyState } from '../components/enterprise/EmptyState';
import { LoadingSkeleton } from '../components/enterprise/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { billsApi, paymentsApi, reportsApi, shiftsApi, terminalsApi } from '../lib/api';
import { ApiError } from '../lib/http';
import { getErrorMessage, isForbiddenError } from '../lib/error-utils';
import { formatCurrency, formatDate, formatTime, localizeText, toUiPaymentType } from '../lib/mappers';
import type {
  BillSummaryDto,
  DailyRevenueDto,
  FailedTransactionDto,
  PaymentDistributionDto,
  PaymentDto,
  PosTerminalDto,
  ShiftDto,
  TerminalPerformanceDto,
} from '../types/api';

export default function EndOfDayReconciliation() {
  const { session } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [managerConfirmed, setManagerConfirmed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenueDto[]>([]);
  const [paymentDistribution, setPaymentDistribution] = useState<PaymentDistributionDto[]>([]);
  const [failedTransactions, setFailedTransactions] = useState<FailedTransactionDto[]>([]);
  const [terminalPerformance, setTerminalPerformance] = useState<TerminalPerformanceDto[]>([]);
  const [bills, setBills] = useState<BillSummaryDto[]>([]);
  const [terminals, setTerminals] = useState<PosTerminalDto[]>([]);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [shifts, setShifts] = useState<ShiftDto[]>([]);
  const [isForbidden, setIsForbidden] = useState(false);

  const branchId = session?.branch.id;

  const loadReconciliation = useCallback(async () => {
    if (!branchId) {
      return;
    }

    setIsLoading(true);
    setIsForbidden(false);
    setErrorMessage('');

    try {
      const [daily, distribution, failed, terminalStats, billsResponse, terminalsResponse, shiftsResponse] =
        await Promise.all([
          reportsApi.dailyRevenue(branchId),
          reportsApi.paymentDistribution(branchId),
          reportsApi.failedTransactions(branchId),
          reportsApi.terminalPerformance(branchId),
          billsApi.getAll(),
          terminalsApi.getByBranch(branchId),
          shiftsApi.getAll(),
        ]);

      setDailyRevenue(daily);
      setPaymentDistribution(distribution);
      setFailedTransactions(failed);
      setTerminalPerformance(terminalStats);
      setBills(billsResponse.filter((bill) => bill.branchId === branchId));
      setTerminals(terminalsResponse);
      setShifts(shiftsResponse.filter((shift) => shift.branchId === branchId));

      try {
        const allPayments = await paymentsApi.getAll();
        setPayments(allPayments.filter((payment) => {
          const branchBill = billsResponse.find((bill) => bill.id === payment.billId);
          return branchBill?.branchId === branchId;
        }));
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 403)) {
          throw error;
        }

        setPayments([]);
      }
    } catch (error) {
      if (isForbiddenError(error)) {
        setIsForbidden(true);
        setErrorMessage('Gün sonu mutabakat ekranına erişim yetkiniz bulunmuyor.');
      } else {
        setErrorMessage(getErrorMessage(error, 'Gün sonu verileri alınamadı.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    loadReconciliation();
  }, [loadReconciliation]);

  const today = new Date();

  const openBills = useMemo(
    () =>
      bills
        .filter((bill) => bill.status !== 'Kapandi' && bill.status !== 'Iptal')
        .map((bill) => ({
          tableNo: localizeText(bill.tableNo),
          waiter: localizeText(bill.waiterName),
          itemCount: bill.items.reduce((sum, item) => sum + item.quantity, 0),
          amount: bill.remainingAmount > 0 ? bill.remainingAmount : bill.totalAmount,
          duration: `${Math.max(1, Math.floor((Date.now() - new Date(bill.openedAt).getTime()) / 60000))} dk`,
        }))
        .sort((left, right) => right.amount - left.amount),
    [bills],
  );

  const cardPayments = paymentDistribution
    .filter((item) => toUiPaymentType(item.paymentType).includes('Kart'))
    .reduce((sum, item) => sum + item.amount, 0);
  const cashPayments = paymentDistribution
    .filter((item) => toUiPaymentType(item.paymentType).includes('Nakit'))
    .reduce((sum, item) => sum + item.amount, 0);
  const splitPayments = paymentDistribution
    .filter((item) => toUiPaymentType(item.paymentType).includes('Bölünmüş'))
    .reduce((sum, item) => sum + item.amount, 0);
  const refundsCancellations = payments.filter((payment) => payment.paymentType === 'Iade').reduce((sum, payment) => sum + payment.amount, 0);
  const totalRevenue = dailyRevenue.reduce((sum, item) => sum + item.totalAmount, 0);
  const successfulTransactions = paymentDistribution.reduce((sum, item) => sum + item.transactionCount, 0);
  const totalTransactions = successfulTransactions + failedTransactions.length;
  const averageTicket = successfulTransactions > 0 ? totalRevenue / successfulTransactions : 0;
  const openBillsAmount = openBills.reduce((sum, bill) => sum + bill.amount, 0);
  const activeShift = shifts.find((shift) => shift.status === 'Acik') ?? null;

  const discrepancies = openBills.length > 0
    ? [{
        message: `${openBills.length} açık adisyon var. Gün sonu kapanışı için tüm adisyonların kapatılması önerilir.`,
        amount: openBillsAmount,
      }]
    : [];

  const handleCloseDay = async () => {
    if (!managerConfirmed) {
      return;
    }

    if (!activeShift) {
      toast.error('Kapatılacak açık vardiya bulunamadı.');
      return;
    }

    setIsClosing(true);
    try {
      await shiftsApi.close(activeShift.id, {
        closingCashAmount: cashPayments,
        note: `Gün sonu kapanışı ${formatDate(today.toISOString())}`,
      });

      toast.success('Gün sonu başarıyla kapatıldı.');
      await loadReconciliation();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gün sonu kapatılamadı.'));
    } finally {
      setIsClosing(false);
    }
  };

  const handleExport = (fileName: string, rows: string[][]) => {
    const blob = new Blob(
      ['\ufeff' + rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(';')).join('\n')],
      { type: 'text/csv;charset=utf-8;' },
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    handleExport('gun-sonu-mutabakat.csv', [
      ['Metrik', 'Değer'],
      ['Toplam Ciro', totalRevenue.toFixed(2)],
      ['Kart Tahsilat', cardPayments.toFixed(2)],
      ['Nakit Tahsilat', cashPayments.toFixed(2)],
      ['Bölünmüş Ödeme', splitPayments.toFixed(2)],
      ['Başarısız İşlem', String(failedTransactions.length)],
      ['Açık Adisyon', String(openBills.length)],
    ]);
  };

  const handleExportExcel = handleExportPDF;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="px-4 pb-24 pt-20 lg:px-6">
          <div className="mb-4 flex flex-col lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">Gün Sonu Mutabakat</h1>
              <p className="mt-1 text-xs text-gray-600 lg:text-sm">Günlük işlem özeti ve kapanış işlemleri</p>
            </div>
            <div className="mt-3 flex items-center gap-2 lg:mt-0">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" />
                PDF İndir
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel'e Aktar
              </Button>
            </div>
          </div>

          {errorMessage && !isLoading && !isForbidden ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</div>
          ) : null}

          {isLoading ? (
            <div className="space-y-6">
              <LoadingSkeleton type="card" count={3} />
              <LoadingSkeleton type="card" count={3} />
            </div>
          ) : isForbidden ? (
            <div className="mx-auto max-w-4xl">
              <AccessDeniedState
                onBack={() => window.history.length > 1 ? window.history.back() : undefined}
                onHome={() => window.location.assign('/dashboard')}
              />
            </div>
          ) : errorMessage ? (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <EmptyState
                type="error"
                title="Mutabakat verileri yüklenemedi"
                description={errorMessage}
                action={{ label: 'Tekrar Dene', onClick: loadReconciliation }}
              />
            </div>
          ) : (
            <>
              <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:mb-6 lg:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">İş Yeri</div>
                      <div className="font-bold text-gray-900">{localizeText(session?.branch.name)}</div>
                      <div className="mt-0.5 text-xs text-gray-600">{session?.branch.code}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Üye İşyeri No</div>
                      <div className="font-bold text-gray-900">{session?.branch.merchantNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">İşlem Tarihi</div>
                      <div className="font-bold text-gray-900">{formatDate(today.toISOString())}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Rapor Saati</div>
                      <div className="font-bold text-gray-900">{formatTime(today.toISOString())}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-3 xl:grid-cols-6 lg:gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="mb-1 text-xs text-gray-600">Toplam Ciro</div>
                  <div className="text-lg font-bold text-gray-900 lg:text-xl">{formatCurrency(totalRevenue)}</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="mb-1 text-xs text-gray-600">Kart Tahsilat</div>
                  <div className="text-lg font-bold text-gray-900 lg:text-xl">{formatCurrency(cardPayments)}</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <Banknote className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="mb-1 text-xs text-gray-600">Nakit Tahsilat</div>
                  <div className="text-lg font-bold text-gray-900 lg:text-xl">{formatCurrency(cashPayments)}</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Split className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="mb-1 text-xs text-gray-600">Bölünmüş Ödeme</div>
                  <div className="text-lg font-bold text-gray-900 lg:text-xl">{formatCurrency(splitPayments)}</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="mb-1 text-xs text-gray-600">Başarısız İşlem</div>
                  <div className="text-lg font-bold text-gray-900 lg:text-xl">{failedTransactions.length}</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <RotateCcw className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="mb-1 text-xs text-gray-600">İade / İptal</div>
                  <div className="text-lg font-bold text-gray-900 lg:text-xl">{formatCurrency(refundsCancellations)}</div>
                </div>
              </div>

              {discrepancies.length > 0 ? (
                <div className="mb-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 lg:mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
                    <div className="flex-1">
                      <h3 className="mb-2 text-sm font-bold text-amber-900">Uyarı ve Kontrol Noktaları</h3>
                      <div className="space-y-2">
                        {discrepancies.map((item, index) => (
                          <div key={index} className="rounded-lg border border-amber-200 bg-white p-3">
                            <p className="text-xs text-amber-900">{item.message}</p>
                            <p className="mt-1 text-sm font-bold text-amber-900">Tutar: {formatCurrency(item.amount)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mb-4 grid grid-cols-1 gap-4 lg:mb-6 lg:grid-cols-3 lg:gap-6">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900 lg:text-lg">Açık Adisyonlar</h2>
                        <p className="mt-1 text-xs text-gray-600">{openBills.length} açık masa</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">Toplam</div>
                        <div className="text-lg font-bold text-amber-600">{formatCurrency(openBillsAmount)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {openBills.length === 0 ? (
                      <div className="p-6 text-sm text-gray-500">Açık adisyon bulunmuyor.</div>
                    ) : (
                      openBills.map((bill, index) => (
                        <div key={index} className="p-4 transition-colors hover:bg-gray-50">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="font-semibold text-gray-900">{bill.tableNo}</div>
                            <div className="font-bold text-gray-900">{formatCurrency(bill.amount)}</div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>{bill.waiter} • {bill.itemCount} ürün</span>
                            <span>{bill.duration}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-gray-200 p-4">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      Tüm Adisyonları Görüntüle
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-200 p-4 lg:p-6">
                    <h2 className="text-base font-semibold text-gray-900 lg:text-lg">Terminal Bazlı Toplam</h2>
                    <p className="mt-1 text-xs text-gray-600">{terminals.filter((terminal) => terminal.status !== 'Cevrimdisi').length} terminal aktif</p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {terminalPerformance.map((terminal) => (
                      <div key={terminal.terminalId} className="p-4">
                        <div className="mb-3 flex items-start gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                            <Terminal className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{terminal.terminalNo}</div>
                            <div className="text-xs text-gray-600">{localizeText(terminal.deviceName)}</div>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">İşlem:</span>
                            <span className="font-semibold text-gray-900">{terminal.transactionCount} adet</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tutar:</span>
                            <span className="font-bold text-gray-900">{formatCurrency(terminal.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-gray-600">Başarı Oranı:</span>
                            <span className="font-semibold text-green-600">{terminal.successRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-200 p-4 lg:p-6">
                    <h2 className="text-base font-semibold text-gray-900 lg:text-lg">Ödeme Tipi Dağılımı</h2>
                    <p className="mt-1 text-xs text-gray-600">{successfulTransactions} başarılı işlem</p>
                  </div>
                  <div className="p-4 lg:p-6">
                    <div className="space-y-4">
                      {paymentDistribution.map((payment) => (
                        <div key={payment.paymentType}>
                          <div className="mb-2 flex items-center justify-between">
                            <div className="text-sm font-semibold text-gray-900">{toUiPaymentType(payment.paymentType)}</div>
                            <div className="text-xs text-gray-600">%{payment.percentage.toFixed(1)}</div>
                          </div>
                          <div className="mb-2 h-2 rounded-full bg-gray-200">
                            <div className="h-2 rounded-full bg-[#d4a017]" style={{ width: `${payment.percentage}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{payment.transactionCount} işlem</span>
                            <span className="font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:mb-6 lg:p-6">
                <h2 className="mb-4 text-base font-semibold text-gray-900 lg:text-lg">Mutabakat Özeti</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 py-2">
                      <span className="text-sm text-gray-600">Toplam İşlem Sayısı:</span>
                      <span className="font-semibold text-gray-900">{totalTransactions}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 py-2">
                      <span className="text-sm text-gray-600">Başarılı İşlem:</span>
                      <span className="font-semibold text-green-600">{successfulTransactions}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 py-2">
                      <span className="text-sm text-gray-600">Başarısız İşlem:</span>
                      <span className="font-semibold text-red-600">{failedTransactions.length}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 py-2">
                      <span className="text-sm text-gray-600">Ortalama Hesap:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(averageTicket)}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 py-2">
                      <span className="text-sm text-gray-600">Kart Ödemeleri:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(cardPayments)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 py-2">
                      <span className="text-sm text-gray-600">Nakit Ödemeleri:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(cashPayments)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 py-2">
                      <span className="text-sm text-gray-600">İade/İptal Tutarı:</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(refundsCancellations)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b-2 border-gray-300 py-2">
                      <span className="text-sm font-bold text-gray-900">Net Ciro:</span>
                      <span className="text-xl font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4 rounded-xl border-2 border-[#d4a017] bg-white p-4 shadow-sm lg:mb-6 lg:p-6">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#d4a017]/10">
                    <Lock className="h-6 w-6 text-[#d4a017]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 lg:text-lg">Yönetici Onayı</h3>
                    <p className="mt-1 text-xs text-gray-600 lg:text-sm">Gün sonu kapanışı yapılabilmesi için yönetici onayı gereklidir</p>
                  </div>
                </div>

                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="mb-2 text-xs font-medium text-blue-600">Kontrol Listesi</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-gray-900">Terminal mutabakatları kontrol edildi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-gray-900">Nakit kasası sayımı için temel veriler hazır</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-gray-900">İade/iptal işlemleri listelendi</span>
                    </div>
                    {openBills.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-xs text-gray-900">Açık adisyonlar mevcut (kontrol gerekli)</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                  <Checkbox
                    id="manager-confirm"
                    checked={managerConfirmed}
                    onCheckedChange={(checked) => setManagerConfirmed(checked === true)}
                    className="mt-1"
                  />
                  <label htmlFor="manager-confirm" className="cursor-pointer text-sm text-gray-900">
                    Yukarıdaki tüm bilgileri kontrol ettim. Gün sonu raporunun doğruluğunu onaylıyorum ve kapanış işleminin yapılmasına izin veriyorum.
                    Bu işlem kayıt altına alınacaktır.
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-10 border-t-2 border-gray-200 bg-white p-4 shadow-lg lg:left-64">
          <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="mb-1 text-xs text-gray-600">Net Günlük Ciro</div>
              <div className="text-xl font-bold text-green-600 lg:text-2xl">{formatCurrency(totalRevenue)}</div>
            </div>
            <Button variant="outline" size="lg" className="sm:w-auto">
              <Eye className="mr-2 h-5 w-5" />
              Detayları Gör
            </Button>
            <Button
              size="lg"
              onClick={handleCloseDay}
              disabled={!managerConfirmed || isClosing}
              className="bg-[#d4a017] px-8 text-base font-semibold text-white hover:bg-[#b8860b] disabled:bg-gray-300 disabled:text-gray-500 sm:w-auto"
            >
              {isClosing ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Kapatılıyor...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Gün Sonunu Kapat
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
