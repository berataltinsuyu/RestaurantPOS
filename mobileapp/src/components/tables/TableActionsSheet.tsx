import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radii, shadows, spacing, typography } from "../../theme";
import { ActionTile } from "../common/ActionTile";

interface TableActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onMove: () => void;
  onMerge: () => void;
  onSplit: () => void;
}

export function TableActionsSheet({
  visible,
  onClose,
  onMove,
  onMerge,
  onSplit,
}: TableActionsSheetProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={styles.backdrop} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>Masa İşlemleri</Text>
          <Text style={styles.subtitle}>Tüm masalar için işlemler</Text>

          <View style={styles.list}>
            <ActionTile
              icon={<MoveIcon />}
              onPress={onMove}
              subtitle="Bir masayı başka bir numaraya taşı"
              title="Masa Taşı"
              tone="info"
            />
            <ActionTile
              icon={<MergeIcon />}
              onPress={onMerge}
              subtitle="Birden fazla masayı birleştir"
              title="Masa Birleştir"
              tone="purple"
            />
            <ActionTile
              icon={<SplitIcon />}
              onPress={onSplit}
              subtitle="Bir masayı birden fazla masaya böl"
              title="Masa Ayır"
              tone="warning"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MoveIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={[styles.crossArm, styles.crossArmHorizontal]} />
      <View style={[styles.crossArm, styles.crossArmVertical]} />
      <View style={[styles.arrowHead, styles.arrowLeft]} />
      <View style={[styles.arrowHead, styles.arrowRight]} />
      <View style={[styles.arrowHead, styles.arrowTop]} />
      <View style={[styles.arrowHead, styles.arrowBottom]} />
    </View>
  );
}

function MergeIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={[styles.mergeNode, styles.mergeLeftTop]} />
      <View style={[styles.mergeNode, styles.mergeLeftBottom]} />
      <View style={[styles.mergeNode, styles.mergeRight]} />
      <View style={[styles.mergeLine, styles.mergeLineVertical]} />
      <View style={[styles.mergeLine, styles.mergeLineTop]} />
      <View style={[styles.mergeLine, styles.mergeLineBottom]} />
    </View>
  );
}

function SplitIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={[styles.mergeNode, styles.splitCenter]} />
      <View style={[styles.mergeNode, styles.splitTopRight]} />
      <View style={[styles.mergeNode, styles.splitBottomRight]} />
      <View style={[styles.mergeLine, styles.splitLineCenter]} />
      <View style={[styles.mergeLine, styles.splitLineTop]} />
      <View style={[styles.mergeLine, styles.splitLineBottom]} />
    </View>
  );
}

const styles = StyleSheet.create({
  arrowBottom: {
    bottom: 0,
    left: 8,
    transform: [{ rotate: "135deg" }],
  },
  arrowHead: {
    borderColor: colors.textPrimary,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    height: 6,
    position: "absolute",
    width: 6,
  },
  arrowLeft: {
    left: 0,
    top: 8,
    transform: [{ rotate: "-45deg" }],
  },
  arrowRight: {
    right: 0,
    top: 8,
    transform: [{ rotate: "135deg" }],
  },
  arrowTop: {
    left: 8,
    top: 0,
    transform: [{ rotate: "45deg" }],
  },
  backdrop: {
    flex: 1,
    width: "100%",
  },
  crossArm: {
    backgroundColor: colors.textPrimary,
    borderRadius: radii.pill,
    position: "absolute",
  },
  crossArmHorizontal: {
    height: 2,
    left: 2,
    right: 2,
    top: 9,
  },
  crossArmVertical: {
    bottom: 2,
    top: 2,
    width: 2,
    left: 9,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: colors.borderStrong,
    borderRadius: radii.pill,
    height: 5,
    marginBottom: spacing.lg,
    width: 46,
  },
  iconFrame: {
    height: 20,
    position: "relative",
    width: 20,
  },
  list: {
    marginTop: spacing.lg,
  },
  mergeLeftBottom: {
    bottom: 1,
    left: 1,
  },
  mergeLeftTop: {
    left: 1,
    top: 1,
  },
  mergeLine: {
    backgroundColor: colors.textPrimary,
    position: "absolute",
  },
  mergeLineBottom: {
    height: 2,
    left: 6,
    right: 4,
    top: 13,
  },
  mergeLineTop: {
    height: 2,
    left: 6,
    right: 4,
    top: 5,
  },
  mergeLineVertical: {
    left: 5,
    top: 5,
    width: 2,
    bottom: 5,
  },
  mergeNode: {
    borderColor: colors.textPrimary,
    borderRadius: radii.pill,
    borderWidth: 2,
    height: 6,
    position: "absolute",
    width: 6,
  },
  mergeRight: {
    right: 1,
    top: 9,
  },
  overlay: {
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    ...shadows.sheet,
  },
  splitBottomRight: {
    bottom: 1,
    right: 1,
  },
  splitCenter: {
    left: 1,
    top: 7,
  },
  splitLineBottom: {
    height: 2,
    left: 5,
    right: 5,
    top: 13,
    transform: [{ rotate: "24deg" }],
  },
  splitLineCenter: {
    left: 5,
    top: 9,
    width: 2,
    bottom: 4,
  },
  splitLineTop: {
    height: 2,
    left: 5,
    right: 5,
    top: 5,
    transform: [{ rotate: "-24deg" }],
  },
  splitTopRight: {
    right: 1,
    top: 1,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title.fontSize,
    fontWeight: typography.heading.fontWeight,
    lineHeight: typography.title.lineHeight,
  },
});
