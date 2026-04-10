import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AccessDeniedState } from '../components/enterprise/AccessDeniedState';
import { EmptyState } from '../components/enterprise/EmptyState';
import { LoadingSkeleton } from '../components/enterprise/LoadingSkeleton';
import { paymentsApi, transactionsApi } from '../lib/api';
import { ApiError } from '../lib/http';
import { getErrorMessage, isForbiddenError } from '../lib/error-utils';
import { formatCurrency, formatDateTime, localizeText, toUiPaymentType, toUiTransactionStatus } from '../lib/mappers';
import { AlertTriangle, CheckCircle2, XCircle, ArrowLeft, FileText, RotateCcw, Terminal } from 'lucide-react';

type RefundType = 'full' | 'partial';
type ProcessState = 'form' | 'success' | 'failed';

interface RefundTransactionState {
  paymentId: number;
  adisyonNo: string;
  masaNo: string;
  terminalNo?: string;
  referansNo?: string;
  odemeTipi: string;
  islemTarihi: string;
  tutar: number;
  kartSonDort?: string;
}

const refundReasons = [
  'Müşteri İsteği',
  'Hatalı İşlem',
  'Ürün/Hizmet İptali',
  'Fiyat Hatası',
  'Sistem Hatası',
  'Yönetici Onayı',
  'Diğer',
];

export default function RefundCancel() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state || null) as RefundTransactionState | null;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transaction, setTransaction] = useState<RefundTransactionState | null>(routeState);
  const [isLoading, setIsLoading] = useState(!routeState);
  const [errorMessage, setErrorMessage] = useState('');
  const [refundType, setRefundType] = useState<RefundType>('full');
  const [refundAmount, setRefundAmount] = useState(routeState ? routeState.tutar.toFixed(2) : '');
  const [refundReason, setRefundReason] = useState('');
  const [description, setDescription] = useState('');
  const [authorizerName, setAuthorizerName] = useState('');
  const [processState, setProcessState] = useState<ProcessState>('form');
  const [processErrorCode, setProcessErrorCode] = useState('');
  const [processErrorMessage, setProcessErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);

  const loadDefaultTransaction = useCallback(async () => {
    if (routeState) {
      return;
    }

    setIsLoading(true);
    setIsForbidden(false);
    setErrorMessage('');

    try {
      const history = await transactionsApi.history();
      const latestSuccessful = history.find(
        (item) =>
          toUiTransactionStatus(item.statusLabel) === 'Başarılı' &&
          item.transactionTypeLabel === 'Odeme',
      );

      if (!latestSuccessful) {
        setTransaction(null);
        return;
      }

      const detail = await transactionsApi.detail(latestSuccessful.id);
      setTransaction({
        paymentId: latestSuccessful.id,
        adisyonNo: detail.receiptNo,
        masaNo: detail.tableNo,
        terminalNo: detail.terminalId || latestSuccessful.terminalNo,
        referansNo: detail.bankReference || latestSuccessful.referenceNo || undefined,
        odemeTipi: toUiPaymentType(detail.paymentType),
        islemTarihi: formatDateTime(detail.transactionDate),
        tutar: detail.amount,
        kartSonDort: detail.cardLastFour || undefined,
      });
      setRefundAmount(detail.amount.toFixed(2));
    } catch (error) {
      if (isForbiddenError(error)) {
        setIsForbidden(true);
        setErrorMessage('İade ekranına erişim yetkiniz bulunmuyor.');
      } else {
        setErrorMessage(getErrorMessage(error, 'İade verileri alınamadı.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [routeState]);

  useEffect(() => {
    loadDefaultTransaction();
  }, [loadDefaultTransaction]);

  const maxRefundAmount = transaction?.tutar ?? 0;

  const parsedRefundAmount = useMemo(() => {
    const value = Number(refundAmount);
    return Number.isFinite(value) ? value : 0;
  }, [refundAmount]);

  const handleSubmitRefund = async () => {
    if (!transaction) {
      return;
    }

    setIsSubmitting(true);
    try {
      await paymentsApi.refund({
        originalPaymentId: transaction.paymentId,
        amount: parsedRefundAmount,
        reason: refundReason,
        description: description || undefined,
        approverName: authorizerName || undefined,
      });

      setProcessState('success');
    } catch (error) {
      setProcessErrorCode(error instanceof ApiError ? `HTTP-${error.status}` : 'REFUND-ERROR');
      setProcessErrorMessage(getErrorMessage(error, 'İade işlemi tamamlanamadı.'));
      setProcessState('failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setProcessState('form');
    setProcessErrorCode('');
    setProcessErrorMessage('');
  };

  const handleCancel = () => {
    navigate('/history');
  };

  const handleViewDetails = () => {
    navigate('/history');
  };

  if (processState === 'success' && transaction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />

          <div className="px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
            <div className="mx-auto max-w-2xl">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">İade Başarılı</h2>
                  <p className="mb-6 text-sm text-gray-600">İade işlemi başarıyla tamamlandı</p>

                  <div className="mb-6 space-y-3 rounded-lg bg-gray-50 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Adisyon No:</span>
                      <span className="font-semibold text-gray-900">{transaction.adisyonNo}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Referans No:</span>
                      <span className="font-semibold text-gray-900">{transaction.referansNo || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">İade Tutarı:</span>
                      <span className="text-xl font-bold text-green-600">{formatCurrency(parsedRefundAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">İade Tarihi:</span>
                      <span className="font-semibold text-gray-900">{new Date().toLocaleString('tr-TR')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button onClick={() => navigate('/history')} className="flex-1 bg-[#d4a017] text-white hover:bg-[#b8860b]">
                      İşlem Geçmişine Dön
                    </Button>
                    <Button onClick={() => window.print()} variant="outline" className="flex-1">
                      Makbuz Yazdır
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (processState === 'failed' && transaction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />

          <div className="px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
            <div className="mx-auto max-w-2xl">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <XCircle className="h-10 w-10 text-red-600" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">İade Başarısız</h2>
                  <p className="mb-6 text-sm text-gray-600">İade işlemi tamamlanamadı</p>

                  <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
                    <div className="mb-3 flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                      <div className="flex-1">
                        <div className="mb-1 text-sm font-semibold text-red-900">Hata Kodu: {processErrorCode}</div>
                        <div className="text-sm text-red-700">{processErrorMessage}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 space-y-2 rounded-lg bg-gray-50 p-4 text-left">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Adisyon No:</span>
                      <span className="font-semibold text-gray-900">{transaction.adisyonNo}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Terminal:</span>
                      <span className="font-semibold text-gray-900">{transaction.terminalNo || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Denenen Tutar:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(parsedRefundAmount)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button onClick={handleRetry} className="flex-1 bg-[#d4a017] text-white hover:bg-[#b8860b]">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Tekrar Dene
                    </Button>
                    <Button onClick={handleViewDetails} variant="outline" className="flex-1">
                      <Terminal className="mr-2 h-4 w-4" />
                      İşlem Geçmişine Dön
                    </Button>
                  </div>

                  <Button onClick={handleCancel} variant="ghost" className="mt-3 w-full">
                    İptal Et
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 lg:mb-6">
              <div className="mb-2 flex items-center gap-3">
                <button onClick={handleCancel} className="rounded-lg p-2 transition-colors hover:bg-gray-100 lg:hidden">
                  <ArrowLeft className="h-5 w-5 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">İade / İptal İşlemi</h1>
              </div>
              <p className="text-xs text-gray-600 lg:text-sm">Tamamlanmış ödeme işlemini iade edin</p>
            </div>

            {isLoading ? (
              <LoadingSkeleton type="detail" count={8} />
            ) : isForbidden ? (
              <div className="mx-auto max-w-4xl">
                <AccessDeniedState onBack={() => navigate(-1)} onHome={() => navigate('/dashboard')} />
              </div>
            ) : errorMessage ? (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <EmptyState
                  type="error"
                  title="İade işlemi hazırlanamadı"
                  description={errorMessage}
                  action={{ label: 'Tekrar Dene', onClick: loadDefaultTransaction }}
                />
              </div>
            ) : !transaction ? (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <EmptyState
                  type="no-data"
                  title="İade edilebilir işlem bulunamadı"
                  description="İade sürecini başlatmak için işlem geçmişinden başarılı bir ödeme seçin."
                  action={{ label: 'İşlem Geçmişine Git', onClick: () => navigate('/history') }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                <div className="space-y-4 lg:col-span-2 lg:space-y-6">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-700" />
                      <h2 className="text-base font-semibold text-gray-900 lg:text-lg">Orijinal İşlem Bilgileri</h2>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs text-gray-600">Adisyon No</label>
                          <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">{transaction.adisyonNo}</div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-gray-600">Masa No</label>
                          <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">{transaction.masaNo}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs text-gray-600">Terminal No</label>
                          <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">{transaction.terminalNo || '-'}</div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-gray-600">Referans No</label>
                          <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">{transaction.referansNo || '-'}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs text-gray-600">Ödeme Tipi</label>
                          <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">{transaction.odemeTipi}</div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-gray-600">İşlem Tarihi</label>
                          <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">{transaction.islemTarihi}</div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Toplam Tutar</span>
                          <span className="text-xl font-bold text-gray-900">{formatCurrency(transaction.tutar)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                    <h2 className="mb-4 text-base font-semibold text-gray-900 lg:text-lg">İade Türü</h2>

                    <div className="mb-4 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setRefundType('full');
                          setRefundAmount(transaction.tutar.toFixed(2));
                        }}
                        className={`rounded-lg border-2 p-4 transition-all ${
                          refundType === 'full' ? 'border-[#d4a017] bg-[#d4a017]/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="mb-1 text-sm font-semibold text-gray-900">Tam İade</div>
                        <div className="text-xs text-gray-600">Tüm tutar iade edilir</div>
                      </button>
                      <button
                        onClick={() => {
                          setRefundType('partial');
                          setRefundAmount('');
                        }}
                        className={`rounded-lg border-2 p-4 transition-all ${
                          refundType === 'partial' ? 'border-[#d4a017] bg-[#d4a017]/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="mb-1 text-sm font-semibold text-gray-900">Kısmi İade</div>
                        <div className="text-xs text-gray-600">Belirtilen tutar iade edilir</div>
                      </button>
                    </div>

                    {refundType === 'partial' ? (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">İade Tutarı (₺)</label>
                        <Input
                          type="number"
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          max={transaction.tutar}
                          className="text-lg"
                        />
                        <p className="mt-1 text-xs text-gray-500">Maksimum: {formatCurrency(transaction.tutar)}</p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <p className="text-sm text-blue-900">
                          Tam iade seçildi: <span className="font-bold">{formatCurrency(transaction.tutar)}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                    <h2 className="mb-4 text-base font-semibold text-gray-900 lg:text-lg">İade Gerekçesi</h2>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          İptal / İade Nedeni <span className="text-red-500">*</span>
                        </label>
                        <Select value={refundReason} onValueChange={setRefundReason}>
                          <SelectTrigger>
                            <SelectValue placeholder="Neden seçiniz..." />
                          </SelectTrigger>
                          <SelectContent>
                            {refundReasons.map((reason) => (
                              <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Açıklama</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="İade işlemi hakkında ek açıklama giriniz..."
                          rows={3}
                          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#d4a017]"
                        />
                        <p className="mt-1 text-xs text-gray-500">İsteğe bağlı</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                    <h2 className="mb-4 text-base font-semibold text-gray-900 lg:text-lg">Kullanıcı Onayı</h2>

                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                        <div className="text-sm text-amber-900">
                          <p className="mb-1 font-semibold">Yetki Gerekli</p>
                          <p className="text-xs">Bu işlem yetkili personel onayı gerektirir. İşlem kaydı sisteme işlenir.</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Yetkili Adı Soyadı <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={authorizerName}
                        onChange={(e) => setAuthorizerName(e.target.value)}
                        placeholder="Onaylayan yetkilinin adı soyadı"
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                    <h2 className="mb-4 text-base font-semibold text-gray-900">İşlem Özeti</h2>

                    <div className="mb-6 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">İşlem Türü:</span>
                        <span className="font-semibold text-gray-900">{refundType === 'full' ? 'Tam İade' : 'Kısmi İade'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Orijinal Tutar:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(transaction.tutar)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">İade Tutarı:</span>
                          <span className="text-xl font-bold text-[#d4a017]">{formatCurrency(parsedRefundAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={handleSubmitRefund}
                        disabled={isSubmitting || !refundReason || !authorizerName || parsedRefundAmount <= 0 || parsedRefundAmount > maxRefundAmount}
                        className="w-full bg-[#d4a017] text-white hover:bg-[#b8860b] disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {isSubmitting ? 'İşleniyor...' : 'POS\'a İade Gönder'}
                      </Button>
                      <Button onClick={handleViewDetails} variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        İşlem Geçmişine Git
                      </Button>
                      <Button onClick={handleCancel} variant="ghost" className="w-full">
                        Vazgeç
                      </Button>
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <p className="text-xs leading-relaxed text-gray-500">
                        İade işlemi, bankanız tarafından onaylandıktan sonra 3-5 iş günü içinde müşteri hesabına yansır.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
