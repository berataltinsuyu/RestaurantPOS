import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { paymentsApi } from '../lib/api';
import { getErrorMessage } from '../lib/error-utils';
import { Loader2, CreditCard } from 'lucide-react';

interface ProcessingState {
  billId: number;
  tableId: number;
  tableNo: string;
  billNo: string;
  amount: number;
  terminalId: number;
  terminalNo: string;
}

export default function Processing() {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentRequest = (location.state || null) as ProcessingState | null;
  const [step, setStep] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const steps = [
    'POS ile Bağlantı Kuruluyor',
    'İşlem Gönderiliyor',
    'İşlem Bekleniyor',
  ];

  useEffect(() => {
    if (!paymentRequest) {
      navigate('/dashboard', { replace: true });
      return;
    }

    let isActive = true;
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    const runPayment = async () => {
      try {
        const payment = await paymentsApi.card({
          billId: paymentRequest.billId,
          terminalId: paymentRequest.terminalId,
          amount: paymentRequest.amount,
        });

        await new Promise((resolve) => setTimeout(resolve, 2200));
        if (!isActive) {
          return;
        }

        navigate('/success', {
          replace: true,
          state: {
            paymentType: 'Kart',
            amount: payment.amount,
            tableId: paymentRequest.tableId,
            tableNo: paymentRequest.tableNo,
            billNo: paymentRequest.billNo,
            terminal: payment.terminalNo || paymentRequest.terminalNo,
            referenceNo: payment.referenceNo,
            approvalCode: payment.bankApprovalCode,
            processedAt: payment.completedAt || payment.createdAt,
          },
        });
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 1800));
        if (!isActive) {
          return;
        }

        navigate('/failed', {
          replace: true,
          state: {
            amount: paymentRequest.amount,
            tableId: paymentRequest.tableId,
            tableNo: paymentRequest.tableNo,
            billNo: paymentRequest.billNo,
            terminal: paymentRequest.terminalNo,
            errorCode: error instanceof Error ? 'PAYMENT-ERROR' : 'PAYMENT-ERROR',
            errorMessage: getErrorMessage(error, 'İşlem sırasında bir hata oluştu.'),
          },
        });
      }
    };

    runPayment();

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [navigate, paymentRequest]);

  if (!paymentRequest) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 pb-6 pt-20">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
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

              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">İşlem Sürüyor</h2>
              <p className="text-center text-gray-600 mb-8">{steps[step]}</p>

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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 text-center font-medium">Lütfen POS cihazından işlemi tamamlayın</p>
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Terminal No</span>
                  <span className="font-semibold text-gray-900">{paymentRequest.terminalNo}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Masa No</span>
                  <span className="font-semibold text-gray-900">{paymentRequest.tableNo}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Adisyon No</span>
                  <span className="font-medium text-gray-900">{paymentRequest.billNo}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-900 font-semibold">Tutar</span>
                  <span className="text-2xl font-bold text-gray-900">{paymentRequest.amount.toFixed(2)} ₺</span>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">Bu işlem 2-3 dakika sürebilir</p>
          </div>
        </div>
      </div>
    </div>
  );
}
