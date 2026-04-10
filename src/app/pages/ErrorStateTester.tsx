import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import {
  WifiOff,
  Clock,
  XCircle,
  UserX,
  AlertTriangle,
  Copy,
  ChevronRight
} from 'lucide-react';

export default function ErrorStateTester() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const errorStates = [
    {
      type: 'terminal-offline',
      title: 'Terminal Çevrimdışı',
      description: 'POS terminali bağlantı hatası',
      icon: WifiOff,
      color: 'bg-orange-100 text-orange-600 border-orange-200'
    },
    {
      type: 'timeout',
      title: 'İşlem Zaman Aşımı',
      description: 'Belirlenen süre içinde yanıt alınamadı',
      icon: Clock,
      color: 'bg-amber-100 text-amber-600 border-amber-200'
    },
    {
      type: 'bank-declined',
      title: 'Banka Onayı Alınamadı',
      description: 'İşlem banka tarafından reddedildi',
      icon: XCircle,
      color: 'bg-red-100 text-red-600 border-red-200'
    },
    {
      type: 'user-cancelled',
      title: 'Kullanıcı İptal Etti',
      description: 'İşlem kullanıcı tarafından iptal edildi',
      icon: UserX,
      color: 'bg-gray-100 text-gray-600 border-gray-300'
    },
    {
      type: 'amount-mismatch',
      title: 'Tutar Uyuşmazlığı',
      description: 'Ödeme tutarı sistem kaydıyla eşleşmiyor',
      icon: AlertTriangle,
      color: 'bg-purple-100 text-purple-600 border-purple-200'
    },
    {
      type: 'duplicate-suspected',
      title: 'Mükerrer İşlem Şüphesi',
      description: 'Çift ödeme riski algılandı',
      icon: Copy,
      color: 'bg-blue-100 text-blue-600 border-blue-200'
    }
  ];

  const handleTestError = (errorType: string) => {
    navigate('/payment-error', {
      state: {
        errorType,
        amount: 520.00,
        tableNo: '12',
        billNo: 'A-0012',
        terminalId: 'VKB-TRM-01'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Hata Durumu Test Ekranı
              </h1>
              <p className="text-sm lg:text-base text-gray-600 mt-2">
                Farklı ödeme hatası durumlarını test etmek için aşağıdaki butonlara tıklayın
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 lg:p-6 mb-6 lg:mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Test Amaçlı Ekran</h3>
                  <p className="text-xs text-blue-800">
                    Bu ekran, geliştiriciler ve test ekibi için oluşturulmuştur. 
                    Her hata durumu için özel UI, mesajlar ve aksiyon butonları tasarlanmıştır.
                  </p>
                </div>
              </div>
            </div>

            {/* Error State Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {errorStates.map((error) => {
                const Icon = error.icon;
                return (
                  <button
                    key={error.type}
                    onClick={() => handleTestError(error.type)}
                    className="bg-white rounded-xl border-2 border-gray-200 hover:border-[#d4a017] shadow-sm hover:shadow-md p-6 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${error.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#d4a017] transition-colors">
                          {error.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {error.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#d4a017] flex-shrink-0 transition-colors" />
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-xs font-mono text-gray-500">
                        Error Type: {error.type}
                      </span>
                      <span className="text-xs font-semibold text-[#d4a017]">
                        Test Et →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Test Data Info */}
            <div className="bg-gray-100 rounded-xl p-4 lg:p-6 mt-6 lg:mt-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Test Verileri</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Tutar</div>
                  <div className="font-semibold text-gray-900">₺520.00</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Masa No</div>
                  <div className="font-semibold text-gray-900">12</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Adisyon No</div>
                  <div className="font-semibold text-gray-900 font-mono">A-0012</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Terminal</div>
                  <div className="font-semibold text-gray-900 font-mono">VKB-TRM-01</div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-6 lg:mt-8">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full lg:w-auto"
              >
                Ana Sayfaya Dön
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
