import React, { PropsWithChildren, ReactNode } from "react";
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "../../theme";

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  includeTopSafeArea?: boolean;
}

export function Screen({
  children,
  scroll = true,
  contentContainerStyle,
  footer,
  includeTopSafeArea = false,
}: ScreenProps) {
  const safeAreaEdges: Edge[] = ["left", "right"];

  if (includeTopSafeArea) {
    safeAreaEdges.unshift("top");
  }

  if (!footer) {
    safeAreaEdges.push("bottom");
  }

  const contentStyle = footer
    ? scroll
      ? styles.scrollContentWithFooter
      : styles.fixedContentWithFooter
    : scroll
      ? styles.scrollContent
      : styles.fixedContent;

  return (
    <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
      <View style={styles.container}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[contentStyle, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[contentStyle, contentContainerStyle]}>{children}</View>
        )}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxs,
  },
  scrollContentWithFooter: {
    flexGrow: 1,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxs,
  },
  fixedContent: {
    flex: 1,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxs,
  },
  fixedContentWithFooter: {
    flex: 1,
    paddingBottom: spacing.xxs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxs,
  },
  footer: {
    backgroundColor: colors.background,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
