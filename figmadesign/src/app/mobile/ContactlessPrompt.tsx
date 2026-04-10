import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Waves, CreditCard } from 'lucide-react';

export default function ContactlessPrompt() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    // Simulate card tap after 3 seconds
    const timer = setTimeout(() => {
      navigate(`/mobile/card-processing/${tableId}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, tableId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3">
        <div className="text-center">
          <h1 className="text-base font-bold text-gray-900">Kart Ödeme</h1>
          <p className="text-xs text-gray-600">Masa {tableId}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Contactless Icon with Animation */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-16 h-16 text-blue-600" />
          </div>
          
          {/* Pulse Rings */}
          {showPulse && (
            <>
              <div className="absolute inset-0 w-32 h-32 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
              <div className="absolute inset-0 w-32 h-32 bg-blue-400 rounded-full opacity-10 animate-pulse"></div>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
          Temassız Kart Okutun
        </h2>

        {/* Instruction */}
        <p className="text-center text-gray-600 mb-8 max-w-xs">
          Kartınızı POS cihazına yaklaştırın veya yerleştirin
        </p>

        {/* Amount Display */}
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Ödenecek Tutar</div>
            <div className="text-4xl font-bold text-gray-900">₺473.00</div>
          </div>
        </div>

        {/* Contactless Symbol */}
        <div className="flex items-center justify-center gap-2 text-blue-600 mb-6">
          <Waves className="w-6 h-6" />
          <span className="text-sm font-semibold">Temassız Ödeme</span>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-xs">
          <p className="text-sm text-blue-900 text-center">
            Kartınızı POS cihazına yaklaştırın. İşlem otomatik olarak başlayacaktır.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-6 pb-6">
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-600 text-center">
            İşlem güvenli VakıfBank POS sistemi üzerinden gerçekleştirilmektedir
          </p>
        </div>
      </div>
    </div>
  );
}
