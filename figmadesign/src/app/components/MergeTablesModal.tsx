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
import { Combine, AlertCircle } from 'lucide-react';

interface MergeTablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: {
    no: string;
    waiter: string;
    itemCount: number;
    total: number;
  };
  availableTables: Array<{
    no: string;
    area: string;
    waiter: string;
    itemCount: number;
    total: number;
  }>;
  onConfirm: (selectedTables: string[], newTableName: string) => void;
}

export function MergeTablesModal({
  isOpen,
  onClose,
  currentTable,
  availableTables,
  onConfirm,
}: MergeTablesModalProps) {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [newTableName, setNewTableName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleTable = (tableNo: string) => {
    setSelectedTables(prev =>
      prev.includes(tableNo)
        ? prev.filter(t => t !== tableNo)
        : [...prev, tableNo]
    );
  };

  const calculateTotals = () => {
    const selectedTableData = availableTables.filter(t => selectedTables.includes(t.no));
    const totalItems = currentTable.itemCount + selectedTableData.reduce((sum, t) => sum + t.itemCount, 0);
    const totalAmount = currentTable.total + selectedTableData.reduce((sum, t) => sum + t.total, 0);
    return { totalItems, totalAmount };
  };

  const { totalItems, totalAmount } = calculateTotals();

  const handleConfirm = async () => {
    if (selectedTables.length === 0) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm(selectedTables, newTableName || `${currentTable.no} Birleşik`);
      setIsProcessing(false);
      setSelectedTables([]);
      setNewTableName('');
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedTables([]);
      setNewTableName('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Combine className="w-5 h-5 text-gray-700" />
            Masa Birleştir
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Table */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-xs text-blue-600 font-medium mb-2">Ana Masa</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-blue-900">Masa:</span>
                <div className="font-bold text-blue-900">{currentTable.no}</div>
              </div>
              <div>
                <span className="text-blue-900">Garson:</span>
                <div className="font-semibold text-blue-900">{currentTable.waiter}</div>
              </div>
              <div>
                <span className="text-blue-900">Ürün:</span>
                <div className="font-semibold text-blue-900">{currentTable.itemCount} adet</div>
              </div>
              <div>
                <span className="text-blue-900">Tutar:</span>
                <div className="font-bold text-blue-900">₺{currentTable.total.toLocaleString('tr-TR')}</div>
              </div>
            </div>
          </div>

          {/* Table Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-3 block">
              Birleştirilecek Masaları Seçin <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {availableTables
                .filter(t => t.no !== currentTable.no)
                .map((table) => (
                  <div
                    key={table.no}
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      selectedTables.includes(table.no)
                        ? 'border-[#d4a017] bg-[#d4a017]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleTable(table.no)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedTables.includes(table.no)}
                        onCheckedChange={() => toggleTable(table.no)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">{table.no}</div>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <div>{table.area} • {table.waiter}</div>
                          <div className="font-semibold text-gray-900">
                            {table.itemCount} ürün • ₺{table.total.toLocaleString('tr-TR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* New Table Name */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Birleşik Masa Adı
            </label>
            <Input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder={`Örn: ${currentTable.no} Birleşik`}
            />
            <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa otomatik isim atanır</p>
          </div>

          {/* Summary */}
          {selectedTables.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-xs text-green-600 font-medium mb-2">Birleştirme Özeti</div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-900">Toplam Masa:</span>
                  <div className="font-bold text-green-900">{selectedTables.length + 1} masa</div>
                </div>
                <div>
                  <span className="text-green-900">Toplam Ürün:</span>
                  <div className="font-bold text-green-900">{totalItems} adet</div>
                </div>
                <div>
                  <span className="text-green-900">Toplam Tutar:</span>
                  <div className="font-bold text-lg text-green-900">
                    ₺{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
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
                <p className="font-semibold mb-1">Önemli Bilgi</p>
                <p>Seçilen masaların tüm ürünleri tek adisyon altında birleştirilecektir. İşlem sonrası masa ayırma yapabilirsiniz.</p>
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
            disabled={selectedTables.length === 0 || isProcessing}
            className="w-full sm:w-auto bg-[#d4a017] hover:bg-[#b8860b] text-white disabled:bg-gray-300"
          >
            {isProcessing ? 'Birleştiriliyor...' : `${selectedTables.length + 1} Masayı Birleştir`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
