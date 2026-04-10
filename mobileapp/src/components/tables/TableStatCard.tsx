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
      <Text style={[styles.label, { color: palette.labelColor }]}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 78,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.display.fontSize,
    fontWeight: typography.heading.fontWeight,
    lineHeight: 28,
  },
});
