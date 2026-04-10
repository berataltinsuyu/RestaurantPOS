import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BottomActionBar } from "../../../components/common/BottomActionBar";
import { Button } from "../../../components/common/Button";
import { InfoRow } from "../../../components/common/InfoRow";
import { Screen } from "../../../components/common/Screen";
import { SectionHeader } from "../../../components/common/SectionHeader";
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
  const [selectedMethod, setSelectedMethod] = useState<PaymentSelection>("card");
  const table = useAppStore((state) =>
    state.tables.find((candidate) => candidate.id === tableId),
  );
  const order = useAppStore((state) => state.ordersByTableId[tableId]);
  const setPaymentIntent = useAppStore((state) => state.setPaymentIntent);
  const clearPaymentIntent = useAppStore((state) => state.clearPaymentIntent);
  const clearSplitPayments = useAppStore((state) => state.clearSplitPayments);
  const upsertOrder = useAppStore((state) => state.upsertOrder);
  const upsertTable = useAppStore((state) => state.upsertTable);

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
            Payment requires both table and order context.
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

    upsertOrder({
      ...currentOrder,
      status: "paid",
      tax: currentPaymentSummary.serviceFee,
      total: currentPaymentSummary.total,
      updatedAt: new Date().toISOString(),
    });
    upsertTable({
      ...currentTable,
      status: "paid",
      totalAmount: currentPaymentSummary.total,
      updatedAt: new Date().toISOString(),
    });

    navigation.replace(ROUTES.PAYMENT_SUCCESS, {
      amount: receipt.amount,
      method: "cash",
      receiptId: receipt.receiptId,
      tableId,
    });
  }

  async function handlePrimaryAction() {
    if (selectedMethod === "card") {
      await handleCardPayment();
      return;
    }

    if (selectedMethod === "cash") {
      await handleCashPayment();
      return;
    }

    navigation.navigate(ROUTES.SPLIT_PAYMENT, { tableId: currentTable.id });
  }

  return (
    <Screen
      contentContainerStyle={styles.content}
      footer={
        <BottomActionBar>
          <Button
            disabled={collectibleAmount <= 0}
            onPress={handlePrimaryAction}
            title={`${formatCurrency(currentCollectibleAmount)} Tahsil Et`}
          />
        </BottomActionBar>
      }
    >
      <SectionHeader
        align="center"
        leading={
          <BackButton onPress={() => navigation.goBack()} />
        }
        subtitle={formatTableLabel(currentTable.label)}
        title="Ödeme"
      />

      <SurfaceCard elevated style={styles.summaryCard}>
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

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Ödemeden geri dön"
      accessibilityRole="button"
      android_ripple={{ color: "rgba(39,48,67,0.06)", radius: 20 }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.backButton,
        pressed ? styles.navButtonPressed : null,
      ]}
    >
      <View style={styles.backArrowStem} />
      <View style={[styles.backArrowHead, styles.backArrowHeadTop]} />
      <View style={[styles.backArrowHead, styles.backArrowHeadBottom]} />
    </Pressable>
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
  backArrowHead: {
    borderColor: colors.textPrimary,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    height: 8,
    left: 8,
    position: "absolute",
    width: 8,
  },
  backArrowHeadBottom: {
    top: 14,
    transform: [{ rotate: "-45deg" }],
  },
  backArrowHeadTop: {
    top: 8,
    transform: [{ rotate: "-135deg" }],
  },
  backArrowStem: {
    backgroundColor: colors.textPrimary,
    borderRadius: radii.pill,
    height: 2,
    left: 10,
    position: "absolute",
    top: 16,
    width: 12,
  },
  backButton: {
    borderRadius: radii.pill,
    height: 32,
    position: "relative",
    width: 32,
  },
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
    gap: spacing.lg,
    paddingTop: spacing.sm,
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
    marginTop: spacing.xs,
  },
  methodsTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: typography.heading.fontWeight,
    lineHeight: 28,
    marginBottom: spacing.md,
  },
  navButtonPressed: {
    opacity: 0.9,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: typography.heading.fontWeight,
    lineHeight: 24,
    marginBottom: spacing.md,
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
