import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { MenuProductFormDialog } from '../components/MenuProductFormDialog';
import { AccessDeniedState } from '../components/enterprise/AccessDeniedState';
import { EmptyState } from '../components/enterprise/EmptyState';
import { LoadingSkeleton } from '../components/enterprise/LoadingSkeleton';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { productsApi } from '../lib/api';
import { getErrorMessage, isForbiddenError } from '../lib/error-utils';
import { formatCurrency, formatDate, localizeText, toUiProductStatus } from '../lib/mappers';
import type { ProductCategoryDto, ProductDto, ProductImportSummaryDto, ProductMenuStatus, UpsertProductRequestDto } from '../types/api';
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Layers3,
  MoreHorizontal,
  PackageCheck,
  PackageOpen,
  PackageX,
  PowerOff,
  Search,
  SquarePen,
  Trash2,
  Upload,
} from 'lucide-react';

const productStatusOptions: Array<{ value: ProductMenuStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Tüm Durumlar' },
  { value: 'Aktif', label: 'Aktif' },
  { value: 'Pasif', label: 'Pasif' },
  { value: 'Tukendi', label: 'Tükendi' },
];

function ProductStatusBadge({ status }: { status: ProductDto['status'] }) {
  const config = {
    Aktif: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Pasif: 'border-slate-200 bg-slate-100 text-slate-600',
    Tukendi: 'border-amber-200 bg-amber-50 text-amber-700',
  } as const;

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${config[status]}`}>
      {toUiProductStatus(status)}
    </span>
  );
}

function BooleanPill({ value, trueLabel = 'Evet', falseLabel = 'Hayır' }: { value: boolean; trueLabel?: string; falseLabel?: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        value ? 'bg-[#eef7ef] text-[#2f855a]' : 'bg-[#f2f4f7] text-[#667085]'
      }`}
    >
      {value ? trueLabel : falseLabel}
    </span>
  );
}

export default function MenuManagement() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<ProductCategoryDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<ProductMenuStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [activeActionProductId, setActiveActionProductId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForbidden, setIsForbidden] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [removeCandidate, setRemoveCandidate] = useState<ProductDto | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isImportingExcel, setIsImportingExcel] = useState(false);
  const [importSummary, setImportSummary] = useState<ProductImportSummaryDto | null>(null);
  const [isImportSummaryOpen, setIsImportSummaryOpen] = useState(false);

  const loadMenuData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    setIsForbidden(false);

    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        productsApi.getProducts({
          categoryId: categoryFilter !== 'all' ? Number(categoryFilter) : undefined,
          status: statusFilter,
          search: searchQuery || undefined,
        }),
        productsApi.getCategories(),
      ]);

      setProducts(productsResponse);
      setCategories(categoriesResponse);
    } catch (error) {
      if (isForbiddenError(error)) {
        setIsForbidden(true);
        setErrorMessage('Menü yönetimi ekranına erişim yetkiniz bulunmuyor.');
      } else {
        setErrorMessage(getErrorMessage(error, 'Menü ürünleri alınamadı.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, searchQuery, statusFilter]);

  useEffect(() => {
    loadMenuData();
  }, [loadMenuData]);

  const hasActiveFilters = searchQuery.trim().length > 0 || categoryFilter !== 'all' || statusFilter !== 'all';

  const summary = useMemo(
    () => ({
      total: products.length,
      active: products.filter((product) => product.status === 'Aktif').length,
      passive: products.filter((product) => product.status === 'Pasif').length,
      outOfStock: products.filter((product) => product.status === 'Tukendi').length,
    }),
    [products],
  );

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsProductDialogOpen(true);
  };

  const handleOpenEdit = (product: ProductDto) => {
    setEditingProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleSubmitProduct = async (payload: UpsertProductRequestDto) => {
    setIsSavingProduct(true);

    try {
      if (editingProduct) {
        await productsApi.updateProduct(editingProduct.id, payload);
        toast.success('Ürün bilgileri güncellendi.');
      } else {
        await productsApi.createProduct(payload);
        toast.success('Yeni ürün menüye eklendi.');
      }

      setIsProductDialogOpen(false);
      setEditingProduct(null);
      await loadMenuData();
    } catch (error) {
      toast.error(getErrorMessage(error, editingProduct ? 'Ürün güncellenemedi.' : 'Ürün eklenemedi.'));
    } finally {
      setIsSavingProduct(false);
    }
  };

  const runProductAction = async (
    product: ProductDto,
    action: () => Promise<unknown>,
    successMessage: string,
    fallbackMessage: string,
  ) => {
    setActiveActionProductId(product.id);

    try {
      await action();
      toast.success(successMessage);
      await loadMenuData();
    } catch (error) {
      toast.error(getErrorMessage(error, fallbackMessage));
    } finally {
      setActiveActionProductId(null);
    }
  };

  const handleDeactivate = async (product: ProductDto) =>
    runProductAction(
      product,
      () => productsApi.deactivateProduct(product.id),
      `${localizeText(product.name)} pasif duruma alındı.`,
      'Ürün pasife alınamadı.',
    );

  const handleMarkOutOfStock = async (product: ProductDto) =>
    runProductAction(
      product,
      () => productsApi.markOutOfStock(product.id),
      `${localizeText(product.name)} tükendi olarak işaretlendi.`,
      'Ürün tükendi durumuna alınamadı.',
    );

  const handleReactivate = async (product: ProductDto) =>
    runProductAction(
      product,
      () => productsApi.reactivateProduct(product.id),
      `${localizeText(product.name)} yeniden aktif edildi.`,
      'Ürün yeniden aktifleştirilemedi.',
    );

  const handleConfirmRemove = async () => {
    if (!removeCandidate) {
      return;
    }

    await runProductAction(
      removeCandidate,
      () => productsApi.removeFromMenu(removeCandidate.id),
      `${localizeText(removeCandidate.name)} menüden kaldırıldı.`,
      'Ürün menüden kaldırılamadı.',
    );

    setRemoveCandidate(null);
  };

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);

    try {
      const blob = await productsApi.downloadImportTemplate();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'menu-import-template.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Excel şablonu indirilemedi.'));
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleExcelFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      toast.error('Yalnızca .xlsx formatındaki Excel dosyaları yüklenebilir.');
      return;
    }

    setIsImportingExcel(true);

    try {
      const summaryResponse = await productsApi.importExcel(file);
      setImportSummary(summaryResponse);
      setIsImportSummaryOpen(true);
      await loadMenuData();
      toast.success(
        summaryResponse.validationErrors.length > 0
          ? 'Excel aktarımı tamamlandı, bazı satırlar atlandı.'
          : 'Excel aktarımı tamamlandı.',
      );
    } catch (error) {
      toast.error(getErrorMessage(error, 'Excel aktarımı tamamlanamadı.'));
    } finally {
      setIsImportingExcel(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
          <div className="mb-4 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">Menü Yönetimi</h1>
              <p className="mt-1 text-xs text-gray-600 lg:text-sm">
                Menüde gösterilecek ürünleri, stok görünürlüğünü ve aktiflik durumunu yönetin.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
              <Button
                variant="outline"
                onClick={() => void handleDownloadTemplate()}
                disabled={isDownloadingTemplate}
                className="h-11 rounded-xl border-[#e4e7ec] px-5"
              >
                <Download className="h-4 w-4" />
                {isDownloadingTemplate ? 'İndiriliyor...' : 'Şablon İndir'}
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImportingExcel}
                className="h-11 rounded-xl border-[#e4e7ec] px-5"
              >
                <Upload className="h-4 w-4" />
                {isImportingExcel ? 'Aktarılıyor...' : 'Excel’den Aktar'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={(event) => void handleExcelFileChange(event)}
              />
              <Button
                onClick={handleOpenCreate}
                disabled={categories.filter((category) => category.isActive).length === 0}
                className="h-11 rounded-xl bg-[#d4a017] px-5 text-white hover:bg-[#c49316]"
              >
                Yeni Ürün Ekle
              </Button>
            </div>
          </div>

          {errorMessage && !isLoading && !isForbidden ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {errorMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="space-y-6">
              <LoadingSkeleton type="card" count={3} />
              <LoadingSkeleton type="table" count={6} />
            </div>
          ) : isForbidden ? (
            <div className="mx-auto max-w-4xl">
              <AccessDeniedState onBack={() => navigate(-1)} onHome={() => navigate('/dashboard')} />
            </div>
          ) : errorMessage ? (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <EmptyState
                type="error"
                title="Menü ürünleri yüklenemedi"
                description={errorMessage}
                action={{ label: 'Tekrar Dene', onClick: loadMenuData }}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4ff] text-[#3563e9]">
                      <PackageOpen className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-gray-500">Toplam</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
                  <div className="mt-1 text-sm text-gray-600">Kayıtlı Ürün</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <PackageCheck className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-gray-500">Servise Açık</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{summary.active}</div>
                  <div className="mt-1 text-sm text-gray-600">Aktif Ürün</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <PackageX className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-gray-500">Geçici Durum</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{summary.outOfStock}</div>
                  <div className="mt-1 text-sm text-gray-600">Tükendi</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Layers3 className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-gray-500">Menü Dışı</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{summary.passive}</div>
                  <div className="mt-1 text-sm text-gray-600">Pasif Ürün</div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#e4e7ec] bg-white shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                <div className="border-b border-[#eaecf0] px-4 py-4 lg:px-6 lg:py-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
                      <Input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Ürün ara..."
                        className="h-11 rounded-2xl border-[#e4e7ec] bg-[#f8fafc] pl-11 shadow-none placeholder:text-[#98a2b3]"
                      />
                    </div>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="h-11 w-full rounded-2xl border-[#e4e7ec] bg-white lg:w-[220px]">
                        <SelectValue placeholder="Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Kategoriler</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {localizeText(category.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProductMenuStatus | 'all')}>
                      <SelectTrigger className="h-11 w-full rounded-2xl border-[#e4e7ec] bg-white lg:w-[220px]">
                        <SelectValue placeholder="Durum" />
                      </SelectTrigger>
                      <SelectContent>
                        {productStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {products.length === 0 ? (
                  <EmptyState
                    type={hasActiveFilters ? 'no-results' : 'no-data'}
                    title={hasActiveFilters ? 'Filtreye uygun ürün bulunamadı' : 'Henüz menü ürünü bulunmuyor'}
                    description={
                      hasActiveFilters
                        ? 'Arama ve filtreleri değiştirerek yeniden deneyin.'
                        : 'Menü yönetimini kullanarak ilk ürün kaydınızı oluşturun.'
                    }
                    action={{
                      label: hasActiveFilters ? 'Filtreleri Temizle' : 'Yeni Ürün Ekle',
                      onClick: hasActiveFilters
                        ? () => {
                            setSearchQuery('');
                            setCategoryFilter('all');
                            setStatusFilter('all');
                          }
                        : handleOpenCreate,
                    }}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#eaecf0]">
                      <thead className="bg-[#f8fafc]">
                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#98a2b3]">
                          <th className="px-4 py-3 lg:px-6">Ürün Adı</th>
                          <th className="px-4 py-3">Kategori</th>
                          <th className="px-4 py-3">Açıklama</th>
                          <th className="px-4 py-3">Fiyat</th>
                          <th className="px-4 py-3">KDV</th>
                          <th className="px-4 py-3">Durum</th>
                          <th className="px-4 py-3">Menüde Aktif mi</th>
                          <th className="px-4 py-3">Tükendi mi</th>
                          <th className="px-4 py-3">Oluşturulma Tarihi</th>
                          <th className="px-4 py-3 text-right lg:px-6">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eaecf0] bg-white">
                        {products.map((product) => {
                          const isActionLoading = activeActionProductId === product.id;

                          return (
                            <tr key={product.id} className="align-top">
                              <td className="px-4 py-4 lg:px-6">
                                <div className="font-semibold text-[#202633]">{localizeText(product.name)}</div>
                              </td>
                              <td className="px-4 py-4 text-sm text-[#475467]">{localizeText(product.categoryName)}</td>
                              <td className="max-w-[280px] px-4 py-4 text-sm text-[#667085]">
                                <div className="line-clamp-2">{localizeText(product.description) || '-'}</div>
                              </td>
                              <td className="px-4 py-4 text-sm font-semibold text-[#202633]">{formatCurrency(product.price)}</td>
                              <td className="px-4 py-4 text-sm text-[#475467]">%{product.vatRate}</td>
                              <td className="px-4 py-4"><ProductStatusBadge status={product.status} /></td>
                              <td className="px-4 py-4"><BooleanPill value={product.isMenuActive && product.isActive} /></td>
                              <td className="px-4 py-4"><BooleanPill value={product.isOutOfStock} trueLabel="Tükendi" falseLabel="Hazır" /></td>
                              <td className="px-4 py-4 text-sm text-[#475467]">{formatDate(product.createdAt)}</td>
                              <td className="px-4 py-4 text-right lg:px-6">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={isActionLoading}>
                                      <MoreHorizontal className="h-4 w-4" />
                                      İşlemler
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>{localizeText(product.name)}</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleOpenEdit(product)}>
                                      <SquarePen className="h-4 w-4" />
                                      Ürün Düzenle
                                    </DropdownMenuItem>
                                    {product.status === 'Aktif' ? (
                                      <DropdownMenuItem onClick={() => void handleMarkOutOfStock(product)}>
                                        <PackageX className="h-4 w-4" />
                                        Tükendi Olarak İşaretle
                                      </DropdownMenuItem>
                                    ) : null}
                                    {product.status !== 'Aktif' ? (
                                      <DropdownMenuItem onClick={() => void handleReactivate(product)}>
                                        <PackageCheck className="h-4 w-4" />
                                        Yeniden Aktif Et
                                      </DropdownMenuItem>
                                    ) : null}
                                    {product.status !== 'Pasif' ? (
                                      <DropdownMenuItem onClick={() => void handleDeactivate(product)}>
                                        <PowerOff className="h-4 w-4" />
                                        Ürünü Pasife Al
                                      </DropdownMenuItem>
                                    ) : null}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant="destructive" onClick={() => setRemoveCandidate(product)}>
                                      <Trash2 className="h-4 w-4" />
                                      Sil / Menüden Kaldır
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <MenuProductFormDialog
        isOpen={isProductDialogOpen}
        onClose={() => {
          setIsProductDialogOpen(false);
          setEditingProduct(null);
        }}
        categories={categories}
        product={editingProduct}
        isSaving={isSavingProduct}
        onSubmit={handleSubmitProduct}
      />

      <Dialog open={isImportSummaryOpen} onOpenChange={setIsImportSummaryOpen}>
        <DialogContent className="max-h-[85vh] max-w-[720px] overflow-hidden rounded-[28px] border border-[#e4e7ec] p-0 shadow-[0_24px_64px_rgba(15,23,42,0.2)]">
          <DialogHeader className="border-b border-[#eaecf0] px-6 pb-5 pt-6">
            <DialogTitle className="flex items-center gap-3 text-[1.05rem] font-bold text-[#202633]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#3563e9]">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              Excel Aktarım Özeti
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-xs font-semibold text-emerald-700">Oluşturulan</div>
                <div className="mt-1 text-2xl font-bold text-emerald-900">{importSummary?.createdCount ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <div className="text-xs font-semibold text-blue-700">Güncellenen</div>
                <div className="mt-1 text-2xl font-bold text-blue-900">{importSummary?.updatedCount ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="text-xs font-semibold text-amber-700">Atlanan</div>
                <div className="mt-1 text-2xl font-bold text-amber-900">{importSummary?.skippedCount ?? 0}</div>
              </div>
            </div>

            {importSummary?.validationErrors.length ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50">
                <div className="border-b border-red-200 px-4 py-3 text-sm font-semibold text-red-800">
                  Doğrulama Hataları
                </div>
                <div className="max-h-[260px] overflow-y-auto">
                  <table className="min-w-full divide-y divide-red-100 text-sm">
                    <thead className="bg-red-100/70 text-left text-xs font-semibold uppercase tracking-[0.08em] text-red-700">
                      <tr>
                        <th className="px-4 py-2">Satır</th>
                        <th className="px-4 py-2">Alan</th>
                        <th className="px-4 py-2">Hata</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100 bg-red-50">
                      {importSummary.validationErrors.map((error, index) => (
                        <tr key={`${error.rowNumber}-${error.field}-${index}`}>
                          <td className="whitespace-nowrap px-4 py-3 font-semibold text-red-900">{error.rowNumber}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-red-800">{error.field}</td>
                          <td className="px-4 py-3 text-red-800">{error.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Aktarım hatasız tamamlandı.
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-[#eaecf0] px-6 py-4">
            <Button onClick={() => setIsImportSummaryOpen(false)} className="bg-[#d4a017] text-white hover:bg-[#c49316]">
              Tamam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!removeCandidate} onOpenChange={(open) => !open && setRemoveCandidate(null)}>
        <DialogContent className="max-w-[520px] rounded-[28px] border border-[#e4e7ec] p-0 shadow-[0_24px_64px_rgba(15,23,42,0.2)]">
          <DialogHeader className="border-b border-[#eaecf0] px-6 pb-5 pt-6">
            <DialogTitle className="flex items-center gap-3 text-[1.05rem] font-bold text-[#202633]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              Sil / Menüden Kaldır
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-6 text-sm text-[#475467]">
            <p className="font-medium text-[#202633]">
              {removeCandidate ? localizeText(removeCandidate.name) : 'Seçili ürün'} menüden kaldırılacak.
            </p>
            <p className="mt-3 leading-6">
              Bu işlem ürünü siparişe kapatır. Geçmiş adisyon kayıtları korunur ve ürün yönetim ekranında pasif olarak kalır.
            </p>
          </div>

          <DialogFooter className="border-t border-[#eaecf0] px-6 py-4">
            <Button variant="outline" onClick={() => setRemoveCandidate(null)}>
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleConfirmRemove()}
              disabled={!!removeCandidate && activeActionProductId === removeCandidate.id}
            >
              Menüden Kaldır
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
