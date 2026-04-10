import React, { ReactNode } from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { colors, radii, shadows, spacing, typography } from "../../theme";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "soft"
  | "danger"
  | "brandOutline";
type ButtonSize = "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const heightBySize = {
  lg: 56,
  md: 48,
} as const;

export function Button({
  title,
  leading,
  trailing,
  variant = "primary",
  size = "lg",
  fullWidth = true,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{
        color: rippleColors[variant],
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: heightBySize[size],
        },
        variantStyles[variant],
        fullWidth ? styles.fullWidth : null,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
      {...rest}
    >
      <View style={styles.content}>
        {leading ? <View style={styles.icon}>{leading}</View> : null}
        <Text style={[styles.text, textStyles[variant]]}>{title}</Text>
        {trailing ? <View style={styles.icon}>{trailing}</View> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: "center",
    marginBottom: spacing.sm,
    overflow: "hidden",
    paddingHorizontal: spacing.lg,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.52,
  },
  fullWidth: {
    width: "100%",
  },
  icon: {
    marginHorizontal: spacing.xs,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.988 }],
  },
  text: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    lineHeight: typography.button.lineHeight,
  },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  brandOutline: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.card,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  soft: {
    backgroundColor: colors.surfaceInfo,
    borderColor: colors.infoMuted,
  },
};

const textStyles = StyleSheet.create<Record<ButtonVariant, object>>({
  brandOutline: {
    color: colors.primary,
  },
  danger: {
    color: colors.textInverse,
  },
  primary: {
    color: colors.textInverse,
  },
  secondary: {
    color: colors.textPrimary,
  },
  soft: {
    color: colors.infoContrast,
  },
});

const rippleColors: Record<ButtonVariant, string> = {
  brandOutline: "rgba(214,169,55,0.12)",
  danger: "rgba(255,255,255,0.14)",
  primary: "rgba(255,255,255,0.14)",
  secondary: "rgba(39,48,67,0.06)",
  soft: "rgba(75,123,255,0.12)",
};
