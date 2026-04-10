import { Receipt, X, Printer, Download } from 'lucide-react';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ReceiptPreviewPanelProps {
  receiptNo: string;
  tableNo: string;
  waiter: string;
  date: string;
  time: string;
  items: ReceiptItem[];
  subtotal: number;
  serviceCharge: number;
  total: number;
  onClose?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

export function ReceiptPreviewPanel({
  receiptNo,
  tableNo,
  waiter,
  date,
  time,
  items,
  subtotal,
  serviceCharge,
  total,
  onClose,
  onPrint,
  onDownload
}: ReceiptPreviewPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Adisyon Önizleme</h3>
            <p className="text-xs text-gray-600">#{receiptNo}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Receipt Content */}
      <div className="p-4 lg:p-6">
        {/* Restaurant Info */}
        <div className="text-center mb-4 pb-4 border-b-2 border-dashed border-gray-200">
          <div className="font-bold text-gray-900 text-lg mb-1">VakıfBank POS</div>
          <div className="text-xs text-gray-600">Restaurant Adisyon Sistemi</div>
        </div>

        {/* Transaction Info */}
        <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Masa:</span>
            <span className="font-semibold text-gray-900">{tableNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Garson:</span>
            <span className="font-semibold text-gray-900">{waiter}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tarih:</span>
            <span className="font-semibold text-gray-900">{date} {time}</span>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
          {items.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900">{item.name}</span>
                <span className="font-semibold text-gray-900">
                  ₺{item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                {item.quantity} x ₺{item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Ara Toplam:</span>
            <span className="text-gray-900">₺{subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Servis Bedeli (%10):</span>
            <span className="text-gray-900">₺{serviceCharge.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="pt-3 border-t-2 border-gray-300 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-900">TOPLAM</span>
            <span className="text-xl font-bold text-gray-900">
              ₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 mb-4">
          <p>Bizi tercih ettiğiniz için teşekkür ederiz!</p>
          <p className="mt-1">Afiyet olsun</p>
        </div>
      </div>

      {/* Actions */}
      {(onPrint || onDownload) && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 lg:px-6 py-3 flex gap-2">
          {onPrint && (
            <button
              onClick={onPrint}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Yazdır
            </button>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#d4a017] hover:bg-[#b8860b] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              İndir
            </button>
          )}
        </div>
      )}
    </div>
  );
}
