import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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
import { SplitPaymentEntryCard } from "../../../components/payments/SplitPaymentEntryCard";
import {
  formatCurrency,
  formatTableLabel,
  getOrderPaymentSummary,
  roundCurrency,
} from "../../../constants/formatters";
import { useBillRealtimeSync } from "../../../hooks/useBillRealtimeSync";
import { ROUTES } from "../../../constants/routes";
import { RootStackParamList } from "../../../navigation/types";
import { services } from "../../../services/composition-root";
import { useAppStore } from "../../../state/app-store";
import {
  SplitPaymentEntry,
  SplitPaymentMethod,
  SplitPaymentSource,
} from "../../../types/domain";
import {
  colors,
  radii,
  spacing,
  typography,
} from "../../../theme";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.SPLIT_PAYMENT
>;

type SplitMode = SplitPaymentSource;
type SplitMethod = SplitPaymentMethod;
type QuickAmountOption = "half" | "third" | "quarter" | "remaining";

export function SplitPaymentScreen({ navigation, route }: Props) {
  const { tableId } = route.params;
  useBillRealtimeSync(tableId);
  const [mode, setMode] = useState<SplitMode>("amount");
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [draftMethod, setDraftMethod] = useState<SplitMethod | null>(null);
  const [draftAmountInput, setDraftAmountInput] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const table = useAppStore((state) =>
    state.tables.find((candidate) => candidate.id === tableId),
  );
  const order = useAppStore((state) => state.ordersByTableId[tableId]);
  const committedEntries = useAppStore(
    (state) => state.splitPaymentsByTableId[tableId] ?? [],
  );
  const setPaymentIntent = useAppStore((state) => state.setPaymentIntent);
  const clearPaymentIntent = useAppStore((state) => state.clearPaymentIntent);
  const setSplitPayments = useAppStore((state) => state.setSplitPayments);
  const upsertOrder = useAppStore((state) => state.upsertOrder);
  const upsertTable = useAppStore((state) => state.upsertTable);
  const [entries, setEntries] = useState<SplitPaymentEntry[]>(committedEntries);
  const paymentSummary = order ? getOrderPaymentSummary(order) : null;
  const existingPaidAmount = order?.paidAmount ?? 0;
  const backendRemainingAmount = order?.remainingAmount ?? paymentSummary?.total ?? 0;

  const paidAmount = useMemo(
    () =>
      roundCurrency(
        existingPaidAmount +
          entries.reduce((sum, entry) => sum + entry.amount, 0),
      ),
    [entries, existingPaidAmount],
  );
  const remainingAmount = useMemo(
    () =>
      roundCurrency(
        Math.max(backendRemainingAmount - (paidAmount - existingPaidAmount), 0),
      ),
    [backendRemainingAmount, existingPaidAmount, paidAmount],
  );
  const usedItemIds = useMemo(
    () => new Set(entries.flatMap((entry) => entry.itemIds)),
    [entries],
  );
  const availableItems = useMemo(
    () =>
      order?.items.filter((item) => !usedItemIds.has(item.id)) ?? [],
    [order?.items, usedItemIds],
  );
  const selectedItems = useMemo(
    () =>
      availableItems.filter((item) => selectedItemIds.includes(item.id)),
    [availableItems, selectedItemIds],
  );
  const parsedDraftAmount = useMemo(
    () => parseAmountInput(draftAmountInput),
    [draftAmountInput],
  );
  const selectedItemsAmount = useMemo(
    () =>
      roundCurrency(
        selectedItems.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0,
        ),
      ),
    [selectedItems],
  );
  const draftAmount =
    mode === "amount" ? parsedDraftAmount : selectedItemsAmount;
  const canAddPaymentEntry = Boolean(
    draftMethod &&
      draftAmount > 0 &&
      draftAmount <= remainingAmount &&
      (mode === "amount" || selectedItemIds.length > 0),
  );
  const formError = useMemo(() => {
    if (!isAddingPayment) {
      return null;
    }

    if (mode === "amount" && draftAmountInput.length > 0 && draftAmount <= 0) {
      return "Geçerli bir ödeme tutarı girin.";
    }

    if (draftAmount > remainingAmount) {
      return "Kalan tutardan fazla ödeme eklenemez.";
    }

    return null;
  }, [
    draftAmount,
    draftAmountInput.length,
    isAddingPayment,
    mode,
    remainingAmount,
  ]);

  if (!table || !order || !paymentSummary) {
    return (
      <Screen>
        <SurfaceCard>
          <Text style={styles.copy}>
            Split payment requires a live table and order.
          </Text>
        </SurfaceCard>
      </Screen>
    );
  }

  const currentTable = table;
  const currentOrder = order;
  const currentPaymentSummary = paymentSummary;

  function switchMode(nextMode: SplitMode) {
    setMode(nextMode);
    setDraftAmountInput("");
    setSelectedItemIds([]);
  }

  function openAddPayment() {
    setIsAddingPayment(true);
  }

  function cancelAddPayment() {
    resetDraft();
    setIsAddingPayment(false);
  }

  function resetDraft() {
    setDraftMethod(null);
    setDraftAmountInput("");
    setSelectedItemIds([]);
  }

  function handleAmountInputChange(value: string) {
    setDraftAmountInput(sanitizeAmountInput(value));
  }

  function handleQuickAmount(option: QuickAmountOption) {
    let nextAmount = remainingAmount;

    if (option === "half") {
      nextAmount = roundCurrency(backendRemainingAmount / 2);
    } else if (option === "third") {
      nextAmount = roundCurrency(backendRemainingAmount / 3);
    } else if (option === "quarter") {
      nextAmount = roundCurrency(backendRemainingAmount / 4);
    }

    const clampedAmount = Math.min(nextAmount, remainingAmount);
    setDraftAmountInput(formatEditableAmount(clampedAmount));
  }

  function toggleSelectedItem(itemId: string) {
    setSelectedItemIds((current) =>
      current.includes(itemId)
        ? current.filter((candidate) => candidate !== itemId)
        : [...current, itemId],
    );
  }

  function addPaymentEntry() {
    if (!canAddPaymentEntry || !draftMethod) {
      return;
    }

    const nextEntry: SplitPaymentEntry = {
      amount: draftAmount,
      id: `split-entry-${Date.now()}`,
      itemIds: mode === "items" ? selectedItemIds : [],
      method: draftMethod,
      source: mode,
    };

    setEntries((current) => [...current, nextEntry]);
    resetDraft();
    setIsAddingPayment(false);
  }

  function removeEntry(entryId: string) {
    setEntries((current) =>
      current.filter((entry) => entry.id !== entryId),
    );
  }

  async function handleComplete() {
    if (remainingAmount > 0 || entries.length === 0) {
      return;
    }

    const nextCommittedEntries = entries
      .filter((entry) => entry.isCommitted || entry.method === "cash")
      .map((entry) => ({
        ...entry,
        isCommitted: true,
      }));
    const cardTotal = roundCurrency(
      entries
        .filter((entry) => !entry.isCommitted && entry.method === "card")
        .reduce((sum, entry) => sum + entry.amount, 0),
    );

    clearPaymentIntent();
    setSplitPayments(tableId, nextCommittedEntries);

    if (cardTotal > 0) {
      const intent = await services.payments.startSplitPayment({
        amountPerSplit: cardTotal,
        orderId: currentOrder.id,
        splitCount: entries.length,
        tableId,
      });

      setPaymentIntent(intent);
      upsertOrder({
        ...currentOrder,
        status: "paymentPending",
        tax: currentPaymentSummary.serviceFee,
        total: currentPaymentSummary.total,
        updatedAt: new Date().toISOString(),
      });
      upsertTable({
        ...currentTable,
        status: "paymentPending",
        totalAmount: currentPaymentSummary.total,
        updatedAt: new Date().toISOString(),
      });
      navigation.replace(ROUTES.CARD_POS_REDIRECT, {
        paymentIntentId: intent.id,
        tableId,
      });
      return;
    }

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
      amount: roundCurrency(entries.reduce((sum, entry) => sum + entry.amount, 0)),
      method: "split",
      tableId,
    });
  }

  return (
    <Screen
      contentContainerStyle={styles.content}
      footer={
        <BottomActionBar>
          <Button
            disabled={remainingAmount > 0 || entries.length === 0}
            onPress={handleComplete}
            title={
              remainingAmount > 0
                ? `Kalan: ${formatCurrency(remainingAmount)}`
                : entries.some(
                    (entry) => !entry.isCommitted && entry.method === "card",
                  )
                  ? "Tahsil Et"
                  : "Tamamla"
            }
          />
        </BottomActionBar>
      }
    >
      <SectionHeader
        align="center"
        leading={<BackButton onPress={() => navigation.goBack()} />}
        subtitle={formatTableLabel(currentTable.label)}
        title="Bölünmüş Ödeme"
      />

      <View style={styles.modeToggle}>
        <ModeSegment
          active={mode === "amount"}
          label="Tutara Göre"
          onPress={() => switchMode("amount")}
        />
        <ModeSegment
          active={mode === "items"}
          label="Ürüne Göre"
          onPress={() => switchMode("items")}
        />
      </View>

      <SurfaceCard tone="info" style={styles.summaryCard}>
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryLabel}>Toplam</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(currentPaymentSummary.total)}
          </Text>
        </View>
        <View style={styles.summaryColumn}>
          <Text style={[styles.summaryLabel, styles.summaryPaidLabel]}>
            Ödenen
          </Text>
          <Text style={[styles.summaryValue, styles.summaryPaidValue]}>
            {formatCurrency(paidAmount)}
          </Text>
        </View>
        <View style={styles.summaryColumn}>
          <Text
            style={[
              styles.summaryLabel,
              remainingAmount === 0
                ? styles.summaryDoneLabel
                : styles.summaryRemainingLabel,
            ]}
          >
            Kalan
          </Text>
          <Text
            style={[
              styles.summaryValue,
              remainingAmount === 0
                ? styles.summaryDoneValue
                : styles.summaryRemainingValue,
            ]}
          >
            {formatCurrency(remainingAmount)}
          </Text>
        </View>
      </SurfaceCard>

      {entries.length > 0 ? (
        <View style={styles.entriesSection}>
          <Text style={styles.entriesTitle}>ÖDEMELER ({entries.length})</Text>
          {entries.map((entry, index) => (
            <SplitPaymentEntryCard
              amount={formatCurrency(entry.amount)}
              icon={
                entry.method === "card" ? <CardIcon /> : <CashIcon />
              }
              key={entry.id}
              onRemove={
                entry.isCommitted ? undefined : () => removeEntry(entry.id)
              }
              subtitle={buildEntrySubtitle(entry)}
              title={`${
                entry.method === "card" ? "Kart" : "Nakit"
              } #${index + 1}`}
              tone={entry.method === "card" ? "info" : "success"}
            />
          ))}
        </View>
      ) : null}

      {isAddingPayment ? (
        <SurfaceCard style={styles.addCard}>
          <View style={styles.addHeaderRow}>
            <Text style={styles.addTitle}>Yeni Ödeme</Text>
            <Pressable
              accessibilityRole="button"
              onPress={cancelAddPayment}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed ? styles.cancelButtonPressed : null,
              ]}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </Pressable>
          </View>

          {mode === "amount" ? (
            <>
              <Text style={styles.inputLabel}>Hızlı Tutar</Text>
              <View style={styles.quickAmountsRow}>
                <QuickAmountChip
                  label="1/2"
                  onPress={() => handleQuickAmount("half")}
                />
                <QuickAmountChip
                  label="1/3"
                  onPress={() => handleQuickAmount("third")}
                />
                <QuickAmountChip
                  label="1/4"
                  onPress={() => handleQuickAmount("quarter")}
                />
                <QuickAmountChip
                  label="Kalan"
                  onPress={() => handleQuickAmount("remaining")}
                />
              </View>

              <Text style={styles.inputLabel}>Tutar (₺)</Text>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={handleAmountInputChange}
                placeholder="0,00"
                placeholderTextColor={colors.textMuted}
                style={styles.amountInput}
                value={draftAmountInput}
              />
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>Ürün Seçimi</Text>

              {availableItems.length ? (
                availableItems.map((item) => {
                  const itemTotal = roundCurrency(
                    item.quantity * item.unitPrice,
                  );
                  const selected = selectedItemIds.includes(item.id);

                  return (
                    <Pressable
                      accessibilityRole="button"
                      android_ripple={{ color: "rgba(75,123,255,0.08)" }}
                      key={item.id}
                      onPress={() => toggleSelectedItem(item.id)}
                      style={({ pressed }) => [
                        styles.itemRow,
                        selected ? styles.itemRowSelected : null,
                        pressed ? styles.itemRowPressed : null,
                      ]}
                    >
                      <View style={styles.itemCheckbox}>
                        {selected ? <View style={styles.itemCheckboxDot} /> : null}
                      </View>
                      <View style={styles.itemCopyBlock}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemMeta}>
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </Text>
                      </View>
                      <Text style={styles.itemAmount}>
                        {formatCurrency(itemTotal)}
                      </Text>
                    </Pressable>
                  );
                })
              ) : (
                <Text style={styles.helperCopy}>
                  Tüm ürünler mevcut ödeme girişlerine dağıtıldı.
                </Text>
              )}

              <InfoRow
                emphasized
                label="Seçilen Ürünler"
                style={styles.selectedItemsSummary}
                value={formatCurrency(selectedItemsAmount)}
              />
            </>
          )}

          <Text style={styles.inputLabel}>Ödeme Yöntemi</Text>
          <View style={styles.methodsRow}>
            <PaymentMethodCard
              compact
              icon={<CardIcon />}
              onPress={() => setDraftMethod("card")}
              selected={draftMethod === "card"}
              style={styles.methodCard}
              subtitle="POS ile"
              title="Kart"
              tone="info"
            />
            <PaymentMethodCard
              compact
              icon={<CashIcon />}
              onPress={() => setDraftMethod("cash")}
              selected={draftMethod === "cash"}
              style={styles.methodCard}
              subtitle="Tahsilat"
              title="Nakit"
              tone="success"
            />
          </View>

          {formError ? <Text style={styles.errorCopy}>{formError}</Text> : null}

          <Button
            disabled={!canAddPaymentEntry}
            onPress={addPaymentEntry}
            title="Ödeme Ekle"
          />
        </SurfaceCard>
      ) : (
        <AddPaymentButton onPress={openAddPayment} />
      )}

      {!entries.length && !isAddingPayment ? (
        <SurfaceCard style={styles.emptyHintCard} tone="info">
          <View style={styles.emptyHintIconWrap}>
            <SplitIcon />
          </View>
          <Text style={styles.emptyHintTitle}>Bölünmüş Ödeme</Text>
          <Text style={styles.emptyHintCopy}>
            Farklı yöntemlerle ödeme alabilirsiniz
          </Text>
        </SurfaceCard>
      ) : null}
    </Screen>
  );
}

function buildEntrySubtitle(entry: SplitPaymentEntry) {
  const methodSubtitle =
    entry.method === "card" ? "POS ile" : "Nakit tahsilat";

  if (entry.source === "items" && entry.itemIds.length > 0) {
    return `${entry.itemIds.length} ürün • ${methodSubtitle}`;
  }

  return methodSubtitle;
}

function AddPaymentButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: "rgba(39,48,67,0.04)" }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.addPaymentButton,
        pressed ? styles.addPaymentButtonPressed : null,
      ]}
    >
      <Text style={styles.addPaymentButtonText}>+ Ödeme Ekle</Text>
    </Pressable>
  );
}

function ModeSegment({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: "rgba(39,48,67,0.04)" }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeSegment,
        active ? styles.modeSegmentActive : null,
        pressed ? styles.modeSegmentPressed : null,
      ]}
    >
      <Text
        style={[
          styles.modeSegmentLabel,
          active ? styles.modeSegmentLabelActive : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function QuickAmountChip({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: "rgba(39,48,67,0.04)" }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickChip,
        pressed ? styles.quickChipPressed : null,
      ]}
    >
      <Text style={styles.quickChipLabel}>{label}</Text>
    </Pressable>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Bölünmüş ödemeden geri dön"
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

function sanitizeAmountInput(value: string) {
  const normalized = value.replace(/[^\d.,]/g, "").replace(/\./g, ",");
  const [whole, ...rest] = normalized.split(",");
  const safeWhole = whole ?? "";

  if (!rest.length) {
    return safeWhole;
  }

  return `${safeWhole},${rest.join("").slice(0, 2)}`;
}

function parseAmountInput(value: string) {
  if (!value.trim()) {
    return 0;
  }

  const parsed = Number(value.replace(",", "."));

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return roundCurrency(parsed);
}

function formatEditableAmount(amount: number) {
  return amount.toFixed(2).replace(".", ",");
}

const styles = StyleSheet.create({
  addCard: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    marginBottom: 0,
    padding: spacing.md,
  },
  addHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  addPaymentButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radii.lg,
    borderStyle: "dashed",
    borderWidth: 1.5,
    justifyContent: "center",
    minHeight: 74,
    paddingHorizontal: spacing.md,
  },
  addPaymentButtonPressed: {
    opacity: 0.92,
  },
  addPaymentButtonText: {
    color: colors.textSecondary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
  },
  addTitle: {
    color: colors.textPrimary,
    fontSize: typography.title.fontSize,
    fontWeight: typography.heading.fontWeight,
    lineHeight: typography.title.lineHeight,
  },
  amountInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: typography.heading.fontWeight,
    lineHeight: 38,
    marginBottom: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  cancelButton: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  cancelButtonPressed: {
    opacity: 0.82,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
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
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  copy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  emptyHintCard: {
    alignItems: "center",
    marginBottom: 0,
    paddingVertical: spacing.xl,
  },
  emptyHintCopy: {
    color: colors.infoContrast,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    textAlign: "center",
  },
  emptyHintIconWrap: {
    marginBottom: spacing.sm,
  },
  emptyHintTitle: {
    color: colors.infoContrast,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
    marginBottom: spacing.xs,
  },
  entriesSection: {
    marginTop: spacing.md,
  },
  entriesTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.heading.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
    marginBottom: spacing.sm,
  },
  errorCopy: {
    color: colors.danger,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.lineHeight,
    marginBottom: spacing.md,
  },
  helperCopy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.md,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
    marginBottom: spacing.xs,
  },
  itemAmount: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyStrong.fontWeight,
    lineHeight: typography.body.lineHeight,
    marginLeft: spacing.md,
  },
  itemCheckbox: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  itemCheckboxDot: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    height: 10,
    width: 10,
  },
  itemCopyBlock: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  itemMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.xxs,
  },
  itemName: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyStrong.fontWeight,
    lineHeight: typography.body.lineHeight,
  },
  itemRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.sm,
    minHeight: 60,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  itemRowPressed: {
    opacity: 0.95,
  },
  itemRowSelected: {
    backgroundColor: colors.surfaceInfo,
    borderColor: colors.infoMuted,
  },
  methodCard: {
    flex: 1,
    marginBottom: 0,
  },
  methodIconFrame: {
    alignItems: "center",
    height: 20,
    justifyContent: "center",
    position: "relative",
    width: 20,
  },
  methodsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modeSegment: {
    alignItems: "center",
    borderRadius: radii.md,
    flex: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  modeSegmentActive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  modeSegmentLabel: {
    color: colors.textSecondary,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
  },
  modeSegmentLabelActive: {
    color: colors.textPrimary,
  },
  modeSegmentPressed: {
    opacity: 0.92,
  },
  modeToggle: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    flexDirection: "row",
    padding: spacing.xxs,
  },
  navButtonPressed: {
    opacity: 0.9,
  },
  quickAmountsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickChip: {
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },
  quickChipLabel: {
    color: colors.textPrimary,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
  },
  quickChipPressed: {
    opacity: 0.92,
  },
  selectedItemsSummary: {
    borderTopColor: colors.borderSoft,
    borderTopWidth: 1,
    marginTop: spacing.xs,
    paddingTop: spacing.md,
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  summaryColumn: {
    flex: 1,
  },
  summaryDoneLabel: {
    color: colors.successContrast,
  },
  summaryDoneValue: {
    color: colors.successContrast,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.lineHeight,
    marginBottom: spacing.xxs,
    textAlign: "center",
  },
  summaryPaidLabel: {
    color: colors.successContrast,
  },
  summaryPaidValue: {
    color: colors.successContrast,
  },
  summaryRemainingLabel: {
    color: colors.warningContrast,
  },
  summaryRemainingValue: {
    color: colors.warningContrast,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.heading.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
    textAlign: "center",
  },
});
