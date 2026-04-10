import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Check, Search } from 'lucide-react';
import { mockTables } from '../data/mockData';

export default function TableSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action'); // 'move', 'merge', 'split'
  
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const actionConfig = {
    move: {
      title: 'Masa Taşı',
      subtitle: 'Taşınacak masayı seçin',
      buttonText: 'Devam',
      filter: (t: typeof mockTables[0]) => t.status === 'Dolu',
    },
    merge: {
      title: 'Masa Birleştir',
      subtitle: 'Ana masayı seçin',
      buttonText: 'Devam',
      filter: (t: typeof mockTables[0]) => t.status === 'Dolu',
    },
    split: {
      title: 'Masa Ayır',
      subtitle: 'Ayrılacak masayı seçin',
      buttonText: 'Devam',
      filter: (t: typeof mockTables[0]) => t.status === 'Dolu',
    },
  };

  const config = actionConfig[action as keyof typeof actionConfig] || actionConfig.move;

  const availableTables = mockTables
    .filter(config.filter)
    .filter(t => t.number.toString().includes(searchQuery));

  const handleContinue = () => {
    if (!selectedTable) {
      alert('Lütfen masa seçin');
      return;
    }

    // Navigate to specific flow based on action
    if (action === 'move') {
      navigate(`/mobile/move-table/${selectedTable}`);
    } else if (action === 'merge') {
      navigate(`/mobile/merge-table/${selectedTable}`);
    } else if (action === 'split') {
      navigate(`/mobile/split-table/${selectedTable}`);
    }
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
              <h1 className="text-base font-bold text-gray-900">{config.title}</h1>
              <p className="text-xs text-gray-600">{config.subtitle}</p>
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
              placeholder="Masa ara..."
            />
          </div>
        </div>

        {/* Info */}
        <div className="px-4 pb-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              {action === 'move' && 'Taşınacak masayı seçin, sonra hedef masa seçilecek'}
              {action === 'merge' && 'Ana masayı seçin, sonra birleştirilecek masalar seçilecek'}
              {action === 'split' && 'Ayrılacak masayı seçin, sonra bölüm sayısı belirlenecek'}
            </p>
          </div>
        </div>
      </div>

      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs font-semibold text-gray-600 mb-3 px-1">
          MÜSAİT MASALAR ({availableTables.length})
        </div>
        <div className="grid grid-cols-3 gap-2">
          {availableTables.map((table) => {
            const isSelected = selectedTable === table.id;
            return (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table.id)}
                className={`aspect-square rounded-xl border-2 p-3 flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'border-[#d4a017] bg-[#d4a017]/10'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className={`text-2xl font-bold mb-1 ${
                  isSelected ? 'text-[#d4a017]' : 'text-blue-900'
                }`}>
                  {table.number}
                </div>
                <div className="text-xs text-gray-600">{table.guests} kişi</div>
                <div className="text-xs font-bold text-gray-900">₺{table.total.toFixed(2)}</div>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-6 h-6 bg-[#d4a017] rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
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
          onClick={handleContinue}
          disabled={!selectedTable}
          className="w-full h-14 bg-[#d4a017] hover:bg-[#b8860b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl"
        >
          {config.buttonText}
        </button>
      </div>
    </div>
  );
}
