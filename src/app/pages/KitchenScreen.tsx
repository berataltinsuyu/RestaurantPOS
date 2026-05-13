import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/enterprise/EmptyState';
import { LoadingSkeleton } from '../components/enterprise/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { billsApi } from '../lib/api';
import { getErrorMessage } from '../lib/error-utils';
import { formatTime, localizeText, toUiBillItemStatus } from '../lib/mappers';
import type { BillItemDto, BillSummaryDto } from '../types/api';
import { ChefHat, Clock, RefreshCw, Utensils } from 'lucide-react';

type KitchenStatus = Extract<
  BillItemDto['status'],
  'SiparisAlindi' | 'Hazirlaniyor' | 'Hazir' | 'TeslimEdildi'
>;

interface KitchenItem {
  bill: BillSummaryDto;
  item: BillItemDto;
  kitchenStatus: KitchenStatus;
}

const statusFlow: Array<{ value: KitchenStatus; label: string }> = [
  { value: 'SiparisAlindi', label: 'Sipariş Alındı' },
  { value: 'Hazirlaniyor', label: 'Hazırlanıyor' },
  { value: 'Hazir', label: 'Hazır' },
  { value: 'TeslimEdildi', label: 'Teslim Edildi' },
];

const statusClasses: Record<KitchenStatus, string> = {
  Hazir: 'bg-green-100 text-green-700 border-green-200',
  Hazirlaniyor: 'bg-blue-100 text-blue-700 border-blue-200',
  SiparisAlindi: 'bg-amber-100 text-amber-700 border-amber-200',
  TeslimEdildi: 'bg-gray-100 text-gray-600 border-gray-200',
};

const normalizeKitchenStatus = (status: BillItemDto['status']): KitchenStatus | null => {
  if (status === 'ServisEdildi') {
    return 'TeslimEdildi';
  }

  if (status === 'SiparisAlindi' || status === 'Hazirlaniyor' || status === 'Hazir' || status === 'TeslimEdildi') {
    return status;
  }

  return null;
};

export default function KitchenScreen() {
  const { session } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bills, setBills] = useState<BillSummaryDto[]>([]);
  const [activeFilter, setActiveFilter] = useState<KitchenStatus | 'all'>('all');
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const branchId = session?.branch.id;

  const loadKitchenItems = useCallback(async () => {
    if (!branchId) {
      setBills([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await billsApi.getAll();
      setBills(
        response.filter(
          (bill) =>
            bill.branchId === branchId &&
            bill.status !== 'Kapandi' &&
            bill.status !== 'Iptal',
        ),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Mutfak siparişleri alınamadı.'));
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    loadKitchenItems();
  }, [loadKitchenItems]);

  const kitchenItems = useMemo<KitchenItem[]>(() => {
    return bills.flatMap((bill) =>
      bill.items
        .map((item) => {
          const kitchenStatus = normalizeKitchenStatus(item.status);
          return kitchenStatus ? { bill, item, kitchenStatus } : null;
        })
        .filter((entry): entry is KitchenItem => entry !== null),
    );
  }, [bills]);

  const filteredItems = useMemo(
    () =>
      activeFilter === 'all'
        ? kitchenItems
        : kitchenItems.filter((entry) => entry.kitchenStatus === activeFilter),
    [activeFilter, kitchenItems],
  );

  const groupedItems = useMemo(() => {
    const groups = new Map<number, KitchenItem[]>();
    filteredItems.forEach((entry) => {
      groups.set(entry.bill.id, [...(groups.get(entry.bill.id) ?? []), entry]);
    });
    return Array.from(groups.values()).sort(
      (left, right) =>
        new Date(left[0].bill.openedAt).getTime() -
        new Date(right[0].bill.openedAt).getTime(),
    );
  }, [filteredItems]);

  const countsByStatus = useMemo(() => {
    return statusFlow.reduce<Record<KitchenStatus, number>>(
      (counts, status) => ({
        ...counts,
        [status.value]: kitchenItems.filter((entry) => entry.kitchenStatus === status.value).length,
      }),
      {
        Hazir: 0,
        Hazirlaniyor: 0,
        SiparisAlindi: 0,
        TeslimEdildi: 0,
      },
    );
  }, [kitchenItems]);

  const handleUpdateStatus = async (item: BillItemDto, nextStatus: KitchenStatus) => {
    setUpdatingItemId(item.id);

    try {
      await billsApi.updateItemStatus(item.id, {
        status: nextStatus,
      });
      await loadKitchenItems();
      toast.success(`${localizeText(item.productNameSnapshot)} durumu güncellendi.`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Sipariş durumu güncellenemedi.'));
    } finally {
      setUpdatingItemId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
          <div className="mb-4 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#d4a017]">
                <ChefHat className="h-4 w-4" />
                Mutfak Takibi
              </div>
              <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">Mutfak Ekranı</h1>
              <p className="mt-1 text-xs text-gray-600 lg:text-sm">
                Aktif adisyonlardaki ürün hazırlık durumlarını takip edin.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={loadKitchenItems}
              disabled={isLoading || updatingItemId !== null}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>

          {errorMessage && !isLoading ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {errorMessage}
            </div>
          ) : null}

          <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`rounded-xl border px-3 py-2.5 text-left shadow-sm transition-colors ${
                activeFilter === 'all'
                  ? 'border-[#d4a017] bg-[#fff8e7]'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="text-xs font-medium text-gray-500">Tümü</div>
              <div className="mt-0.5 text-xl font-bold text-gray-900">{kitchenItems.length}</div>
            </button>
            {statusFlow.map((status) => (
              <button
                key={status.value}
                onClick={() => setActiveFilter(status.value)}
                className={`rounded-xl border px-3 py-2.5 text-left shadow-sm transition-colors ${
                  activeFilter === status.value
                    ? 'border-[#d4a017] bg-[#fff8e7]'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="text-xs font-medium text-gray-500">{status.label}</div>
                <div className="mt-0.5 text-xl font-bold text-gray-900">{countsByStatus[status.value]}</div>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <LoadingSkeleton type="card" count={3} />
            </div>
          ) : groupedItems.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <EmptyState
                type="no-data"
                title="Mutfakta bekleyen ürün yok"
                description="Aktif adisyonlara ürün eklendiğinde burada görüntülenir."
              />
            </div>
          ) : (
            <div className="space-y-2.5">
              {groupedItems.map((group) => {
                const bill = group[0].bill;
                return (
                  <div key={bill.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-1.5 border-b border-gray-200 bg-gray-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between lg:px-4">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="text-sm font-bold text-gray-900">{bill.tableNo}</div>
                        <div className="text-xs text-gray-600">Adisyon: {bill.billNo}</div>
                        <div className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-600 ring-1 ring-gray-200">
                          {group.length} ürün
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Clock className="h-3.5 w-3.5" />
                        Açılış: {formatTime(bill.openedAt)}
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {group.map(({ item, kitchenStatus }) => (
                        <div key={item.id} className="grid gap-2 px-3 py-2.5 lg:grid-cols-[minmax(180px,1fr)_130px_minmax(300px,auto)] lg:items-center lg:px-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#fff8e7] text-[#9a6b00]">
                                <Utensils className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-gray-900">{localizeText(item.productNameSnapshot)}</div>
                                <div className="text-xs text-gray-600">{item.quantity} adet</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses[kitchenStatus]}`}>
                              {toUiBillItemStatus(kitchenStatus)}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 lg:justify-end">
                            {statusFlow.map((status) => (
                              <Button
                                key={status.value}
                                size="sm"
                                variant={kitchenStatus === status.value ? 'secondary' : 'outline'}
                                disabled={updatingItemId !== null || kitchenStatus === status.value}
                                onClick={() => handleUpdateStatus(item, status.value)}
                                className="h-7 rounded-lg px-2 text-[11px]"
                              >
                                {status.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
