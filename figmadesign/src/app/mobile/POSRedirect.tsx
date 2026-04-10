import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Smartphone } from 'lucide-react';

export default function POSRedirect() {
  const navigate = useNavigate();
  const { tableId } = useParams();

  useEffect(() => {
    // Auto-redirect to contactless prompt after 2 seconds
    const timer = setTimeout(() => {
      navigate(`/mobile/contactless-prompt/${tableId}`);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, tableId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-sm w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
          POS Cihazına Yönlendiriliyor
        </h1>

        {/* Subtitle */}
        <p className="text-center text-gray-600 mb-8">
          Lütfen bekleyin, ödeme işlemi başlatılıyor...
        </p>

        {/* Loading Spinner */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 border-4 border-[#d4a017] border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Amount Card */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
          <div className="text-sm text-gray-600 mb-2">Toplam Tutar</div>
          <div className="text-3xl font-bold text-gray-900">₺473.00</div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900 text-center">
            POS cihazı hazırlanıyor. İşlem otomatik olarak devam edecektir.
          </p>
        </div>
      </div>
    </div>
  );
}
