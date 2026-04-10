import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Check, Plus } from 'lucide-react';
import { mockTables } from '../data/mockData';

export default function MergeTable() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const currentTable = mockTables.find(t => t.id === tableId);
  
  // Tables that can be merged (occupied)
  const mergeableTables = mockTables.filter(t => 
    t.id !== tableId && 
    t.status === 'Dolu'
  );

  const toggleTable = (id: string) => {
    setSelectedTables(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  const calculateTotal = () => {
    const selected = mockTables.filter(t => selectedTables.includes(t.id));
    const selectedTotal = selected.reduce((sum, t) => sum + t.total, 0);
    return (currentTable?.total || 0) + selectedTotal;
  };

  const handleMerge = () => {
    if (selectedTables.length === 0) {
      alert('Lütfen birleştirilecek masa seçin');
      return;
    }
    const tableNumbers = [currentTable?.number, ...selectedTables.map(id => 
      mockTables.find(t => t.id === id)?.number
    )].join(', ');
    alert(`Masalar birleştirildi: ${tableNumbers}`);
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
              <h1 className="text-base font-bold text-gray-900">Masa Birleştir</h1>
              <p className="text-xs text-gray-600">Ana Masa: {currentTable?.number}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="px-4 pb-3">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-purple-700">Toplam Masa Sayısı</div>
              <div className="font-bold text-purple-900">{1 + selectedTables.length}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-purple-700">Toplam Tutar</div>
              <div className="font-bold text-lg text-purple-900">₺{calculateTotal().toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs font-semibold text-gray-600 mb-3 px-1">
          BİRLEŞTİRİLEBİLİR MASALAR ({mergeableTables.length})
        </div>

        <div className="space-y-2">
          {mergeableTables.map((table) => {
            const isSelected = selectedTables.includes(table.id);
            return (
              <button
                key={table.id}
                onClick={() => toggleTable(table.id)}
                className={`w-full border-2 rounded-xl p-4 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>

                  {/* Table Info */}
                  <div className="flex-1 text-left">
                    <div className="font-bold text-gray-900 mb-0.5">Masa {table.number}</div>
                    <div className="text-xs text-gray-600">{table.guests} Kişi • {table.time}</div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <div className="font-bold text-gray-900">₺{table.total.toFixed(2)}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {mergeableTables.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">Birleştirilebilir masa bulunamadı</p>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 p-4">
        <button
          onClick={handleMerge}
          disabled={selectedTables.length === 0}
          className="w-full h-14 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {selectedTables.length > 0 ? `${1 + selectedTables.length} Masayı Birleştir` : 'Masa Seçin'}
        </button>
      </div>
    </div>
  );
}
