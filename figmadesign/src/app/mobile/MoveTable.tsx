import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Check, Search } from 'lucide-react';
import { mockTables } from '../data/mockData';

export default function MoveTable() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get current table info
  const currentTable = mockTables.find(t => t.id === tableId);
  
  // Available tables (empty or paid)
  const availableTables = mockTables.filter(t => 
    t.id !== tableId && 
    (t.status === 'Boş' || t.status === 'Ödendi') &&
    t.number.toString().includes(searchQuery)
  );

  const handleMove = () => {
    if (!selectedTarget) {
      alert('Lütfen hedef masa seçin');
      return;
    }
    alert(`Masa ${currentTable?.number} → Masa ${mockTables.find(t => t.id === selectedTarget)?.number} taşındı!`);
    navigate('/mobile/tables');
  };

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
            <div className="flex-1">
              <h1 className="text-base font-bold text-gray-900">Masa Taşı</h1>
              <p className="text-xs text-gray-600">Masa {currentTable?.number}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 border-2 border-gray-200 rounded-lg focus:border-[#d4a017] focus:outline-none text-sm"
              placeholder="Hedef masa ara..."
            />
          </div>
        </div>

        {/* Current Table Info */}
        <div className="px-4 pb-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-700 mb-0.5">Taşınacak Masa</div>
                <div className="font-bold text-blue-900">Masa {currentTable?.number}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-700 mb-0.5">Tutar</div>
                <div className="font-bold text-blue-900">₺{currentTable?.total.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Tables */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs font-semibold text-gray-600 mb-3 px-1">
          MÜSAİT MASALAR ({availableTables.length})
        </div>
        <div className="grid grid-cols-3 gap-2">
          {availableTables.map((table) => (
            <button
              key={table.id}
              onClick={() => setSelectedTarget(table.id)}
              className={`aspect-square rounded-xl border-2 p-3 flex flex-col items-center justify-center transition-all ${
                selectedTarget === table.id
                  ? 'border-[#d4a017] bg-[#d4a017]/10'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className={`text-2xl font-bold mb-1 ${
                selectedTarget === table.id ? 'text-[#d4a017]' : 'text-gray-900'
              }`}>
                {table.number}
              </div>
              <div className="text-xs text-gray-500">Boş</div>
              {selectedTarget === table.id && (
                <div className="absolute top-1 right-1 w-6 h-6 bg-[#d4a017] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {availableTables.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">Müsait masa bulunamadı</p>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 p-4">
        <button
          onClick={handleMove}
          disabled={!selectedTarget}
          className="w-full h-14 bg-[#d4a017] hover:bg-[#b8860b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl"
        >
          Masa Taşı
        </button>
      </div>
    </div>
  );
}
