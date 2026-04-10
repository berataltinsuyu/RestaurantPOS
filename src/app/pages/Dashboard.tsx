import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { TableCard } from '../components/TableCard';
import { Button } from '../components/ui/button';
import { MoveTableModal } from '../components/MoveTableModal';
import { MergeTablesModal } from '../components/MergeTablesModal';
import { SplitTableModal } from '../components/SplitTableModal';
import { ChangeWaiterModal } from '../components/ChangeWaiterModal';
import { AddReservationLabelModal } from '../components/AddReservationLabelModal';
import { ComplimentaryItemApprovalModal } from '../components/ComplimentaryItemApprovalModal';
import { OpenTableModal } from '../components/OpenTableModal';
import { EmptyState } from '../components/enterprise/EmptyState';
import { LoadingSkeleton } from '../components/enterprise/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { billsApi, reportsApi, tablesApi, usersApi } from '../lib/api';
import { ApiError } from '../lib/http';
import { getErrorMessage } from '../lib/error-utils';
import {
  formatTime,
  localizeText,
  parseTableNumber,
  toUiTableStatus,
} from '../lib/mappers';
import type { BillSummaryDto, DashboardSummaryDto, TableSummaryDto, UserSummaryDto } from '../types/api';
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
  Gift,
} from 'lucide-react';

interface WaiterOption {
  id: string;
  name: string;
  activeTablesCount: number;
}

interface TableOperationItem {
  id: string;
  no: string;
  area: string;
  waiter: string;
  itemCount: number;
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  billId: number;
  areaName: string;
}

export default function Dashboard() {
  const { session } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moveTableOpen, setMoveTableOpen] = useState(false);
  const [mergeTablesOpen, setMergeTablesOpen] = useState(false);
  const [splitTableOpen, setSplitTableOpen] = useState(false);
  const [changeWaiterOpen, setChangeWaiterOpen] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [complimentaryOpen, setComplimentaryOpen] = useState(false);
  const [openTableOpen, setOpenTableOpen] = useState(false);
  const [selectedTableToOpen, setSelectedTableToOpen] = useState<TableSummaryDto | null>(null);
  const [tables, setTables] = useState<TableSummaryDto[]>([]);
  const [bills, setBills] = useState<BillSummaryDto[]>([]);
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [waiters, setWaiters] = useState<UserSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const branchId = session?.branch.id;

  const loadDashboardData = useCallback(async () => {
    if (!branchId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const [tablesResponse, billsResponse, summaryResponse, usersResponse] = await Promise.all([
        tablesApi.getByBranch(branchId),
        billsApi.getAll(),
        reportsApi.dashboardSummary(branchId).catch((error) => {
          if (error instanceof ApiError && error.status === 403) {
            return null;
          }

          throw error;
        }),
        usersApi.getAll().catch((error) => {
          if (error instanceof ApiError && error.status === 403) {
            return [] as UserSummaryDto[];
          }

          throw error;
        }),
      ]);

      setTables(tablesResponse);
      setBills(billsResponse.filter((bill) => bill.branchId === branchId));
      setSummary(summaryResponse);
      setWaiters(usersResponse);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Masa verileri alınamadı.'));
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadDashboardData();
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [loadDashboardData]);

  const billByTableId = useMemo(
    () => new Map<number, BillSummaryDto>(bills.map((bill) => [bill.tableId, bill])),
    [bills],
  );

  const billById = useMemo(
    () => new Map<number, BillSummaryDto>(bills.map((bill) => [bill.id, bill])),
    [bills],
  );

  const tableCards = useMemo(
    () =>
      tables
        .slice()
        .sort((left, right) => parseTableNumber(left.tableNo) - parseTableNumber(right.tableNo))
        .map((table) => {
          const bill = (table.currentBillId ? billById.get(table.currentBillId) : null) ?? billByTableId.get(table.id);
          const reservationDate = table.activeReservation ? new Date(table.activeReservation.reservationAt) : null;
          const minutesToReservation = reservationDate
            ? Math.round((reservationDate.getTime() - Date.now()) / 60000)
            : null;
          const reservationLabel = !table.activeReservation
            ? null
            : minutesToReservation !== null && minutesToReservation <= 0
              ? `Rezervasyon Saati ${formatTime(table.activeReservation.reservationAt)}`
              : minutesToReservation !== null && minutesToReservation <= 30
                ? `Yaklaşan Rezervasyon ${formatTime(table.activeReservation.reservationAt)}`
                : `Rezerve ${formatTime(table.activeReservation.reservationAt)}`;

          return {
            id: String(table.id),
            number: parseTableNumber(table.tableNo),
            status: toUiTableStatus(table.status) as 'Boş' | 'Dolu' | 'Ödeme Bekliyor' | 'Ödendi',
            guests: table.currentGuestCount || bill?.customerCount || 0,
            total: bill?.totalAmount ?? table.currentTotal,
            waiter: localizeText(bill?.waiterName || table.waiterName),
            time: formatTime(bill?.openedAt),
            billNo: bill?.billNo,
            reservationLabel,
            rawTable: table,
          };
        }),
    [billById, billByTableId, tables],
  );

  const fallbackStats = useMemo(() => {
    const activeTables = tables.filter((table) => table.status === 'Dolu').length;
    const activeOrders = tables.filter((table) => table.status === 'Dolu' || table.status === 'OdemeBekliyor').length;
    const pendingPayments = tables.filter((table) => table.status === 'OdemeBekliyor').length;
    const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    return {
      activeTables,
      activeOrders,
      pendingPayments,
      totalRevenue,
    };
  }, [bills, tables]);

  const stats = {
    activeTables: summary?.activeTables ?? fallbackStats.activeTables,
    activeOrders: summary?.activeOrders ?? fallbackStats.activeOrders,
    pendingPayments: summary?.pendingPayments ?? fallbackStats.pendingPayments,
    totalRevenue: summary?.totalRevenue ?? fallbackStats.totalRevenue,
  };

  const availableTables = useMemo(
    () =>
      tables.map((table) => ({
        id: String(table.id),
        no: table.tableNo,
        area: localizeText(table.areaName),
        status: table.status === 'Bos' && !table.activeReservation ? 'available' as const : 'occupied' as const,
      })),
    [tables],
  );

  const actionableTables = useMemo<TableOperationItem[]>(
    () =>
      tables
        .map((table) => {
          const bill = (table.currentBillId ? billById.get(table.currentBillId) : null) ?? billByTableId.get(table.id);
          if (!bill || bill.status === 'Kapandi' || bill.status === 'Iptal') {
            return null;
          }

          return {
            id: String(table.id),
            no: table.tableNo,
            area: localizeText(table.areaName),
            waiter: localizeText(bill.waiterName || table.waiterName) || localizeText(session?.user.fullName),
            itemCount: bill.items.length,
            total: bill.totalAmount,
            items: bill.items.map((item) => ({
              id: String(item.id),
              name: localizeText(item.productNameSnapshot),
              quantity: item.quantity,
              price: item.unitPrice,
              total: item.lineTotal,
            })),
            billId: bill.id,
            areaName: table.areaName,
          };
        })
        .filter((table): table is TableOperationItem => table !== null),
    [billById, billByTableId, session?.user.fullName, tables],
  );

  const splitSourceTables = useMemo(
    () => actionableTables.filter((table) => table.items.length > 0),
    [actionableTables],
  );

  const reservationTargetTables = useMemo(
    () =>
      tables
        .filter((table) => table.status === 'Bos' && !table.activeReservation)
        .map((table) => ({
          id: String(table.id),
          no: table.tableNo,
          area: localizeText(table.areaName),
        })),
    [tables],
  );

  const availableWaiters = useMemo<WaiterOption[]>(() => {
    const waiterMap = new Map<number, WaiterOption>();

    waiters
      .filter((user) => user.roleName === 'Garson')
      .forEach((user) => {
        waiterMap.set(user.id, {
          id: String(user.id),
          name: localizeText(user.fullName),
          activeTablesCount: tables.filter((table) => table.waiterId === user.id && table.status !== 'Bos').length,
        });
      });

    tables.forEach((table) => {
      if (!table.waiterId || !table.waiterName || waiterMap.has(table.waiterId)) {
        return;
      }

      waiterMap.set(table.waiterId, {
        id: String(table.waiterId),
        name: localizeText(table.waiterName),
        activeTablesCount: tables.filter((candidate) => candidate.waiterId === table.waiterId && candidate.status !== 'Bos').length,
      });
    });

    if (session?.user.roleName === 'Garson' && !waiterMap.has(session.user.id)) {
      waiterMap.set(session.user.id, {
        id: String(session.user.id),
        name: localizeText(session.user.fullName),
        activeTablesCount: tables.filter((table) => table.waiterId === session.user.id && table.status !== 'Bos').length,
      });
    }

    return Array.from(waiterMap.values());
  }, [session?.user.fullName, session?.user.id, session?.user.roleName, tables, waiters]);

  const handleOperationError = (error: unknown, fallbackMessage: string) => {
    toast.error(getErrorMessage(error, fallbackMessage));
  };

  const handleOpenTable = async (data: { tableNo: string; waiterId: string; guestCount: number; notes?: string }) => {
    if (!selectedTableToOpen) {
      return;
    }

    try {
      await tablesApi.open(selectedTableToOpen.id, {
        waiterId: Number(data.waiterId),
        guestCount: data.guestCount,
        note: data.notes,
      });
      toast.success(`${selectedTableToOpen.tableNo} başarıyla açıldı.`);
      await loadDashboardData();
    } catch (error) {
      handleOperationError(error, 'Masa açılamadı.');
    }
  };

  const handleMoveTable = async (sourceTableId: string, targetTableId: string) => {
    const sourceTable = tables.find((table) => String(table.id) === sourceTableId);
    const targetTable = tables.find((table) => String(table.id) === targetTableId);

    if (!sourceTable || !targetTable) {
      return;
    }

    try {
      await tablesApi.move(sourceTable.id, targetTable.id);
      toast.success(`${sourceTable.tableNo} ${targetTable.tableNo} masasına taşındı.`);
      await loadDashboardData();
    } catch (error) {
      handleOperationError(error, 'Masa taşıma işlemi tamamlanamadı.');
    }
  };

  const handleMergeTables = async (sourceTableId: string, selectedTables: string[], newTableName: string) => {
    const sourceTable = tables.find((table) => String(table.id) === sourceTableId);
    if (!sourceTable) {
      return;
    }

    const targetTableIds = tables
      .filter((table) => selectedTables.includes(String(table.id)))
      .map((table) => table.id);

    try {
      await tablesApi.merge(sourceTable.id, targetTableIds, newTableName);
      toast.success('Masalar başarıyla birleştirildi.');
      await loadDashboardData();
    } catch (error) {
      handleOperationError(error, 'Masa birleştirme işlemi tamamlanamadı.');
      throw error;
    }
  };

  const handleSplitTable = async (sourceTableId: string, selectedItems: string[], newTableNo: string) => {
    const sourceTable = tables.find((table) => String(table.id) === sourceTableId);
    if (!sourceTable) {
      return;
    }

    try {
      await tablesApi.split(sourceTable.id, {
        newTableNo,
        billItemIds: selectedItems.map((itemId) => Number(itemId)),
        areaName: sourceTable.areaName,
      });
      toast.success(`${newTableNo} için yeni masa oluşturuldu.`);
      await loadDashboardData();
    } catch (error) {
      handleOperationError(error, 'Masa ayırma işlemi tamamlanamadı.');
    }
  };

  const handleChangeWaiter = async (sourceTableId: string, newWaiterId: string, reason: string) => {
    const sourceTable = tables.find((table) => String(table.id) === sourceTableId);
    if (!sourceTable) {
      return;
    }

    try {
      await tablesApi.assignWaiter(sourceTable.id, Number(newWaiterId), reason);
      toast.success('Garson ataması güncellendi.');
      await loadDashboardData();
    } catch (error) {
      handleOperationError(error, 'Garson değiştirilemedi.');
    }
  };

  const handleAddReservation = async (tableId: string, reservationData: {
    customerName: string;
    phoneNumber: string;
    guestCount: number;
    reservationTime: string;
    notes: string;
  }) => {
    const reservationTable = tables.find((table) => String(table.id) === tableId);
    if (!reservationTable) {
      return;
    }

    const today = new Date();
    const [hours, minutes] = reservationData.reservationTime.split(':').map(Number);
    today.setHours(hours, minutes, 0, 0);

    try {
      await tablesApi.addReservation(reservationTable.id, {
        customerName: reservationData.customerName,
        phoneNumber: reservationData.phoneNumber,
        guestCount: reservationData.guestCount,
        reservationAt: today.toISOString(),
        notes: reservationData.notes,
      });
      toast.success(`${reservationTable.tableNo} için rezervasyon kaydedildi.`);
      await loadDashboardData();
    } catch (error) {
      handleOperationError(error, 'Rezervasyon eklenemedi.');
    }
  };

  const handleComplimentaryApproval = async (sourceTableId: string, approvalData: {
    approvedItems: string[];
    reason: string;
    approverName: string;
    requiresManagerApproval: boolean;
  }) => {
    const sourceTable = actionableTables.find((table) => table.id === sourceTableId);
    if (!sourceTable) {
      return;
    }

    try {
      await billsApi.approveComplimentary(sourceTable.billId, {
        billItemIds: approvalData.approvedItems.map((itemId) => Number(itemId)),
        reason: approvalData.reason,
        approverName: approvalData.approverName,
      });
      toast.success(
        approvalData.requiresManagerApproval
          ? 'İkram talebi gönderildi.'
          : 'İkram onayı işlendi.',
      );
      await loadDashboardData();
    } catch (error) {
      handleOperationError(error, 'İkram onayı gönderilemedi.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
          {errorMessage && !isLoading ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 mb-6">
              {errorMessage}
            </div>
          ) : null}

          {/* Stats Cards */}
          {isLoading ? (
            <LoadingSkeleton type="card" count={4} />
          ) : (
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
                <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{Math.round(stats.totalRevenue)} ₺</div>
                <div className="text-xs lg:text-sm text-gray-600">Toplam Ciro</div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Hızlı Masa İşlemleri</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Button
                variant="outline"
                onClick={() => setMoveTableOpen(true)}
                className="flex-col h-auto py-4 gap-2"
                disabled={actionableTables.length === 0}
              >
                <ArrowRight className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-medium">Masa Taşı</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setMergeTablesOpen(true)}
                className="flex-col h-auto py-4 gap-2"
                disabled={actionableTables.length === 0}
              >
                <Combine className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-medium">Masa Birleştir</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setSplitTableOpen(true)}
                className="flex-col h-auto py-4 gap-2"
                disabled={splitSourceTables.length === 0}
              >
                <SplitIcon className="w-5 h-5 text-green-600" />
                <span className="text-xs font-medium">Masa Ayır</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setChangeWaiterOpen(true)}
                className="flex-col h-auto py-4 gap-2"
                disabled={actionableTables.length === 0 || availableWaiters.length === 0}
              >
                <UserCheck className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-medium">Garson Değiştir</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setReservationOpen(true)}
                className="flex-col h-auto py-4 gap-2"
                disabled={reservationTargetTables.length === 0}
              >
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-medium">Rezervasyon</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setComplimentaryOpen(true)}
                className="flex-col h-auto py-4 gap-2"
                disabled={splitSourceTables.length === 0}
              >
                <Gift className="w-5 h-5 text-red-600" />
                <span className="text-xs font-medium">İkram Onayı</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setOpenTableOpen(true)}
                className="flex-col h-auto py-4 gap-2"
                disabled={!tables.some((table) => table.status === 'Bos')}
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
              {isLoading ? (
                <LoadingSkeleton type="card" count={6} />
              ) : tableCards.length === 0 ? (
                <EmptyState
                  type="no-tables"
                  title="Gösterilecek masa bulunamadı"
                  description="Seçili şube için henüz masa tanımı yapılmamış."
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                  {tableCards.map((table) => (
                    <TableCard
                      key={table.id}
                      id={table.id}
                      number={table.number}
                      status={table.status}
                      guests={table.guests}
                      total={table.total}
                      time={table.time}
                      reservationLabel={table.reservationLabel}
                      isMerged={table.rawTable.isMerged}
                      onOpenTable={() => {
                        setSelectedTableToOpen(table.rawTable);
                        setOpenTableOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MoveTableModal
        isOpen={moveTableOpen}
        onClose={() => setMoveTableOpen(false)}
        sourceTables={actionableTables}
        availableTables={availableTables}
        onConfirm={handleMoveTable}
      />

      <MergeTablesModal
        isOpen={mergeTablesOpen}
        onClose={() => setMergeTablesOpen(false)}
        sourceTables={actionableTables}
        availableTables={actionableTables}
        onConfirm={handleMergeTables}
      />

      <SplitTableModal
        isOpen={splitTableOpen}
        onClose={() => setSplitTableOpen(false)}
        sourceTables={splitSourceTables}
        onConfirm={handleSplitTable}
      />

      <ChangeWaiterModal
        isOpen={changeWaiterOpen}
        onClose={() => setChangeWaiterOpen(false)}
        sourceTables={actionableTables.map((table) => ({
          id: table.id,
          no: table.no,
          currentWaiter: table.waiter,
          itemCount: table.itemCount,
          total: table.total,
        }))}
        availableWaiters={availableWaiters}
        onConfirm={handleChangeWaiter}
      />

      <AddReservationLabelModal
        isOpen={reservationOpen}
        onClose={() => setReservationOpen(false)}
        tables={reservationTargetTables}
        onConfirm={handleAddReservation}
      />

      <ComplimentaryItemApprovalModal
        isOpen={complimentaryOpen}
        onClose={() => setComplimentaryOpen(false)}
        tables={splitSourceTables.map((table) => ({
          id: table.id,
          no: table.no,
          waiter: table.waiter,
          items: table.items,
        }))}
        onConfirm={handleComplimentaryApproval}
      />

      <OpenTableModal
        isOpen={openTableOpen}
        onClose={() => {
          setOpenTableOpen(false);
          setSelectedTableToOpen(null);
        }}
        table={{
          no: selectedTableToOpen?.tableNo ?? reservationTargetTables[0]?.no ?? 'M-1',
          area: localizeText(selectedTableToOpen?.areaName) || reservationTargetTables[0]?.area || 'İç Salon',
        }}
        availableWaiters={availableWaiters}
        onConfirm={handleOpenTable}
      />
    </div>
  );
}
