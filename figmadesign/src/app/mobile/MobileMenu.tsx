import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Search, Plus, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

const products: Product[] = [
  { id: '1', name: 'Izgara Köfte', price: 145.00, category: 'Ana Yemekler' },
  { id: '2', name: 'Adana Kebap', price: 165.00, category: 'Ana Yemekler' },
  { id: '3', name: 'Kuzu Şiş', price: 185.00, category: 'Ana Yemekler' },
  { id: '4', name: 'Tavuk Şiş', price: 135.00, category: 'Ana Yemekler' },
  { id: '5', name: 'Karışık Salata', price: 65.00, category: 'Başlangıçlar' },
  { id: '6', name: 'Çoban Salata', price: 55.00, category: 'Başlangıçlar' },
  { id: '7', name: 'Humus', price: 45.00, category: 'Başlangıçlar' },
  { id: '8', name: 'Mercimek Çorbası', price: 45.00, category: 'Çorbalar' },
  { id: '9', name: 'İşkembe Çorbası', price: 55.00, category: 'Çorbalar' },
  { id: '10', name: 'Ayran', price: 25.00, category: 'İçecekler' },
  { id: '11', name: 'Coca Cola', price: 35.00, category: 'İçecekler' },
  { id: '12', name: 'Su', price: 15.00, category: 'İçecekler' },
  { id: '13', name: 'Baklava', price: 95.00, category: 'Tatlılar' },
  { id: '14', name: 'Künefe', price: 105.00, category: 'Tatlılar' },
];

const categories = ['Tümü', 'Ana Yemekler', 'Başlangıçlar', 'Çorbalar', 'İçecekler', 'Tatlılar'];

export default function MobileMenu() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Tümü' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = products.find(p => p.id === id);
    return sum + (product?.price || 0) * qty;
  }, 0);

  const handleConfirm = () => {
    // In real app, this would add items to order
    navigate(`/mobile/order/${tableId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-gray-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900">Ürün Seç</h1>
            <p className="text-xs text-gray-600">Masa {tableId}</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 border-2 border-gray-200 rounded-lg focus:border-[#d4a017] focus:outline-none text-sm"
              placeholder="Ürün ara..."
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-[#d4a017] text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredProducts.map((product) => {
            const inCart = cart[product.id] || 0;
            return (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-0.5">{product.name}</div>
                    <div className="text-sm text-gray-600">₺{product.price.toFixed(2)}</div>
                    {inCart > 0 && (
                      <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-100 border border-green-200 text-green-700 text-xs font-semibold rounded">
                        <Check className="w-3 h-3" />
                        Sepette: {inCart}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {inCart > 0 && (
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="w-10 h-10 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center justify-center font-bold"
                      >
                        −
                      </button>
                    )}
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-10 h-10 bg-[#d4a017] hover:bg-[#b8860b] text-white rounded-lg flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Summary */}
      {cartCount > 0 && (
        <div className="bg-white border-t border-gray-200 sticky bottom-0">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-gray-600">{cartCount} ürün seçildi</div>
                <div className="font-bold text-lg text-gray-900">₺{cartTotal.toFixed(2)}</div>
              </div>
              <button
                onClick={handleConfirm}
                className="h-12 px-6 bg-[#d4a017] hover:bg-[#b8860b] text-white font-semibold rounded-lg"
              >
                Siparişe Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
