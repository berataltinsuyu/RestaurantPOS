import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { ToneName } from "../../theme/colors";
import { radii, spacing, tonePalette } from "../../theme";

interface IconBadgeProps {
  icon: ReactNode;
  tone?: ToneName;
  size?: "sm" | "md" | "lg";
  shape?: "rounded" | "circle";
  style?: StyleProp<ViewStyle>;
}

const badgeSizes = {
  lg: 56,
  md: 48,
  sm: 40,
} as const;

export function IconBadge({
  icon,
  tone = "neutral",
  size = "md",
  shape = "rounded",
  style,
}: IconBadgeProps) {
  const dimension = badgeSizes[size];
  const palette = tonePalette[tone];

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: palette.iconBackground,
          borderRadius: shape === "circle" ? dimension / 2 : radii.md,
          height: dimension,
          width: dimension,
        },
        style,
      ]}
    >
      {icon}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
  },
});
