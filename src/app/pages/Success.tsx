import { useLocation, useNavigate } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import { CheckCircle2, Receipt, Printer, Home } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { paymentType, amount, tableId, tableNo, billNo, terminal, referenceNo, approvalCode, processedAt } = location.state || {};

  const currentDate = processedAt ? new Date(processedAt) : new Date();
  const formattedDate = format(currentDate, 'dd.MM.yyyy');
  const formattedTime = format(currentDate, 'HH:mm:ss');

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 pb-6 pt-20">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
              </div>

              {/* Status */}
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                İşlem Başarılı
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Ödeme başarıyla alındı
              </p>

              {/* Details */}
              <div className="space-y-3 mb-6">
                {referenceNo && (
                  <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Referans No</span>
                    <span className="font-mono font-semibold text-gray-900">{referenceNo}</span>
                  </div>
                )}
                {approvalCode && (
                  <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Onay Kodu</span>
                    <span className="font-mono font-semibold text-gray-900">{approvalCode}</span>
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
                  <span className="font-semibold text-gray-900">{tableNo}</span>
                </div>
                <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Adisyon No</span>
                  <span className="font-medium text-gray-900">{billNo || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Ödeme Türü</span>
                  <span className="font-medium text-gray-900">{paymentType}</span>
                </div>
                <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Tarih</span>
                  <span className="font-medium text-gray-900">{formattedDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Saat</span>
                  <span className="font-medium text-gray-900">{formattedTime}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-gray-900 font-semibold text-lg">Tutar</span>
                  <span className="text-2xl font-bold text-green-600">
                    {amount?.toFixed(2)} ₺
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-11"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Fiş Görüntüle
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Yazdır
                  </Button>
                </div>

                <Button
                  onClick={() => navigate('/dashboard')}
                  className="w-full h-12 bg-[#d4a017] hover:bg-[#c49316] text-white font-semibold"
                >
                  <Home className="w-4 h-4 mr-2" />
                  {tableId ? 'Masalara Dön' : 'Ana Sayfaya Dön'}
                </Button>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500">
                  İşlem kaydı sisteme başarıyla işlendi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
