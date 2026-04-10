import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface SourceTableOption {
  id: string;
  no: string;
  waiter: string;
  itemCount: number;
  total: number;
}

interface TargetTableOption {
  id: string;
  no: string;
  area: string;
  status: 'available' | 'occupied';
}

interface MoveTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceTables: SourceTableOption[];
  availableTables: TargetTableOption[];
  onConfirm: (sourceTableId: string, targetTableId: string) => Promise<void> | void;
}

export function MoveTableModal({
  isOpen,
  onClose,
  sourceTables,
  availableTables,
  onConfirm,
}: MoveTableModalProps) {
  const [sourceTableId, setSourceTableId] = useState('');
  const [targetTableId, setTargetTableId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedSourceTable = useMemo(
    () => sourceTables.find((table) => table.id === sourceTableId) ?? null,
    [sourceTableId, sourceTables],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSourceTableId((current) => current || sourceTables[0]?.id || '');
    setTargetTableId('');
  }, [isOpen, sourceTables]);

  useEffect(() => {
    setTargetTableId('');
  }, [sourceTableId]);

  const handleConfirm = async () => {
    if (!sourceTableId || !targetTableId) {
      return;
    }

    setIsProcessing(true);
    try {
      await Promise.resolve(onConfirm(sourceTableId, targetTableId));
      setSourceTableId('');
      setTargetTableId('');
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSourceTableId('');
      setTargetTableId('');
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
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              İşlem Yapılacak Masa <span className="text-red-500">*</span>
            </label>
            <Select value={sourceTableId} onValueChange={setSourceTableId}>
              <SelectTrigger>
                <SelectValue placeholder="Kaynak masa seçiniz..." />
              </SelectTrigger>
              <SelectContent>
                {sourceTables.map((table) => (
                  <SelectItem key={table.id} value={table.id}>
                    {table.no} • {table.waiter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-xs text-blue-600 font-medium mb-2">Mevcut Masa Bilgileri</div>
            {selectedSourceTable ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-900">Masa No:</span>
                  <span className="font-bold text-blue-900">{selectedSourceTable.no}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-900">Garson:</span>
                  <span className="font-semibold text-blue-900">{selectedSourceTable.waiter}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-900">Ürün Sayısı:</span>
                  <span className="font-semibold text-blue-900">{selectedSourceTable.itemCount} adet</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                  <span className="text-blue-900">Toplam:</span>
                  <span className="font-bold text-lg text-blue-900">
                    ₺{selectedSourceTable.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-blue-900">İşlem yapılacak masa seçiniz.</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Hedef Masa Seçin <span className="text-red-500">*</span>
            </label>
            <Select value={targetTableId} onValueChange={setTargetTableId}>
              <SelectTrigger>
                <SelectValue placeholder="Hedef masa seçiniz..." />
              </SelectTrigger>
              <SelectContent>
                {availableTables
                  .filter((table) => table.id !== sourceTableId)
                  .map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{table.no} - {table.area}</span>
                        {table.status === 'occupied' ? (
                          <span className="text-xs text-amber-600 ml-2">(Dolu)</span>
                        ) : null}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Adisyon bilgileri seçilen hedef masaya taşınacaktır.
            </p>
          </div>

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
            disabled={!sourceTableId || !targetTableId || isProcessing}
            className="w-full sm:w-auto bg-[#d4a017] hover:bg-[#b8860b] text-white disabled:bg-gray-300"
          >
            {isProcessing ? 'Taşınıyor...' : 'Masayı Taşı'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
