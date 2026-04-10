import { useState } from 'react';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import { MoveTableModal } from '../components/MoveTableModal';
import { MergeTablesModal } from '../components/MergeTablesModal';
import { SplitTableModal } from '../components/SplitTableModal';
import { ChangeWaiterModal } from '../components/ChangeWaiterModal';
import { AddReservationLabelModal } from '../components/AddReservationLabelModal';
import { ComplimentaryItemApprovalModal } from '../components/ComplimentaryItemApprovalModal';
import { 
  ArrowRight, 
  Combine, 
  Split, 
  UserCheck, 
  Calendar, 
  Gift 
} from 'lucide-react';

export default function TableOperations() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moveTableOpen, setMoveTableOpen] = useState(false);
  const [mergeTablesOpen, setMergeTablesOpen] = useState(false);
  const [splitTableOpen, setSplitTableOpen] = useState(false);
  const [changeWaiterOpen, setChangeWaiterOpen] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [complimentaryOpen, setComplimentaryOpen] = useState(false);

  // Mock data
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
          {/* Header */}
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Masa İşlemleri</h1>
            <p className="text-xs lg:text-sm text-gray-600 mt-1">Gelişmiş masa operasyon modüllerini test edin</p>
          </div>

          {/* Demo Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Sayfa</h3>
            <p className="text-xs text-blue-800">
              Bu sayfa masa işlem modallerini test etmek için oluşturulmuştur. 
              Her buton ilgili modal penceresini açar. Gerçek uygulamada bu işlemler 
              Dashboard ve Adisyon Detayı sayfalarından erişilebilir olacaktır.
            </p>
          </div>

          {/* Operations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Move Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <ArrowRight className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Masa Taşı</h3>
              <p className="text-sm text-gray-600 mb-4">
                Açık adisyonu başka bir masaya taşıyın
              </p>
              <Button
                onClick={() => setMoveTableOpen(true)}
                className="w-full bg-[#d4a017] hover:bg-[#b8860b] text-white"
              >
                Modalı Aç
              </Button>
            </div>

            {/* Merge Tables */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Combine className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Masa Birleştir</h3>
              <p className="text-sm text-gray-600 mb-4">
                Birden fazla masayı tek adisyon altında birleştirin
              </p>
              <Button
                onClick={() => setMergeTablesOpen(true)}
                className="w-full bg-[#d4a017] hover:bg-[#b8860b] text-white"
              >
                Modalı Aç
              </Button>
            </div>

            {/* Split Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Split className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Masa Ayır</h3>
              <p className="text-sm text-gray-600 mb-4">
                Birleşik masayı ayırın veya ürünleri farklı masalara bölün
              </p>
              <Button
                onClick={() => setSplitTableOpen(true)}
                className="w-full bg-[#d4a017] hover:bg-[#b8860b] text-white"
              >
                Modalı Aç
              </Button>
            </div>

            {/* Change Waiter */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Garson Değiştir</h3>
              <p className="text-sm text-gray-600 mb-4">
                Masa sorumluluğunu farklı bir garsona atayın
              </p>
              <Button
                onClick={() => setChangeWaiterOpen(true)}
                className="w-full bg-[#d4a017] hover:bg-[#b8860b] text-white"
              >
                Modalı Aç
              </Button>
            </div>

            {/* Reservation Label */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Rezervasyon Etiketi</h3>
              <p className="text-sm text-gray-600 mb-4">
                Masaya rezervasyon etiketi ekleyin
              </p>
              <Button
                onClick={() => setReservationOpen(true)}
                className="w-full bg-[#d4a017] hover:bg-[#b8860b] text-white"
              >
                Modalı Aç
              </Button>
            </div>

            {/* Complimentary Item */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">İkram Ürün Onayı</h3>
              <p className="text-sm text-gray-600 mb-4">
                Müşteriye ikram edilecek ürünleri onaylayın
              </p>
              <Button
                onClick={() => setComplimentaryOpen(true)}
                className="w-full bg-[#d4a017] hover:bg-[#b8860b] text-white"
              >
                Modalı Aç
              </Button>
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
    </div>
  );
}
