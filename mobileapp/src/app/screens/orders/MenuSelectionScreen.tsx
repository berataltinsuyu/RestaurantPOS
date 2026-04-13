import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getBackendErrorMessage } from "../../../api/http/api-client";
import { BottomActionBar } from "../../../components/common/BottomActionBar";
import { Button } from "../../../components/common/Button";
import { FilterChip } from "../../../components/common/FilterChip";
import { Screen } from "../../../components/common/Screen";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
import { formatCurrency } from "../../../constants/formatters";
import { ROUTES } from "../../../constants/routes";
import { RootStackParamList } from "../../../navigation/types";
import { services } from "../../../services/composition-root";
import { useAppStore } from "../../../state/app-store";
import { MenuCategory, MenuProduct } from "../../../types/domain";
import { colors, radii, spacing, typography } from "../../../theme";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.MENU_SELECTION
>;

type CategoryOption = {
  id: string;
  label: string;
};

const ALL_CATEGORY_ID = "all";

export function MenuSelectionScreen({ navigation, route }: Props) {
  const { tableId } = route.params;
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORY_ID);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [quantitiesByProductId, setQuantitiesByProductId] = useState<
    Record<string, number>
  >({});
  const table = useAppStore((state) =>
    state.tables.find((candidate) => candidate.id === tableId),
  );
  const order = useAppStore((state) => state.ordersByTableId[tableId]);
  const upsertOrder = useAppStore((state) => state.upsertOrder);
  const upsertTable = useAppStore((state) => state.upsertTable);

  useEffect(() => {
    let isMounted = true;

    async function loadMenuCatalog() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const catalog = await services.menu.listMenuCatalog();

        if (!isMounted) {
          return;
        }

        setCategories(catalog.categories);
        setProducts(catalog.products);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Menü verileri alınamadı.";

        setCategories([]);
        setProducts([]);
        setErrorMessage(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMenuCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryOptions = useMemo<CategoryOption[]>(
    () => [
      { id: ALL_CATEGORY_ID, label: "Tümü" },
      ...categories.map((category) => ({
        id: category.id,
        label: category.label,
      })),
    ],
    [categories],
  );

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.label])),
    [categories],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("tr");

    return products.filter((product) => {
      const matchesCategory =
        selectedCategoryId === ALL_CATEGORY_ID ||
        product.categoryId === selectedCategoryId;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        product.name.toLocaleLowerCase("tr").includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategoryId]);

  const keyExtractor = useCallback((item: MenuProduct) => item.id, []);
  const selectedBillId = useMemo(() => {
    if (typeof order?.dbId === "number" && Number.isFinite(order.dbId)) {
      return order.dbId;
    }

    const tableBillId = Number(table?.activeOrderId);
    return Number.isFinite(tableBillId) ? tableBillId : null;
  }, [order?.dbId, table?.activeOrderId]);
  const canRefreshAfterMutation =
    services.tables.isReadConfigured && services.bills.isReadConfigured;

  const handleAddProduct = useCallback(
    async (productId: string, quantity: number) => {
      if (isMutating) {
        console.info("[MenuSelectionScreen] Add product ignored because another mutation is in progress.", {
          selectedBillId,
          selectedQuantity: quantity,
          selectedProductId: productId,
          selectedTableId: tableId,
        });
        return;
      }

      console.info("[MenuSelectionScreen] Add product requested.", {
        selectedBillId,
        selectedQuantity: quantity,
        selectedProductId: productId,
        selectedTableId: tableId,
      });

      setIsMutating(true);

      try {
        const updatedOrder = await services.orders.addMenuProduct({
          billId: selectedBillId ?? undefined,
          productId,
          quantity,
          tableId,
        });

        upsertOrder(updatedOrder);

        if (table) {
          upsertTable({
            ...table,
            activeOrderId: String(updatedOrder.dbId ?? updatedOrder.id),
            status: "occupied",
            totalAmount: updatedOrder.total,
            updatedAt: updatedOrder.updatedAt,
          });
        }

        try {
          if (canRefreshAfterMutation) {
            await services.sync.refreshAfterMutation(tableId);
          } else {
            console.warn("[MenuSelectionScreen] Post-add refresh skipped because live read adapters are not configured.", {
              billsReadConfigured: services.bills.isReadConfigured,
              selectedTableId: tableId,
              tablesReadConfigured: services.tables.isReadConfigured,
            });
          }
        } catch (refreshError) {
          console.error("[MenuSelectionScreen] Post-add refresh failed after a successful backend mutation.", refreshError);
        }

        console.info("[MenuSelectionScreen] Add product completed.", {
          refreshedBillId:
            useAppStore.getState().ordersByTableId[tableId]?.dbId ?? null,
          refreshedItemCount:
            useAppStore.getState().ordersByTableId[tableId]?.items.length ?? 0,
          selectedQuantity: quantity,
          selectedProductId: productId,
          selectedTableId: tableId,
        });

        setQuantitiesByProductId((currentQuantities) => {
          if (!(productId in currentQuantities)) {
            return currentQuantities;
          }

          const nextQuantities = { ...currentQuantities };
          delete nextQuantities[productId];
          return nextQuantities;
        });

        Alert.alert(
          "Ürün eklendi",
          "Seçilen ürün aktif adisyona eklendi.",
        );
      } catch (error) {
        console.error("[MenuSelectionScreen] Add product failed.", error);
        Alert.alert(
          "Ürün eklenemedi",
          getBackendErrorMessage(
            error,
            "Seçilen ürün aktif adisyona eklenemedi.",
          ),
        );
      } finally {
        setIsMutating(false);
      }
    },
    [
      canRefreshAfterMutation,
      isMutating,
      selectedBillId,
      table,
      tableId,
      upsertOrder,
      upsertTable,
    ],
  );

  const handleIncreaseQuantity = useCallback((productId: string) => {
    setQuantitiesByProductId((currentQuantities) => ({
      ...currentQuantities,
      [productId]: (currentQuantities[productId] ?? 1) + 1,
    }));
  }, []);

  const handleDecreaseQuantity = useCallback((productId: string) => {
    setQuantitiesByProductId((currentQuantities) => {
      const currentQuantity = currentQuantities[productId] ?? 1;
      const nextQuantity = Math.max(1, currentQuantity - 1);

      if (nextQuantity === 1) {
        if (!(productId in currentQuantities)) {
          return currentQuantities;
        }

        const nextQuantities = { ...currentQuantities };
        delete nextQuantities[productId];
        return nextQuantities;
      }

      return {
        ...currentQuantities,
        [productId]: nextQuantity,
      };
    });
  }, []);

  const renderCategory = useCallback(
    ({ item }: ListRenderItemInfo<CategoryOption>) => (
      <FilterChip
        label={item.label}
        onPress={() => setSelectedCategoryId(item.id)}
        selected={selectedCategoryId === item.id}
        style={styles.categoryChip}
      />
    ),
    [selectedCategoryId],
  );

  const renderProduct = useCallback(
    ({ item }: ListRenderItemInfo<MenuProduct>) => (
      <MemoizedProductCard
        categoryLabel={categoriesById.get(item.categoryId)}
        isMutating={isMutating}
        onDecreaseQuantity={handleDecreaseQuantity}
        onIncreaseQuantity={handleIncreaseQuantity}
        onAdd={handleAddProduct}
        product={item}
        quantity={quantitiesByProductId[item.id] ?? 1}
      />
    ),
    [
      categoriesById,
      handleAddProduct,
      handleDecreaseQuantity,
      handleIncreaseQuantity,
      isMutating,
      quantitiesByProductId,
    ],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <SectionHeader
          eyebrow="Ürün Seçimi"
          subtitle={`${table?.label ?? "Masa"} için ürün seçin ve siparişe ekleyin.`}
          title="Ürün Seçimi"
        />

        <View style={styles.searchShell}>
          <SearchIcon />
          <TextInput
            onChangeText={setSearchQuery}
            placeholder="Ürün ara..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
          />
        </View>

        <FlatList
          contentContainerStyle={styles.categoriesContent}
          data={categoryOptions}
          horizontal
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={renderCategory}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    ),
    [categoryOptions, renderCategory, searchQuery, table?.label],
  );

  const emptyState = useMemo(() => {
    if (isLoading) {
      return (
        <SurfaceCard elevated style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Menü yükleniyor</Text>
          <Text style={styles.feedbackCopy}>
            Ürün ve kategori listesi Supabase üzerinden alınıyor.
          </Text>
        </SurfaceCard>
      );
    }

    if (errorMessage) {
      return (
        <SurfaceCard elevated style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Menü alınamadı</Text>
          <Text style={styles.feedbackCopy}>{errorMessage}</Text>
        </SurfaceCard>
      );
    }

    if (products.length === 0) {
      return (
        <SurfaceCard elevated style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Menü boş görünüyor</Text>
          <Text style={styles.feedbackCopy}>
            Products ve ProductCategories verisi veya aktif menü bayrakları kontrol edilmeli.
          </Text>
        </SurfaceCard>
      );
    }

    return (
      <SurfaceCard elevated style={styles.feedbackCard}>
        <Text style={styles.feedbackTitle}>Ürün bulunamadı</Text>
        <Text style={styles.feedbackCopy}>
          Arama veya kategori seçimine uygun ürün görünmüyor.
        </Text>
      </SurfaceCard>
    );
  }, [errorMessage, isLoading, products.length]);

  return (
    <Screen
      contentContainerStyle={styles.content}
      footer={
        <BottomActionBar>
          <Button
            onPress={() => navigation.replace(ROUTES.ORDER_DETAIL, { tableId })}
            title="Siparişe Dön"
          />
        </BottomActionBar>
      }
      scroll={false}
    >
      <FlatList
        contentContainerStyle={styles.productsContent}
        data={filteredProducts}
        keyExtractor={keyExtractor}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={emptyState}
        ListHeaderComponent={listHeader}
        removeClippedSubviews
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const ProductCard = memo(function ProductCard({
  categoryLabel,
  isMutating,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onAdd,
  product,
  quantity,
}: {
  categoryLabel?: string;
  isMutating: boolean;
  onDecreaseQuantity: (productId: string) => void;
  onIncreaseQuantity: (productId: string) => void;
  onAdd: (productId: string, quantity: number) => void;
  product: MenuProduct;
  quantity: number;
}) {
  const isDecreaseDisabled = quantity <= 1 || isMutating;

  return (
    <SurfaceCard elevated style={styles.productCard}>
      <View style={styles.productTopRow}>
        <Text numberOfLines={2} style={styles.productName}>
          {product.name}
        </Text>
        <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
      </View>

      <View style={styles.productBottomRow}>
        <Text numberOfLines={1} style={styles.productMeta}>
          {categoryLabel ?? "Kategori"}
        </Text>

        <View style={styles.actionCluster}>
          <View style={styles.quantityControl}>
            <Pressable
              accessibilityLabel={`${product.name} miktar azalt`}
              accessibilityRole="button"
              android_ripple={{ color: "rgba(39,48,67,0.06)" }}
              disabled={isDecreaseDisabled}
              onPress={() => onDecreaseQuantity(product.id)}
              style={({ pressed }) => [
                styles.quantityButton,
                isDecreaseDisabled ? styles.quantityButtonDisabled : null,
                pressed && !isDecreaseDisabled ? styles.quantityButtonPressed : null,
              ]}
            >
              <Text
                style={[
                  styles.quantityButtonText,
                  isDecreaseDisabled ? styles.quantityButtonTextDisabled : null,
                ]}
              >
                -
              </Text>
            </Pressable>

            <View style={styles.quantityValue}>
              <Text style={styles.quantityValueText}>{quantity}</Text>
            </View>

            <Pressable
              accessibilityLabel={`${product.name} miktar artır`}
              accessibilityRole="button"
              android_ripple={{ color: "rgba(39,48,67,0.06)" }}
              disabled={isMutating}
              onPress={() => onIncreaseQuantity(product.id)}
              style={({ pressed }) => [
                styles.quantityButton,
                isMutating ? styles.quantityButtonDisabled : null,
                pressed && !isMutating ? styles.quantityButtonPressed : null,
              ]}
            >
              <Text
                style={[
                  styles.quantityButtonText,
                  isMutating ? styles.quantityButtonTextDisabled : null,
                ]}
              >
                +
              </Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityLabel={`${product.name} ${quantity} adet ekle`}
            accessibilityRole="button"
            android_ripple={{ color: "rgba(214,169,55,0.12)" }}
            disabled={isMutating}
            onPress={() => onAdd(product.id, quantity)}
            style={({ pressed }) => [
              styles.addButton,
              isMutating ? styles.addButtonDisabled : null,
              pressed && !isMutating ? styles.addButtonPressed : null,
            ]}
          >
            <Text style={styles.addButtonIcon}>+</Text>
            <Text style={styles.addButtonText}>Ekle</Text>
          </Pressable>
        </View>
      </View>
    </SurfaceCard>
  );
});

const MemoizedProductCard = ProductCard;

function SearchIcon() {
  return (
    <View style={styles.searchIcon}>
      <View style={styles.searchRing} />
      <View style={styles.searchHandle} />
    </View>
  );
}

const styles = StyleSheet.create({
  actionCluster: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: spacing.xs,
  },
  addButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: colors.surfaceBrand,
    borderRadius: radii.pill,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: spacing.sm,
  },
  addButtonIcon: {
    color: colors.primaryContrast,
    fontSize: 16,
    fontWeight: typography.bodyStrong.fontWeight,
    marginRight: spacing.xxs,
  },
  addButtonPressed: {
    opacity: 0.92,
  },
  addButtonDisabled: {
    opacity: 0.52,
  },
  addButtonText: {
    color: colors.primaryContrast,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
  },
  categoriesContent: {
    paddingRight: spacing.sm,
  },
  categoryChip: {
    marginRight: spacing.xs,
  },
  content: {
    paddingBottom: 0,
    paddingTop: spacing.sm,
  },
  feedbackCard: {
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
  },
  feedbackCopy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    textAlign: "center",
  },
  feedbackTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  listHeader: {
    paddingBottom: spacing.sm,
  },
  productBottomRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  productCard: {
    marginBottom: spacing.sm,
    minHeight: 96,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  productMeta: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: typography.caption.fontSize,
    marginRight: spacing.md,
  },
  productName: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyStrong.fontWeight,
    marginRight: spacing.md,
  },
  productPrice: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.subtitle.fontWeight,
  },
  quantityButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  quantityButtonDisabled: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  quantityButtonPressed: {
    opacity: 0.84,
  },
  quantityButtonText: {
    color: colors.textPrimary,
    fontSize: typography.bodyStrong.fontSize,
    fontWeight: typography.bodyStrong.fontWeight,
    lineHeight: typography.bodyStrong.lineHeight,
  },
  quantityButtonTextDisabled: {
    color: colors.textMuted,
  },
  quantityControl: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  quantityValue: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 28,
    paddingHorizontal: spacing.xs,
  },
  quantityValueText: {
    color: colors.textPrimary,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
    textAlign: "center",
  },
  productsContent: {
    paddingBottom: spacing.md,
  },
  productTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  searchHandle: {
    backgroundColor: colors.textMuted,
    borderRadius: radii.pill,
    bottom: -1,
    height: 2,
    position: "absolute",
    right: -1,
    transform: [{ rotate: "45deg" }],
    width: 6,
  },
  searchIcon: {
    height: 18,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
    position: "relative",
    width: 18,
  },
  searchInput: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    minHeight: 50,
    paddingRight: spacing.md,
  },
  searchRing: {
    borderColor: colors.textMuted,
    borderRadius: radii.pill,
    borderWidth: 1.8,
    height: 12,
    left: 1,
    position: "absolute",
    top: 1,
    width: 12,
  },
  searchShell: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.sm,
    minHeight: 52,
  },
});
