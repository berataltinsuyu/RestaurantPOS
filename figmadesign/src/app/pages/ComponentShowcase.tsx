import { useState } from 'react';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import {
  TerminalStatusWidget,
  WarningBanner,
  EmptyState,
  ReceiptPreviewPanel,
  AuditTimeline,
  PermissionMatrix,
  SplitPaymentRow,
  SuccessToast,
  ErrorToast,
  LoadingSkeleton,
  OfflineStatusChip,
  TransactionProgressIndicator
} from '../components/enterprise';
import { Button } from '../components/ui/button';

export default function ComponentShowcase() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  // Permission Matrix Demo Data
  const demoRoles = [
    { id: 'waiter', label: 'Garson', color: '#3b82f6' },
    { id: 'cashier', label: 'Kasiyer', color: '#8b5cf6' },
    { id: 'manager', label: 'Müdür', color: '#d4a017' }
  ];

  const demoPermissions = [
    { id: 'view', label: 'Görüntüle' },
    { id: 'edit', label: 'Düzenle' },
    { id: 'refund', label: 'İade', critical: true }
  ];

  const demoMatrix = {
    waiter: { view: true, edit: true, refund: false },
    cashier: { view: true, edit: true, refund: true },
    manager: { view: true, edit: true, refund: true }
  };

  // Timeline Demo Data
  const demoTimeline = [
    { label: 'Adisyon Oluşturuldu', timestamp: '14:30:15', status: 'completed' as const, detail: 'Masa 12' },
    { label: 'Ödeme Talebi Alındı', timestamp: '14:45:20', status: 'completed' as const },
    { label: 'POS\'a Gönderildi', timestamp: '14:45:22', status: 'completed' as const },
    { label: 'Banka Onayı Bekleniyor', timestamp: '14:45:25', status: 'pending' as const }
  ];

  // Receipt Demo Data
  const demoReceipt = {
    receiptNo: 'A-0012',
    tableNo: 'Masa 12',
    waiter: 'Ahmet Yılmaz',
    date: '07.04.2026',
    time: '14:45',
    items: [
      { name: 'Izgara Köfte', quantity: 2, price: 145.00, total: 290.00 },
      { name: 'Karışık Salata', quantity: 1, price: 65.00, total: 65.00 },
      { name: 'Ayran', quantity: 3, price: 25.00, total: 75.00 }
    ],
    subtotal: 430.00,
    serviceCharge: 43.00,
    total: 473.00
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="pt-16 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Enterprise UI Bileşenleri</h1>
              <p className="text-base text-gray-600 mt-2">
                VakıfBank POS sistemi için yeniden kullanılabilir kurumsal bileşenler
              </p>
            </div>

            <div className="space-y-12">
              {/* Terminal Status Widget */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Terminal Status Widget</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <TerminalStatusWidget
                    terminalId="VKB-TRM-01"
                    terminalName="Ana Kasa POS 1"
                    status="online"
                    transactionsToday={47}
                  />
                  <TerminalStatusWidget
                    terminalId="VKB-TRM-02"
                    terminalName="Garson POS 1"
                    status="busy"
                  />
                  <TerminalStatusWidget
                    terminalId="VKB-TRM-03"
                    terminalName="Ana Kasa POS 2"
                    status="offline"
                    lastSeen="10 dakika önce"
                  />
                  <TerminalStatusWidget
                    terminalId="VKB-TRM-04"
                    terminalName="Mobil POS 1"
                    status="error"
                  />
                </div>
              </section>

              {/* Warning Banners */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Warning Banners</h2>
                <div className="space-y-4">
                  <WarningBanner
                    type="warning"
                    title="Dikkat Gerekli"
                    message="Gün sonu mutabakat işlemi henüz yapılmadı. Lütfen vardiya sonunda mutabakat işlemini tamamlayın."
                    action={{ label: 'Mutabakta Git', onClick: () => alert('Mutabakat açılıyor') }}
                  />
                  <WarningBanner
                    type="info"
                    title="Sistem Güncellemesi"
                    message="Yeni özellikler ve iyileştirmeler içeren sistem güncellemesi mevcuttur."
                    dismissible
                    onDismiss={() => console.log('Dismissed')}
                  />
                  <WarningBanner
                    type="error"
                    title="Bağlantı Hatası"
                    message="Terminal VKB-TRM-03 ile bağlantı kurulamıyor. Lütfen ağ bağlantısını kontrol edin."
                    action={{ label: 'Yeniden Dene', onClick: () => alert('Yeniden deneniyor') }}
                  />
                </div>
              </section>

              {/* Empty States */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Empty States</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200">
                    <EmptyState
                      type="no-transactions"
                      title="Henüz İşlem Yok"
                      description="Bu tarih aralığında herhangi bir işlem kaydı bulunmuyor."
                      action={{ label: 'Yeni İşlem Başlat', onClick: () => {} }}
                    />
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200">
                    <EmptyState
                      type="no-results"
                      title="Sonuç Bulunamadı"
                      description="Arama kriterlerinize uygun sonuç bulunamadı. Farklı kriterler deneyin."
                    />
                  </div>
                </div>
              </section>

              {/* Receipt Preview */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Receipt Preview Panel</h2>
                <div className="max-w-md">
                  <ReceiptPreviewPanel
                    {...demoReceipt}
                    onPrint={() => alert('Yazdırılıyor')}
                    onDownload={() => alert('İndiriliyor')}
                  />
                </div>
              </section>

              {/* Audit Timeline */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Audit Timeline</h2>
                <div className="max-w-2xl">
                  <AuditTimeline steps={demoTimeline} />
                </div>
              </section>

              {/* Permission Matrix */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Permission Matrix</h2>
                <PermissionMatrix
                  roles={demoRoles}
                  permissions={demoPermissions}
                  matrix={demoMatrix}
                  readonly
                />
              </section>

              {/* Split Payment Row */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Split Payment Row</h2>
                <div className="space-y-4 max-w-2xl">
                  <SplitPaymentRow
                    index={1}
                    amount={250.00}
                    method="Kart"
                    status="Bekliyor"
                  />
                  <SplitPaymentRow
                    index={2}
                    amount={223.00}
                    method="Nakit"
                    status="Tamamlandı"
                    referenceNo="REF-123456789"
                    readonly
                  />
                </div>
              </section>

              {/* Offline Status Chip */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Offline Status Chip</h2>
                <div className="flex flex-wrap gap-4 items-center">
                  <OfflineStatusChip status="online" size="sm" />
                  <OfflineStatusChip status="online" size="md" />
                  <OfflineStatusChip status="online" size="lg" />
                  <OfflineStatusChip status="offline" size="sm" />
                  <OfflineStatusChip status="offline" size="md" />
                  <OfflineStatusChip status="offline" size="lg" />
                  <OfflineStatusChip status="online" showLabel={false} />
                  <OfflineStatusChip status="offline" showLabel={false} />
                </div>
              </section>

              {/* Transaction Progress Indicator */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction Progress Indicator</h2>
                <div className="max-w-2xl">
                  <TransactionProgressIndicator
                    currentStep={2}
                    totalSteps={4}
                    status="processing"
                    steps={[
                      'Adisyon oluşturuldu',
                      'Ödeme talebi alındı',
                      'Banka onayı bekleniyor',
                      'İşlem tamamlandı'
                    ]}
                  />
                </div>
              </section>

              {/* Loading Skeleton */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Loading Skeleton</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Card Type</h3>
                    <LoadingSkeleton type="card" count={2} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">List Type</h3>
                    <LoadingSkeleton type="list" count={3} />
                  </div>
                </div>
              </section>

              {/* Toasts */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Toast Notifications</h2>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setShowSuccessToast(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Show Success Toast
                  </Button>
                  <Button
                    onClick={() => setShowErrorToast(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Show Error Toast
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Examples */}
      {showSuccessToast && (
        <SuccessToast
          message="İşlem Başarılı"
          description="Ödeme işlemi başarıyla tamamlandı."
          onClose={() => setShowSuccessToast(false)}
        />
      )}
      {showErrorToast && (
        <ErrorToast
          message="İşlem Başarısız"
          description="Ödeme işlemi sırasında bir hata oluştu."
          actionLabel="Tekrar Dene"
          onAction={() => alert('Tekrar deneniyor')}
          onClose={() => setShowErrorToast(false)}
        />
      )}
    </div>
  );
}
