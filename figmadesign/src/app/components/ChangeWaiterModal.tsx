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
import { UserCheck, AlertCircle } from 'lucide-react';

interface ChangeWaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: {
    no: string;
    currentWaiter: string;
    itemCount: number;
    total: number;
  };
  availableWaiters: Array<{
    id: string;
    name: string;
    activeTablesCount: number;
  }>;
  onConfirm: (newWaiterId: string, reason: string) => void;
}

export function ChangeWaiterModal({
  isOpen,
  onClose,
  currentTable,
  availableWaiters,
  onConfirm,
}: ChangeWaiterModalProps) {
  const [newWaiterId, setNewWaiterId] = useState('');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const reasons = [
    'Vardiya Değişimi',
    'Garson Talebi',
    'Müşteri İsteği',
    'İş Yükü Dengeleme',
    'Yönetici Onayı',
    'Acil Durum',
  ];

  const handleConfirm = async () => {
    if (!newWaiterId || !reason) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm(newWaiterId, reason);
      setIsProcessing(false);
      setNewWaiterId('');
      setReason('');
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setNewWaiterId('');
      setReason('');
      onClose();
    }
  };

  const selectedWaiter = availableWaiters.find(w => w.id === newWaiterId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-gray-700" />
            Garson Değiştir
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Assignment */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-xs text-blue-600 font-medium mb-2">Mevcut Atama</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-blue-900 mb-0.5">Masa</div>
                <div className="font-bold text-blue-900 text-lg">{currentTable.no}</div>
              </div>
              <div>
                <div className="text-xs text-blue-900 mb-0.5">Garson</div>
                <div className="font-bold text-blue-900 text-lg">{currentTable.currentWaiter}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 flex items-center justify-between text-sm">
              <span className="text-blue-900">{currentTable.itemCount} ürün</span>
              <span className="font-bold text-blue-900">
                ₺{currentTable.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* New Waiter Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Yeni Garson Seçin <span className="text-red-500">*</span>
            </label>
            <Select value={newWaiterId} onValueChange={setNewWaiterId}>
              <SelectTrigger>
                <SelectValue placeholder="Garson seçiniz..." />
              </SelectTrigger>
              <SelectContent>
                {availableWaiters
                  .filter(w => w.name !== currentTable.currentWaiter)
                  .map((waiter) => (
                    <SelectItem key={waiter.id} value={waiter.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{waiter.name}</span>
                        <span className="text-xs text-gray-500 ml-3">
                          ({waiter.activeTablesCount} aktif masa)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Değişim Nedeni <span className="text-red-500">*</span>
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Neden seçiniz..." />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Değişim nedeni kayıt altına alınacaktır</p>
          </div>

          {/* New Assignment Preview */}
          {selectedWaiter && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-xs text-green-600 font-medium mb-2">Yeni Atama</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-green-900 text-lg">{selectedWaiter.name}</div>
                  <div className="text-sm text-green-900 mt-1">
                    Toplam {selectedWaiter.activeTablesCount + 1} aktif masa olacak
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-green-900">Masa</div>
                  <div className="font-bold text-lg text-green-900">{currentTable.no}</div>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <p className="font-semibold mb-1">Bilgilendirme</p>
                <p>Garson değişimi yapıldığında yeni garson masanın tüm sorumluluğunu üstlenecektir. İşlem sistem kaydına alınır.</p>
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
            disabled={!newWaiterId || !reason || isProcessing}
            className="w-full sm:w-auto bg-[#d4a017] hover:bg-[#b8860b] text-white disabled:bg-gray-300"
          >
            {isProcessing ? 'Değiştiriliyor...' : 'Garson Değiştir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
