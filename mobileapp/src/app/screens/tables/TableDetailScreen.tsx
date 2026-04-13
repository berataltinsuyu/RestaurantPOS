import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BottomActionBar } from "../../../components/common/BottomActionBar";
import { Button } from "../../../components/common/Button";
import { Screen } from "../../../components/common/Screen";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { StatusChip } from "../../../components/common/StatusChip";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
import {
  formatCurrency,
  formatTableLabel,
  getOrderPaymentSummary,
} from "../../../constants/formatters";
import { ROUTES } from "../../../constants/routes";
import { useBillRealtimeSync } from "../../../hooks/useBillRealtimeSync";
import { RootStackParamList } from "../../../navigation/types";
import { useAppStore } from "../../../state/app-store";
import { colors, radii, spacing, typography } from "../../../theme";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.TABLE_DETAIL
>;

export function TableDetailScreen({ navigation, route }: Props) {
  const { tableId } = route.params;
  useBillRealtimeSync(tableId);
  const setSelectedTableId = useAppStore((state) => state.setSelectedTableId);
  const table = useAppStore((state) =>
    state.tables.find((candidate) => candidate.id === tableId),
  );
  const order = useAppStore((state) => state.ordersByTableId[tableId]);

  useEffect(() => {
    setSelectedTableId(tableId);
    return () => setSelectedTableId(null);
  }, [setSelectedTableId, tableId]);

  const paymentSummary = useMemo(
    () => (order ? getOrderPaymentSummary(order) : null),
    [order],
  );

  if (!table) {
    return (
      <Screen>
        <SurfaceCard>
          <Text style={styles.missingTitle}>Masa bulunamadı</Text>
          <Text style={styles.missingCopy}>
            Seçilen masa mobil uygulama verilerinde bulunamadı.
          </Text>
        </SurfaceCard>
      </Screen>
    );
  }

  const tableLabel = formatTableLabel(table.label);
  const waiterLabel = table.assignedWaiterName ?? "Atanmadı";
  const orderItems = order?.items ?? [];
  const hasOrderItems = orderItems.length > 0;
  const totalAmount = paymentSummary?.total ?? order?.total ?? table.totalAmount;

  return (
    <Screen
      contentContainerStyle={styles.content}
      footer={
        <BottomActionBar style={styles.bottomActions}>
          <Button
            fullWidth={false}
            onPress={() =>
              navigation.navigate(ROUTES.MENU_SELECTION, { tableId: table.id })
            }
            style={styles.bottomButton}
            title="Ürün Ekle"
            variant="secondary"
          />
          <Button
            disabled={!hasOrderItems}
            fullWidth={false}
            onPress={() =>
              navigation.navigate(ROUTES.PAYMENT, { tableId: table.id })
            }
            style={styles.bottomButton}
            title="Ödemeye Geç"
          />
        </BottomActionBar>
      }
    >
      <SectionHeader
        eyebrow="Sipariş Detayı"
        right={<StatusChip label={table.status} status={table.status} />}
        subtitle={`${table.areaLabel ?? "Salon"} · ${tableLabel}`}
        title={tableLabel}
      />

      <SurfaceCard elevated style={styles.summaryCard}>
        <View style={styles.summaryMeta}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Masa</Text>
            <Text style={styles.metaValue}>{tableLabel}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Garson</Text>
            <Text numberOfLines={1} style={styles.metaValue}>
              {waiterLabel}
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Misafir</Text>
            <Text style={styles.metaValue}>{table.guestCount}</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard elevated style={styles.itemsCard}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Sipariş İçeriği</Text>
          {order?.updatedAt ? (
            <Text style={styles.sectionMeta}>
              Son güncelleme {formatTime(order.updatedAt)}
            </Text>
          ) : null}
        </View>

        {hasOrderItems ? (
          orderItems.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.orderRow,
                index === orderItems.length - 1 ? styles.orderRowLast : null,
              ]}
            >
              <View style={styles.orderCopy}>
                <View style={styles.orderTitleRow}>
                  <Text style={styles.orderName}>{item.name}</Text>
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>{item.quantity}x</Text>
                  </View>
                </View>
                <Text style={styles.orderMeta}>
                  Birim Fiyat {formatCurrency(item.unitPrice)}
                </Text>
                {item.note ? (
                  <View style={styles.notePill}>
                    <Text style={styles.noteText}>Not: {item.note}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.orderAmount}>
                {formatCurrency(item.quantity * item.unitPrice)}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Henüz ürün eklenmedi</Text>
            <Text style={styles.emptyCopy}>
              Bu masa için siparişi başlatmak veya yeni ürün eklemek için ürün
              seçimine geçin.
            </Text>
          </View>
        )}
      </SurfaceCard>

      <SurfaceCard style={styles.totalCard} tone="brand">
        <Text style={styles.totalLabel}>Toplam</Text>
        <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
      </SurfaceCard>
    </Screen>
  );
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

const styles = StyleSheet.create({
  bottomActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  bottomButton: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  emptyCopy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  itemsCard: {
    marginBottom: spacing.md,
  },
  metaBlock: {
    flex: 1,
  },
  metaLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.lineHeight,
    marginBottom: spacing.xxs,
  },
  metaValue: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyStrong.fontWeight,
    lineHeight: typography.body.lineHeight,
  },
  missingCopy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  missingTitle: {
    color: colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    marginBottom: spacing.sm,
  },
  notePill: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceBrand,
    borderColor: colors.primary,
    borderRadius: radii.sm,
    borderWidth: 1,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  noteText: {
    color: colors.primaryContrast,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.lineHeight,
  },
  orderAmount: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.heading.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
    marginLeft: spacing.md,
    textAlign: "right",
  },
  orderCopy: {
    flex: 1,
  },
  orderMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.xs,
  },
  orderName: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
    paddingRight: spacing.sm,
  },
  orderRow: {
    borderBottomColor: colors.borderSoft,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingVertical: spacing.md,
  },
  orderRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  orderTitleRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  quantityBadge: {
    alignItems: "center",
    backgroundColor: colors.infoMuted,
    borderRadius: radii.pill,
    justifyContent: "center",
    minWidth: 38,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  quantityText: {
    color: colors.infoContrast,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.lineHeight,
  },
  sectionHeading: {
    borderBottomColor: colors.borderSoft,
    borderBottomWidth: 1,
    marginBottom: spacing.sm,
    paddingBottom: spacing.md,
  },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  summaryMeta: {
    flexDirection: "row",
    gap: spacing.md,
  },
  totalCard: {
    alignItems: "center",
    marginBottom: 0,
  },
  totalLabel: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.xs,
  },
  totalValue: {
    color: colors.primaryContrast,
    fontSize: typography.amountHero.fontSize,
    fontWeight: typography.amountHero.fontWeight,
    lineHeight: typography.amountHero.lineHeight,
  },
});
