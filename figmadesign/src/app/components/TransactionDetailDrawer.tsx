import { 
  X,
  Receipt,
  Printer,
  RotateCcw,
  Share2,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  CreditCard,
  FileText,
  MapPin,
  Terminal,
  Calendar,
  Banknote,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { Button } from './ui/button';

interface TransactionStep {
  label: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'pending';
  detail?: string;
}

interface TransactionDetail {
  id: string;
  receiptNo: string;
  tableNo: string;
  waiter: string;
  terminalId: string;
  terminalName: string;
  paymentType: string;
  amount: number;
  bankReference?: string;
  authCode?: string;
  cardLastFour?: string;
  date: string;
  time: string;
  status: 'success' | 'failed' | 'pending' | 'refunded';
  errorReason?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  timeline: TransactionStep[];
}

interface TransactionDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionDetail | null;
}

export function TransactionDetailDrawer({ isOpen, onClose, transaction }: TransactionDetailDrawerProps) {
  if (!transaction) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'success':
        return { label: 'Başarılı', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 };
      case 'failed':
        return { label: 'Başarısız', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle };
      case 'pending':
        return { label: 'Beklemede', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock };
      case 'refunded':
        return { label: 'İade Edildi', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: RotateCcw };
      default:
        return { label: 'Bilinmiyor', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle };
    }
  };

  const statusConfig = getStatusConfig(transaction.status);
  const StatusIcon = statusConfig.icon;

  const handlePrint = () => {
    console.log('Printing receipt:', transaction.id);
    alert('Fiş yazdırılıyor...');
  };

  const handleRefund = () => {
    console.log('Starting refund:', transaction.id);
    alert('İade işlemi başlatılıyor...');
  };

  const handleShare = () => {
    console.log('Sharing transaction:', transaction.id);
    alert('İşlem detayı paylaşılıyor...');
  };

  const handleViewReceipt = () => {
    console.log('Viewing receipt:', transaction.id);
    alert('Fiş görüntüleniyor...');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">İşlem Detayı</h2>
                <p className="text-xs text-gray-600">#{transaction.receiptNo}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold ${statusConfig.color}`}>
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </div>
            <div className="text-xs text-gray-600">
              {transaction.date} • {transaction.time}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-180px)] overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Transaction Summary */}
            <div className="bg-gradient-to-br from-[#d4a017]/10 to-[#d4a017]/5 rounded-xl border border-[#d4a017]/20 p-4">
              <div className="text-sm text-gray-600 mb-2">İşlem Tutarı</div>
              <div className="text-3xl font-bold text-gray-900">
                ₺{transaction.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm">
                <CreditCard className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900">{transaction.paymentType}</span>
                {transaction.cardLastFour && (
                  <span className="text-gray-600">•••• {transaction.cardLastFour}</span>
                )}
              </div>
            </div>

            {/* Error Message if Failed */}
            {transaction.status === 'failed' && transaction.errorReason && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-red-900">Hata Nedeni</div>
                    <div className="text-sm text-red-800 mt-1">{transaction.errorReason}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Information */}
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">İşlem Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-600">Masa Numarası</div>
                      <div className="text-sm font-semibold text-gray-900">{transaction.tableNo}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-600">Adisyon No</div>
                      <div className="text-sm font-semibold text-gray-900">{transaction.receiptNo}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-600">Garson</div>
                      <div className="text-sm font-semibold text-gray-900">{transaction.waiter}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Terminal className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-600">Terminal</div>
                      <div className="text-sm font-semibold text-gray-900">{transaction.terminalName}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{transaction.terminalId}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-600">İşlem Zamanı</div>
                      <div className="text-sm font-semibold text-gray-900">{transaction.date} {transaction.time}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Reference Info */}
              {transaction.bankReference && (
                <div className="p-4 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Banka Bilgileri</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Referans No:</span>
                      <span className="text-xs font-mono font-semibold text-gray-900">{transaction.bankReference}</span>
                    </div>
                    {transaction.authCode && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Onay Kodu:</span>
                        <span className="text-xs font-mono font-semibold text-gray-900">{transaction.authCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Receipt Summary */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Adisyon Özeti</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3 mb-4">
                  {transaction.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-600">
                          {item.quantity} x ₺{item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        ₺{item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">Toplam</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₺{transaction.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Timeline */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">İşlem Zaman Çizelgesi</h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {transaction.timeline.map((step, idx) => {
                    const isLast = idx === transaction.timeline.length - 1;
                    return (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.status === 'completed' 
                              ? 'bg-green-100' 
                              : step.status === 'failed' 
                              ? 'bg-red-100' 
                              : 'bg-gray-100'
                          }`}>
                            {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                            {step.status === 'failed' && <XCircle className="w-4 h-4 text-red-600" />}
                            {step.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 h-8 ${
                              step.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="text-sm font-semibold text-gray-900">{step.label}</div>
                          <div className="text-xs text-gray-600 mt-0.5">{step.timestamp}</div>
                          {step.detail && (
                            <div className="text-xs text-gray-700 mt-1 bg-gray-50 rounded px-2 py-1">
                              {step.detail}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Audit Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900">Denetim Bilgisi</h3>
                  <p className="text-xs text-blue-800 mt-1">
                    Bu işlem kaydı VakıfBank POS sisteminde güvenli bir şekilde saklanmaktadır. 
                    İşlem ID: {transaction.id} • Tüm işlemler denetim günlüğüne kaydedilmiştir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleViewReceipt}
              className="w-full"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Fiş Görüntüle
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="w-full"
            >
              <Printer className="w-4 h-4 mr-2" />
              Yazdır
            </Button>
            {transaction.status === 'success' && (
              <Button
                variant="outline"
                onClick={handleRefund}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                İade Başlat
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleShare}
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Detayı Paylaş
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
