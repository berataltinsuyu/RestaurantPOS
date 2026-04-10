import React, { ReactNode } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { ToneName } from "../../theme/colors";
import {
  colors,
  radii,
  spacing,
  tonePalette,
  typography,
} from "../../theme";
import { IconBadge } from "../common/IconBadge";

interface PaymentMethodCardProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  tone?: ToneName;
  selected?: boolean;
  showSelectedIndicator?: boolean;
  compact?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function PaymentMethodCard({
  title,
  subtitle,
  icon,
  tone = "info",
  selected = false,
  showSelectedIndicator = false,
  compact = false,
  onPress,
  style,
}: PaymentMethodCardProps) {
  const palette = tonePalette[tone];

  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: "rgba(39,48,67,0.05)" }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.baseCompact : null,
        selected
          ? {
              backgroundColor: palette.background,
              borderColor:
                tone === "brand" ? colors.primary : palette.iconForeground,
            }
          : styles.unselected,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      {icon ? (
        <IconBadge
          icon={icon}
          size={compact ? "sm" : "md"}
          tone={tone}
        />
      ) : null}
      <View style={styles.copyBlock}>
        <Text style={[styles.title, compact ? styles.titleCompact : null]}>
          {title}
        </Text>
        <Text
          numberOfLines={compact ? 1 : 2}
          style={[styles.subtitle, compact ? styles.subtitleCompact : null]}
        >
          {subtitle}
        </Text>
      </View>
      {selected && showSelectedIndicator ? <View style={styles.selectedDot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radii.lg,
    borderWidth: 1.5,
    flexDirection: "row",
    marginBottom: spacing.md,
    minHeight: 102,
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  baseCompact: {
    minHeight: 78,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  copyBlock: {
    flex: 1,
    marginLeft: spacing.md,
  },
  pressed: {
    opacity: 0.97,
  },
  selectedDot: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    height: 10,
    marginLeft: spacing.sm,
    width: 10,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    marginTop: spacing.xxs,
  },
  subtitleCompact: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
  },
  titleCompact: {
    fontSize: typography.label.fontSize,
    lineHeight: typography.label.lineHeight,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
});
