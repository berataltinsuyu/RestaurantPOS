import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BottomActionBar } from "../../../components/common/BottomActionBar";
import { Button } from "../../../components/common/Button";
import { Screen } from "../../../components/common/Screen";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
import {
  formatCurrency,
  getOrderPaymentSummary,
} from "../../../constants/formatters";
import { ROUTES } from "../../../constants/routes";
import { RootStackParamList } from "../../../navigation/types";
import { useAppStore } from "../../../state/app-store";
import {
  colors,
  radii,
  spacing,
  typography,
} from "../../../theme";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.PAYMENT_SUCCESS
>;

export function PaymentSuccessScreen({ navigation, route }: Props) {
  const { amount, method, receiptId, tableId } = route.params;
  const order = useAppStore((state) => state.ordersByTableId[tableId]);
  const splitEntries = useAppStore(
    (state) => state.splitPaymentsByTableId[tableId] ?? [],
  );
  const paymentSummary = order ? getOrderPaymentSummary(order) : null;
  const settledAmount = amount ?? paymentSummary?.total ?? order?.total ?? 0;
  const checklistItems = buildChecklistItems(method, splitEntries.length);

  return (
    <Screen
      contentContainerStyle={styles.content}
      footer={
        <BottomActionBar style={styles.footer}>
          <Button
            fullWidth={false}
            onPress={() => navigation.navigate(ROUTES.TABLES_OVERVIEW)}
            style={styles.secondaryAction}
            title="Masa Planı"
            variant="secondary"
          />
          <Button
            fullWidth={false}
            onPress={() => navigation.navigate(ROUTES.TABLE_DETAIL, { tableId })}
            style={styles.primaryAction}
            title="Masa Detayı"
          />
        </BottomActionBar>
      }
      scroll={false}
    >
      <View style={styles.main}>
        <View style={styles.heroHalo}>
          <SuccessOutlineIcon />
        </View>

        <Text style={styles.title}>Ödeme Başarılı</Text>
        <Text style={styles.subtitle}>Tahsilat tamamlandı</Text>

        <View style={styles.successBadgeWrap}>
          <View style={styles.successBadge}>
            <SuccessSolidIcon />
          </View>
        </View>

        <SurfaceCard style={styles.amountCard} tone="success">
          <Text style={styles.amountLabel}>Ödenen Tutar</Text>
          <Text style={styles.amountValue}>{formatCurrency(settledAmount)}</Text>
        </SurfaceCard>

        <SurfaceCard style={styles.checklistCard} tone="success">
          {checklistItems.map((item) => (
            <View key={item} style={styles.checklistRow}>
              <View style={styles.checkDot} />
              <Text style={styles.checklistText}>{item}</Text>
            </View>
          ))}
          {receiptId ? (
            <Text style={styles.receiptText}>İşlem No: {receiptId}</Text>
          ) : null}
        </SurfaceCard>

        <Text style={styles.footerCopy}>
          Masa akışına devam etmek için bir sonraki ekranı seçin.
        </Text>
      </View>
    </Screen>
  );
}

function buildChecklistItems(
  method: Props["route"]["params"]["method"],
  splitEntryCount: number,
) {
  if (method === "cash") {
    return [
      "Nakit tahsilat kaydedildi",
      "Sipariş kapatıldı",
      "İşlem tamamlandı",
    ];
  }

  if (method === "split") {
    return [
      "Kart bilgileri okundu",
      splitEntryCount > 0
        ? `${splitEntryCount} ödeme girişi güncellendi`
        : "Bölünmüş ödeme kaydı güncellendi",
      "İşlem tamamlandı",
    ];
  }

  return [
    "Kart bilgileri okundu",
    "Banka onayı alındı",
    "İşlem tamamlandı",
  ];
}

function SuccessOutlineIcon() {
  return (
    <View style={styles.outlineIconFrame}>
      <View style={styles.outlineRing} />
      <View style={[styles.checkStem, styles.checkStemShort]} />
      <View style={[styles.checkStem, styles.checkStemLong]} />
    </View>
  );
}

function SuccessSolidIcon() {
  return (
    <View style={styles.solidIconFrame}>
      <View style={[styles.solidCheckStem, styles.solidCheckStemShort]} />
      <View style={[styles.solidCheckStem, styles.solidCheckStemLong]} />
    </View>
  );
}

const styles = StyleSheet.create({
  amountCard: {
    alignItems: "center",
    borderColor: colors.success,
    borderWidth: 1.5,
    marginBottom: spacing.lg,
    minWidth: "100%",
  },
  amountLabel: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.xs,
  },
  amountValue: {
    color: colors.successContrast,
    fontSize: typography.amountHero.fontSize,
    fontWeight: typography.amountHero.fontWeight,
    lineHeight: typography.amountHero.lineHeight,
  },
  checkDot: {
    backgroundColor: colors.success,
    borderRadius: radii.pill,
    height: 8,
    marginRight: spacing.sm,
    marginTop: 7,
    width: 8,
  },
  checkStem: {
    backgroundColor: colors.success,
    borderRadius: radii.pill,
    position: "absolute",
  },
  checkStemLong: {
    height: 4,
    left: 28,
    top: 31,
    transform: [{ rotate: "-45deg" }],
    width: 24,
  },
  checkStemShort: {
    height: 4,
    left: 17,
    top: 36,
    transform: [{ rotate: "45deg" }],
    width: 12,
  },
  checklistCard: {
    minWidth: "100%",
  },
  checklistRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  checklistText: {
    color: colors.successContrast,
    flex: 1,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
  },
  content: {
    paddingBottom: spacing.lg,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  footerCopy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    textAlign: "center",
  },
  heroHalo: {
    alignItems: "center",
    backgroundColor: colors.successMuted,
    borderRadius: radii.pill,
    height: 112,
    justifyContent: "center",
    marginBottom: spacing.xl,
    width: 112,
  },
  main: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  outlineIconFrame: {
    alignItems: "center",
    height: 56,
    justifyContent: "center",
    position: "relative",
    width: 56,
  },
  outlineRing: {
    borderColor: colors.success,
    borderRadius: radii.pill,
    borderWidth: 3,
    height: 44,
    width: 44,
  },
  primaryAction: {
    flex: 1,
  },
  receiptText: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.xs,
  },
  secondaryAction: {
    flex: 1,
  },
  solidCheckStem: {
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    position: "absolute",
  },
  solidCheckStemLong: {
    height: 4,
    left: 16,
    top: 20,
    transform: [{ rotate: "-45deg" }],
    width: 14,
  },
  solidCheckStemShort: {
    height: 4,
    left: 10,
    top: 23,
    transform: [{ rotate: "45deg" }],
    width: 8,
  },
  solidIconFrame: {
    backgroundColor: colors.success,
    borderRadius: radii.pill,
    height: 40,
    position: "relative",
    width: 40,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
    marginBottom: spacing.xl,
  },
  successBadge: {
    alignItems: "center",
    backgroundColor: colors.success,
    borderRadius: radii.pill,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  successBadgeWrap: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    lineHeight: typography.title.lineHeight,
    marginBottom: spacing.xs,
  },
});
