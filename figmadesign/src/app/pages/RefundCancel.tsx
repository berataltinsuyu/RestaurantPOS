import { useState } from 'react';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertTriangle, CheckCircle2, XCircle, ArrowLeft, FileText, RotateCcw, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router';

type RefundType = 'full' | 'partial';
type ProcessState = 'form' | 'success' | 'failed';

export default function RefundCancel() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refundType, setRefundType] = useState<RefundType>('full');
  const [refundAmount, setRefundAmount] = useState('2450.00');
  const [refundReason, setRefundReason] = useState('');
  const [description, setDescription] = useState('');
  const [authorizerName, setAuthorizerName] = useState('');
  const [processState, setProcessState] = useState<ProcessState>('form');
  const [errorCode, setErrorCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Mock transaction data
  const transaction = {
    adisyonNo: 'ADS-2026-004281',
    masaNo: 'M-12',
    terminalNo: 'T-001',
    referansNo: 'RF-92485172',
    odemeTipi: 'Kredi Kartı',
    islemTarihi: '07.04.2026 14:32',
    tutar: 2450.00,
    kartSonDort: '4523',
    islemTuru: 'Satış',
  };

  const refundReasons = [
    'Müşteri İsteği',
    'Hatalı İşlem',
    'Ürün/Hizmet İptali',
    'Fiyat Hatası',
    'Sistem Hatası',
    'Yönetici Onayı',
    'Diğer',
  ];

  const handleSubmitRefund = () => {
    // Simulate processing
    const isSuccess = Math.random() > 0.3; // 70% success rate for demo
    
    if (isSuccess) {
      setProcessState('success');
    } else {
      setErrorCode('ERR-POS-4021');
      setErrorMessage('Bağlantı zaman aşımı. POS terminali yanıt vermiyor.');
      setProcessState('failed');
    }
  };

  const handleRetry = () => {
    setProcessState('form');
    setErrorCode('');
    setErrorMessage('');
  };

  const handleCancel = () => {
    navigate('/history');
  };

  const handleViewDetails = () => {
    // Navigate to transaction details
    console.log('View transaction details');
  };

  const handleSelectDifferentTerminal = () => {
    // Logic to select different terminal
    console.log('Select different terminal');
  };

  if (processState === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          
          <div className="pt-16 p-4 lg:p-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">İade Başarılı</h2>
                  <p className="text-sm text-gray-600 mb-6">İade işlemi başarıyla tamamlandı</p>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Adisyon No:</span>
                      <span className="font-semibold text-gray-900">{transaction.adisyonNo}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Referans No:</span>
                      <span className="font-semibold text-gray-900">{transaction.referansNo}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">İade Tutarı:</span>
                      <span className="font-bold text-xl text-green-600">₺{parseFloat(refundAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">İade Tarihi:</span>
                      <span className="font-semibold text-gray-900">{new Date().toLocaleString('tr-TR')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => navigate('/history')}
                      className="flex-1 bg-[#d4a017] hover:bg-[#b8860b] text-white"
                    >
                      İşlem Geçmişine Dön
                    </Button>
                    <Button
                      onClick={() => window.print()}
                      variant="outline"
                      className="flex-1"
                    >
                      Makbuz Yazdır
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (processState === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          
          <div className="pt-16 p-4 lg:p-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">İade Başarısız</h2>
                  <p className="text-sm text-gray-600 mb-6">İade işlemi tamamlanamadı</p>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-red-900 mb-1">Hata Kodu: {errorCode}</div>
                        <div className="text-sm text-red-700">{errorMessage}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-left">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Adisyon No:</span>
                      <span className="font-semibold text-gray-900">{transaction.adisyonNo}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Terminal:</span>
                      <span className="font-semibold text-gray-900">{transaction.terminalNo}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Denenen Tutar:</span>
                      <span className="font-semibold text-gray-900">₺{parseFloat(refundAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleRetry}
                      className="flex-1 bg-[#d4a017] hover:bg-[#b8860b] text-white"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Tekrar Dene
                    </Button>
                    <Button
                      onClick={handleSelectDifferentTerminal}
                      variant="outline"
                      className="flex-1"
                    >
                      <Terminal className="w-4 h-4 mr-2" />
                      Farklı Terminal Seç
                    </Button>
                  </div>

                  <Button
                    onClick={handleCancel}
                    variant="ghost"
                    className="w-full mt-3"
                  >
                    İptal Et
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="pt-16 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-4 lg:mb-6">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={handleCancel}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">İade / İptal İşlemi</h1>
              </div>
              <p className="text-xs lg:text-sm text-gray-600">Tamamlanmış ödeme işlemini iade edin</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                {/* Original Payment Summary */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-gray-700" />
                    <h2 className="text-base lg:text-lg font-semibold text-gray-900">Orijinal İşlem Bilgileri</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Adisyon No</label>
                        <div className="text-sm font-semibold text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                          {transaction.adisyonNo}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Masa No</label>
                        <div className="text-sm font-semibold text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                          {transaction.masaNo}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Terminal No</label>
                        <div className="text-sm font-semibold text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                          {transaction.terminalNo}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Referans No</label>
                        <div className="text-sm font-semibold text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                          {transaction.referansNo}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Ödeme Tipi</label>
                        <div className="text-sm font-semibold text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                          {transaction.odemeTipi}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">İşlem Tarihi</label>
                        <div className="text-sm font-semibold text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                          {transaction.islemTarihi}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Toplam Tutar</span>
                        <span className="text-xl font-bold text-gray-900">
                          ₺{transaction.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refund Type Selection */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">İade Türü</h2>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => {
                        setRefundType('full');
                        setRefundAmount(transaction.tutar.toFixed(2));
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        refundType === 'full'
                          ? 'border-[#d4a017] bg-[#d4a017]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-semibold text-gray-900 mb-1">Tam İade</div>
                      <div className="text-xs text-gray-600">Tüm tutar iade edilir</div>
                    </button>
                    <button
                      onClick={() => {
                        setRefundType('partial');
                        setRefundAmount('');
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        refundType === 'partial'
                          ? 'border-[#d4a017] bg-[#d4a017]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-semibold text-gray-900 mb-1">Kısmi İade</div>
                      <div className="text-xs text-gray-600">Belirtilen tutar iade edilir</div>
                    </button>
                  </div>

                  {refundType === 'partial' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">İade Tutarı (₺)</label>
                      <Input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        max={transaction.tutar}
                        className="text-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maksimum: ₺{transaction.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}

                  {refundType === 'full' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900">
                        Tam iade seçildi: <span className="font-bold">₺{transaction.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Reason and Description */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">İade Gerekçesi</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        İptal / İade Nedeni <span className="text-red-500">*</span>
                      </label>
                      <Select value={refundReason} onValueChange={setRefundReason}>
                        <SelectTrigger>
                          <SelectValue placeholder="Neden seçiniz..." />
                        </SelectTrigger>
                        <SelectContent>
                          {refundReasons.map((reason) => (
                            <SelectItem key={reason} value={reason}>
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Açıklama</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="İade işlemi hakkında ek açıklama giriniz..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a017] focus:border-transparent text-sm resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">İsteğe bağlı</p>
                    </div>
                  </div>
                </div>

                {/* Authorization */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Kullanıcı Onayı</h2>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-900">
                        <p className="font-semibold mb-1">Yetki Gerekli</p>
                        <p className="text-xs">Bu işlem yetkili personel onayı gerektirir. İşlem kaydı sisteme işlenir.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Yetkili Adı Soyadı <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={authorizerName}
                      onChange={(e) => setAuthorizerName(e.target.value)}
                      placeholder="Onaylayan yetkilinin adı soyadı"
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 sticky top-20">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">İşlem Özeti</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">İşlem Türü:</span>
                      <span className="font-semibold text-gray-900">
                        {refundType === 'full' ? 'Tam İade' : 'Kısmi İade'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Orijinal Tutar:</span>
                      <span className="font-semibold text-gray-900">
                        ₺{transaction.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">İade Tutarı:</span>
                        <span className="text-xl font-bold text-[#d4a017]">
                          ₺{refundAmount ? parseFloat(refundAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleSubmitRefund}
                      disabled={!refundReason || !authorizerName || !refundAmount || parseFloat(refundAmount) <= 0}
                      className="w-full bg-[#d4a017] hover:bg-[#b8860b] text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      POS'a İade Gönder
                    </Button>
                    <Button
                      onClick={handleViewDetails}
                      variant="outline"
                      className="w-full"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      İşlem Detayını Gör
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="ghost"
                      className="w-full"
                    >
                      Vazgeç
                    </Button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      İade işlemi, bankanız tarafından onaylandıktan sonra 3-5 iş günü içinde müşteri hesabına yansır.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
