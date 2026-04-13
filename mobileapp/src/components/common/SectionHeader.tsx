import React, { ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { colors, spacing, typography } from "../../theme";

interface SectionHeaderProps {
  leading?: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  align?: "start" | "center";
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({
  leading,
  eyebrow,
  title,
  subtitle,
  right,
  align = "start",
  style,
}: SectionHeaderProps) {
  if (align === "center") {
    return (
      <View style={[styles.wrapper, styles.wrapperCentered, style]}>
        {leading ? <View style={[styles.slot, styles.slotLeft]}>{leading}</View> : null}
        <View style={[styles.copyBlock, styles.copyBlockCentered]}>
          {eyebrow ? <Text style={[styles.eyebrow, styles.eyebrowCentered]}>{eyebrow}</Text> : null}
          <Text style={[styles.title, styles.titleCentered]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, styles.subtitleCentered]}>{subtitle}</Text>
          ) : null}
        </View>
        {right ? <View style={[styles.slot, styles.slotRight]}>{right}</View> : null}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.leftCluster}>
        {leading ? <View style={styles.leading}>{leading}</View> : null}
        <View style={styles.copyBlock}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  copyBlock: {
    flex: 1,
  },
  copyBlockCentered: {
    alignItems: "center",
    flexGrow: 0,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  eyebrowCentered: {
    textAlign: "center",
  },
  leading: {
    marginRight: spacing.md,
  },
  leftCluster: {
    alignItems: "flex-start",
    flex: 1,
    flexDirection: "row",
  },
  right: {
    marginLeft: spacing.md,
  },
  slot: {
    justifyContent: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
  },
  slotLeft: {
    left: 0,
  },
  slotRight: {
    right: 0,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    marginTop: spacing.xs,
  },
  subtitleCentered: {
    textAlign: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    lineHeight: typography.heading.lineHeight,
  },
  titleCentered: {
    textAlign: "center",
  },
  wrapper: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  wrapperCentered: {
    justifyContent: "center",
    minHeight: 40,
    position: "relative",
  },
});
