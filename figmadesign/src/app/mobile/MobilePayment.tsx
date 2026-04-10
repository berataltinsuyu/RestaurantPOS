import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CreditCard, Banknote, CheckCircle2, Split } from 'lucide-react';

export default function MobilePayment() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | null>(null);
  const [processing, setProcessing] = useState(false);

  const subtotal = 430.00;
  const serviceCharge = 43.00;
  const total = 473.00;

  const handlePayment = () => {
    if (!paymentMethod) {
      alert('Lütfen ödeme yöntemi seçin');
      return;
    }

    setProcessing(true);
    
    if (paymentMethod === 'card') {
      // Redirect to POS device flow
      setTimeout(() => {
        setProcessing(false);
        navigate(`/mobile/pos-redirect/${tableId}`);
      }, 1000);
    } else {
      // Cash payment - direct to success
      setTimeout(() => {
        setProcessing(false);
        navigate(`/mobile/payment-success/${tableId}`);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-gray-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-base font-bold text-gray-900">Ödeme</h1>
            <p className="text-xs text-gray-600">Masa {tableId}</p>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Order Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <h2 className="font-bold text-gray-900 mb-3">Sipariş Özeti</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Ara Toplam</span>
              <span className="text-gray-900">₺{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Servis Bedeli (%10)</span>
              <span className="text-gray-900">₺{serviceCharge.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between">
              <span className="font-bold text-gray-900">Toplam</span>
              <span className="font-bold text-xl text-gray-900">₺{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-4">
          <h2 className="font-bold text-gray-900 mb-3 px-1">Ödeme Yöntemi</h2>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full bg-white border-2 rounded-xl p-4 transition-all ${
                paymentMethod === 'card'
                  ? 'border-[#d4a017] bg-[#d4a017]/5'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  paymentMethod === 'card' ? 'bg-[#d4a017]' : 'bg-blue-100'
                }`}>
                  <CreditCard className={`w-6 h-6 ${
                    paymentMethod === 'card' ? 'text-white' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">Kart ile Ödeme</div>
                  <div className="text-sm text-gray-600">POS cihazı ile</div>
                </div>
                {paymentMethod === 'card' && (
                  <div className="w-6 h-6 bg-[#d4a017] rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('cash')}
              className={`w-full bg-white border-2 rounded-xl p-4 transition-all ${
                paymentMethod === 'cash'
                  ? 'border-[#d4a017] bg-[#d4a017]/5'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  paymentMethod === 'cash' ? 'bg-[#d4a017]' : 'bg-green-100'
                }`}>
                  <Banknote className={`w-6 h-6 ${
                    paymentMethod === 'cash' ? 'text-white' : 'text-green-600'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">Nakit Ödeme</div>
                  <div className="text-sm text-gray-600">Direkt nakit tahsilat</div>
                </div>
                {paymentMethod === 'cash' && (
                  <div className="w-6 h-6 bg-[#d4a017] rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>

            {/* Split Payment Option */}
            <button
              onClick={() => navigate(`/mobile/split-payment/${tableId}`)}
              className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 transition-all active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100">
                  <Split className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">Bölünmüş Ödeme</div>
                  <div className="text-sm text-gray-600">Farklı yöntemlerle ödeme al</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Payment Info */}
        {paymentMethod === 'card' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">POS Cihazı Bilgisi</p>
              <p className="text-xs text-blue-800">
                Ödeme tamamlandıktan sonra POS cihazından onay alınacaktır.
              </p>
            </div>
          </div>
        )}

        {paymentMethod === 'cash' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-sm text-green-900">
              <p className="font-semibold mb-1">Nakit Ödeme</p>
              <p className="text-xs text-green-800">
                Nakit tahsilat sonrası masayı kapatabilirsiniz.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="p-4 space-y-2">
          {/* Main Payment Button */}
          <button
            onClick={handlePayment}
            disabled={!paymentMethod || processing}
            className="w-full h-14 bg-[#d4a017] hover:bg-[#b8860b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-base transition-colors"
          >
            {processing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                İşleniyor...
              </div>
            ) : (
              `₺${total.toFixed(2)} Tahsil Et`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}