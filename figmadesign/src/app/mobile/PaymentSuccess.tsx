import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { tableId } = useParams();

  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/mobile/tables');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-14 h-14 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h1>
          <p className="text-gray-600">
            Masa {tableId} ödemesi başarıyla tamamlandı.
          </p>
        </div>

        {/* Transaction Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Masa No</span>
              <span className="font-semibold text-gray-900">{tableId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tutar</span>
              <span className="font-semibold text-gray-900">₺473.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Yöntem</span>
              <span className="font-semibold text-gray-900">Kart</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tarih</span>
              <span className="font-semibold text-gray-900">
                {new Date().toLocaleDateString('tr-TR')} {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/mobile/tables')}
            className="w-full h-12 bg-[#d4a017] hover:bg-[#b8860b] text-white font-semibold"
          >
            Masa Planına Dön
          </Button>
          <Button
            onClick={() => navigate('/mobile/tables')}
            variant="outline"
            className="w-full h-12"
          >
            Yeni Masa Aç
          </Button>
        </div>

        {/* Auto Redirect Info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          3 saniye içinde otomatik olarak masa planına yönlendirileceksiniz...
        </p>
      </div>
    </div>
  );
}
