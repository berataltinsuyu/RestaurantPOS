import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CreditCard, Banknote, Plus, Trash2, Split } from 'lucide-react';

type PaymentEntry = {
  id: string;
  method: 'card' | 'cash';
  amount: number;
};

export default function SplitPayment() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const [splitMode, setSplitMode] = useState<'amount' | 'items'>('amount');
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<'card' | 'cash' | null>(null);
  const [currentAmount, setCurrentAmount] = useState('');

  const subtotal = 430.00;
  const serviceCharge = 43.00;
  const total = 473.00;

  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - paidAmount;

  const handleAddPayment = () => {
    if (!currentMethod || !currentAmount || parseFloat(currentAmount) <= 0) {
      alert('Lütfen ödeme yöntemi ve tutar girin');
      return;
    }

    const amount = parseFloat(currentAmount);
    if (amount > remaining) {
      alert('Ödeme tutarı kalan tutardan fazla olamaz');
      return;
    }

    setPayments([...payments, {
      id: Date.now().toString(),
      method: currentMethod,
      amount: amount
    }]);

    setCurrentMethod(null);
    setCurrentAmount('');
    setShowAddPayment(false);
  };

  const handleRemovePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const handleCompletePayment = () => {
    if (remaining > 0.01) {
      alert('Lütfen toplam tutarı tamamlayın');
      return;
    }

    alert('Bölünmüş ödeme tamamlandı!');
    navigate(`/mobile/payment-success/${tableId}`);
  };

  const quickAmounts = [
    total / 2,
    total / 3,
    total / 4,
    remaining
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center text-gray-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-base font-bold text-gray-900">Bölünmüş Ödeme</h1>
              <p className="text-xs text-gray-600">Masa {tableId}</p>
            </div>
            <div className="w-10"></div>
          </div>

          {/* Split Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setSplitMode('amount')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                splitMode === 'amount'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Tutara Göre
            </button>
            <button
              onClick={() => setSplitMode('items')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                splitMode === 'items'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Ürüne Göre
            </button>
          </div>
        </div>

        {/* Total & Remaining */}
        <div className="px-4 pb-3">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs text-gray-600 mb-0.5">Toplam</div>
                <div className="font-bold text-gray-900">₺{total.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-green-700 mb-0.5">Ödenen</div>
                <div className="font-bold text-green-700">₺{paidAmount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-amber-700 mb-0.5">Kalan</div>
                <div className="font-bold text-amber-700">₺{remaining.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {splitMode === 'amount' ? (
          <>
            {/* Payment Entries */}
            {payments.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-900 mb-3 px-1">
                  ÖDEMELER ({payments.length})
                </div>
                <div className="space-y-2">
                  {payments.map((payment, idx) => (
                    <div
                      key={payment.id}
                      className="bg-white border-2 border-gray-200 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          payment.method === 'card' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {payment.method === 'card' ? (
                            <CreditCard className={`w-5 h-5 ${
                              payment.method === 'card' ? 'text-blue-600' : 'text-green-600'
                            }`} />
                          ) : (
                            <Banknote className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {payment.method === 'card' ? 'Kart' : 'Nakit'} #{idx + 1}
                          </div>
                          <div className="text-xs text-gray-600">
                            {payment.method === 'card' ? 'POS ile' : 'Nakit tahsilat'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">₺{payment.amount.toFixed(2)}</div>
                        </div>
                        <button
                          onClick={() => handleRemovePayment(payment.id)}
                          className="w-8 h-8 flex items-center justify-center text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Payment Button */}
            {remaining > 0.01 && !showAddPayment && (
              <button
                onClick={() => setShowAddPayment(true)}
                className="w-full h-14 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-semibold flex items-center justify-center gap-2 mb-4 bg-white"
              >
                <Plus className="w-5 h-5" />
                Ödeme Ekle
              </button>
            )}

            {/* Add Payment Form */}
            {showAddPayment && (
              <div className="bg-white border-2 border-[#d4a017] rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-gray-900">Yeni Ödeme</div>
                  <button
                    onClick={() => setShowAddPayment(false)}
                    className="text-sm text-gray-600"
                  >
                    İptal
                  </button>
                </div>

                {/* Quick Amount Buttons */}
                <div className="mb-3">
                  <div className="text-xs text-gray-600 mb-2">Hızlı Tutar</div>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((amount, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentAmount(amount.toFixed(2))}
                        className="h-10 bg-gray-100 rounded-lg text-xs font-semibold text-gray-900 border-2 border-gray-200 active:scale-95"
                      >
                        {idx === 3 ? 'Kalan' : `1/${idx + 2}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">Tutar (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-[#d4a017] focus:outline-none text-lg font-bold"
                    placeholder="0.00"
                  />
                </div>

                {/* Payment Method */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-2">Ödeme Yöntemi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCurrentMethod('card')}
                      className={`h-12 border-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 ${
                        currentMethod === 'card'
                          ? 'border-[#d4a017] bg-[#d4a017]/10 text-gray-900'
                          : 'border-gray-200 text-gray-600 bg-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Kart
                    </button>
                    <button
                      onClick={() => setCurrentMethod('cash')}
                      className={`h-12 border-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 ${
                        currentMethod === 'cash'
                          ? 'border-[#d4a017] bg-[#d4a017]/10 text-gray-900'
                          : 'border-gray-200 text-gray-600 bg-white'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                      Nakit
                    </button>
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddPayment}
                  className="w-full h-12 bg-[#d4a017] text-white font-bold rounded-lg"
                >
                  Ödeme Ekle
                </button>
              </div>
            )}

            {/* Info */}
            {payments.length === 0 && !showAddPayment && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <Split className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-900 font-semibold mb-1">
                  Bölünmüş Ödeme
                </p>
                <p className="text-xs text-blue-800">
                  Farklı yöntemlerle ödeme alabilirsiniz
                </p>
              </div>
            )}
          </>
        ) : (
          // Items mode placeholder
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-sm text-amber-900 font-semibold mb-1">
              Ürüne Göre Bölme
            </p>
            <p className="text-xs text-amber-800">
              Sipariş içindeki ürünleri farklı ödemelere ayırın
            </p>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 p-4">
        <button
          onClick={handleCompletePayment}
          disabled={remaining > 0.01}
          className="w-full h-14 bg-[#d4a017] hover:bg-[#b8860b] disabled:opacity-50 disabled:bg-gray-300 text-white font-bold rounded-xl"
        >
          {remaining > 0.01
            ? `Kalan: ₺${remaining.toFixed(2)}`
            : 'Ödemeyi Tamamla'
          }
        </button>
      </div>
    </div>
  );
}
