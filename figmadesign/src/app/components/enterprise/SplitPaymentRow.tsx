import { CreditCard, Banknote, Send, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react';

interface SplitPaymentRowProps {
  index: number;
  amount: number;
  method: 'Kart' | 'Nakit';
  status: 'Bekliyor' | 'POS\'a Gönderildi' | 'Tamamlandı' | 'Başarısız';
  referenceNo?: string;
  error?: string;
  onAmountChange?: (value: number) => void;
  onMethodChange?: (method: 'Kart' | 'Nakit') => void;
  onSend?: () => void;
  onRemove?: () => void;
  readonly?: boolean;
}

export function SplitPaymentRow({
  index,
  amount,
  method,
  status,
  referenceNo,
  error,
  onAmountChange,
  onMethodChange,
  onSend,
  onRemove,
  readonly = false
}: SplitPaymentRowProps) {
  const statusConfig = {
    'Bekliyor': {
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: Clock,
      borderColor: 'border-gray-200'
    },
    'POS\'a Gönderildi': {
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Send,
      borderColor: 'border-blue-200'
    },
    'Tamamlandı': {
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle2,
      borderColor: 'border-green-200'
    },
    'Başarısız': {
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: XCircle,
      borderColor: 'border-red-200'
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const isEditable = status === 'Bekliyor' && !readonly;

  return (
    <div className={`bg-white rounded-xl border-2 shadow-sm p-4 lg:p-6 ${config.borderColor}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
            {index}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Ödeme Bölümü {index}</h3>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold mt-1 ${config.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {status}
            </div>
          </div>
        </div>
        {isEditable && onRemove && (
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 transition-colors p-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditable ? (
        <>
          {/* Amount Input */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-700 mb-2 block">Ödeme Tutarı</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => onAmountChange?.(parseFloat(e.target.value) || 0)}
                className="w-full h-12 text-base font-semibold pr-12 border border-gray-300 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-[#d4a017] focus:border-transparent"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₺</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-700 mb-2 block">Ödeme Yöntemi</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onMethodChange?.('Kart')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  method === 'Kart'
                    ? 'border-[#d4a017] bg-[#d4a017]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="font-medium text-sm">Kart ile</span>
              </button>
              <button
                onClick={() => onMethodChange?.('Nakit')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  method === 'Nakit'
                    ? 'border-[#d4a017] bg-[#d4a017]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span className="font-medium text-sm">Nakit</span>
              </button>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={onSend}
            disabled={amount <= 0}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            {method === 'Kart' ? 'POS\'a Gönder' : 'Nakit Onayla'}
          </button>
        </>
      ) : (
        <div className={`rounded-lg p-4 border-2 ${
          status === 'Tamamlandı' ? 'bg-green-50 border-green-200' :
          status === 'Başarısız' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tutar</span>
              <span className="font-bold text-gray-900">
                ₺{amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Yöntem</span>
              <span className="font-medium text-gray-900">{method}</span>
            </div>
            {referenceNo && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Referans</span>
                <span className="font-mono text-xs text-gray-900">{referenceNo}</span>
              </div>
            )}
            {error && (
              <div className="pt-2 border-t border-red-200">
                <span className="text-xs text-red-800">{error}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
