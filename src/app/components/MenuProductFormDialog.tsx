import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { localizeText, toUiProductStatus } from '../lib/mappers';
import type { ProductCategoryDto, ProductDto, UpsertProductRequestDto } from '../types/api';
import { PackagePlus, SquarePen } from 'lucide-react';

interface MenuProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ProductCategoryDto[];
  product?: ProductDto | null;
  isSaving?: boolean;
  onSubmit: (payload: UpsertProductRequestDto) => Promise<void> | void;
}

interface FormState {
  categoryId: string;
  name: string;
  description: string;
  price: string;
  vatRate: string;
  isMenuActive: boolean;
}

const createInitialState = (product?: ProductDto | null): FormState => ({
  categoryId: product ? String(product.categoryId) : '',
  name: product?.name ?? '',
  description: product?.description ?? '',
  price: product ? String(product.price) : '',
  vatRate: product ? String(product.vatRate) : '10',
  isMenuActive: product ? product.isActive && product.isMenuActive : true,
});

export function MenuProductFormDialog({
  isOpen,
  onClose,
  categories,
  product,
  isSaving = false,
  onSubmit,
}: MenuProductFormDialogProps) {
  const [form, setForm] = useState<FormState>(createInitialState(product));
  const [validationMessage, setValidationMessage] = useState('');

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(createInitialState(product));
    setValidationMessage('');
  }, [isOpen, product]);

  const handleClose = () => {
    if (isSaving) {
      return;
    }

    setValidationMessage('');
    onClose();
  };

  const handleSubmit = async () => {
    const parsedCategoryId = Number(form.categoryId);
    const parsedPrice = Number.parseFloat(form.price.replace(',', '.'));
    const parsedVatRate = Number.parseFloat(form.vatRate.replace(',', '.'));

    if (!parsedCategoryId) {
      setValidationMessage('Lütfen bir kategori seçin.');
      return;
    }

    if (!form.name.trim()) {
      setValidationMessage('Ürün adı zorunludur.');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setValidationMessage('Geçerli bir fiyat girin.');
      return;
    }

    if (!Number.isFinite(parsedVatRate) || parsedVatRate < 0 || parsedVatRate > 100) {
      setValidationMessage('KDV oranı 0 ile 100 arasında olmalıdır.');
      return;
    }

    setValidationMessage('');

    await Promise.resolve(
      onSubmit({
        categoryId: parsedCategoryId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parsedPrice,
        vatRate: parsedVatRate,
        isActive: form.isMenuActive,
        isMenuActive: form.isMenuActive,
        isOutOfStock: form.isMenuActive ? product?.isOutOfStock ?? false : false,
      }),
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] max-w-[640px] overflow-y-auto rounded-[28px] border border-[#e4e7ec] p-0 shadow-[0_24px_64px_rgba(15,23,42,0.2)]">
        <DialogHeader className="border-b border-[#eaecf0] px-6 pb-5 pt-6">
          <DialogTitle className="flex items-center gap-3 text-[1.05rem] font-bold text-[#202633]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#3563e9]">
              {product ? <SquarePen className="h-5 w-5" /> : <PackagePlus className="h-5 w-5" />}
            </div>
            <div>
              <div>{product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</div>
              <div className="mt-1 text-sm font-normal text-[#667085]">
                Menüde gösterilecek ürün bilgilerini yönetin.
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          {product ? (
            <div className="rounded-2xl border border-[#e4e7ec] bg-[#f8fafc] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#98a2b3]">Mevcut Durum</div>
                  <div className="mt-1 text-sm font-semibold text-[#202633]">{toUiProductStatus(product.status)}</div>
                </div>
                <div className="text-xs text-[#667085]">
                  Menüde Aktif: <span className="font-semibold text-[#202633]">{product.isMenuActive ? 'Evet' : 'Hayır'}</span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-name">Ürün Adı</Label>
              <Input
                id="product-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Örn: Soğuk Latte"
                className="h-11 rounded-xl border-[#d9dee7]"
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={form.categoryId}
                onValueChange={(value) => setForm((current) => ({ ...current, categoryId: value }))}
              >
                <SelectTrigger className="h-11 rounded-xl border-[#d9dee7]">
                  <SelectValue placeholder="Kategori seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {activeCategories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {localizeText(category.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Açıklama</Label>
            <textarea
              id="product-description"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Ürün açıklaması"
              className="min-h-[110px] w-full rounded-2xl border border-[#d9dee7] bg-white px-4 py-3 text-sm text-[#202633] outline-none transition focus:border-[#d4a017] focus:ring-4 focus:ring-[#d4a017]/10"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-price">Fiyat</Label>
              <Input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                placeholder="0,00"
                className="h-11 rounded-xl border-[#d9dee7]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-vat">KDV Oranı</Label>
              <Input
                id="product-vat"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.vatRate}
                onChange={(event) => setForm((current) => ({ ...current, vatRate: event.target.value }))}
                placeholder="10"
                className="h-11 rounded-xl border-[#d9dee7]"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#e4e7ec] bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-[#202633]">Menüde Aktif mi?</div>
                <div className="mt-1 text-xs text-[#667085]">
                  Kapalı olduğunda ürün pasif hale gelir ve siparişe açılamaz.
                </div>
              </div>
              <Switch
                checked={form.isMenuActive}
                onCheckedChange={(checked) => setForm((current) => ({ ...current, isMenuActive: checked }))}
              />
            </div>
          </div>

          {validationMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {validationMessage}
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t border-[#eaecf0] px-6 py-4">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-[#d4a017] text-white hover:bg-[#c49316]"
          >
            {isSaving ? 'Kaydediliyor...' : product ? 'Değişiklikleri Kaydet' : 'Ürünü Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
