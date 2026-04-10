import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { ToneName } from "../../theme/colors";
import { colors, spacing, tonePalette, typography } from "../../theme";
import { SurfaceCard } from "./SurfaceCard";

interface SummaryCardProps {
  label: string;
  value: string;
  subtitle?: string;
  tone?: ToneName;
  align?: "left" | "center";
  style?: StyleProp<ViewStyle>;
}

export function SummaryCard({
  label,
  value,
  subtitle,
  tone = "neutral",
  align = "left",
  style,
}: SummaryCardProps) {
  const palette = tonePalette[tone];

  return (
    <SurfaceCard style={[styles.card, style]} tone={tone}>
      <View
        style={[
          styles.content,
          align === "center" ? styles.centered : null,
        ]}
      >
        <Text style={styles.label}>{label}</Text>
        <Text
          style={[
            styles.value,
            tone !== "neutral" ? { color: palette.text } : null,
          ]}
        >
          {value}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 92,
    padding: spacing.md,
  },
  centered: {
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.micro.fontSize,
    fontWeight: typography.micro.fontWeight,
    marginTop: spacing.xs,
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.amountLarge.fontSize,
    fontWeight: typography.amountLarge.fontWeight,
    lineHeight: typography.amountLarge.lineHeight,
  },
});
