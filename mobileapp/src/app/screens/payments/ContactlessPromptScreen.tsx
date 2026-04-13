import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getBackendErrorMessage } from "../../../api/http/api-client";
import { BottomActionBar } from "../../../components/common/BottomActionBar";
import { Button } from "../../../components/common/Button";
import { Screen } from "../../../components/common/Screen";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
import {
  formatCurrency,
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
  const { height } = useWindowDimensions();
  useBillRealtimeSync(tableId);
  const confirmationLockRef = useRef(false);
  const [status, setStatus] = useState<ContactlessStatus>("waiting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const order = useAppStore((state) => state.ordersByTableId[tableId]);
  const paymentIntent = useAppStore((state) => state.paymentIntent);
  const clearPaymentIntent = useAppStore((state) => state.clearPaymentIntent);
  const updatePaymentIntentStatus = useAppStore(
    (state) => state.updatePaymentIntentStatus,
  );
  const paymentSummary = order ? getOrderPaymentSummary(order) : null;

  const payableAmount = paymentIntent?.amount ?? paymentSummary?.total ?? 0;

  useEffect(() => {
    updatePaymentIntentStatus("awaitingContactless");

    if (status !== "waiting") {
      return;
    }

    const timer = setTimeout(() => {
      setStatus("error");
      setErrorMessage(
        "Temassız okuma zaman aşımına uğradı. Kartı tekrar yaklaştırın; gerekirse kartı çip ile takarak deneyin veya başka ödeme yöntemine geçin.",
      );
      updatePaymentIntentStatus("failed");
    }, WAIT_TIMEOUT_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [status, updatePaymentIntentStatus]);

  useEffect(() => {
    if (status !== "waiting") {
      pulseAnimation.stopAnimation();
      pulseAnimation.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
      pulseAnimation.stopAnimation();
    };
  }, [pulseAnimation, status]);

  async function handleCardRead() {
    if (status !== "waiting") {
      console.info("[ContactlessPromptScreen] Card confirmation ignored because status is not waiting.", {
        status,
        tableId,
      });
      return;
    }

    if (confirmationLockRef.current) {
      console.info("[ContactlessPromptScreen] Duplicate card confirmation prevented.", {
        paymentIntentId,
        tableId,
      });
      return;
    }

    confirmationLockRef.current = true;
    setStatus("processing");
    setErrorMessage(null);
    updatePaymentIntentStatus("awaitingContactless");
    console.info("[ContactlessPromptScreen] Card confirmation started.", {
      paymentIntentId,
      tableId,
    });

    try {
      await delay(PROCESSING_DELAY_MS);
      const receipt = await services.payments.confirmCardPayment({
        paymentIntentId,
      });

      updatePaymentIntentStatus("completed");
      clearPaymentIntent();
      await services.sync.refreshAfterMutation(tableId);

      navigation.replace(ROUTES.PAYMENT_SUCCESS, {
        amount: receipt.amount,
        method: paymentIntent?.method === "split" ? "split" : "card",
        receiptId: receipt.receiptId,
        tableId,
      });
    } catch (error) {
      console.error("[ContactlessPromptScreen] Card confirmation failed.", error);
      const detail = getBackendErrorMessage(
        error,
        "Temassız işlem tamamlanamadı. Kartı tekrar yaklaştırın; olmazsa kartı çip ile takarak deneyin veya başka bir ödeme yöntemi seçin.",
      );
      setStatus("error");
      setErrorMessage(detail);
      updatePaymentIntentStatus("failed");
      confirmationLockRef.current = false;
    } finally {
      console.info("[ContactlessPromptScreen] Card confirmation finished.", {
        status: paymentIntent?.status ?? null,
        tableId,
      });
    }
  }

  function handleRetry() {
    console.info("[ContactlessPromptScreen] Card confirmation retry requested.", {
      paymentIntentId,
      tableId,
    });
    confirmationLockRef.current = false;
    setStatus("waiting");
    setErrorMessage(null);
    updatePaymentIntentStatus("awaitingContactless");
  }

  function handleCancel() {
    confirmationLockRef.current = false;
    updatePaymentIntentStatus("cancelled");
    clearPaymentIntent();

    if (paymentIntent?.method === "split") {
      navigation.replace(ROUTES.SPLIT_PAYMENT, { tableId });
      return;
    }

    navigation.replace(ROUTES.PAYMENT, { tableId });
  }

  const helperTone = status === "error" ? "danger" : "info";
  const hasFooter = status === "error";
  const isCompactLayout = height <= 860 || hasFooter;
  const isVeryCompactLayout = height <= 760 || (hasFooter && height <= 820);
  const isUltraCompactLayout = height <= 680 || (hasFooter && height <= 740);
  const helperCopy =
    status === "processing"
      ? "Kart bilgileri okunuyor. POS cihazı banka onayını bekliyor."
      : status === "error"
        ? errorMessage ??
          "Temassız ödeme tamamlanamadı. Kartı tekrar yaklaştırın veya kartı çip ile takarak deneyin."
        : "Kartınızı POS cihazına yaklaştırın. Temas algılanınca işlem otomatik olarak başlayacaktır.";
  const pulseStyle = {
    opacity:
      status === "waiting"
        ? pulseAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.84, 1],
          })
        : 1,
    transform: [
      {
        scale:
          status === "waiting"
            ? pulseAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.08],
              })
            : 1,
      },
    ],
  };
  const footer =
    hasFooter ? (
      <BottomActionBar style={styles.footer}>
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
      </BottomActionBar>
    ) : undefined;
  const heroSize = isUltraCompactLayout
    ? 132
    : isVeryCompactLayout
      ? 148
      : isCompactLayout
        ? 164
        : 188;
  const heroBadgeSize = isUltraCompactLayout
    ? 72
    : isVeryCompactLayout
      ? 80
      : isCompactLayout
        ? 88
        : 96;

  return (
    <Screen
      contentContainerStyle={styles.content}
      footer={footer}
      includeTopSafeArea
      scroll={false}
    >
      <View
        style={[
          styles.navRow,
          isUltraCompactLayout
            ? styles.navRowUltraCompact
            : isVeryCompactLayout
              ? styles.navRowCompact
              : null,
        ]}
      >
        <BackButton onPress={handleCancel} />
      </View>

      <View
        style={[
          styles.main,
          isUltraCompactLayout
            ? styles.mainUltraCompact
            : isVeryCompactLayout
              ? styles.mainVeryCompact
              : isCompactLayout
                ? styles.mainCompact
                : null,
        ]}
      >
        <View
          style={[
            styles.topSection,
            isUltraCompactLayout
              ? styles.topSectionUltraCompact
              : isVeryCompactLayout
                ? styles.topSectionCompact
                : null,
          ]}
        >
          {status === "waiting" ? (
            <Pressable
              accessibilityLabel="Temassız kart okutma alanı"
              accessibilityRole="button"
              android_ripple={{ color: "rgba(75,123,255,0.10)", radius: 120 }}
              onPress={handleCardRead}
              style={({ pressed }) => [
                styles.heroPressable,
                isUltraCompactLayout
                  ? styles.heroPressableUltraCompact
                  : isVeryCompactLayout
                    ? styles.heroPressableCompact
                    : null,
                pressed ? styles.heroPressablePressed : null,
              ]}
            >
              <Animated.View
                style={[
                  styles.heroHalo,
                  {
                    height: heroSize,
                    width: heroSize,
                  },
                  pulseStyle,
                ]}
              >
                <View
                  style={[
                    styles.heroBadge,
                    {
                      height: heroBadgeSize,
                      width: heroBadgeSize,
                    },
                  ]}
                >
                  <CardIcon />
                </View>
              </Animated.View>
            </Pressable>
          ) : (
            <Animated.View
              style={[
                styles.heroHalo,
                {
                  height: heroSize,
                  width: heroSize,
                },
                pulseStyle,
              ]}
            >
              <View
                style={[
                  styles.heroBadge,
                  {
                    height: heroBadgeSize,
                    width: heroBadgeSize,
                  },
                ]}
              >
                <CardIcon />
              </View>
            </Animated.View>
          )}

          <Text style={[styles.title, isCompactLayout ? styles.titleCompact : null]}>
            Temassız kart okutun
          </Text>
          <Text
            style={[
              styles.subtitle,
              isUltraCompactLayout
                ? styles.subtitleUltraCompact
                : isCompactLayout
                  ? styles.subtitleCompact
                  : null,
            ]}
          >
            Kartınızı POS cihazına yaklaştırın veya yerleştirin.
          </Text>

          <SurfaceCard
            elevated
            style={[
              styles.amountCard,
              isUltraCompactLayout
                ? styles.amountCardUltraCompact
                : isCompactLayout
                  ? styles.amountCardCompact
                  : null,
            ]}
          >
            <Text style={styles.amountLabel}>Ödenecek Tutar</Text>
            <Text style={styles.amountValue}>{formatCurrency(payableAmount)}</Text>
          </SurfaceCard>
        </View>

        <View
          style={[
            styles.bottomSection,
            isUltraCompactLayout
              ? styles.bottomSectionUltraCompact
              : isCompactLayout
                ? styles.bottomSectionCompact
                : null,
          ]}
        >
          <View
            style={[
              styles.contactlessRow,
              isUltraCompactLayout
                ? styles.contactlessRowUltraCompact
                : isCompactLayout
                  ? styles.contactlessRowCompact
                  : null,
            ]}
          >
            <ContactlessIcon />
            <Text style={styles.contactlessLabel}>Temassız Ödeme</Text>
          </View>

          <SurfaceCard
            style={[
              styles.helperCard,
              isUltraCompactLayout
                ? styles.helperCardUltraCompact
                : isCompactLayout
                  ? styles.helperCardCompact
                  : null,
            ]}
            tone={helperTone}
          >
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
            <View
              style={[
                styles.processingRow,
                isUltraCompactLayout
                  ? styles.processingRowUltraCompact
                  : isCompactLayout
                    ? styles.processingRowCompact
                    : null,
              ]}
            >
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={styles.processingLabel}>İşlem devam ediyor</Text>
            </View>
          ) : null}

          <SurfaceCard
            style={[
              styles.providerCard,
              isUltraCompactLayout
                ? styles.providerCardUltraCompact
                : isCompactLayout
                  ? styles.providerCardCompact
                  : null,
            ]}
          >
            <Text style={styles.providerCopy}>
              İşlem güvenli POS sistemi üzerinden gerçekleştirilmektedir.
            </Text>
          </SurfaceCard>
        </View>
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
    marginBottom: 0,
    maxWidth: 272,
    minWidth: 236,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    width: "78%",
  },
  amountCardCompact: {
    minWidth: 220,
    paddingVertical: spacing.md,
  },
  amountCardUltraCompact: {
    minWidth: 204,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
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
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  contactlessRowCompact: {
    marginBottom: spacing.xs,
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
    paddingBottom: 0,
    paddingTop: 0,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxs,
  },
  helperCard: {
    marginBottom: spacing.sm,
    minWidth: "100%",
    paddingVertical: spacing.md,
  },
  helperCardCompact: {
    marginBottom: spacing.xs,
    paddingVertical: spacing.sm,
  },
  helperCardUltraCompact: {
    marginBottom: spacing.xs,
    paddingVertical: spacing.xs,
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
    justifyContent: "center",
  },
  heroHalo: {
    alignItems: "center",
    backgroundColor: "rgba(220,232,255,0.46)",
    borderRadius: radii.pill,
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  heroPressable: {
    borderRadius: radii.pill,
  },
  heroPressableCompact: {
    marginBottom: spacing.xxs,
  },
  heroPressablePressed: {
    opacity: 0.96,
  },
  heroPressableUltraCompact: {
    marginBottom: 0,
  },
  iconFrame: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    position: "relative",
    width: 44,
  },
  main: {
    alignItems: "stretch",
    flex: 1,
    justifyContent: "flex-start",
    minHeight: 0,
    paddingBottom: 0,
    paddingTop: 0,
  },
  mainCompact: {
    paddingBottom: 0,
  },
  mainUltraCompact: {
    paddingBottom: 0,
  },
  mainVeryCompact: {
    paddingTop: 0,
  },
  navRow: {
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: spacing.sm,
    minHeight: 32,
  },
  navRowCompact: {
    marginBottom: spacing.xs,
  },
  navRowUltraCompact: {
    marginBottom: spacing.xxs,
  },
  topSection: {
    alignItems: "center",
    flexShrink: 0,
  },
  topSectionCompact: {
    marginBottom: spacing.xxs,
  },
  topSectionUltraCompact: {
    marginBottom: 0,
  },
  bottomSection: {
    flexShrink: 1,
    marginTop: spacing.md,
    width: "100%",
  },
  bottomSectionCompact: {
    marginTop: spacing.sm,
  },
  bottomSectionUltraCompact: {
    marginTop: spacing.xs,
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
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  processingRowCompact: {
    marginBottom: spacing.xs,
  },
  processingRowUltraCompact: {
    marginBottom: spacing.xxs,
  },
  providerCard: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderSoft,
    marginBottom: 0,
    minWidth: "100%",
    paddingVertical: spacing.sm,
  },
  providerCardCompact: {
    paddingVertical: spacing.xs,
  },
  providerCardUltraCompact: {
    paddingVertical: spacing.xxs,
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
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitleCompact: {
    marginBottom: spacing.sm,
  },
  subtitleUltraCompact: {
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    lineHeight: typography.title.lineHeight,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: typography.heading.fontSize,
    lineHeight: typography.heading.lineHeight,
  },
  contactlessRowUltraCompact: {
    marginBottom: spacing.xxs,
  },
});
