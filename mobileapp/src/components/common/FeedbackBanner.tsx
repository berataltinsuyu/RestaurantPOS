import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { colors, radii, spacing, typography } from "../../theme";

type FeedbackTone = "success" | "error" | "info";

interface FeedbackBannerProps {
  message: string;
  tone?: FeedbackTone;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

const toneStyles = {
  error: {
    backgroundColor: colors.surfaceDanger,
    borderColor: colors.dangerMuted,
    dot: colors.danger,
    text: colors.dangerContrast,
  },
  info: {
    backgroundColor: colors.surfaceInfo,
    borderColor: colors.infoMuted,
    dot: colors.info,
    text: colors.infoContrast,
  },
  success: {
    backgroundColor: colors.surfaceSuccess,
    borderColor: colors.successMuted,
    dot: colors.success,
    text: colors.successContrast,
  },
} as const;

export function FeedbackBanner({
  message,
  tone = "info",
  onDismiss,
  style,
}: FeedbackBannerProps) {
  const palette = toneStyles[tone];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: palette.dot }]} />
      <Text style={[styles.text, { color: palette.text }]}>{message}</Text>
      {onDismiss ? (
        <Pressable
          accessibilityLabel="Mesajı kapat"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onDismiss}
          style={styles.dismiss}
        >
          <Text style={[styles.dismissText, { color: palette.text }]}>Kapat</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dismiss: {
    marginLeft: spacing.sm,
  },
  dismissText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
  },
  dot: {
    borderRadius: radii.pill,
    height: 8,
    marginRight: spacing.sm,
    width: 8,
  },
  text: {
    flex: 1,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.lineHeight,
  },
});
