import { useNavigate, useLocation } from 'react-router';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import { XCircle, RefreshCw, CreditCard, ArrowLeft } from 'lucide-react';

export default function Failed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { amount, tableNo, terminal, errorCode, errorMessage } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar />
      <div className="ml-64">
        <TopBar />
        
        <div className="pt-16 p-6 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>

              {/* Status */}
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                İşlem Başarısız
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Ödeme işlemi tamamlanamadı
              </p>

              {/* Error Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-900 font-medium text-center">
                  {errorMessage || 'İşlem sırasında bir hata oluştu'}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                {errorCode && (
                  <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Hata Kodu</span>
                    <span className="font-mono font-semibold text-red-600">{errorCode}</span>
                  </div>
                )}
                {terminal && (
                  <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Terminal No</span>
                    <span className="font-semibold text-gray-900">{terminal}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Masa No</span>
                  <span className="font-semibold text-gray-900">Masa {tableNo}</span>
                </div>
                <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Adisyon No</span>
                  <span className="font-medium text-gray-900">A-{String(tableNo).padStart(4, '0')}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-gray-900 font-semibold text-lg">Tutar</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {amount?.toFixed(2)} ₺
                  </span>
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 font-medium mb-2">Öneriler:</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Kart limitini kontrol edin</li>
                  <li>Kart bilgilerini doğru girdiğinizden emin olun</li>
                  <li>Farklı bir ödeme yöntemi deneyin</li>
                  <li>Teknik destek için 0850 222 0 724</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/processing', { state: { amount, tableNo, terminal } })}
                  className="w-full h-12 bg-[#d4a017] hover:bg-[#c49316] text-white font-semibold"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tekrar Dene
                </Button>

                <Button
                  onClick={() => navigate(`/payment/${tableNo}`)}
                  variant="outline"
                  className="w-full h-12 border-2"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Farklı Ödeme Yöntemi
                </Button>

                <Button
                  onClick={() => navigate(`/bill/${tableNo}`)}
                  variant="ghost"
                  className="w-full h-12"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Adisyona Geri Dön
                </Button>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500">
                  İşlem iptal edildi • Para çekilmedi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
