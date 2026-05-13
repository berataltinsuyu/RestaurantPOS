import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getBackendErrorMessage } from "../../../api/http/api-client";
import { BottomActionBar } from "../../../components/common/BottomActionBar";
import { Button } from "../../../components/common/Button";
import { FeedbackBanner } from "../../../components/common/FeedbackBanner";
import { Screen } from "../../../components/common/Screen";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { StatusChip } from "../../../components/common/StatusChip";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
import {
  formatCurrency,
  formatOrderLineStatus,
} from "../../../constants/formatters";
import { ROUTES } from "../../../constants/routes";
import { useBillRealtimeSync } from "../../../hooks/useBillRealtimeSync";
import { RootStackParamList } from "../../../navigation/types";
import { services } from "../../../services/composition-root";
import { useAppStore } from "../../../state/app-store";
import { colors, spacing, typography } from "../../../theme";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.ORDER_DETAIL
>;
type FeedbackState = { tone: "success" | "error" | "info"; message: string } | null;

export function OrderDetailScreen({ navigation, route }: Props) {
  const { tableId } = route.params;
  useBillRealtimeSync(tableId);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isClosingEmptyBill, setIsClosingEmptyBill] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const table = useAppStore((state) =>
    state.tables.find((candidate) => candidate.id === tableId),
  );
  const order = useAppStore((state) => state.ordersByTableId[tableId]);
  const clearOrderByTableId = useAppStore((state) => state.clearOrderByTableId);
  const clearPaymentsForBill = useAppStore((state) => state.clearPaymentsForBill);
  const clearSplitPayments = useAppStore((state) => state.clearSplitPayments);
  const upsertTable = useAppStore((state) => state.upsertTable);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }

      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);

  if (!table) {
    return (
      <Screen>
        <SurfaceCard>
          <Text style={styles.emptyCopy}>Masa bilgisi bulunamadı.</Text>
        </SurfaceCard>
      </Screen>
    );
  }

  const currentTable = table;
  const orderItems = order?.items ?? [];
  const canCloseEmptyBill = Boolean(currentTable.activeOrderId || order?.dbId) &&
    currentTable.status !== "empty" &&
    (orderItems.length === 0 || (order?.total ?? currentTable.totalAmount) <= 0) &&
    (order?.paidAmount ?? 0) <= 0;

  function showFeedback(nextFeedback: FeedbackState) {
    setFeedback(nextFeedback);

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }

    if (nextFeedback) {
      feedbackTimerRef.current = setTimeout(() => {
        setFeedback(null);
      }, 3200);
    }
  }

  async function closeEmptyBill() {
    setIsClosingEmptyBill(true);

    try {
      const updatedTable = await services.tables.closeEmptyBill(currentTable.id);
      const billIdToClear = order?.dbId ?? Number(currentTable.activeOrderId);

      upsertTable(updatedTable);
      clearOrderByTableId(currentTable.id);
      clearSplitPayments(currentTable.id);
      if (Number.isFinite(billIdToClear)) {
        clearPaymentsForBill(billIdToClear);
      }

      try {
        await services.sync.refreshAfterMutation(currentTable.id);
      } catch (refreshError) {
        console.error("[OrderDetailScreen] Post-close refresh failed after successful empty bill close.", refreshError);
      }

      showFeedback({
        message: "Boş adisyon kapatıldı. Masa tekrar boş duruma alındı.",
        tone: "success",
      });
      navigationTimerRef.current = setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: ROUTES.TABLES_OVERVIEW }],
        });
      }, 600);
    } catch (error) {
      console.error("[OrderDetailScreen] Close empty bill failed.", {
        activeOrderId: currentTable.activeOrderId ?? null,
        error,
        tableId: currentTable.id,
      });
      showFeedback({
        message: getBackendErrorMessage(error, "Boş adisyon kapatılamadı."),
        tone: "error",
      });
    } finally {
      setIsClosingEmptyBill(false);
    }
  }

  function confirmCloseEmptyBill() {
    Alert.alert(
      "Boş Adisyonu Kapat",
      "Bu işlem adisyonu ödeme almadan iptal eder ve masayı boş duruma alır.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          onPress: () => void closeEmptyBill(),
          style: "destructive",
          text: "Kapat",
        },
      ],
    );
  }

  return (
    <Screen
      footer={
        <BottomActionBar style={styles.bottomActions}>
          <Button
            fullWidth={false}
            onPress={() =>
              navigation.navigate(ROUTES.MENU_SELECTION, { tableId: table.id })
            }
            size="md"
            style={styles.bottomButton}
            title="Ürün Ekle"
            variant="secondary"
          />
          {canCloseEmptyBill ? (
            <Button
              disabled={isClosingEmptyBill}
              fullWidth={false}
              onPress={confirmCloseEmptyBill}
              size="md"
              style={styles.bottomButton}
              title="Boş Adisyonu Kapat"
              variant="secondary"
            />
          ) : (
            <Button
              disabled={!order}
              fullWidth={false}
              onPress={() =>
                navigation.navigate(ROUTES.PAYMENT, { tableId: table.id })
              }
              size="md"
              style={styles.bottomButton}
              title="Ödemeye Geç"
            />
          )}
        </BottomActionBar>
      }
    >
      {feedback ? (
        <FeedbackBanner
          message={feedback.message}
          onDismiss={() => showFeedback(null)}
          style={styles.feedbackBanner}
          tone={feedback.tone}
        />
      ) : null}

      <SectionHeader
        eyebrow="Sipariş Detayı"
        right={
          order ? <StatusChip label={order.status} status={order.status} /> : null
        }
        subtitle="Siparişi gözden geçirin, ürün ekleyin ve ödeme adımına geçin."
        title={table.label}
      />

      <SurfaceCard elevated>
        <Text style={styles.sectionTitle}>Sipariş Kalemleri</Text>
        {orderItems.length ? (
          orderItems.map((item) => (
            <View key={item.id} style={styles.orderRow}>
              <View style={styles.orderTextBlock}>
                <Text style={styles.orderName}>{item.name}</Text>
                <Text style={styles.orderMeta}>
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                  {formatOrderLineStatus(item.status)
                    ? ` • ${formatOrderLineStatus(item.status)}`
                    : ""}
                </Text>
              </View>
              <Text style={styles.orderValue}>
                {formatCurrency(item.quantity * item.unitPrice)}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Henüz ürün eklenmedi</Text>
            <Text style={styles.emptyCopy}>
              Bu masa açıldı ancak adisyona ürün eklenmedi. Ürün ekleyebilir
              veya boş adisyonu kapatabilirsiniz.
            </Text>
            <View style={styles.emptyActions}>
              <Button
                fullWidth={false}
                onPress={() =>
                  navigation.navigate(ROUTES.MENU_SELECTION, { tableId: table.id })
                }
                size="md"
                title="Ürün Ekle"
              />
              {canCloseEmptyBill ? (
                <Button
                  disabled={isClosingEmptyBill}
                  fullWidth={false}
                  onPress={confirmCloseEmptyBill}
                  size="md"
                  title="Boş Adisyonu Kapat"
                  variant="secondary"
                />
              ) : null}
            </View>
          </View>
        )}
      </SurfaceCard>

      <SurfaceCard tone="brand">
        <Text style={styles.sectionTitle}>İşlem Notu</Text>
        <Text style={styles.emptyCopy}>
          Bölünmüş ödeme ve son düzenleme işlemleri bu sipariş üzerinden devam
          eder. Sipariş bağlamı bu ekranda korunur.
        </Text>
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bottomActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  bottomButton: {
    flex: 1,
  },
  emptyCopy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    textAlign: "center",
  },
  emptyActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
    marginTop: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  feedbackBanner: {
    marginBottom: spacing.sm,
  },
  orderMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
  orderName: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyStrong.fontWeight,
  },
  orderRow: {
    alignItems: "center",
    borderBottomColor: colors.borderSoft,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  orderTextBlock: {
    flex: 1,
    paddingRight: spacing.md,
  },
  orderValue: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyStrong.fontWeight,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    marginBottom: spacing.md,
  },
});
