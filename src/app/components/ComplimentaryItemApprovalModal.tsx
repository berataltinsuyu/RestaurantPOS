import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertTriangle, Gift, ShieldCheck, User } from 'lucide-react';

interface ComplimentaryItemOption {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ComplimentaryTableOption {
  id: string;
  no: string;
  waiter: string;
  items: ComplimentaryItemOption[];
}

interface ComplimentaryItemApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: ComplimentaryTableOption[];
  onConfirm: (sourceTableId: string, approvalData: {
    approvedItems: string[];
    reason: string;
    approverName: string;
    requiresManagerApproval: boolean;
  }) => Promise<void> | void;
}

export function ComplimentaryItemApprovalModal({
  isOpen,
  onClose,
  tables,
  onConfirm,
}: ComplimentaryItemApprovalModalProps) {
  const [sourceTableId, setSourceTableId] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [approverName, setApproverName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const reasons = [
    'Müşteri Memnuniyeti',
    'Şikayet Telafisi',
    'Özel Gün Kutlaması',
    'Sadakat Programı',
    'Gecikmeli Servis',
    'Kalite Sorunu',
    'VIP Müşteri',
    'Promosyon',
  ];

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === sourceTableId) ?? null,
    [sourceTableId, tables],
  );

  const items = selectedTable?.items ?? [];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSourceTableId((current) => current || tables[0]?.id || '');
    setSelectedItems([]);
    setReason('');
    setApproverName('');
  }, [isOpen, tables]);

  useEffect(() => {
    setSelectedItems([]);
    setReason('');
    setApproverName('');
  }, [sourceTableId]);

  const toggleItem = (itemId: string) => {
    setSelectedItems((previous) =>
      previous.includes(itemId)
        ? previous.filter((id) => id !== itemId)
        : [...previous, itemId],
    );
  };

  const totalComplimentaryAmount = items
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.total, 0);

  const requiresManagerApproval = totalComplimentaryAmount > 500;

  const resetForm = () => {
    setSelectedItems([]);
    setReason('');
    setApproverName('');
  };

  const handleConfirm = async () => {
    if (!sourceTableId || selectedItems.length === 0 || !reason || !approverName) {
      return;
    }

    setIsProcessing(true);
    try {
      await Promise.resolve(onConfirm(sourceTableId, {
        approvedItems: selectedItems,
        reason,
        approverName,
        requiresManagerApproval,
      }));
      setSourceTableId('');
      resetForm();
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSourceTableId('');
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-gray-700" />
            İkram Ürün Onayı
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              İşlem Yapılacak Masa <span className="text-red-500">*</span>
            </label>
            <Select value={sourceTableId} onValueChange={setSourceTableId}>
              <SelectTrigger>
                <SelectValue placeholder="Masa seçiniz..." />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.id} value={table.id}>
                    {table.no} • {table.waiter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-xs text-blue-600 font-medium mb-2">Masa Bilgileri</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-blue-900 mb-0.5">Masa No</div>
                <div className="font-bold text-blue-900 text-lg">{selectedTable?.no ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-blue-900 mb-0.5">Garson</div>
                <div className="font-bold text-blue-900 text-lg">{selectedTable?.waiter ?? '-'}</div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900 mb-3 block">
              İkram Edilecek Ürünleri Seçin <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`border-b border-gray-200 last:border-b-0 p-3 cursor-pointer transition-colors ${
                      selectedItems.includes(item.id)
                        ? 'bg-green-50'
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
                          <div>
                            <div className="font-semibold text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {item.quantity} adet × ₺{item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              ₺{item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </div>
                            {selectedItems.includes(item.id) ? (
                              <div className="text-xs text-green-600 font-medium mt-0.5">✓ İkram</div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              İkram Nedeni <span className="text-red-500">*</span>
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Neden seçiniz..." />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Onaylayan Yetkili <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={approverName}
                onChange={(event) => setApproverName(event.target.value)}
                placeholder="Yetkili adı soyadı"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a017] focus:border-transparent text-sm"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Onay işlemi kayıt altına alınacaktır.</p>
          </div>

          {selectedItems.length > 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-xs text-green-600 font-medium mb-3">İkram Özeti</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-900">Seçilen Ürün Sayısı:</span>
                  <span className="font-semibold text-green-900">{selectedItems.length} adet</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-green-200">
                  <span className="text-green-900">Toplam İkram Tutarı:</span>
                  <span className="font-bold text-xl text-green-900">
                    ₺{totalComplimentaryAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {requiresManagerApproval ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-red-900 mb-1">Yönetici Onayı Gerekli</div>
                  <div className="text-xs text-red-800">
                    ₺500 üzeri ikram işlemleri için üst yönetici onayı zorunludur. Bu işlem yönetici paneline bildirim olarak gönderilecektir.
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <p className="font-semibold mb-1">Önemli</p>
                <p>İkram ürünler adisyondan düşülecek ve raporlama sisteminde ayrı olarak kaydedilecektir. İşlem geri alınamaz.</p>
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
            disabled={!sourceTableId || selectedItems.length === 0 || !reason || !approverName || isProcessing}
            className="w-full sm:w-auto bg-[#d4a017] hover:bg-[#b8860b] text-white disabled:bg-gray-300"
          >
            {isProcessing ? 'Onaylanıyor...' : requiresManagerApproval ? 'Yönetici Onayına Gönder' : 'İkramı Onayla'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
