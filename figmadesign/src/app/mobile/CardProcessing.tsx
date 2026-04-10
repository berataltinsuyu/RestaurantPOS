import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { CheckCircle2, CreditCard } from 'lucide-react';

export default function CardProcessing() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const [stage, setStage] = useState<'reading' | 'processing' | 'success'>('reading');

  useEffect(() => {
    // Simulate card reading stages
    const readingTimer = setTimeout(() => {
      setStage('processing');
    }, 1500);

    const processingTimer = setTimeout(() => {
      setStage('success');
    }, 3000);

    const successTimer = setTimeout(() => {
      navigate(`/mobile/payment-success/${tableId}`);
    }, 4500);

    return () => {
      clearTimeout(readingTimer);
      clearTimeout(processingTimer);
      clearTimeout(successTimer);
    };
  }, [navigate, tableId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {stage === 'success' ? (
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          ) : (
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-12 h-12 text-blue-600" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
          {stage === 'reading' && 'Kart Okunuyor...'}
          {stage === 'processing' && 'İşlem Yapılıyor...'}
          {stage === 'success' && 'Ödeme Başarılı'}
        </h1>

        {/* Subtitle */}
        <p className="text-center text-gray-600 mb-8">
          {stage === 'reading' && 'Kart bilgileri alınıyor'}
          {stage === 'processing' && 'Banka onayı bekleniyor'}
          {stage === 'success' && 'Tahsilat tamamlandı'}
        </p>

        {/* Progress or Success */}
        {stage !== 'success' ? (
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>
        )}

        {/* Amount Card */}
        <div className={`border-2 rounded-xl p-6 text-center transition-all ${
          stage === 'success' 
            ? 'bg-green-50 border-green-300' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-sm text-gray-600 mb-2">
            {stage === 'success' ? 'Ödenen Tutar' : 'İşlem Tutarı'}
          </div>
          <div className={`text-3xl font-bold ${
            stage === 'success' ? 'text-green-700' : 'text-gray-900'
          }`}>
            ₺473.00
          </div>
        </div>

        {/* Stage Info */}
        <div className={`mt-6 border rounded-xl p-4 ${
          stage === 'success' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                stage === 'reading' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
              }`}></div>
              <span className={`text-sm ${
                stage === 'reading' ? 'text-blue-900 font-semibold' : 'text-gray-700'
              }`}>
                Kart bilgileri okundu
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                stage === 'processing' ? 'bg-blue-500 animate-pulse' : 
                stage === 'success' ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <span className={`text-sm ${
                stage === 'processing' ? 'text-blue-900 font-semibold' : 
                stage === 'success' ? 'text-gray-700' : 'text-gray-500'
              }`}>
                Banka onayı alındı
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                stage === 'success' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
              }`}></div>
              <span className={`text-sm ${
                stage === 'success' ? 'text-green-900 font-semibold' : 'text-gray-500'
              }`}>
                İşlem tamamlandı
              </span>
            </div>
          </div>
        </div>

        {stage === 'success' && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Başarı ekranına yönlendiriliyorsunuz...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
