import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, CreditCard, X } from 'lucide-react';
import { Button } from '../components/ui/button';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export default function MobileOrder() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [noteText, setNoteText] = useState('');

  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', name: 'Izgara Köfte', price: 145.00, quantity: 2 },
    { id: '2', name: 'Karışık Salata', price: 65.00, quantity: 1 },
    { id: '3', name: 'Mercimek Çorbası', price: 45.00, quantity: 2 },
    { id: '4', name: 'Ayran', price: 25.00, quantity: 3, note: 'Soğuk olsun' },
  ]);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceCharge = subtotal * 0.1;
  const total = subtotal + serviceCharge;

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as OrderItem[]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const openNoteModal = (item: OrderItem) => {
    setSelectedItem(item);
    setNoteText(item.note || '');
    setShowNoteModal(true);
  };

  const saveNote = () => {
    if (selectedItem) {
      setItems(items.map(item => 
        item.id === selectedItem.id 
          ? { ...item, note: noteText.trim() || undefined }
          : item
      ));
    }
    setShowNoteModal(false);
    setNoteText('');
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-gray-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-gray-900">Masa {tableId}</h1>
            <p className="text-xs text-gray-600">4 Kişi • 45 dk</p>
          </div>
          <button
            onClick={() => navigate(`/mobile/menu/${tableId}`)}
            className="w-10 h-10 flex items-center justify-center text-[#d4a017]"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Order Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm mb-4">Henüz sipariş yok</p>
            <Button
              onClick={() => navigate(`/mobile/menu/${tableId}`)}
              className="bg-[#d4a017] hover:bg-[#b8860b] text-white"
            >
              Ürün Ekle
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">{item.name}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      ₺{item.price.toFixed(2)} x {item.quantity} = ₺{(item.price * item.quantity).toFixed(2)}
                    </div>
                    {item.note && (
                      <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1 rounded inline-block">
                        Not: {item.note}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4 text-gray-700" />
                    </button>
                    <div className="w-12 text-center font-bold text-gray-900">{item.quantity}</div>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* Add Note */}
                  <button
                    onClick={() => openNoteModal(item)}
                    className="flex-1 h-9 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium rounded-lg"
                  >
                    {item.note ? 'Notu Düzenle' : 'Not Ekle'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Summary */}
      {items.length > 0 && (
        <div className="bg-white border-t border-gray-200 sticky bottom-0">
          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ara Toplam</span>
              <span className="text-gray-900">₺{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Servis (%10)</span>
              <span className="text-gray-900">₺{serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-900">Toplam</span>
              <span className="font-bold text-xl text-gray-900">₺{total.toFixed(2)}</span>
            </div>
          </div>
          <div className="px-4 pb-4 flex gap-2">
            <button
              onClick={() => navigate(`/mobile/menu/${tableId}`)}
              className="flex-1 h-12 bg-white border-2 border-gray-300 text-gray-900 font-semibold rounded-lg"
            >
              Ürün Ekle
            </button>
            <button
              onClick={() => navigate(`/mobile/payment/${tableId}`)}
              className="flex-1 h-12 bg-[#d4a017] hover:bg-[#b8860b] text-white font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Ödeme
            </button>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Not Ekle</h3>
              <button onClick={() => setShowNoteModal(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full h-32 p-3 border-2 border-gray-200 rounded-lg focus:border-[#d4a017] focus:outline-none text-sm resize-none"
                placeholder="Özel talep, alerji bilgisi vb."
                autoFocus
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="flex-1 h-12 bg-gray-100 text-gray-900 font-semibold rounded-lg"
                >
                  İptal
                </button>
                <button
                  onClick={saveNote}
                  className="flex-1 h-12 bg-[#d4a017] text-white font-semibold rounded-lg"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
