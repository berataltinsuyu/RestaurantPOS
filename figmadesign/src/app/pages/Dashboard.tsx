import { useState } from 'react';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { TableCard } from '../components/TableCard';
import { mockTables } from '../data/mockData';
import { Button } from '../components/ui/button';
import { MoveTableModal } from '../components/MoveTableModal';
import { MergeTablesModal } from '../components/MergeTablesModal';
import { SplitTableModal } from '../components/SplitTableModal';
import { ChangeWaiterModal } from '../components/ChangeWaiterModal';
import { AddReservationLabelModal } from '../components/AddReservationLabelModal';
import { ComplimentaryItemApprovalModal } from '../components/ComplimentaryItemApprovalModal';
import { OpenTableModal } from '../components/OpenTableModal';
import { 
  Users, 
  ShoppingBag, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Combine,
  Split as SplitIcon,
  UserCheck,
  Calendar,
  Gift
} from 'lucide-react';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moveTableOpen, setMoveTableOpen] = useState(false);
  const [mergeTablesOpen, setMergeTablesOpen] = useState(false);
  const [splitTableOpen, setSplitTableOpen] = useState(false);
  const [changeWaiterOpen, setChangeWaiterOpen] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [complimentaryOpen, setComplimentaryOpen] = useState(false);
  const [openTableOpen, setOpenTableOpen] = useState(false);
  const [selectedTableToOpen, setSelectedTableToOpen] = useState<{ no: string; area: string } | null>(null);
  
  const stats = {
    activeTables: mockTables.filter(t => t.status === 'Dolu').length,
    activeOrders: mockTables.filter(t => t.status === 'Dolu' || t.status === 'Ödeme Bekliyor').length,
    pendingPayments: mockTables.filter(t => t.status === 'Ödeme Bekliyor').length,
    totalRevenue: mockTables.reduce((sum, t) => sum + t.total, 0),
  };

  // Mock data for modals
  const currentTable = {
    no: 'M-12',
    waiter: 'Ahmet Yılmaz',
    itemCount: 8,
    total: 1245.50,
  };

  const availableTables = [
    { no: 'M-1', area: 'İç Salon', status: 'available' as const },
    { no: 'M-5', area: 'İç Salon', status: 'available' as const },
    { no: 'M-8', area: 'Teras', status: 'occupied' as const },
    { no: 'M-15', area: 'Teras', status: 'available' as const },
  ];

  const availableTablesForMerge = [
    { no: 'M-13', area: 'İç Salon', waiter: 'Mehmet Demir', itemCount: 4, total: 680.00 },
    { no: 'M-14', area: 'İç Salon', waiter: 'Ayşe Kaya', itemCount: 6, total: 925.00 },
    { no: 'M-16', area: 'Teras', waiter: 'Ahmet Yılmaz', itemCount: 3, total: 420.00 },
  ];

  const tableItems = [
    { id: '1', name: 'Izgara Köfte', quantity: 2, price: 145.00, total: 290.00 },
    { id: '2', name: 'Karışık Salata', quantity: 1, price: 65.00, total: 65.00 },
    { id: '3', name: 'Mercimek Çorbası', quantity: 2, price: 45.00, total: 90.00 },
    { id: '4', name: 'Adana Kebap', quantity: 1, price: 165.00, total: 165.00 },
    { id: '5', name: 'İçecek (Ayran)', quantity: 3, price: 25.00, total: 75.00 },
    { id: '6', name: 'Kuzu Şiş', quantity: 1, price: 185.00, total: 185.00 },
    { id: '7', name: 'Patlıcan Kızartma', quantity: 1, price: 85.00, total: 85.00 },
    { id: '8', name: 'Baklava', quantity: 2, price: 95.00, total: 190.00 },
  ];

  const availableWaiters = [
    { id: '1', name: 'Mehmet Demir', activeTablesCount: 4 },
    { id: '2', name: 'Ayşe Kaya', activeTablesCount: 3 },
    { id: '3', name: 'Fatma Öztürk', activeTablesCount: 5 },
    { id: '4', name: 'Ali Çelik', activeTablesCount: 2 },
  ];

  const tableForReservation = {
    no: 'M-8',
    area: 'Teras Bölümü',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="pt-16 p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500">Canlı</span>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{stats.activeTables}</div>
              <div className="text-xs lg:text-sm text-gray-600">Açık Masa</div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                </div>
                <span className="text-xs text-gray-500">Aktif</span>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{stats.activeOrders}</div>
              <div className="text-xs lg:text-sm text-gray-600">Aktif Sipariş</div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600" />
                </div>
                <span className="text-xs text-gray-500">Bekliyor</span>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{stats.pendingPayments}</div>
              <div className="text-xs lg:text-sm text-gray-600">Bekleyen Ödeme</div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                </div>
                <span className="text-xs text-gray-500">Bugün</span>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                {stats.totalRevenue.toFixed(0)} ₺
              </div>
              <div className="text-xs lg:text-sm text-gray-600">Toplam Ciro</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Hızlı Masa İşlemleri</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Button
                variant="outline"
                onClick={() => setMoveTableOpen(true)}
                className="flex-col h-auto py-4 gap-2"
              >
                <ArrowRight className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-medium">Masa Taşı</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setMergeTablesOpen(true)}
                className="flex-col h-auto py-4 gap-2"
              >
                <Combine className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-medium">Masa Birleştir</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setSplitTableOpen(true)}
                className="flex-col h-auto py-4 gap-2"
              >
                <SplitIcon className="w-5 h-5 text-green-600" />
                <span className="text-xs font-medium">Masa Ayır</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setChangeWaiterOpen(true)}
                className="flex-col h-auto py-4 gap-2"
              >
                <UserCheck className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-medium">Garson Değiştir</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setReservationOpen(true)}
                className="flex-col h-auto py-4 gap-2"
              >
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-medium">Rezervasyon</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setComplimentaryOpen(true)}
                className="flex-col h-auto py-4 gap-2"
              >
                <Gift className="w-5 h-5 text-red-600" />
                <span className="text-xs font-medium">İkram Onayı</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setOpenTableOpen(true)}
                className="flex-col h-auto py-4 gap-2"
              >
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-medium">Masa Aç</span>
              </Button>
            </div>
          </div>

          {/* Tables Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-0">
                <div>
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Masa Planı</h2>
                  <p className="text-xs lg:text-sm text-gray-500 mt-1">Mevcut masa durumları</p>
                </div>
                <div className="flex items-center gap-3 lg:gap-4 overflow-x-auto pb-2 lg:pb-0">
                  <div className="flex items-center gap-2 text-xs lg:text-sm whitespace-nowrap">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="text-gray-600">Boş</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs lg:text-sm whitespace-nowrap">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">Dolu</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs lg:text-sm whitespace-nowrap">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-gray-600">Ödeme Bekliyor</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs lg:text-sm whitespace-nowrap">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Ödendi</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 lg:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                {mockTables.map((table) => (
                  <TableCard 
                    key={table.id} 
                    {...table} 
                    onOpenTable={() => {
                      setSelectedTableToOpen({
                        no: `M-${table.number}`,
                        area: 'İç Salon'
                      });
                      setOpenTableOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MoveTableModal
        isOpen={moveTableOpen}
        onClose={() => setMoveTableOpen(false)}
        currentTable={currentTable}
        availableTables={availableTables}
        onConfirm={(targetTable) => {
          console.log('Move to table:', targetTable);
          alert(`Masa ${currentTable.no} başarıyla ${targetTable} numaralı masaya taşındı!`);
        }}
      />

      <MergeTablesModal
        isOpen={mergeTablesOpen}
        onClose={() => setMergeTablesOpen(false)}
        currentTable={currentTable}
        availableTables={availableTablesForMerge}
        onConfirm={(selectedTables, newTableName) => {
          console.log('Merge tables:', selectedTables, newTableName);
          alert(`${selectedTables.length + 1} masa "${newTableName}" adıyla birleştirildi!`);
        }}
      />

      <SplitTableModal
        isOpen={splitTableOpen}
        onClose={() => setSplitTableOpen(false)}
        currentTable={{ ...currentTable, items: tableItems }}
        onConfirm={(selectedItems, newTableNo) => {
          console.log('Split items to new table:', selectedItems, newTableNo);
          alert(`${selectedItems.length} ürün ${newTableNo} numaralı masaya taşındı!`);
        }}
      />

      <ChangeWaiterModal
        isOpen={changeWaiterOpen}
        onClose={() => setChangeWaiterOpen(false)}
        currentTable={{
          no: currentTable.no,
          currentWaiter: currentTable.waiter,
          itemCount: currentTable.itemCount,
          total: currentTable.total,
        }}
        availableWaiters={availableWaiters}
        onConfirm={(newWaiterId, reason) => {
          const waiter = availableWaiters.find(w => w.id === newWaiterId);
          console.log('Change waiter:', newWaiterId, reason);
          alert(`Garson ${waiter?.name} olarak değiştirildi. Neden: ${reason}`);
        }}
      />

      <AddReservationLabelModal
        isOpen={reservationOpen}
        onClose={() => setReservationOpen(false)}
        table={tableForReservation}
        onConfirm={(reservationData) => {
          console.log('Add reservation:', reservationData);
          alert(`${tableForReservation.no} masası ${reservationData.customerName} adına saat ${reservationData.reservationTime} için rezerve edildi!`);
        }}
      />

      <ComplimentaryItemApprovalModal
        isOpen={complimentaryOpen}
        onClose={() => setComplimentaryOpen(false)}
        table={currentTable}
        items={tableItems}
        onConfirm={(approvalData) => {
          console.log('Approve complimentary items:', approvalData);
          alert(`${approvalData.approvedItems.length} ürün ikram olarak onaylandı. ${approvalData.requiresManagerApproval ? 'Yönetici onayı bekleniyor.' : ''}`);
        }}
      />

      <OpenTableModal
        isOpen={openTableOpen}
        onClose={() => {
          setOpenTableOpen(false);
          setSelectedTableToOpen(null);
        }}
        table={selectedTableToOpen || { no: 'M-1', area: 'İç Salon' }}
        availableWaiters={availableWaiters}
        onConfirm={(data) => {
          console.log('Open table:', data);
          alert(`Masa ${data.tableNo} başarıyla açıldı! Garson: ${availableWaiters.find(w => w.id === data.waiterId)?.name}, Misafir: ${data.guestCount} kişi`);
          setOpenTableOpen(false);
          setSelectedTableToOpen(null);
        }}
      />
    </div>
  );
}