import React, { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { ToneName } from "../../theme/colors";
import {
  colors,
  radii,
  shadows,
  spacing,
  tonePalette,
} from "../../theme";

interface SurfaceCardProps extends PropsWithChildren {
  tone?: ToneName;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SurfaceCard({
  children,
  tone = "neutral",
  elevated = false,
  style,
}: SurfaceCardProps) {
  const palette = tonePalette[tone];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.background,
          borderColor: tone === "neutral" ? colors.border : palette.border,
        },
        elevated ? shadows.card : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
});
