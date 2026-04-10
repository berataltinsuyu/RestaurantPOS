import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Split, AlertCircle } from 'lucide-react';

interface SplitTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: {
    no: string;
    waiter: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    total: number;
  };
  onConfirm: (selectedItems: string[], newTableNo: string) => void;
}

export function SplitTableModal({
  isOpen,
  onClose,
  currentTable,
  onConfirm,
}: SplitTableModalProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [newTableNo, setNewTableNo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const calculateSplit = () => {
    const selectedItemsData = currentTable.items.filter(item => selectedItems.includes(item.id));
    const remainingItemsData = currentTable.items.filter(item => !selectedItems.includes(item.id));
    
    const selectedTotal = selectedItemsData.reduce((sum, item) => sum + item.total, 0);
    const remainingTotal = remainingItemsData.reduce((sum, item) => sum + item.total, 0);
    
    return {
      selectedCount: selectedItemsData.length,
      selectedTotal,
      remainingCount: remainingItemsData.length,
      remainingTotal,
    };
  };

  const { selectedCount, selectedTotal, remainingCount, remainingTotal } = calculateSplit();

  const handleConfirm = async () => {
    if (selectedItems.length === 0 || !newTableNo) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm(selectedItems, newTableNo);
      setIsProcessing(false);
      setSelectedItems([]);
      setNewTableNo('');
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedItems([]);
      setNewTableNo('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Split className="w-5 h-5 text-gray-700" />
            Masa Ayır
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Table Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-xs text-blue-600 font-medium mb-2">Mevcut Masa</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-blue-900 text-lg">{currentTable.no}</div>
                <div className="text-sm text-blue-900">{currentTable.waiter}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-900">Toplam</div>
                <div className="font-bold text-lg text-blue-900">
                  ₺{currentTable.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* New Table Number */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Yeni Masa Numarası <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={newTableNo}
              onChange={(e) => setNewTableNo(e.target.value)}
              placeholder="Örn: M-15A"
            />
            <p className="text-xs text-gray-500 mt-1">Seçilen ürünler bu masaya taşınacak</p>
          </div>

          {/* Items Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-3 block">
              Yeni Masaya Taşınacak Ürünleri Seçin <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                {currentTable.items.map((item) => (
                  <div
                    key={item.id}
                    className={`border-b border-gray-200 last:border-b-0 p-3 cursor-pointer transition-colors ${
                      selectedItems.includes(item.id)
                        ? 'bg-[#d4a017]/10'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          <div className="font-bold text-gray-900">
                            ₺{item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          {item.quantity} adet × ₺{item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Split Summary */}
          {selectedItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="text-xs text-amber-600 font-medium mb-3">
                  Yeni Masa ({newTableNo || '?'})
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-amber-900">Ürün Sayısı:</span>
                    <span className="font-semibold text-amber-900">{selectedCount} adet</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-amber-200">
                    <span className="text-amber-900">Toplam:</span>
                    <span className="font-bold text-lg text-amber-900">
                      ₺{selectedTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-xs text-green-600 font-medium mb-3">
                  Mevcut Masa ({currentTable.no})
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-900">Kalan Ürün:</span>
                    <span className="font-semibold text-green-900">{remainingCount} adet</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-200">
                    <span className="text-green-900">Toplam:</span>
                    <span className="font-bold text-lg text-green-900">
                      ₺{remainingTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <p className="font-semibold mb-1">Dikkat</p>
                <p>Seçilen ürünler yeni masaya taşınacak ve ayrı bir adisyon oluşturulacaktır. Garson ataması mevcut masa ile aynı olacaktır.</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            İptal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedItems.length === 0 || !newTableNo || isProcessing}
            className="w-full sm:w-auto bg-[#d4a017] hover:bg-[#b8860b] text-white disabled:bg-gray-300"
          >
            {isProcessing ? 'Ayrılıyor...' : 'Masayı Ayır'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
