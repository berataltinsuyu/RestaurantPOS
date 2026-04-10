import { useState } from 'react';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import { 
  Calendar,
  TrendingUp,
  CreditCard,
  Banknote,
  Split,
  XCircle,
  RotateCcw,
  FileText,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Terminal,
  Eye,
  Building2,
  Clock,
  Users
} from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';

export default function EndOfDayReconciliation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-04-07');
  const [managerConfirmed, setManagerConfirmed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Mock data - realistic end of day figures
  const reconciliationData = {
    date: '07 Nisan 2026',
    businessName: 'Vakıf Lezzet Restoran',
    branch: 'Beşiktaş Şubesi',
    merchantId: '8472651',
    totalRevenue: 47890.50,
    cardPayments: 38450.00,
    cashPayments: 8215.50,
    splitPayments: 1225.00,
    failedTransactions: 12,
    refundsCancellations: 1340.00,
    openBills: 3,
    openBillsAmount: 2850.50,
    totalTransactions: 143,
    successfulTransactions: 131,
    averageTicket: 334.90,
  };

  const terminalBreakdown = [
    { terminalNo: 'VKB-TRM-01', deviceName: 'Ana Kasa POS 1', transactionCount: 52, amount: 18340.00, successRate: 98.1 },
    { terminalNo: 'VKB-TRM-02', deviceName: 'Garson POS 1', transactionCount: 38, amount: 12680.00, successRate: 97.4 },
    { terminalNo: 'VKB-TRM-03', deviceName: 'Ana Kasa POS 2', transactionCount: 41, amount: 14645.50, successRate: 100.0 },
  ];

  const paymentTypeBreakdown = [
    { type: 'Kredi Kartı', count: 84, amount: 28340.00, percentage: 59.2 },
    { type: 'Banka Kartı', count: 32, amount: 10110.00, percentage: 21.1 },
    { type: 'Nakit', count: 12, amount: 8215.50, percentage: 17.2 },
    { type: 'Bölünmüş Ödeme', count: 3, amount: 1225.00, percentage: 2.5 },
  ];

  const openBills = [
    { tableNo: 'M-8', waiter: 'Ahmet Yılmaz', itemCount: 6, amount: 1245.00, duration: '1 saat 25 dk' },
    { tableNo: 'M-15', waiter: 'Ayşe Kaya', itemCount: 4, amount: 890.50, duration: '45 dk' },
    { tableNo: 'M-22', waiter: 'Mehmet Demir', itemCount: 3, amount: 715.00, duration: '32 dk' },
  ];

  const discrepancies = [
    { 
      type: 'warning', 
      message: '3 açık adisyon var. Gün sonu kapanışı için tüm adisyonların kapatılması önerilir.',
      amount: 2850.50
    },
  ];

  const handleCloseDay = () => {
    if (!managerConfirmed) return;
    
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      alert('Gün sonu başarıyla kapatıldı! Mutabakat raporu oluşturuldu.');
    }, 2000);
  };

  const handleExportPDF = () => {
    console.log('Exporting PDF...');
    alert('Mutabakat raporu PDF olarak indiriliyor...');
  };

  const handleExportExcel = () => {
    console.log('Exporting Excel...');
    alert('Mutabakat raporu Excel olarak indiriliyor...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="pt-16 p-4 lg:p-6 pb-24">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Gün Sonu Mutabakat</h1>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">Günlük işlem özeti ve kapanış işlemleri</p>
            </div>
            <div className="flex items-center gap-2 mt-3 lg:mt-0">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                PDF İndir
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel'e Aktar
              </Button>
            </div>
          </div>

          {/* Business Info & Date */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 mb-4 lg:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">İş Yeri</div>
                  <div className="font-bold text-gray-900">{reconciliationData.businessName}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{reconciliationData.branch}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Üye İşyeri No</div>
                  <div className="font-bold text-gray-900">{reconciliationData.merchantId}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">İşlem Tarihi</div>
                  <div className="font-bold text-gray-900">{reconciliationData.date}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Rapor Saati</div>
                  <div className="font-bold text-gray-900">23:45</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4 mb-4 lg:mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-1">Toplam Ciro</div>
              <div className="text-lg lg:text-xl font-bold text-gray-900">
                ₺{reconciliationData.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-1">Kart Tahsilat</div>
              <div className="text-lg lg:text-xl font-bold text-gray-900">
                ₺{reconciliationData.cardPayments.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-1">Nakit Tahsilat</div>
              <div className="text-lg lg:text-xl font-bold text-gray-900">
                ₺{reconciliationData.cashPayments.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Split className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-1">Bölünmüş Ödeme</div>
              <div className="text-lg lg:text-xl font-bold text-gray-900">
                ₺{reconciliationData.splitPayments.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-1">Başarısız İşlem</div>
              <div className="text-lg lg:text-xl font-bold text-gray-900">
                {reconciliationData.failedTransactions}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-1">İade / İptal</div>
              <div className="text-lg lg:text-xl font-bold text-gray-900">
                ₺{reconciliationData.refundsCancellations.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Discrepancies Warning */}
          {discrepancies.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-4 lg:mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-amber-900 mb-2">Uyarı ve Kontrol Noktaları</h3>
                  <div className="space-y-2">
                    {discrepancies.map((disc, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-amber-200">
                        <p className="text-xs text-amber-900">{disc.message}</p>
                        {disc.amount && (
                          <p className="text-sm font-bold text-amber-900 mt-1">
                            Tutar: ₺{disc.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
            {/* Open Bills */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base lg:text-lg font-semibold text-gray-900">Açık Adisyonlar</h2>
                    <p className="text-xs text-gray-600 mt-1">{openBills.length} açık masa</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">Toplam</div>
                    <div className="text-lg font-bold text-amber-600">
                      ₺{reconciliationData.openBillsAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {openBills.map((bill, idx) => (
                  <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">{bill.tableNo}</div>
                      <div className="font-bold text-gray-900">
                        ₺{bill.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{bill.waiter} • {bill.itemCount} ürün</span>
                      <span>{bill.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  Tüm Adisyonları Görüntüle
                </Button>
              </div>
            </div>

            {/* Terminal Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900">Terminal Bazlı Toplam</h2>
                <p className="text-xs text-gray-600 mt-1">{terminalBreakdown.length} terminal aktif</p>
              </div>
              <div className="divide-y divide-gray-200">
                {terminalBreakdown.map((terminal, idx) => (
                  <div key={idx} className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Terminal className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">{terminal.terminalNo}</div>
                        <div className="text-xs text-gray-600">{terminal.deviceName}</div>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">İşlem:</span>
                        <span className="font-semibold text-gray-900">{terminal.transactionCount} adet</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tutar:</span>
                        <span className="font-bold text-gray-900">
                          ₺{terminal.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-gray-600">Başarı Oranı:</span>
                        <span className="font-semibold text-green-600">{terminal.successRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Type Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900">Ödeme Tipi Dağılımı</h2>
                <p className="text-xs text-gray-600 mt-1">{reconciliationData.successfulTransactions} başarılı işlem</p>
              </div>
              <div className="p-4 lg:p-6">
                <div className="space-y-4">
                  {paymentTypeBreakdown.map((payment, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-gray-900">{payment.type}</div>
                        <div className="text-xs text-gray-600">{payment.percentage}%</div>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-[#d4a017] h-2 rounded-full"
                          style={{ width: `${payment.percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{payment.count} işlem</span>
                        <span className="font-bold text-gray-900">
                          ₺{payment.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reconciliation Summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Mutabakat Özeti</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Toplam İşlem Sayısı:</span>
                  <span className="font-semibold text-gray-900">{reconciliationData.totalTransactions}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Başarılı İşlem:</span>
                  <span className="font-semibold text-green-600">{reconciliationData.successfulTransactions}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Başarısız İşlem:</span>
                  <span className="font-semibold text-red-600">{reconciliationData.failedTransactions}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Ortalama Hesap:</span>
                  <span className="font-semibold text-gray-900">
                    ₺{reconciliationData.averageTicket.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Kart Ödemeleri:</span>
                  <span className="font-semibold text-gray-900">
                    ₺{reconciliationData.cardPayments.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Nakit Ödemeleri:</span>
                  <span className="font-semibold text-gray-900">
                    ₺{reconciliationData.cashPayments.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">İade/İptal Tutarı:</span>
                  <span className="font-semibold text-red-600">
                    -₺{reconciliationData.refundsCancellations.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b-2 border-gray-300">
                  <span className="text-sm font-bold text-gray-900">Net Ciro:</span>
                  <span className="text-xl font-bold text-green-600">
                    ₺{reconciliationData.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Manager Confirmation */}
          <div className="bg-white rounded-xl border-2 border-[#d4a017] shadow-sm p-4 lg:p-6 mb-4 lg:mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-[#d4a017]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-[#d4a017]" />
              </div>
              <div>
                <h3 className="text-base lg:text-lg font-bold text-gray-900">Yönetici Onayı</h3>
                <p className="text-xs lg:text-sm text-gray-600 mt-1">
                  Gün sonu kapanışı yapılabilmesi için yönetici onayı gereklidir
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="text-xs text-blue-600 font-medium mb-2">Kontrol Listesi</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-900">Tüm terminal mutabakatları kontrol edildi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-900">Nakit kasası sayımı yapıldı</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-900">İade/iptal işlemleri incelendi</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-gray-900">Açık adisyonlar mevcut (kontrol gerekli)</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="manager-confirm"
                checked={managerConfirmed}
                onCheckedChange={(checked) => setManagerConfirmed(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="manager-confirm" className="text-sm text-gray-900 cursor-pointer">
                Yukarıdaki tüm bilgileri kontrol ettim. Gün sonu raporunun doğruluğunu onaylıyorum ve 
                kapanış işleminin yapılmasına izin veriyorum. Bu işlem kayıt altına alınacaktır.
              </label>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t-2 border-gray-200 shadow-lg p-4 z-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">Net Günlük Ciro</div>
              <div className="text-xl lg:text-2xl font-bold text-green-600">
                ₺{reconciliationData.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="sm:w-auto"
            >
              <Eye className="w-5 h-5 mr-2" />
              Detayları Gör
            </Button>
            <Button
              size="lg"
              onClick={handleCloseDay}
              disabled={!managerConfirmed || isClosing}
              className="sm:w-auto bg-[#d4a017] hover:bg-[#b8860b] text-white disabled:bg-gray-300 disabled:text-gray-500 text-base font-semibold px-8"
            >
              {isClosing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Kapatılıyor...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Gün Sonunu Kapat
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
