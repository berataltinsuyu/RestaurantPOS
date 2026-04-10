import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Loader2, CreditCard } from 'lucide-react';

export default function Processing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { amount, tableNo, terminal } = location.state || {};
  const [step, setStep] = useState(0);

  const steps = [
    'POS ile Bağlantı Kuruluyor',
    'İşlem Gönderiliyor',
    'İşlem Bekleniyor',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    const timeout = setTimeout(() => {
      // Simulate success (90% success rate)
      const isSuccess = Math.random() > 0.1;
      if (isSuccess) {
        navigate('/success', { 
          state: { 
            paymentType: 'Kart', 
            amount, 
            tableNo,
            terminal: terminal === 't1' ? 'T-001' : 'T-002',
            referenceNo: 'REF-' + Math.random().toString().slice(2, 11)
          } 
        });
      } else {
        navigate('/failed', { 
          state: { 
            amount, 
            tableNo,
            terminal: terminal === 't1' ? 'T-001' : 'T-002',
            errorCode: 'ERR-051',
            errorMessage: 'Kart limitiniz yetersiz'
          } 
        });
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate, amount, tableNo, terminal]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar />
      <div className="ml-64">
        <TopBar />
        
        <div className="pt-16 p-6 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
              {/* Loading Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#d4a017] rounded-full flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                </div>
              </div>

              {/* Status */}
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                İşlem Sürüyor
              </h2>
              <p className="text-center text-gray-600 mb-8">
                {steps[step]}
              </p>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`flex-1 h-2 rounded-full mx-1 transition-colors ${
                        index <= step ? 'bg-[#d4a017]' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 text-center font-medium">
                  Lütfen POS cihazından işlemi tamamlayın
                </p>
              </div>

              {/* Details */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Terminal No</span>
                  <span className="font-semibold text-gray-900">
                    {terminal === 't1' ? 'T-001' : 'T-002'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Masa No</span>
                  <span className="font-semibold text-gray-900">Masa {tableNo}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Adisyon No</span>
                  <span className="font-medium text-gray-900">A-{String(tableNo).padStart(4, '0')}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-900 font-semibold">Tutar</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {amount?.toFixed(2)} ₺
                  </span>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Bu işlem 2-3 dakika sürebilir
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
