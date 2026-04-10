import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Users, UserCheck } from 'lucide-react';

export default function OpenTable() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const [guestCount, setGuestCount] = useState(2);
  const [selectedWaiter, setSelectedWaiter] = useState('');

  const quickCounts = [1, 2, 3, 4, 5, 6, 8, 10];
  const waiters = [
    { id: '1', name: 'Ahmet Yılmaz', activeTables: 4 },
    { id: '2', name: 'Mehmet Demir', activeTables: 3 },
    { id: '3', name: 'Ayşe Kaya', activeTables: 5 },
  ];

  const handleConfirm = () => {
    if (!selectedWaiter) {
      alert('Lütfen garson seçin');
      return;
    }
    alert(`Masa ${tableId} başarıyla açıldı!`);
    navigate('/mobile/tables');
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
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900">Masa Aç</h1>
            <p className="text-xs text-gray-600">Masa {tableId}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Guest Count */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Misafir Sayısı
          </label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {quickCounts.map((count) => (
              <button
                key={count}
                onClick={() => setGuestCount(count)}
                className={`h-12 rounded-lg border-2 font-semibold transition-all ${
                  guestCount === count
                    ? 'border-[#d4a017] bg-[#d4a017]/10 text-[#d4a017]'
                    : 'border-gray-200 text-gray-700'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="1"
              value={guestCount}
              onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full h-12 pl-11 pr-4 border-2 border-gray-200 rounded-lg focus:border-[#d4a017] focus:outline-none text-base font-semibold"
            />
          </div>
        </div>

        {/* Waiter Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Garson Seçimi
          </label>
          <div className="space-y-2">
            {waiters.map((waiter) => (
              <button
                key={waiter.id}
                onClick={() => setSelectedWaiter(waiter.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  selectedWaiter === waiter.id
                    ? 'border-[#d4a017] bg-[#d4a017]/5'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedWaiter === waiter.id ? 'bg-[#d4a017]' : 'bg-gray-200'
                  }`}>
                    <UserCheck className={`w-5 h-5 ${
                      selectedWaiter === waiter.id ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">{waiter.name}</div>
                    <div className="text-xs text-gray-600">{waiter.activeTables} aktif masa</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 p-4">
        <button
          onClick={handleConfirm}
          disabled={!selectedWaiter}
          className="w-full h-12 bg-[#d4a017] hover:bg-[#b8860b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg"
        >
          Masayı Aç
        </button>
      </div>
    </div>
  );
}
