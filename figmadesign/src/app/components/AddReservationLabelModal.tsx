import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Clock, User, AlertCircle } from 'lucide-react';

interface AddReservationLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: {
    no: string;
    area: string;
  };
  onConfirm: (reservationData: {
    customerName: string;
    phoneNumber: string;
    guestCount: number;
    reservationTime: string;
    notes: string;
  }) => void;
}

export function AddReservationLabelModal({
  isOpen,
  onClose,
  table,
  onConfirm,
}: AddReservationLabelModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  const handleConfirm = async () => {
    if (!customerName || !phoneNumber || !guestCount || !reservationTime) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm({
        customerName,
        phoneNumber,
        guestCount: parseInt(guestCount),
        reservationTime,
        notes,
      });
      setIsProcessing(false);
      resetForm();
      onClose();
    }, 1000);
  };

  const resetForm = () => {
    setCustomerName('');
    setPhoneNumber('');
    setGuestCount('');
    setReservationTime('');
    setNotes('');
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-700" />
            Rezervasyon Etiketi Ekle
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Table Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-xs text-blue-600 font-medium mb-2">Rezerve Edilecek Masa</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-blue-900 text-lg">{table.no}</div>
                <div className="text-sm text-blue-900">{table.area}</div>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-2 block">
                Müşteri Adı Soyadı <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900 mb-2 block">
                Telefon Numarası <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="5XX XXX XX XX"
                maxLength={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Kişi Sayısı <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  placeholder="4"
                  min="1"
                  max="20"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Rezervasyon Saati <span className="text-red-500">*</span>
                </label>
                <Select value={reservationTime} onValueChange={setReservationTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Saat" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900 mb-2 block">
                Not (Opsiyonel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Özel istek veya notlar..."
                rows={3}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a017] focus:border-transparent text-sm resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{notes.length}/200 karakter</p>
            </div>
          </div>

          {/* Reservation Preview */}
          {customerName && reservationTime && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-xs text-green-600 font-medium mb-2">Rezervasyon Özeti</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-green-900">Müşteri:</span>
                  <span className="font-semibold text-green-900">{customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-900">Masa:</span>
                  <span className="font-semibold text-green-900">{table.no}</span>
                </div>
                {guestCount && (
                  <div className="flex items-center justify-between">
                    <span className="text-green-900">Kişi Sayısı:</span>
                    <span className="font-semibold text-green-900">{guestCount} kişi</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-green-200">
                  <span className="text-green-900">Saat:</span>
                  <span className="font-bold text-lg text-green-900">{reservationTime}</span>
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
                <p>Rezervasyon eklendikten sonra masa durumu "Rezerve" olarak işaretlenecek ve masa listesinde özel etiketle gösterilecektir.</p>
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
            disabled={!customerName || !phoneNumber || !guestCount || !reservationTime || isProcessing}
            className="w-full sm:w-auto bg-[#d4a017] hover:bg-[#b8860b] text-white disabled:bg-gray-300"
          >
            {isProcessing ? 'Kaydediliyor...' : 'Rezervasyon Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
