import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ToneName } from "../../theme/colors";
import {
  colors,
  radii,
  spacing,
  tonePalette,
  typography,
} from "../../theme";
import { IconBadge } from "./IconBadge";

interface ActionTileProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  tone?: ToneName;
  onPress?: () => void;
}

export function ActionTile({
  title,
  subtitle,
  icon,
  tone = "neutral",
  onPress,
}: ActionTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: "rgba(39,48,67,0.05)" }}
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed ? styles.pressed : null]}
    >
      {icon ? <IconBadge icon={icon} tone={tone} /> : null}
      <View style={styles.copyBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.md,
    minHeight: 88,
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  copyBlock: {
    flex: 1,
    marginLeft: spacing.md,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.992 }],
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    marginTop: spacing.xxs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
  },
});
