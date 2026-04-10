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
import { colors, radii, spacing, typography } from "../../theme";
import { IconBadge } from "../common/IconBadge";
import { SurfaceCard } from "../common/SurfaceCard";

interface SplitPaymentEntryCardProps {
  title: string;
  subtitle: string;
  amount: string;
  icon?: ReactNode;
  tone?: ToneName;
  onRemove?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SplitPaymentEntryCard({
  title,
  subtitle,
  amount,
  icon,
  tone = "neutral",
  onRemove,
  style,
}: SplitPaymentEntryCardProps) {
  return (
    <SurfaceCard style={[styles.card, style]}>
      <View style={styles.row}>
        {icon ? <IconBadge icon={icon} size="sm" tone={tone} /> : null}
        <View style={styles.copyBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.amount}>{amount}</Text>
        {onRemove ? (
          <Pressable
            accessibilityLabel={`${title} ödemesini sil`}
            accessibilityRole="button"
            android_ripple={{ color: "rgba(255,102,109,0.12)", radius: 18 }}
            onPress={onRemove}
            style={({ pressed }) => [
              styles.removeButton,
              pressed ? styles.removeButtonPressed : null,
            ]}
          >
            <TrashIcon />
          </Pressable>
        ) : null}
      </View>
    </SurfaceCard>
  );
}

function TrashIcon() {
  return (
    <View style={styles.trashFrame}>
      <View style={styles.trashLid} />
      <View style={styles.trashBody} />
      <View style={styles.trashLine} />
      <View style={[styles.trashLine, styles.trashLineRight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  amount: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
    marginLeft: spacing.md,
  },
  card: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  copyBlock: {
    flex: 1,
    marginLeft: spacing.md,
  },
  removeButton: {
    alignItems: "center",
    borderRadius: radii.pill,
    height: 28,
    justifyContent: "center",
    marginLeft: spacing.sm,
    width: 28,
  },
  removeButtonPressed: {
    opacity: 0.9,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.xxs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
  },
  trashBody: {
    borderColor: colors.danger,
    borderRadius: 2,
    borderWidth: 1.6,
    height: 11,
    left: 3,
    position: "absolute",
    top: 5,
    width: 10,
  },
  trashFrame: {
    height: 16,
    position: "relative",
    width: 16,
  },
  trashLid: {
    backgroundColor: colors.danger,
    borderRadius: radii.pill,
    height: 2,
    left: 2,
    position: "absolute",
    top: 3,
    width: 12,
  },
  trashLine: {
    backgroundColor: colors.danger,
    borderRadius: radii.pill,
    height: 7,
    left: 6,
    position: "absolute",
    top: 7,
    width: 1.6,
  },
  trashLineRight: {
    left: 9,
  },
});
