import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AccessDeniedState } from '../components/enterprise/AccessDeniedState';
import { EmptyState } from '../components/enterprise/EmptyState';
import { LoadingSkeleton } from '../components/enterprise/LoadingSkeleton';
import { billsApi, productsApi } from '../lib/api';
import { getErrorMessage, isForbiddenError } from '../lib/error-utils';
import { formatCurrency, formatTime, localizeText } from '../lib/mappers';
import type { BillSummaryDto, ProductCategoryDto, ProductDto } from '../types/api';
import { ArrowLeft, Plus, Minus, Trash2, Search, User, Clock as ClockIcon } from 'lucide-react';

export default function BillDetail() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState<BillSummaryDto | null>(null);
  const [categories, setCategories] = useState<ProductCategoryDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForbidden, setIsForbidden] = useState(false);

  const numericTableId = Number(tableId);

  const loadBillData = useCallback(async () => {
    if (!numericTableId) {
      return;
    }

    setIsLoading(true);
    setIsForbidden(false);
    setErrorMessage('');

    try {
      const [billResponse, categoriesResponse, productsResponse] = await Promise.all([
        billsApi.getByTable(numericTableId),
        productsApi.getCategories(),
        productsApi.getProducts({ onlyMenuItems: true }),
      ]);

      setBill(billResponse);
      setCategories(categoriesResponse.filter((category) => category.isActive));
      setProducts(productsResponse);
    } catch (error) {
      if (isForbiddenError(error)) {
        setIsForbidden(true);
        setErrorMessage('Bu adisyonu görüntüleme yetkiniz bulunmuyor.');
      } else {
        setErrorMessage(getErrorMessage(error, 'Adisyon verileri alınamadı.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [numericTableId]);

  useEffect(() => {
    loadBillData();
  }, [loadBillData]);

  const categoryTabs = useMemo(
    () => [{ value: 'all', label: 'Tümü' }, ...categories.map((category) => ({
      value: String(category.id),
      label: localizeText(category.name),
    }))],
    [categories],
  );

  const categoryGridClass = useMemo(() => {
    if (categoryTabs.length <= 2) {
      return 'grid-cols-2';
    }

    if (categoryTabs.length === 3) {
      return 'grid-cols-3';
    }

    return 'grid-cols-4';
  }, [categoryTabs.length]);

  const handleAddProduct = async (product: ProductDto) => {
    if (!bill) {
      return;
    }

    setIsMutating(true);
    try {
      await billsApi.addItem(bill.id, {
        productId: product.id,
        quantity: 1,
      });
      toast.success(`${localizeText(product.name)} adisyona eklendi.`);
      await loadBillData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Ürün eklenemedi.'));
    } finally {
      setIsMutating(false);
    }
  };

  const handleQuantityChange = async (itemId: number, delta: number) => {
    const currentItem = bill?.items.find((item) => item.id === itemId);
    if (!bill || !currentItem) {
      return;
    }

    setIsMutating(true);
    try {
      if (currentItem.quantity + delta <= 0) {
        await billsApi.deleteItem(itemId);
      } else {
        await billsApi.updateItem(itemId, {
          quantity: currentItem.quantity + delta,
          note: currentItem.note ?? undefined,
        });
      }

      await loadBillData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Adisyon güncellenemedi.'));
    } finally {
      setIsMutating(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setIsMutating(true);
    try {
      await billsApi.deleteItem(itemId);
      toast.success('Ürün adisyondan kaldırıldı.');
      await loadBillData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Ürün kaldırılamadı.'));
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
          <div className="mb-4 lg:mb-5">
            <button
              onClick={() => navigate('/dashboard')}
              className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Masalara Dön</span>
            </button>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-[1.65rem] font-bold tracking-[-0.02em] text-[#202633]">Adisyon Detayı</h1>
                {bill ? (
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#667085]">
                    <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                      <User className="h-4 w-4 text-[#98a2b3]" />
                      <span>Garson: {localizeText(bill.waiterName)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                      <ClockIcon className="h-4 w-4 text-[#98a2b3]" />
                      <span>Açılış: {formatTime(bill.openedAt)}</span>
                    </div>
                    <div className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-xs font-semibold text-[#3563e9] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                      {bill.tableNo} • {bill.customerCount} Kişi
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="rounded-2xl border border-[#e4e7ec] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#98a2b3]">Adisyon No</div>
                <div className="mt-1 text-lg font-bold text-[#202633]">{bill?.billNo ?? '-'}</div>
              </div>
            </div>
          </div>

          {errorMessage && !isLoading && !isForbidden ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 mb-6">
              {errorMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <LoadingSkeleton type="card" count={3} />
              <LoadingSkeleton type="detail" count={5} />
            </div>
          ) : isForbidden ? (
            <div className="mx-auto max-w-4xl">
              <AccessDeniedState
                onBack={() => navigate(-1)}
                onHome={() => navigate('/dashboard')}
              />
            </div>
          ) : !bill ? (
            <div className="rounded-[28px] border border-[#e4e7ec] bg-white p-8 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
              <EmptyState
                type="no-data"
                title="Açık adisyon bulunamadı"
                description="Seçili masa için aktif bir adisyon kaydı bulunmuyor."
                action={{
                  label: 'Masalara Dön',
                  onClick: () => navigate('/dashboard'),
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-[28px] border border-[#e4e7ec] bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.04)] lg:p-6">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
                    <Input
                      type="text"
                      placeholder="Ürün ara..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="h-12 rounded-2xl border-[#e4e7ec] bg-[#f8fafc] pl-11 text-sm shadow-none placeholder:text-[#98a2b3]"
                    />
                  </div>
                </div>

                <Tabs defaultValue="all" className="gap-4">
                  <TabsList className={`grid h-14 w-full rounded-2xl bg-[#eef1f5] p-1 ${categoryGridClass}`}>
                    {categoryTabs.map((category) => (
                      <TabsTrigger
                        key={category.value}
                        value={category.value}
                        className="rounded-xl text-sm font-semibold text-[#475467] data-[state=active]:bg-white data-[state=active]:text-[#1f2937] data-[state=active]:shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
                      >
                        {category.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {categoryTabs.map((category) => (
                    <TabsContent key={category.value} value={category.value} className="mt-0">
                      <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2 xl:grid-cols-3">
                        {products
                          .filter((product) => category.value === 'all' || String(product.categoryId) === category.value)
                          .filter((product) => localizeText(product.name).toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((product) => (
                            <ProductCard
                              key={product.id}
                              name={localizeText(product.name)}
                              price={product.price}
                              onAdd={() => handleAddProduct(product)}
                            />
                          ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <div className="lg:sticky lg:top-20 lg:h-fit">
                <div className="overflow-hidden rounded-[28px] border border-[#e4e7ec] bg-white shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                  <div className="border-b border-[#eaecf0] px-6 py-5">
                    <h2 className="text-[1.65rem] font-bold tracking-[-0.02em] text-[#202633]">Adisyon</h2>
                    <p className="mt-1 text-sm text-[#98a2b3]">Adisyon No: {bill.billNo}</p>
                  </div>

                  <div className="max-h-[460px] overflow-y-auto px-6 py-3">
                    {bill.items.length === 0 ? (
                      <div className="py-10 text-center text-sm text-[#98a2b3]">Henüz ürün eklenmedi</div>
                    ) : (
                      <div>
                        {bill.items.map((item) => (
                          <div key={item.id} className="border-b border-[#eaecf0] py-5 last:border-b-0">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="text-lg font-semibold text-[#202633]">{localizeText(item.productNameSnapshot)}</div>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={isMutating}
                                className="text-[#ef4444] transition-colors hover:text-[#dc2626] disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleQuantityChange(item.id, -1)}
                                  disabled={isMutating}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f2f4f7] text-[#344054] transition-colors hover:bg-[#e4e7ec] disabled:opacity-50"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="min-w-6 text-center text-lg font-semibold text-[#202633]">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, 1)}
                                  disabled={isMutating}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f2f4f7] text-[#344054] transition-colors hover:bg-[#e4e7ec] disabled:opacity-50"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="text-[1.05rem] font-bold text-[#202633]">{formatCurrency(item.lineTotal)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {bill.items.length > 0 && (
                    <>
                      <div className="border-t border-[#eaecf0] px-6 py-5">
                        <div className="space-y-3 text-[1rem]">
                          <div className="flex items-center justify-between">
                            <span className="text-[#667085]">Ara Toplam</span>
                            <span className="font-semibold text-[#202633]">{formatCurrency(bill.subtotal)}</span>
                          </div>
                          {bill.discountAmount > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-[#667085]">İndirim</span>
                              <span className="font-semibold text-[#dc2626]">-{formatCurrency(bill.discountAmount)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-[#667085]">Hizmet Bedeli</span>
                            <span className="font-semibold text-[#202633]">{formatCurrency(bill.serviceCharge)}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-[#eaecf0] pt-4">
                            <span className="text-[1.05rem] font-bold text-[#202633]">Toplam Tutar</span>
                            <span className="text-[2.2rem] font-bold leading-none tracking-[-0.03em] text-[#202633]">
                              {formatCurrency(bill.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-[#eaecf0] px-6 py-5">
                        <Button
                          onClick={() => navigate(`/payment/${numericTableId}`)}
                          className="h-14 w-full rounded-2xl bg-[#d4a017] text-base font-semibold text-white hover:bg-[#bf8c12]"
                        >
                          Masa Kapat
                        </Button>
                        <div className="mt-3 text-center text-xs text-[#98a2b3]">
                          {bill.items.reduce((sum, item) => sum + item.quantity, 0)} ürün • VakıfBank güvenli ödeme akışı
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
