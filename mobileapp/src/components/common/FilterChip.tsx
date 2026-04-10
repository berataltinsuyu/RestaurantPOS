import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { ToneName } from "../../theme/colors";
import {
  colors,
  radii,
  spacing,
  tonePalette,
  typography,
} from "../../theme";

interface FilterChipProps {
  label: string;
  selected?: boolean;
  tone?: ToneName;
  onPress?: () => void;
}

export function FilterChip({
  label,
  selected = false,
  tone = "neutral",
  onPress,
}: FilterChipProps) {
  const palette = tonePalette[tone];

  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: "rgba(39,48,67,0.06)" }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected
          ? {
              backgroundColor:
                tone === "neutral" ? colors.primary : palette.iconForeground,
              borderColor:
                tone === "neutral" ? colors.primary : palette.iconForeground,
            }
          : styles.unselected,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          selected
            ? {
                color: colors.textInverse,
              }
            : {
                color: colors.textPrimary,
              },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 40,
    overflow: "hidden",
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
  },
  pressed: {
    opacity: 0.95,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
});
