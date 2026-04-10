import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BottomActionBar } from "../../../components/common/BottomActionBar";
import { Button } from "../../../components/common/Button";
import { Screen } from "../../../components/common/Screen";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
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
  typeof ROUTES.CONTACTLESS_PROMPT
>;

type ContactlessStatus = "waiting" | "processing" | "error";

const WAIT_TIMEOUT_MS = 12000;
const PROCESSING_DELAY_MS = 1200;

export function ContactlessPromptScreen({ navigation, route }: Props) {
  const { paymentIntentId, tableId } = route.params;
  useBillRealtimeSync(tableId);
  const [status, setStatus] = useState<ContactlessStatus>("waiting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const table = useAppStore((state) =>
    state.tables.find((candidate) => candidate.id === tableId),
  );
  const order = useAppStore((state) => state.ordersByTableId[tableId]);
  const paymentIntent = useAppStore((state) => state.paymentIntent);
  const clearPaymentIntent = useAppStore((state) => state.clearPaymentIntent);
  const appendSplitPayment = useAppStore((state) => state.appendSplitPayment);
  const upsertOrder = useAppStore((state) => state.upsertOrder);
  const upsertTable = useAppStore((state) => state.upsertTable);
  const updatePaymentIntentStatus = useAppStore(
    (state) => state.updatePaymentIntentStatus,
  );
  const paymentSummary = order ? getOrderPaymentSummary(order) : null;

  const payableAmount = paymentIntent?.amount ?? paymentSummary?.total ?? 0;
  const settledTotal = useMemo(
    () =>
      paymentIntent?.method === "split"
        ? paymentSummary?.total ?? order?.total ?? 0
        : payableAmount,
    [order?.total, payableAmount, paymentIntent?.method, paymentSummary?.total],
  );

  useEffect(() => {
    updatePaymentIntentStatus("awaitingContactless");

    if (status !== "waiting") {
      return;
    }

    const timer = setTimeout(() => {
      setStatus("error");
      setErrorMessage(
        "Temassız okuma zaman aşımına uğradı. Kartı yeniden okutun veya başka ödeme yöntemine dönün.",
      );
      updatePaymentIntentStatus("failed");
    }, WAIT_TIMEOUT_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [status, updatePaymentIntentStatus]);

  async function handleCardRead() {
    if (status === "processing") {
      return;
    }

    setStatus("processing");
    setErrorMessage(null);
    updatePaymentIntentStatus("awaitingContactless");

    try {
      await delay(PROCESSING_DELAY_MS);
      const receipt = await services.payments.confirmCardPayment({
        paymentIntentId,
      });

      if (paymentIntent?.method === "split") {
        appendSplitPayment(tableId, {
          amount: receipt.amount,
          id: `split-payment-card-${Date.now()}`,
          isCommitted: true,
          itemIds: [],
          method: "card",
          source: "amount",
        });
      }

      updatePaymentIntentStatus("completed");
      clearPaymentIntent();

      if (order) {
        upsertOrder({
          ...order,
          status: "paid",
          tax: paymentSummary?.serviceFee ?? order.tax,
          total: settledTotal,
          updatedAt: new Date().toISOString(),
        });
      }

      if (table && order) {
        upsertTable({
          ...table,
          status: "paid",
          totalAmount: settledTotal,
          updatedAt: new Date().toISOString(),
        });
      }

      navigation.replace(ROUTES.PAYMENT_SUCCESS, {
        amount: receipt.amount,
        method: paymentIntent?.method === "split" ? "split" : "card",
        receiptId: receipt.receiptId,
        tableId,
      });
    } catch {
      setStatus("error");
      setErrorMessage(
        "POS cihazı banka onayı alamadı. Kartı tekrar okutun veya başka ödeme yöntemini seçin.",
      );
      updatePaymentIntentStatus("failed");
    }
  }

  function handleRetry() {
    setStatus("waiting");
    setErrorMessage(null);
    updatePaymentIntentStatus("awaitingContactless");
  }

  function handleCancel() {
    updatePaymentIntentStatus("cancelled");
    clearPaymentIntent();

    if (paymentIntent?.method === "split") {
      navigation.replace(ROUTES.SPLIT_PAYMENT, { tableId });
      return;
    }

    navigation.replace(ROUTES.PAYMENT, { tableId });
  }

  const helperTone = status === "error" ? "danger" : "info";
  const helperCopy =
    status === "processing"
      ? "Kart bilgileri okunuyor. POS cihazı banka onayını bekliyor."
      : status === "error"
        ? errorMessage ??
          "İşlem tamamlanamadı. Yeniden deneyin veya başka ödeme yöntemini seçin."
        : "Kartınızı POS cihazına yaklaştırın. İşlem otomatik olarak başlayacaktır.";

  return (
    <Screen
      contentContainerStyle={styles.content}
      footer={
        <BottomActionBar style={styles.footer}>
          {status === "processing" ? (
            <Button disabled title="Banka Onayı Bekleniyor" />
          ) : status === "error" ? (
            <>
              <Button
                fullWidth={false}
                onPress={handleCancel}
                style={styles.secondaryAction}
                title="Başka Yöntem"
                variant="secondary"
              />
              <Button
                fullWidth={false}
                onPress={handleRetry}
                style={styles.primaryAction}
                title="Tekrar Dene"
              />
            </>
          ) : (
            <>
              <Button
                fullWidth={false}
                onPress={handleCancel}
                style={styles.secondaryAction}
                title="İptal"
                variant="secondary"
              />
              <Button
                fullWidth={false}
                onPress={handleCardRead}
                style={styles.primaryAction}
                title="Kart Okutuldu"
              />
            </>
          )}
        </BottomActionBar>
      }
      scroll={false}
    >
      <SectionHeader
        align="center"
        leading={<BackButton onPress={handleCancel} />}
        subtitle={table ? formatTableLabel(table.label) : tableId}
        title="Kart Ödeme"
      />

      <View style={styles.main}>
        <View style={styles.heroHalo}>
          <View style={styles.heroBadge}>
            <CardIcon />
          </View>
        </View>

        <Text style={styles.title}>Temassız kart okutun</Text>
        <Text style={styles.subtitle}>
          Kartınızı POS cihazına yaklaştırın veya yerleştirin.
        </Text>

        <SurfaceCard elevated style={styles.amountCard}>
          <Text style={styles.amountLabel}>Ödenecek Tutar</Text>
          <Text style={styles.amountValue}>{formatCurrency(payableAmount)}</Text>
        </SurfaceCard>

        <View style={styles.contactlessRow}>
          <ContactlessIcon />
          <Text style={styles.contactlessLabel}>Temassız Ödeme</Text>
        </View>

        <SurfaceCard style={styles.helperCard} tone={helperTone}>
          <Text
            style={[
              styles.helperCopy,
              status === "error" ? styles.helperCopyError : null,
            ]}
          >
            {helperCopy}
          </Text>
        </SurfaceCard>

        {status === "processing" ? (
          <View style={styles.processingRow}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={styles.processingLabel}>İşlem devam ediyor</Text>
          </View>
        ) : null}

        <SurfaceCard style={styles.providerCard}>
          <Text style={styles.providerCopy}>
            İşlem güvenli POS sistemi üzerinden gerçekleştirilmektedir.
          </Text>
        </SurfaceCard>
      </View>
    </Screen>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Kart ödemesini iptal et"
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
    <View style={styles.iconFrame}>
      <View style={styles.cardOutline} />
      <View style={styles.cardStripe} />
    </View>
  );
}

function ContactlessIcon() {
  return (
    <View style={styles.contactlessIcon}>
      <View style={[styles.contactlessWave, styles.contactlessWaveOne]} />
      <View style={[styles.contactlessWave, styles.contactlessWaveTwo]} />
      <View style={[styles.contactlessWave, styles.contactlessWaveThree]} />
    </View>
  );
}

function delay(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

const styles = StyleSheet.create({
  amountCard: {
    alignItems: "center",
    borderColor: colors.infoMuted,
    borderWidth: 1.5,
    marginBottom: spacing.lg,
    minWidth: 236,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  amountLabel: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.xs,
  },
  amountValue: {
    color: colors.textPrimary,
    fontSize: typography.amountHero.fontSize,
    fontWeight: typography.amountHero.fontWeight,
    lineHeight: typography.amountHero.lineHeight,
  },
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
    borderRadius: 6,
    borderWidth: 2.8,
    height: 28,
    width: 40,
  },
  cardStripe: {
    backgroundColor: colors.info,
    borderRadius: radii.pill,
    height: 3,
    position: "absolute",
    top: 12,
    width: 40,
  },
  contactlessIcon: {
    height: 18,
    marginRight: spacing.xs,
    position: "relative",
    width: 18,
  },
  contactlessLabel: {
    color: colors.info,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
  },
  contactlessRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  contactlessWave: {
    borderColor: colors.info,
    borderLeftWidth: 2.2,
    borderRadius: radii.pill,
    height: 10,
    position: "absolute",
    top: 4,
  },
  contactlessWaveOne: {
    left: 2,
    width: 4,
  },
  contactlessWaveThree: {
    left: 10,
    width: 6,
  },
  contactlessWaveTwo: {
    left: 6,
    width: 5,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  helperCard: {
    marginBottom: spacing.lg,
    minWidth: "100%",
  },
  helperCopy: {
    color: colors.infoContrast,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    textAlign: "center",
  },
  helperCopyError: {
    color: colors.dangerContrast,
  },
  heroBadge: {
    alignItems: "center",
    backgroundColor: "#C0D6FF",
    borderRadius: radii.pill,
    height: 112,
    justifyContent: "center",
    width: 112,
  },
  heroHalo: {
    alignItems: "center",
    backgroundColor: "rgba(220,232,255,0.46)",
    borderRadius: radii.pill,
    height: 220,
    justifyContent: "center",
    marginBottom: spacing.md,
    width: 220,
  },
  iconFrame: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    position: "relative",
    width: 44,
  },
  main: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingBottom: spacing.lg,
  },
  navButtonPressed: {
    opacity: 0.88,
  },
  primaryAction: {
    flex: 1,
  },
  processingLabel: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    marginLeft: spacing.sm,
  },
  processingRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  providerCard: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderSoft,
    marginBottom: 0,
    minWidth: "100%",
    paddingVertical: spacing.md,
  },
  providerCopy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    textAlign: "center",
  },
  secondaryAction: {
    flex: 1,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    lineHeight: typography.title.lineHeight,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
});
