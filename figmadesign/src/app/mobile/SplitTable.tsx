import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Users, Split } from 'lucide-react';
import { mockTables } from '../data/mockData';

export default function SplitTable() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const [splitCount, setSplitCount] = useState(2);

  const currentTable = mockTables.find(t => t.id === tableId);
  const splitAmount = (currentTable?.total || 0) / splitCount;
  const guestsPerTable = Math.ceil((currentTable?.guests || 0) / splitCount);

  const handleSplit = () => {
    alert(`Masa ${currentTable?.number} → ${splitCount} masaya ayrıldı`);
    navigate('/mobile/tables');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center text-gray-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-base font-bold text-gray-900">Masa Ayır</h1>
              <p className="text-xs text-gray-600">Masa {currentTable?.number}</p>
            </div>
          </div>
        </div>

        {/* Current Table */}
        <div className="px-4 pb-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs text-amber-700 mb-0.5">Masa</div>
                <div className="font-bold text-amber-900">{currentTable?.number}</div>
              </div>
              <div>
                <div className="text-xs text-amber-700 mb-0.5">Misafir</div>
                <div className="font-bold text-amber-900">{currentTable?.guests}</div>
              </div>
              <div>
                <div className="text-xs text-amber-700 mb-0.5">Toplam</div>
                <div className="font-bold text-amber-900">₺{currentTable?.total.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Split Count Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Kaç Masaya Bölünecek?
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 5].map((count) => (
              <button
                key={count}
                onClick={() => setSplitCount(count)}
                className={`h-14 rounded-xl border-2 font-bold text-lg transition-all ${
                  splitCount === count
                    ? 'border-amber-500 bg-amber-50 text-amber-900'
                    : 'border-gray-200 text-gray-700 bg-white'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-900 mb-3">Önizleme</div>
          <div className="space-y-2">
            {Array.from({ length: splitCount }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-amber-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Split className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Yeni Masa #{idx + 1}</div>
                      <div className="text-xs text-gray-600 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        ~{guestsPerTable} kişi
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600 mb-0.5">Tahmini</div>
                    <div className="font-bold text-gray-900">₺{splitAmount.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Not:</strong> Masa ayrıldıktan sonra siparişleri yeni masalara manuel olarak dağıtmanız gerekecek.
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 p-4">
        <button
          onClick={handleSplit}
          className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
        >
          <Split className="w-5 h-5" />
          {splitCount} Masaya Ayır
        </button>
      </div>
    </div>
  );
}
