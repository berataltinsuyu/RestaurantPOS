import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors, spacing, typography } from "../../theme";

interface InfoRowProps {
  label: string;
  value: string;
  emphasized?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function InfoRow({
  label,
  value,
  emphasized = false,
  style,
}: InfoRowProps) {
  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.label, emphasized ? styles.labelStrong : null]}>
        {label}
      </Text>
      <Text style={[styles.value, emphasized ? styles.valueStrong : null]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
  },
  labelStrong: {
    color: colors.textPrimary,
    fontWeight: typography.bodyStrong.fontWeight,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyStrong.fontWeight,
    lineHeight: typography.body.lineHeight,
  },
  valueStrong: {
    fontSize: typography.subtitle.fontSize,
    lineHeight: typography.subtitle.lineHeight,
  },
});
