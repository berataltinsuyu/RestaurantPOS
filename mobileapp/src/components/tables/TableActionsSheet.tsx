import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ActionTile } from "../common/ActionTile";
import { colors, radii, shadows, spacing, typography } from "../../theme";

interface TableActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onOpen: () => void;
  onMove: () => void;
  onMerge: () => void;
  onSplit: () => void;
}

export function TableActionsSheet({
  visible,
  onClose,
  onOpen,
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
          <Text style={styles.subtitle}>Tüm masalar için hızlı işlemler</Text>

          <View style={styles.list}>
            <ActionTile
              icon={<OpenIcon />}
              onPress={onOpen}
              subtitle="Boş bir masayı siparişe aç"
              title="Masa Aç"
              tone="brand"
            />
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

function OpenIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={styles.tableOutline} />
      <View style={[styles.iconStroke, styles.plusHorizontal]} />
      <View style={[styles.iconStroke, styles.plusVertical]} />
    </View>
  );
}

function MoveIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={[styles.iconStroke, styles.moveHorizontal]} />
      <View style={[styles.iconStroke, styles.moveVertical]} />
      <View style={[styles.arrowHead, styles.arrowTopLeft]} />
      <View style={[styles.arrowHead, styles.arrowTopRight]} />
      <View style={[styles.arrowHead, styles.arrowRightTop]} />
      <View style={[styles.arrowHead, styles.arrowRightBottom]} />
      <View style={[styles.arrowHead, styles.arrowBottomLeft]} />
      <View style={[styles.arrowHead, styles.arrowBottomRight]} />
      <View style={[styles.arrowHead, styles.arrowLeftTop]} />
      <View style={[styles.arrowHead, styles.arrowLeftBottom]} />
    </View>
  );
}

function MergeIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={[styles.iconNode, styles.nodeTopLeft]} />
      <View style={[styles.iconNode, styles.nodeBottomLeft]} />
      <View style={[styles.iconNode, styles.nodeRightCenter]} />
      <View style={[styles.iconStroke, styles.mergeVertical]} />
      <View style={[styles.iconStroke, styles.mergeTopBranch]} />
      <View style={[styles.iconStroke, styles.mergeBottomBranch]} />
    </View>
  );
}

function SplitIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={[styles.iconNode, styles.nodeLeftCenter]} />
      <View style={[styles.iconNode, styles.nodeTopRight]} />
      <View style={[styles.iconNode, styles.nodeBottomRight]} />
      <View style={[styles.iconStroke, styles.splitVertical]} />
      <View style={[styles.iconStroke, styles.splitTopBranch]} />
      <View style={[styles.iconStroke, styles.splitBottomBranch]} />
    </View>
  );
}

const styles = StyleSheet.create({
  arrowBottomLeft: {
    bottom: 0,
    left: 8.5,
    transform: [{ rotate: "180deg" }],
  },
  arrowBottomRight: {
    bottom: 0,
    left: 8.5,
    transform: [{ rotate: "-90deg" }],
  },
  arrowHead: {
    borderColor: colors.textPrimary,
    borderLeftWidth: 1.8,
    borderTopWidth: 1.8,
    height: 5,
    position: "absolute",
    width: 5,
  },
  arrowLeftBottom: {
    left: 0,
    top: 8.5,
    transform: [{ rotate: "90deg" }],
  },
  arrowLeftTop: {
    left: 0,
    top: 8.5,
    transform: [{ rotate: "180deg" }],
  },
  arrowRightBottom: {
    right: 0,
    top: 8.5,
    transform: [{ rotate: "0deg" }],
  },
  arrowRightTop: {
    right: 0,
    top: 8.5,
    transform: [{ rotate: "-90deg" }],
  },
  arrowTopLeft: {
    left: 8.5,
    top: 0,
    transform: [{ rotate: "90deg" }],
  },
  arrowTopRight: {
    left: 8.5,
    top: 0,
    transform: [{ rotate: "0deg" }],
  },
  backdrop: {
    flex: 1,
    width: "100%",
  },
  handle: {
    alignSelf: "center",
    backgroundColor: colors.borderStrong,
    borderRadius: radii.pill,
    height: 5,
    marginBottom: spacing.md,
    width: 46,
  },
  iconFrame: {
    height: 22,
    position: "relative",
    width: 22,
  },
  iconNode: {
    borderColor: colors.textPrimary,
    borderRadius: radii.pill,
    borderWidth: 1.8,
    height: 5,
    position: "absolute",
    width: 5,
  },
  iconStroke: {
    backgroundColor: colors.textPrimary,
    borderRadius: radii.pill,
    position: "absolute",
  },
  list: {
    marginTop: spacing.md,
  },
  mergeBottomBranch: {
    height: 1.8,
    left: 5.5,
    right: 5.5,
    top: 13.5,
  },
  mergeTopBranch: {
    height: 1.8,
    left: 5.5,
    right: 5.5,
    top: 5.5,
  },
  mergeVertical: {
    height: 10,
    left: 5.7,
    top: 5.5,
    width: 1.8,
  },
  moveHorizontal: {
    height: 1.8,
    left: 5,
    right: 5,
    top: 10.1,
  },
  moveVertical: {
    bottom: 5,
    left: 10.1,
    top: 5,
    width: 1.8,
  },
  nodeBottomLeft: {
    bottom: 1,
    left: 1,
  },
  nodeBottomRight: {
    bottom: 1,
    right: 1,
  },
  nodeLeftCenter: {
    left: 1,
    top: 8.5,
  },
  nodeRightCenter: {
    right: 1,
    top: 8.5,
  },
  nodeTopLeft: {
    left: 1,
    top: 1,
  },
  nodeTopRight: {
    right: 1,
    top: 1,
  },
  overlay: {
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: "flex-end",
  },
  plusHorizontal: {
    height: 1.8,
    left: 6,
    right: 6,
    top: 10.1,
  },
  plusVertical: {
    bottom: 6,
    left: 10.1,
    top: 6,
    width: 1.8,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadows.sheet,
  },
  splitBottomBranch: {
    height: 1.8,
    left: 6,
    right: 5.5,
    top: 13.5,
    transform: [{ rotate: "24deg" }],
  },
  splitTopBranch: {
    height: 1.8,
    left: 6,
    right: 5.5,
    top: 5.5,
    transform: [{ rotate: "-24deg" }],
  },
  splitVertical: {
    height: 10,
    left: 5.7,
    top: 6,
    width: 1.8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
  },
  tableOutline: {
    borderColor: colors.textPrimary,
    borderRadius: 5,
    borderWidth: 1.8,
    height: 16,
    left: 3,
    position: "absolute",
    top: 3,
    width: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title.fontSize,
    fontWeight: typography.heading.fontWeight,
    lineHeight: typography.title.lineHeight,
  },
});
