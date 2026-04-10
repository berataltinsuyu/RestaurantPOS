import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { mockTables, mockBillItems } from '../data/mockData';
import { ArrowLeft, CreditCard, Banknote, Split, X, CheckCircle2 } from 'lucide-react';

export default function Payment() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const table = mockTables.find(t => t.id === tableId);
  const billItems = mockBillItems[tableId!] || [];
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('');
  const [selectedTerminal, setSelectedTerminal] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!table) {
    return <div>Masa bulunamadı</div>;
  }

  const subtotal = billItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceCharge = subtotal * 0.10;
  const total = subtotal + serviceCharge;

  const paymentTypes = [
    { id: 'card', label: 'Kart ile Ödeme', icon: CreditCard, color: 'blue' },
    { id: 'cash', label: 'Nakit Ödeme', icon: Banknote, color: 'green' },
    { id: 'split', label: 'Bölünmüş Ödeme', icon: Split, color: 'purple' },
  ];

  const handlePayment = () => {
    if (selectedPaymentType === 'split') {
      navigate(`/split-payment/${tableId}`);
    } else if (selectedPaymentType === 'cash') {
      navigate('/success', { state: { paymentType: 'Nakit', amount: total, tableNo: table.number } });
    } else if (selectedPaymentType === 'card') {
      navigate('/processing', { state: { amount: total, tableNo: table.number, terminal: selectedTerminal } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="pt-16 p-4 lg:p-6">
          {/* Header */}
          <div className="mb-4 lg:mb-6">
            <button
              onClick={() => navigate(`/bill/${tableId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 lg:mb-4"
            >
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="text-sm lg:text-base">Adisyona Geri Dön</span>
            </button>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Ödeme Ekranı</h1>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Left: Payment Summary */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Ödeme Özeti</h2>
                
                <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                  <div className="flex items-center justify-between text-xs lg:text-sm pb-2 lg:pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Masa No</span>
                    <span className="font-semibold text-gray-900">Masa {table.number}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs lg:text-sm pb-2 lg:pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Adisyon No</span>
                    <span className="font-medium text-gray-900">A-{String(table.number).padStart(4, '0')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs lg:text-sm pb-2 lg:pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Ürün Sayısı</span>
                    <span className="font-medium text-gray-900">{billItems.reduce((sum, item) => sum + item.quantity, 0)} Adet</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 lg:p-4 space-y-1.5 lg:space-y-2 mb-4 lg:mb-6">
                  <div className="flex items-center justify-between text-xs lg:text-sm">
                    <span className="text-gray-600">Ara Toplam</span>
                    <span className="font-medium text-gray-900">{subtotal.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex items-center justify-between text-xs lg:text-sm">
                    <span className="text-gray-600">Hizmet Bedeli</span>
                    <span className="font-medium text-gray-900">{serviceCharge.toFixed(2)} ₺</span>
                  </div>
                  <div className="pt-2 border-t border-gray-300 flex items-center justify-between">
                    <span className="font-semibold text-sm lg:text-base text-gray-900">Toplam Tutar</span>
                    <span className="text-xl lg:text-2xl font-bold text-gray-900">{total.toFixed(2)} ₺</span>
                  </div>
                </div>

                {/* Payment Type Selection */}
                <div className="space-y-2 lg:space-y-3">
                  <label className="text-xs lg:text-sm font-medium text-gray-700">Ödeme Türü</label>
                  <div className="space-y-2">
                    {paymentTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = selectedPaymentType === type.id;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setSelectedPaymentType(type.id)}
                          className={`w-full flex items-center gap-2 lg:gap-3 p-3 lg:p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-[#d4a017] bg-[#d4a017]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-[#d4a017] text-white' : `bg-${type.color}-100 text-${type.color}-600`
                          }`}>
                            <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                          </div>
                          <span className={`font-medium text-sm lg:text-base ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                            {type.label}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-[#d4a017] ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Terminal & Actions */}
              <div className="space-y-4 lg:space-y-6">
                {selectedPaymentType === 'card' && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                    <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Terminal Seçimi</h2>
                    
                    <div className="mb-4 lg:mb-6">
                      <label className="text-xs lg:text-sm font-medium text-gray-700 mb-2 block">
                        POS Cihazı
                      </label>
                      <Select value={selectedTerminal} onValueChange={setSelectedTerminal}>
                        <SelectTrigger className="h-10 lg:h-12">
                          <SelectValue placeholder="Terminal seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="t1">T-001 (Ana Kasa)</SelectItem>
                          <SelectItem value="t2">T-002 (Arka Salon)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedTerminal && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4 mb-3 lg:mb-4">
                        <div className="text-xs lg:text-sm font-medium text-blue-900 mb-1.5 lg:mb-2">POS Cihaz Bilgileri</div>
                        <div className="space-y-1 text-xs text-blue-700">
                          <div>Terminal No: {selectedTerminal === 't1' ? 'T-001' : 'T-002'}</div>
                          <div>Durum: <span className="font-medium">Bağlı</span></div>
                          <div>İşyeri No: 8547293</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedPaymentType === 'cash' && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                    <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Nakit Ödeme</h2>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 lg:p-4">
                      <div className="text-xs lg:text-sm text-green-800">
                        Nakit ödeme işlemi için kasaya bildirim yapılacak. Ödeme tamamlandıktan sonra masayı kapatabilirsiniz.
                      </div>
                    </div>
                  </div>
                )}

                {selectedPaymentType === 'split' && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                    <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Bölünmüş Ödeme</h2>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 lg:p-4">
                      <div className="text-xs lg:text-sm text-purple-800">
                        Ödemyi birden fazla kişi arasında bölmek için devam edin. Kart ve nakit ödeme yöntemlerini birlikte kullanabilirsiniz.
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                  <div className="space-y-2 lg:space-y-3">
                    <Button
                      onClick={handlePayment}
                      disabled={!selectedPaymentType || (selectedPaymentType === 'card' && !selectedTerminal)}
                      className="w-full h-12 lg:h-14 bg-[#d4a017] hover:bg-[#c49316] text-white font-semibold text-base lg:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedPaymentType === 'card' && 'VakıfBank POS\'a Gönder'}
                      {selectedPaymentType === 'cash' && 'Nakit Ödeme Onayla'}
                      {selectedPaymentType === 'split' && 'Bölünmüş Ödemeye Geç'}
                      {!selectedPaymentType && 'Ödeme Türü Seçiniz'}
                    </Button>

                    <Button
                      onClick={() => navigate(`/bill/${tableId}`)}
                      variant="outline"
                      className="w-full h-10 lg:h-12 border-2"
                    >
                      <X className="w-4 h-4 mr-2" />
                      İptal
                    </Button>
                  </div>

                  <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 text-center">
                      Güvenli ödeme • 256-bit SSL şifreleme
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}