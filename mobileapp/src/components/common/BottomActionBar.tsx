import React, { PropsWithChildren } from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, shadows, spacing } from "../../theme";

interface BottomActionBarProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}

export function BottomActionBar({
  children,
  style,
}: BottomActionBarProps) {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadows.bottomAction,
  },
  safeArea: {
    backgroundColor: colors.surface,
  },
});
