import React, { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Screen } from "../../../components/common/Screen";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
import {
  formatCurrency,
  formatTableLabel,
} from "../../../constants/formatters";
import { useBillRealtimeSync } from "../../../hooks/useBillRealtimeSync";
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
  typeof ROUTES.CARD_POS_REDIRECT
>;

const REDIRECT_DELAY_MS = 1600;

export function CardPosRedirectScreen({ navigation, route }: Props) {
  const { paymentIntentId, tableId } = route.params;
  useBillRealtimeSync(tableId);
  const table = useAppStore((state) =>
    state.tables.find((candidate) => candidate.id === tableId),
  );
  const paymentIntent = useAppStore((state) => state.paymentIntent);
  const updatePaymentIntentStatus = useAppStore(
    (state) => state.updatePaymentIntentStatus,
  );

  useEffect(() => {
    updatePaymentIntentStatus("redirectingToPos");

    const timer = setTimeout(() => {
      updatePaymentIntentStatus("awaitingContactless");
      navigation.replace(ROUTES.CONTACTLESS_PROMPT, {
        paymentIntentId,
        tableId,
      });
    }, REDIRECT_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [
    navigation,
    paymentIntentId,
    tableId,
    updatePaymentIntentStatus,
  ]);

  return (
    <Screen contentContainerStyle={styles.content} scroll={false}>
      <View style={styles.main}>
        <View style={styles.heroBadge}>
          <PosDeviceIcon />
        </View>

        <View style={styles.copyBlock}>
          <Text style={styles.title}>POS cihazına bağlanıyor</Text>
          <Text style={styles.subtitle}>
            Lütfen bekleyin, ödeme işlemi başlatılıyor.
          </Text>
        </View>

        <ActivityIndicator color={colors.primary} size="large" />

        <SurfaceCard elevated style={styles.amountCard}>
          <Text style={styles.amountLabel}>Toplam Tutar</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(paymentIntent?.amount ?? 0)}
          </Text>
          <Text style={styles.amountMeta}>
            {table ? formatTableLabel(table.label) : tableId}
          </Text>
        </SurfaceCard>

        <SurfaceCard style={styles.infoCard} tone="info">
          <Text style={styles.infoCopy}>
            POS cihazı hazırlanıyor. İşlem otomatik olarak devam edecektir.
          </Text>
        </SurfaceCard>
      </View>
    </Screen>
  );
}

function PosDeviceIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={styles.iconBody} />
      <View style={styles.iconScreen} />
      <View style={styles.iconButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  amountCard: {
    alignItems: "center",
    marginBottom: spacing.lg,
    minWidth: "100%",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  amountLabel: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.xs,
  },
  amountMeta: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.xs,
  },
  amountValue: {
    color: colors.textPrimary,
    fontSize: typography.amountHero.fontSize,
    fontWeight: typography.amountHero.fontWeight,
    lineHeight: typography.amountHero.lineHeight,
  },
  content: {
    justifyContent: "center",
    paddingBottom: spacing.xxxl,
  },
  copyBlock: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  heroBadge: {
    alignItems: "center",
    backgroundColor: colors.infoMuted,
    borderRadius: radii.pill,
    height: 108,
    justifyContent: "center",
    marginBottom: spacing.xl,
    width: 108,
  },
  iconBody: {
    borderColor: colors.info,
    borderRadius: 8,
    borderWidth: 2.5,
    height: 34,
    width: 22,
  },
  iconButton: {
    backgroundColor: colors.info,
    borderRadius: radii.pill,
    bottom: 5,
    height: 4,
    position: "absolute",
    width: 4,
  },
  iconFrame: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    position: "relative",
    width: 32,
  },
  iconScreen: {
    backgroundColor: colors.info,
    borderRadius: radii.pill,
    height: 2.5,
    position: "absolute",
    top: 6,
    width: 10,
  },
  infoCard: {
    marginBottom: 0,
    minWidth: "100%",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  infoCopy: {
    color: colors.infoContrast,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    textAlign: "center",
  },
  main: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
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
