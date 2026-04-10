import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  RotateCcw,
  Terminal,
  CreditCard,
  Phone,
  FileText,
  Settings,
  ChevronRight,
  Info
} from 'lucide-react';

type ErrorType = 
  | 'terminal-offline'
  | 'timeout'
  | 'bank-declined'
  | 'user-cancelled'
  | 'amount-mismatch'
  | 'duplicate-suspected';

interface ErrorConfig {
  title: string;
  description: string;
  errorCode: string;
  icon: any;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  recommendation: string;
  primaryAction: {
    label: string;
    action: () => void;
  };
  secondaryAction: {
    label: string;
    action: () => void;
  };
  tertiaryAction?: {
    label: string;
    action: () => void;
  };
}

export default function PaymentError() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get error data from navigation state or use defaults
  const errorType: ErrorType = location.state?.errorType || 'bank-declined';
  const amount = location.state?.amount || 520.00;
  const tableNo = location.state?.tableNo || '12';
  const billNo = location.state?.billNo || 'A-0012';
  const terminalId = location.state?.terminalId || 'VKB-TRM-01';
  const timestamp = new Date().toLocaleString('tr-TR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const handleRetry = () => {
    navigate(`/payment/${tableNo}`);
  };

  const handleSelectDifferentTerminal = () => {
    navigate(`/payment/${tableNo}`, { state: { selectTerminal: true } });
  };

  const handleDifferentPaymentMethod = () => {
    navigate(`/payment/${tableNo}`, { state: { changeMethod: true } });
  };

  const handleBackToBill = () => {
    navigate(`/bill/${tableNo}`);
  };

  const handleViewDetails = () => {
    alert('İşlem detayları açılıyor...');
  };

  const handleContactSupport = () => {
    alert('Destek ekibi aranıyor...');
  };

  const getErrorConfig = (type: ErrorType): ErrorConfig => {
    switch (type) {
      case 'terminal-offline':
        return {
          title: 'Terminal Çevrimdışı',
          description: 'Seçili POS terminali şu anda çevrimdışı durumda. Terminal ile bağlantı kurulamadı. Lütfen farklı bir terminal seçin veya terminal bağlantısını kontrol edin.',
          errorCode: 'ERR-TRM-001',
          icon: WifiOff,
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          recommendation: 'Terminal bağlantısını kontrol edin veya farklı bir terminal ile işleme devam edin.',
          primaryAction: {
            label: 'Farklı Terminal Seç',
            action: handleSelectDifferentTerminal
          },
          secondaryAction: {
            label: 'Terminal Yönetimine Git',
            action: () => navigate('/terminal-management')
          },
          tertiaryAction: {
            label: 'Adisyona Geri Dön',
            action: handleBackToBill
          }
        };

      case 'timeout':
        return {
          title: 'İşlem Zaman Aşımı',
          description: 'Ödeme işlemi için belirlenen süre doldu. Banka yanıtı alınamadı veya işlem çok uzun sürdü. İşlem otomatik olarak iptal edildi.',
          errorCode: 'ERR-TMO-002',
          icon: Clock,
          iconColor: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          recommendation: 'İnternet bağlantınızı kontrol edin ve işlemi tekrar deneyin. Sorun devam ederse destek ekibiyle iletişime geçin.',
          primaryAction: {
            label: 'Tekrar Dene',
            action: handleRetry
          },
          secondaryAction: {
            label: 'Farklı Ödeme Yöntemi',
            action: handleDifferentPaymentMethod
          },
          tertiaryAction: {
            label: 'Destek Ekibiyle İletişim',
            action: handleContactSupport
          }
        };

      case 'bank-declined':
        return {
          title: 'Banka Onayı Alınamadı',
          description: 'İşlem banka tarafından reddedildi. Yetersiz bakiye, kart limiti veya banka kısıtlaması nedeniyle ödeme gerçekleştirilemedi.',
          errorCode: 'ERR-BNK-003',
          icon: XCircle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          recommendation: 'Müşteriden farklı bir kart kullanmasını veya farklı ödeme yöntemi seçmesini isteyin.',
          primaryAction: {
            label: 'Tekrar Dene',
            action: handleRetry
          },
          secondaryAction: {
            label: 'Farklı Ödeme Yöntemi',
            action: handleDifferentPaymentMethod
          },
          tertiaryAction: {
            label: 'Adisyona Geri Dön',
            action: handleBackToBill
          }
        };

      case 'user-cancelled':
        return {
          title: 'Kullanıcı İşlemi İptal Etti',
          description: 'Ödeme işlemi kullanıcı tarafından iptal edildi. İşlem tamamlanmadan önce müşteri veya personel tarafından iptal butonuna basıldı.',
          errorCode: 'ERR-USR-004',
          icon: UserX,
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-300',
          recommendation: 'Müşteri ile görüşerek ödemeye devam etmek isteyip istemediğini öğrenin.',
          primaryAction: {
            label: 'Tekrar Dene',
            action: handleRetry
          },
          secondaryAction: {
            label: 'Adisyona Geri Dön',
            action: handleBackToBill
          }
        };

      case 'amount-mismatch':
        return {
          title: 'Tutar Uyuşmazlığı',
          description: 'Gönderilen ödeme tutarı ile sistem kaydındaki tutar eşleşmiyor. Güvenlik nedeniyle işlem engellenmiştir. Bu durum adisyon güncellemesi sırasında ortaya çıkmış olabilir.',
          errorCode: 'ERR-AMT-005',
          icon: AlertTriangle,
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          recommendation: 'Adisyon detaylarını kontrol edin ve güncel tutarla tekrar ödeme işlemi başlatın.',
          primaryAction: {
            label: 'Adisyonu Kontrol Et',
            action: handleBackToBill
          },
          secondaryAction: {
            label: 'Ödeme Ekranına Dön',
            action: handleRetry
          },
          tertiaryAction: {
            label: 'İşlem Detayını Aç',
            action: handleViewDetails
          }
        };

      case 'duplicate-suspected':
        return {
          title: 'Mükerrer İşlem Şüphesi',
          description: 'Aynı tutar ve adisyon için kısa süre içinde birden fazla ödeme talebi algılandı. Çift ödeme riskini önlemek için işlem durduruldu.',
          errorCode: 'ERR-DUP-006',
          icon: Copy,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          recommendation: 'Son işlemin durumunu kontrol edin. Ödeme tamamlanmadıysa güvenle tekrar deneyebilirsiniz.',
          primaryAction: {
            label: 'İşlem Geçmişini Kontrol Et',
            action: () => navigate('/history')
          },
          secondaryAction: {
            label: 'Yeni İşlem Başlat',
            action: handleRetry
          },
          tertiaryAction: {
            label: 'İşlem Detayını Aç',
            action: handleViewDetails
          }
        };

      default:
        return {
          title: 'İşlem Başarısız',
          description: 'Ödeme işlemi tamamlanamadı.',
          errorCode: 'ERR-GEN-000',
          icon: XCircle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          recommendation: 'Tekrar deneyin.',
          primaryAction: {
            label: 'Tekrar Dene',
            action: handleRetry
          },
          secondaryAction: {
            label: 'Geri Dön',
            action: handleBackToBill
          }
        };
    }
  };

  const errorConfig = getErrorConfig(errorType);
  const ErrorIcon = errorConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
          <div className="max-w-2xl w-full">
            {/* Error Icon & Title */}
            <div className="text-center mb-6 lg:mb-8">
              <div className={`w-20 h-20 lg:w-24 lg:h-24 ${errorConfig.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 border-4 ${errorConfig.borderColor}`}>
                <ErrorIcon className={`w-10 h-10 lg:w-12 lg:h-12 ${errorConfig.iconColor}`} />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-3">
                {errorConfig.title}
              </h1>
              <p className="text-sm lg:text-base text-gray-600 max-w-lg mx-auto px-4">
                {errorConfig.description}
              </p>
            </div>

            {/* Error Details Card */}
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden mb-4 lg:mb-6">
              {/* Error Code Banner */}
              <div className={`${errorConfig.bgColor} border-b-2 ${errorConfig.borderColor} px-4 lg:px-6 py-3 lg:py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg flex items-center justify-center border ${errorConfig.borderColor}`}>
                      <AlertTriangle className={`w-4 h-4 lg:w-5 lg:h-5 ${errorConfig.iconColor}`} />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600">Hata Kodu</div>
                      <div className={`text-sm lg:text-base font-bold font-mono ${errorConfig.iconColor}`}>
                        {errorConfig.errorCode}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">Zaman</div>
                    <div className="text-xs lg:text-sm font-semibold text-gray-900">{timestamp}</div>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="p-4 lg:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-600">Adisyon No</div>
                      <div className="text-sm lg:text-base font-semibold text-gray-900 font-mono">{billNo}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-600">Tutar</div>
                      <div className="text-sm lg:text-base font-bold text-gray-900">
                        ₺{amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Terminal className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-600">Terminal No</div>
                      <div className="text-sm lg:text-base font-semibold text-gray-900 font-mono">{terminalId}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Settings className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-600">Masa No</div>
                      <div className="text-sm lg:text-base font-semibold text-gray-900">Masa {tableNo}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className={`${errorConfig.bgColor} border-2 ${errorConfig.borderColor} rounded-xl p-4 lg:p-6 mb-4 lg:mb-6`}>
              <div className="flex items-start gap-3">
                <Info className={`w-5 h-5 lg:w-6 lg:h-6 ${errorConfig.iconColor} flex-shrink-0 mt-0.5`} />
                <div>
                  <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-1 lg:mb-2">
                    Önerilen Çözüm
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-700">
                    {errorConfig.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={errorConfig.primaryAction.action}
                className="w-full h-12 lg:h-14 bg-[#d4a017] hover:bg-[#b8860b] text-white font-semibold text-sm lg:text-base"
              >
                {errorConfig.primaryAction.label}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                onClick={errorConfig.secondaryAction.action}
                variant="outline"
                className="w-full h-12 lg:h-14 text-sm lg:text-base font-semibold"
              >
                {errorConfig.secondaryAction.label}
              </Button>

              {errorConfig.tertiaryAction && (
                <Button
                  onClick={errorConfig.tertiaryAction.action}
                  variant="outline"
                  className="w-full h-11 lg:h-12 text-sm lg:text-base"
                >
                  {errorConfig.tertiaryAction.label}
                </Button>
              )}
            </div>

            {/* Support Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 lg:p-6 mt-4 lg:mt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    Destek Ekibi
                  </h3>
                  <p className="text-xs text-blue-800 mb-3">
                    Sorun devam ederse veya acil yardıma ihtiyacınız varsa VakıfBank İşyeri Destek ekibiyle iletişime geçin.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleContactSupport}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      444 0 724
                    </button>
                    <button
                      onClick={handleViewDetails}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-blue-600 text-sm font-medium rounded-lg border border-blue-200 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Detayları Görüntüle
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Dashboard Link */}
            <div className="text-center mt-6 lg:mt-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 mx-auto transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
