import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { mockTables, mockBillItems, mockProducts, BillItem } from '../data/mockData';
import { ArrowLeft, Plus, Minus, Trash2, Search, User, Clock as ClockIcon } from 'lucide-react';

export default function BillDetail() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const table = mockTables.find(t => t.id === tableId);
  const [billItems, setBillItems] = useState<BillItem[]>(mockBillItems[tableId!] || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!table) {
    return <div>Masa bulunamadı</div>;
  }

  const categories = ['Tümü', ...Array.from(new Set(mockProducts.map(p => p.category)))];

  const subtotal = billItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = 0;
  const serviceCharge = subtotal * 0.10;
  const total = subtotal - discount + serviceCharge;

  const handleAddProduct = (product: typeof mockProducts[0]) => {
    const existingItem = billItems.find(item => item.productId === product.id);
    if (existingItem) {
      setBillItems(billItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setBillItems([...billItems, {
        id: `b${Date.now()}`,
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
      }]);
    }
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setBillItems(billItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleRemoveItem = (itemId: string) => {
    setBillItems(billItems.filter(item => item.id !== itemId));
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
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 lg:mb-4"
            >
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="text-sm lg:text-base">Masalar</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Masa {table.number} - Adisyon Detayı</h1>
                <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-2 text-xs lg:text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    <span>Garson: {table.waiter}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    <span>Açılış: {table.time}</span>
                  </div>
                  <div className="px-2 lg:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {table.guests} Kişi
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Left: Products */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Ürünler</h2>
                
                {/* Search */}
                <div className="relative mb-3 lg:mb-4">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 lg:h-auto"
                  />
                </div>

                {/* Categories */}
                <Tabs defaultValue="Tümü">
                  <TabsList className="w-full justify-start overflow-x-auto">
                    {categories.map(cat => (
                      <TabsTrigger key={cat} value={cat} className="text-xs lg:text-sm whitespace-nowrap">{cat}</TabsTrigger>
                    ))}
                  </TabsList>

                  {categories.map(category => (
                    <TabsContent key={category} value={category} className="mt-3 lg:mt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:gap-3 max-h-[400px] lg:max-h-[600px] overflow-y-auto pr-2">
                        {mockProducts
                          .filter(p => category === 'Tümü' || p.category === category)
                          .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(product => (
                            <ProductCard
                              key={product.id}
                              name={product.name}
                              price={product.price}
                              onAdd={() => handleAddProduct(product)}
                            />
                          ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>

            {/* Right: Bill */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-fit lg:sticky lg:top-20">
              <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900">Adisyon</h2>
                <p className="text-xs lg:text-sm text-gray-500 mt-1">Adisyon No: A-{String(table.number).padStart(4, '0')}</p>
              </div>

              <div className="px-4 lg:px-6 py-3 lg:py-4 max-h-[300px] lg:max-h-[400px] overflow-y-auto">
                {billItems.length === 0 ? (
                  <div className="text-center py-6 lg:py-8 text-gray-500 text-xs lg:text-sm">
                    Henüz ürün eklenmedi
                  </div>
                ) : (
                  <div className="space-y-2 lg:space-y-3">
                    {billItems.map(item => (
                      <div key={item.id} className="pb-2 lg:pb-3 border-b border-gray-200 last:border-0">
                        <div className="flex items-start justify-between mb-1.5 lg:mb-2">
                          <div className="font-medium text-xs lg:text-sm text-gray-900">{item.productName}</div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 lg:gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="w-6 h-6 lg:w-7 lg:h-7 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3 lg:w-4 lg:h-4" />
                            </button>
                            <span className="w-6 lg:w-8 text-center font-medium text-sm">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-6 h-6 lg:w-7 lg:h-7 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                            </button>
                          </div>
                          <div className="font-semibold text-sm lg:text-base text-gray-900">
                            {(item.price * item.quantity).toFixed(2)} ₺
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {billItems.length > 0 && (
                <>
                  <div className="px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200 space-y-1.5 lg:space-y-2">
                    <div className="flex items-center justify-between text-xs lg:text-sm">
                      <span className="text-gray-600">Ara Toplam</span>
                      <span className="font-medium text-gray-900">{subtotal.toFixed(2)} ₺</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center justify-between text-xs lg:text-sm">
                        <span className="text-gray-600">İndirim</span>
                        <span className="font-medium text-red-600">-{discount.toFixed(2)} ₺</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs lg:text-sm">
                      <span className="text-gray-600">Hizmet Bedeli (10%)</span>
                      <span className="font-medium text-gray-900">{serviceCharge.toFixed(2)} ₺</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                      <span className="font-semibold text-sm lg:text-base text-gray-900">Toplam Tutar</span>
                      <span className="text-xl lg:text-2xl font-bold text-gray-900">{total.toFixed(2)} ₺</span>
                    </div>
                  </div>

                  <div className="px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200">
                    <Button
                      onClick={() => navigate(`/payment/${tableId}`)}
                      className="w-full h-11 lg:h-12 bg-[#d4a017] hover:bg-[#c49316] text-white font-semibold"
                    >
                      Masa Kapat
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}