import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "../../theme";

type TableStatTone = "info" | "neutral" | "warning";

interface TableStatCardProps {
  label: string;
  value: string;
  tone?: TableStatTone;
}

const paletteByTone = {
  info: {
    backgroundColor: colors.surfaceInfo,
    borderColor: colors.infoMuted,
    labelColor: colors.info,
  },
  neutral: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    labelColor: colors.textSecondary,
  },
  warning: {
    backgroundColor: colors.surfaceWarning,
    borderColor: colors.warningMuted,
    labelColor: colors.warningContrast,
  },
} as const;

export function TableStatCard({
  label,
  value,
  tone = "neutral",
}: TableStatCardProps) {
  const palette = paletteByTone[tone];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
      ]}
    >
      <Text
        adjustsFontSizeToFit
        ellipsizeMode="tail"
        minimumFontScale={0.9}
        numberOfLines={1}
        style={[styles.label, { color: palette.labelColor }]}
      >
        {label}
      </Text>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        numberOfLines={1}
        style={styles.value}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 74,
    minWidth: 0,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.caption.lineHeight,
    marginBottom: spacing.xxs,
    textAlign: "center",
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.amountLarge.fontSize,
    fontWeight: typography.heading.fontWeight,
    lineHeight: typography.amountLarge.lineHeight,
    textAlign: "center",
  },
});
