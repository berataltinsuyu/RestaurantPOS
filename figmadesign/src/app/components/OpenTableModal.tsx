import { useState } from 'react';
import { X, Users, UserCheck, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface OpenTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: {
    no: string;
    area: string;
  };
  availableWaiters: Array<{
    id: string;
    name: string;
    activeTablesCount: number;
  }>;
  onConfirm: (data: {
    tableNo: string;
    waiterId: string;
    guestCount: number;
    notes?: string;
  }) => void;
}

export function OpenTableModal({
  isOpen,
  onClose,
  table,
  availableWaiters,
  onConfirm
}: OpenTableModalProps) {
  const [selectedWaiter, setSelectedWaiter] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedWaiter) {
      alert('Lütfen bir garson seçin');
      return;
    }
    if (guestCount < 1) {
      alert('Lütfen geçerli bir misafir sayısı girin');
      return;
    }

    onConfirm({
      tableNo: table.no,
      waiterId: selectedWaiter,
      guestCount,
      notes: notes.trim()
    });

    // Reset form
    setSelectedWaiter('');
    setGuestCount(2);
    setNotes('');
    onClose();
  };

  const handleCancel = () => {
    setSelectedWaiter('');
    setGuestCount(2);
    setNotes('');
    onClose();
  };

  const quickGuestCounts = [1, 2, 3, 4, 5, 6, 8, 10];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Masa Aç</h2>
              <p className="text-sm text-gray-600">{table.no} - {table.area}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Guest Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Misafir Sayısı
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {quickGuestCounts.map((count) => (
                <button
                  key={count}
                  onClick={() => setGuestCount(count)}
                  className={`h-12 rounded-lg border-2 font-semibold transition-all ${
                    guestCount === count
                      ? 'border-[#d4a017] bg-[#d4a017]/10 text-[#d4a017]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
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
                placeholder="Misafir sayısı girin"
              />
            </div>
          </div>

          {/* Waiter Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Garson Seçimi
            </label>
            <div className="space-y-2">
              {availableWaiters.map((waiter) => (
                <button
                  key={waiter.id}
                  onClick={() => setSelectedWaiter(waiter.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedWaiter === waiter.id
                      ? 'border-[#d4a017] bg-[#d4a017]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedWaiter === waiter.id ? 'bg-[#d4a017]' : 'bg-gray-200'
                      }`}>
                        <UserCheck className={`w-5 h-5 ${
                          selectedWaiter === waiter.id ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{waiter.name}</div>
                        <div className="text-xs text-gray-600">
                          {waiter.activeTablesCount} aktif masa
                        </div>
                      </div>
                    </div>
                    {selectedWaiter === waiter.id && (
                      <div className="w-5 h-5 bg-[#d4a017] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Not (Opsiyonel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-24 p-3 border-2 border-gray-200 rounded-lg focus:border-[#d4a017] focus:outline-none text-sm resize-none"
              placeholder="Özel talep, alerji bilgisi vb."
            />
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="text-sm font-semibold text-blue-900 mb-2">Özet</div>
            <div className="space-y-1 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>Masa:</span>
                <span className="font-semibold">{table.no}</span>
              </div>
              <div className="flex justify-between">
                <span>Misafir:</span>
                <span className="font-semibold">{guestCount} kişi</span>
              </div>
              <div className="flex justify-between">
                <span>Garson:</span>
                <span className="font-semibold">
                  {selectedWaiter 
                    ? availableWaiters.find(w => w.id === selectedWaiter)?.name 
                    : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 rounded-b-2xl border-t border-gray-200">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 h-12"
          >
            İptal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedWaiter}
            className="flex-1 h-12 bg-[#d4a017] hover:bg-[#b8860b] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Masayı Aç
          </Button>
        </div>
      </div>
    </div>
  );
}
