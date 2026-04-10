import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MoveTableModalProps {
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
    status: 'available' | 'occupied';
  }>;
  onConfirm: (targetTable: string) => void;
}

export function MoveTableModal({
  isOpen,
  onClose,
  currentTable,
  availableTables,
  onConfirm,
}: MoveTableModalProps) {
  const [targetTable, setTargetTable] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!targetTable) return;
    
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      onConfirm(targetTable);
      setIsProcessing(false);
      setTargetTable('');
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setTargetTable('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-gray-700" />
            Masa Taşı
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Table Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-xs text-blue-600 font-medium mb-2">Mevcut Masa Bilgileri</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-900">Masa No:</span>
                <span className="font-bold text-blue-900">{currentTable.no}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-900">Garson:</span>
                <span className="font-semibold text-blue-900">{currentTable.waiter}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-900">Ürün Sayısı:</span>
                <span className="font-semibold text-blue-900">{currentTable.itemCount} adet</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                <span className="text-blue-900">Toplam:</span>
                <span className="font-bold text-lg text-blue-900">
                  ₺{currentTable.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Target Table Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Hedef Masa Seçin <span className="text-red-500">*</span>
            </label>
            <Select value={targetTable} onValueChange={setTargetTable}>
              <SelectTrigger>
                <SelectValue placeholder="Masa seçiniz..." />
              </SelectTrigger>
              <SelectContent>
                {availableTables
                  .filter(t => t.no !== currentTable.no)
                  .map((table) => (
                    <SelectItem key={table.no} value={table.no}>
                      <div className="flex items-center justify-between w-full">
                        <span>{table.no} - {table.area}</span>
                        {table.status === 'occupied' && (
                          <span className="text-xs text-amber-600 ml-2">(Dolu)</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Adisyon bilgileri seçilen masaya taşınacaktır
            </p>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <p className="font-semibold mb-1">Dikkat</p>
                <p>Masa taşıma işlemi geri alınamaz. Tüm adisyon bilgileri hedef masaya aktarılacaktır.</p>
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
            disabled={!targetTable || isProcessing}
            className="w-full sm:w-auto bg-[#d4a017] hover:bg-[#b8860b] text-white disabled:bg-gray-300"
          >
            {isProcessing ? 'Taşınıyor...' : 'Masayı Taşı'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
