import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { formatCurrency } from "../../constants/formatters";
import { TableSummary } from "../../types/domain";
import { colors, radii, spacing, tonePalette, typography } from "../../theme";

interface TableCardProps {
  table: TableSummary;
  onPress?: () => void;
  onOpen?: () => void;
  style?: StyleProp<ViewStyle>;
}

const toneByStatus = {
  empty: "neutral",
  occupied: "info",
  paid: "success",
  paymentPending: "warning",
} as const;

export function TableCard({
  table,
  onPress,
  onOpen,
  style,
}: TableCardProps) {
  const tone = toneByStatus[table.status];
  const palette = tonePalette[tone];
  const isEmpty = table.status === "empty";
  const handleCardPress = isEmpty ? onOpen : onPress;
  const safeTotalAmount = Number.isFinite(table.totalAmount)
    ? table.totalAmount
    : 0;

  if (!Number.isFinite(table.totalAmount)) {
    console.warn("[TableCard] Table contains an invalid totalAmount. Falling back to 0.", {
      table,
    });
  }

  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: "rgba(39,48,67,0.05)" }}
      disabled={!handleCardPress}
      onPress={handleCardPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: palette.background,
          borderColor: tone === "neutral" ? colors.borderStrong : palette.border,
        },
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>{formatTableLabel(table.label)}</Text>
        <View
          style={[
            styles.dot,
            {
              backgroundColor:
                tone === "neutral" ? colors.textMuted : palette.iconForeground,
            },
          ]}
        />
      </View>

      {isEmpty ? (
        <View style={styles.emptyBody}>
          <Text style={styles.emptyLabel}>Müsait</Text>
          <View style={styles.emptyPill}>
            <Text style={styles.emptyPillText}>Masa Aç</Text>
          </View>
        </View>
      ) : (
        <View style={styles.detailsBody}>
          <View style={styles.metaRow}>
            <GuestsIcon />
            <Text style={styles.metaLine}>{table.guestCount} Kişi</Text>
          </View>
          <View style={styles.metaRow}>
            <ClockIcon />
            <Text style={styles.metaLine}>{formatTime(table.updatedAt)}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.amountLabel}>Tutar</Text>
          <Text style={styles.amountValue}>{formatCurrency(safeTotalAmount)}</Text>
        </View>
      )}
    </Pressable>
  );
}

function formatTableLabel(label: string) {
  const match = label.match(/(\d+)$/);

  if (!match) {
    return label;
  }

  return `M-${match[1]}`;
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
  amountLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    marginTop: spacing.sm,
  },
  amountValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: typography.amountLarge.fontWeight,
    lineHeight: 30,
    marginTop: spacing.xs,
  },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1.5,
    minHeight: 170,
    overflow: "hidden",
    padding: spacing.md,
  },
  detailsBody: {
    flex: 1,
  },
  divider: {
    backgroundColor: colors.borderSoft,
    height: 1,
    marginTop: spacing.md,
  },
  dot: {
    borderRadius: radii.pill,
    height: 8,
    width: 8,
  },
  emptyBody: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingBottom: spacing.md,
  },
  emptyLabel: {
    color: colors.textSecondary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
  },
  emptyPill: {
    backgroundColor: colors.surfaceBrand,
    borderRadius: radii.pill,
    marginTop: spacing.md,
    minHeight: 30,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  emptyPillPressed: {
    opacity: 0.92,
  },
  emptyPillText: {
    color: colors.primaryContrast,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  metaLine: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: typography.body.fontWeight,
    lineHeight: 18,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.992 }],
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    lineHeight: typography.heading.lineHeight,
  },
});

function GuestsIcon() {
  return (
    <View style={stylesMeta.iconFrame}>
      <View style={[stylesMeta.head, stylesMeta.headBack]} />
      <View style={[stylesMeta.head, stylesMeta.headFront]} />
      <View style={[stylesMeta.body, stylesMeta.bodyBack]} />
      <View style={[stylesMeta.body, stylesMeta.bodyFront]} />
    </View>
  );
}

function ClockIcon() {
  return (
    <View style={stylesMeta.iconFrame}>
      <View style={stylesMeta.clockRing} />
      <View style={stylesMeta.clockHandVertical} />
      <View style={stylesMeta.clockHandHorizontal} />
    </View>
  );
}

const stylesMeta = StyleSheet.create({
  body: {
    borderColor: colors.textSecondary,
    borderTopLeftRadius: radii.pill,
    borderTopRightRadius: radii.pill,
    borderWidth: 1.6,
    borderBottomWidth: 0,
    height: 4,
    position: "absolute",
    width: 6,
  },
  bodyBack: {
    left: 1,
    top: 8,
  },
  bodyFront: {
    left: 7,
    top: 8,
  },
  clockHandHorizontal: {
    backgroundColor: colors.textSecondary,
    borderRadius: radii.pill,
    height: 1.5,
    left: 8,
    position: "absolute",
    top: 8,
    width: 4,
  },
  clockHandVertical: {
    backgroundColor: colors.textSecondary,
    borderRadius: radii.pill,
    height: 5,
    left: 8,
    position: "absolute",
    top: 4,
    width: 1.5,
  },
  clockRing: {
    borderColor: colors.textSecondary,
    borderRadius: radii.pill,
    borderWidth: 1.6,
    height: 16,
    width: 16,
  },
  head: {
    backgroundColor: colors.textSecondary,
    borderRadius: radii.pill,
    height: 4,
    position: "absolute",
    width: 4,
  },
  headBack: {
    left: 2,
    top: 2,
  },
  headFront: {
    left: 8,
    top: 1,
  },
  iconFrame: {
    height: 16,
    marginRight: spacing.xs,
    position: "relative",
    width: 16,
  },
});
