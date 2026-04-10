import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AccessDeniedState } from '../components/enterprise/AccessDeniedState';
import { EmptyState } from '../components/enterprise/EmptyState';
import { LoadingSkeleton } from '../components/enterprise/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { billsApi, paymentsApi, terminalsApi } from '../lib/api';
import { getErrorMessage, isForbiddenError } from '../lib/error-utils';
import { formatCurrency, localizeText, toUiTerminalStatus } from '../lib/mappers';
import type { BillSummaryDto, PosTerminalDto } from '../types/api';
import { ArrowLeft, CreditCard, Banknote, Split, X, CheckCircle2, Loader2 } from 'lucide-react';

export default function Payment() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [bill, setBill] = useState<BillSummaryDto | null>(null);
  const [terminals, setTerminals] = useState<PosTerminalDto[]>([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('');
  const [selectedTerminal, setSelectedTerminal] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForbidden, setIsForbidden] = useState(false);

  const numericTableId = Number(tableId);
  const branchId = session?.branch.id;

  const loadPaymentData = useCallback(async () => {
    if (!numericTableId || !branchId) {
      return;
    }

    setIsLoading(true);
    setIsForbidden(false);
    setErrorMessage('');

    try {
      const [billResponse, terminalsResponse] = await Promise.all([
        billsApi.getByTable(numericTableId),
        terminalsApi.getByBranch(branchId),
      ]);

      setBill(billResponse);
      setTerminals(terminalsResponse.filter((terminal) => terminal.isActive));
    } catch (error) {
      if (isForbiddenError(error)) {
        setIsForbidden(true);
        setErrorMessage('Ödeme ekranına erişim yetkiniz bulunmuyor.');
      } else {
        setErrorMessage(getErrorMessage(error, 'Ödeme bilgileri alınamadı.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [branchId, numericTableId]);

  useEffect(() => {
    loadPaymentData();
  }, [loadPaymentData]);

  const activeTerminals = useMemo(
    () => terminals.filter((terminal) => terminal.status !== 'Cevrimdisi'),
    [terminals],
  );

  const selectedTerminalDetail = activeTerminals.find((terminal) => String(terminal.id) === selectedTerminal) ?? null;
  const payableAmount = bill?.remainingAmount ?? 0;

  const paymentTypes = [
    {
      id: 'card',
      label: 'Kart ile Ödeme',
      icon: CreditCard,
      accentClass: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'cash',
      label: 'Nakit Ödeme',
      icon: Banknote,
      accentClass: 'bg-green-100 text-green-600',
    },
    {
      id: 'split',
      label: 'Bölünmüş Ödeme',
      icon: Split,
      accentClass: 'bg-purple-100 text-purple-600',
    },
  ];

  const handlePayment = async () => {
    if (!bill) {
      return;
    }

    if (selectedPaymentType === 'split') {
      navigate(`/split-payment/${numericTableId}`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedPaymentType === 'cash') {
        const payment = await paymentsApi.cash({
          billId: bill.id,
          amount: payableAmount,
        });

        toast.success('Nakit ödeme başarıyla alındı.');
        navigate('/success', {
          state: {
            paymentType: 'Nakit',
            amount: payment.amount,
            tableId: numericTableId,
            tableNo: bill.tableNo,
            billNo: bill.billNo,
            referenceNo: payment.referenceNo,
            processedAt: payment.completedAt || payment.createdAt,
          },
        });
        return;
      }

      if (selectedPaymentType === 'card' && selectedTerminalDetail) {
        navigate('/processing', {
          state: {
            billId: bill.id,
            tableId: numericTableId,
            tableNo: bill.tableNo,
            billNo: bill.billNo,
            amount: payableAmount,
            terminalId: selectedTerminalDetail.id,
            terminalNo: selectedTerminalDetail.terminalNo,
          },
        });
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Ödeme işlemi başlatılamadı.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
          <div className="mb-4 lg:mb-6">
            <button
              onClick={() => navigate(`/bill/${tableId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 lg:mb-4"
            >
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="text-sm lg:text-base">Adisyona Geri Dön</span>
            </button>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Ödeme Ekranı</h1>
          </div>

          {errorMessage && !isLoading && !isForbidden ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 mb-6">
              {errorMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto">
              <LoadingSkeleton type="detail" count={6} />
              <LoadingSkeleton type="detail" count={5} />
            </div>
          ) : isForbidden ? (
            <div className="mx-auto max-w-4xl">
              <AccessDeniedState
                onBack={() => navigate(-1)}
                onHome={() => navigate('/dashboard')}
              />
            </div>
          ) : !bill ? (
            <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm">
              <EmptyState
                type="no-data"
                title="Ödenecek adisyon bulunamadı"
                description="Seçili masa için aktif bir ödeme kaydı bulunmuyor."
                action={{
                  label: 'Masalara Dön',
                  onClick: () => navigate('/dashboard'),
                }}
              />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Ödeme Özeti</h2>

                  <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                    <div className="flex items-center justify-between text-xs lg:text-sm pb-2 lg:pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Masa No</span>
                      <span className="font-semibold text-gray-900">{bill.tableNo}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs lg:text-sm pb-2 lg:pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Adisyon No</span>
                      <span className="font-medium text-gray-900">{bill.billNo}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs lg:text-sm pb-2 lg:pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Ürün Sayısı</span>
                      <span className="font-medium text-gray-900">
                        {bill.items.reduce((sum, item) => sum + item.quantity, 0)} Adet
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 lg:p-4 space-y-1.5 lg:space-y-2 mb-4 lg:mb-6">
                    <div className="flex items-center justify-between text-xs lg:text-sm">
                      <span className="text-gray-600">Ara Toplam</span>
                      <span className="font-medium text-gray-900">{formatCurrency(bill.subtotal)}</span>
                    </div>
                    {bill.discountAmount > 0 && (
                      <div className="flex items-center justify-between text-xs lg:text-sm">
                        <span className="text-gray-600">İndirim</span>
                        <span className="font-medium text-red-600">-{formatCurrency(bill.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs lg:text-sm">
                      <span className="text-gray-600">Hizmet Bedeli</span>
                      <span className="font-medium text-gray-900">{formatCurrency(bill.serviceCharge)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-300 flex items-center justify-between">
                      <span className="font-semibold text-sm lg:text-base text-gray-900">Ödenecek Tutar</span>
                      <span className="text-xl lg:text-2xl font-bold text-gray-900">{formatCurrency(payableAmount)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 lg:space-y-3">
                    <label className="text-xs lg:text-sm font-medium text-gray-700">Ödeme Türü</label>
                    <div className="space-y-2">
                      {paymentTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = selectedPaymentType === type.id;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setSelectedPaymentType(type.id)}
                            className={`w-full flex items-center gap-2 lg:gap-3 p-3 lg:p-4 rounded-lg border-2 transition-all ${
                              isSelected ? 'border-[#d4a017] bg-[#d4a017]/5' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-[#d4a017] text-white' : type.accentClass
                            }`}>
                              <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                            </div>
                            <span className={`font-medium text-sm lg:text-base ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                              {type.label}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-[#d4a017] ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  {selectedPaymentType === 'card' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                      <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Terminal Seçimi</h2>

                      <div className="mb-4 lg:mb-6">
                        <label className="text-xs lg:text-sm font-medium text-gray-700 mb-2 block">POS Cihazı</label>
                        <Select value={selectedTerminal} onValueChange={setSelectedTerminal}>
                          <SelectTrigger className="h-10 lg:h-12">
                            <SelectValue placeholder="Terminal seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeTerminals.map((terminal) => (
                              <SelectItem key={terminal.id} value={String(terminal.id)}>
                                {terminal.terminalNo} ({localizeText(terminal.deviceName)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedTerminalDetail && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4 mb-3 lg:mb-4">
                          <div className="text-xs lg:text-sm font-medium text-blue-900 mb-1.5 lg:mb-2">POS Cihaz Bilgileri</div>
                          <div className="space-y-1 text-xs text-blue-700">
                            <div>Terminal No: {selectedTerminalDetail.terminalNo}</div>
                            <div>Durum: <span className="font-medium">{toUiTerminalStatus(selectedTerminalDetail.status)}</span></div>
                            <div>Kasa: {localizeText(selectedTerminalDetail.cashRegisterName)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedPaymentType === 'cash' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                      <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Nakit Ödeme</h2>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 lg:p-4">
                        <div className="text-xs lg:text-sm text-green-800">
                          Nakit ödeme alındığında adisyon ve masa durumu backend üzerinde gerçek olarak güncellenecektir.
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPaymentType === 'split' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                      <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Bölünmüş Ödeme</h2>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 lg:p-4">
                        <div className="text-xs lg:text-sm text-purple-800">
                          Kart ve nakit bileşenleri ile gerçek split payment isteği oluşturmak için devam edin.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                    <div className="space-y-2 lg:space-y-3">
                      <Button
                        onClick={handlePayment}
                        disabled={
                          isSubmitting ||
                          payableAmount <= 0 ||
                          !selectedPaymentType ||
                          (selectedPaymentType === 'card' && !selectedTerminal)
                        }
                        className="w-full h-12 lg:h-14 bg-[#d4a017] hover:bg-[#c49316] text-white font-semibold text-base lg:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            İşlem Başlatılıyor
                          </span>
                        ) : (
                          <>
                            {selectedPaymentType === 'card' && 'VakıfBank POS\'a Gönder'}
                            {selectedPaymentType === 'cash' && 'Nakit Ödeme Onayla'}
                            {selectedPaymentType === 'split' && 'Bölünmüş Ödemeye Geç'}
                            {!selectedPaymentType && 'Ödeme Türü Seçiniz'}
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={() => navigate(`/bill/${tableId}`)}
                        variant="outline"
                        className="w-full h-10 lg:h-12 border-2"
                      >
                        <X className="w-4 h-4 mr-2" />
                        İptal
                      </Button>
                    </div>

                    <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500 text-center">Güvenli ödeme • 256-bit SSL şifreleme</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
