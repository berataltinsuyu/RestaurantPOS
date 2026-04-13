import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getBackendErrorMessage } from "../../../api/http/api-client";
import { BottomActionBar } from "../../../components/common/BottomActionBar";
import { Button } from "../../../components/common/Button";
import { InfoRow } from "../../../components/common/InfoRow";
import { Screen } from "../../../components/common/Screen";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
import { PaymentMethodCard } from "../../../components/payments/PaymentMethodCard";
import {
  formatCurrency,
  formatTableLabel,
  getOrderPaymentSummary,
} from "../../../constants/formatters";
import { useBillRealtimeSync } from "../../../hooks/useBillRealtimeSync";
import { ROUTES } from "../../../constants/routes";
import { RootStackParamList } from "../../../navigation/types";
import { services } from "../../../services/composition-root";
import { useAppStore } from "../../../state/app-store";
import {
  colors,
  radii,
  spacing,
  typography,
} from "../../../theme";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.PAYMENT
>;

type PaymentSelection = "card" | "cash" | "split";

export function PaymentScreen({ navigation, route }: Props) {
  const { tableId } = route.params;
  useBillRealtimeSync(tableId);
  const paymentSubmitLockRef = useRef(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentSelection>("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const table = useAppStore((state) =>
    state.tables.find((candidate) => candidate.id === tableId),
  );
  const order = useAppStore((state) => state.ordersByTableId[tableId]);
  const setPaymentIntent = useAppStore((state) => state.setPaymentIntent);
  const clearPaymentIntent = useAppStore((state) => state.clearPaymentIntent);
  const clearSplitPayments = useAppStore((state) => state.clearSplitPayments);

  const paymentSummary = useMemo(
    () => (order ? getOrderPaymentSummary(order) : null),
    [order],
  );
  const collectibleAmount = order?.remainingAmount ?? paymentSummary?.total ?? 0;

  if (!table || !order || !paymentSummary) {
    return (
      <Screen>
        <SurfaceCard>
          <Text style={styles.copy}>
            Ödeme ekranı için masa ve sipariş bilgisi gereklidir.
          </Text>
        </SurfaceCard>
      </Screen>
    );
  }

  const currentTable = table;
  const currentOrder = order;
  const currentPaymentSummary = paymentSummary;
  const currentCollectibleAmount = collectibleAmount;

  async function handleCardPayment() {
    clearPaymentIntent();
    clearSplitPayments(tableId);
    const intent = await services.payments.startPayment({
      amount: currentCollectibleAmount,
      method: "card",
      orderId: currentOrder.id,
      tableId,
    });
    setPaymentIntent(intent);
    navigation.replace(ROUTES.CARD_POS_REDIRECT, {
      paymentIntentId: intent.id,
      tableId,
    });
  }

  async function handleCashPayment() {
    clearSplitPayments(tableId);
    const receipt = await services.payments.confirmCashPayment({
      amount: currentCollectibleAmount,
      orderId: currentOrder.id,
      tableId,
    });
    await services.sync.refreshAfterMutation(tableId);

    navigation.replace(ROUTES.PAYMENT_SUCCESS, {
      amount: receipt.amount,
      method: "cash",
      receiptId: receipt.receiptId,
      tableId,
    });
  }

  async function handlePrimaryAction() {
    if (paymentSubmitLockRef.current) {
      console.info("[PaymentScreen] Duplicate payment submit prevented.", {
        method: selectedMethod,
        tableId,
      });
      return;
    }

    paymentSubmitLockRef.current = true;
    setIsSubmitting(true);
    console.info("[PaymentScreen] Payment submit started.", {
      amount: currentCollectibleAmount,
      method: selectedMethod,
      orderId: currentOrder.id,
      tableId,
    });

    let completed = false;

    try {
      if (selectedMethod === "card") {
        await handleCardPayment();
        completed = true;
        return;
      }

      if (selectedMethod === "cash") {
        await handleCashPayment();
        completed = true;
        return;
      }

      navigation.navigate(ROUTES.SPLIT_PAYMENT, { tableId: currentTable.id });
      completed = true;
    } catch (error) {
      console.error("[PaymentScreen] Payment action failed.", error);
      const detail = getBackendErrorMessage(
        error,
        "İşlem backend üzerinde tamamlanamadı. Lütfen tekrar deneyin.",
      );
      Alert.alert(
        "Ödeme başlatılamadı",
        detail,
      );
    } finally {
      console.info("[PaymentScreen] Payment submit finished.", {
        completed,
        method: selectedMethod,
        tableId,
      });

      if (!completed) {
        paymentSubmitLockRef.current = false;
        setIsSubmitting(false);
      }
    }
  }

  return (
    <Screen
      contentContainerStyle={styles.content}
      footer={
        <BottomActionBar>
          <Button
            disabled={collectibleAmount <= 0 || isSubmitting}
            onPress={handlePrimaryAction}
            title={`${formatCurrency(currentCollectibleAmount)} Tahsil Et`}
          />
        </BottomActionBar>
      }
    >
      <SurfaceCard elevated style={styles.summaryCard}>
        <Text style={styles.tableLabel}>{formatTableLabel(currentTable.label)}</Text>
        <Text style={styles.sectionTitle}>Sipariş Özeti</Text>
        <InfoRow
          label="Ara Toplam"
          style={styles.summaryRow}
          value={formatCurrency(currentPaymentSummary.subtotal)}
        />
        <InfoRow
          label="Servis Bedeli (%10)"
          style={styles.summaryRow}
          value={formatCurrency(currentPaymentSummary.serviceFee)}
        />
        <InfoRow
          emphasized
          label="Toplam"
          style={styles.summaryRowLast}
          value={formatCurrency(currentPaymentSummary.total)}
        />
      </SurfaceCard>

      <View style={styles.methodsSection}>
        <Text style={styles.methodsTitle}>Ödeme Yöntemi</Text>

        <PaymentMethodCard
          icon={<CardIcon />}
          onPress={() => setSelectedMethod("card")}
          selected={selectedMethod === "card"}
          subtitle="POS cihazı ile"
          title="Kart ile Ödeme"
          tone="info"
        />
        <PaymentMethodCard
          icon={<CashIcon />}
          onPress={() => setSelectedMethod("cash")}
          selected={selectedMethod === "cash"}
          subtitle="Direkt nakit tahsilat"
          title="Nakit Ödeme"
          tone="success"
        />
        <PaymentMethodCard
          icon={<SplitIcon />}
          onPress={() => setSelectedMethod("split")}
          selected={selectedMethod === "split"}
          subtitle="Farklı yöntemlerle ödeme al"
          title="Bölünmüş Ödeme"
          tone="purple"
        />
      </View>

    </Screen>
  );
}

function CardIcon() {
  return (
    <View style={styles.methodIconFrame}>
      <View style={styles.cardOutline} />
      <View style={styles.cardStripe} />
    </View>
  );
}

function CashIcon() {
  return (
    <View style={styles.methodIconFrame}>
      <View style={styles.cashOutline} />
      <View style={styles.cashDot} />
      <View style={styles.cashLine} />
    </View>
  );
}

function SplitIcon() {
  return (
    <View style={styles.methodIconFrame}>
      <View style={[styles.splitNode, styles.splitNodeLeft]} />
      <View style={[styles.splitNode, styles.splitNodeTop]} />
      <View style={[styles.splitNode, styles.splitNodeBottom]} />
      <View style={[styles.splitLine, styles.splitLineVertical]} />
      <View style={[styles.splitLine, styles.splitLineTop]} />
      <View style={[styles.splitLine, styles.splitLineBottom]} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardOutline: {
    borderColor: colors.info,
    borderRadius: 4,
    borderWidth: 2,
    height: 14,
    width: 20,
  },
  cardStripe: {
    backgroundColor: colors.info,
    height: 2,
    position: "absolute",
    top: 8,
    width: 20,
  },
  cashDot: {
    backgroundColor: colors.success,
    borderRadius: radii.pill,
    height: 4,
    left: 4,
    position: "absolute",
    top: 8,
    width: 4,
  },
  cashLine: {
    backgroundColor: colors.success,
    borderRadius: radii.pill,
    height: 2,
    position: "absolute",
    right: 4,
    top: 9,
    width: 6,
  },
  cashOutline: {
    borderColor: colors.success,
    borderRadius: 4,
    borderWidth: 2,
    height: 14,
    width: 20,
  },
  content: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  copy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  methodIconFrame: {
    alignItems: "center",
    height: 20,
    justifyContent: "center",
    position: "relative",
    width: 20,
  },
  methodsSection: {
    marginTop: 0,
  },
  methodsTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
    marginBottom: spacing.md,
  },
  tableLabel: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyStrong.fontWeight,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.sm,
  },
  splitLine: {
    backgroundColor: colors.purple,
    borderRadius: radii.pill,
    position: "absolute",
  },
  splitLineBottom: {
    height: 2,
    right: 6,
    top: 13,
    width: 8,
  },
  splitLineTop: {
    height: 2,
    right: 6,
    top: 5,
    width: 8,
  },
  splitLineVertical: {
    height: 10,
    left: 5,
    top: 5,
    width: 2,
  },
  splitNode: {
    borderColor: colors.purple,
    borderRadius: radii.pill,
    borderWidth: 2,
    height: 6,
    position: "absolute",
    width: 6,
  },
  splitNodeBottom: {
    right: 1,
    top: 11,
  },
  splitNodeLeft: {
    left: 1,
    top: 7,
  },
  splitNodeTop: {
    right: 1,
    top: 3,
  },
  summaryCard: {
    marginBottom: 0,
    paddingBottom: spacing.md,
  },
  summaryRow: {
    marginBottom: spacing.sm,
  },
  summaryRowLast: {
    marginBottom: 0,
  },
});
