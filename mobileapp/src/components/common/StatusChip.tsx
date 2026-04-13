import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { ConnectionState } from "../../types/app";
import { OrderStatus, TableStatus } from "../../types/domain";
import {
  colors,
  radii,
  spacing,
  statusPalette,
  typography,
} from "../../theme";

type SupportedStatus = TableStatus | OrderStatus | ConnectionState;

interface StatusChipProps {
  label: string;
  status: SupportedStatus;
  showDot?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function StatusChip({
  label,
  status,
  showDot = true,
  style,
}: StatusChipProps) {
  const palette = statusPalette[status];
  const normalizedLabel = STATUS_LABELS[status] ?? STATUS_LABELS[label as SupportedStatus] ?? label.replace(/([A-Z])/g, " $1").trim();

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
        style,
      ]}
    >
      {showDot ? (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: palette.dot,
            },
          ]}
        />
      ) : null}
      <Text
        style={[
          styles.text,
          {
            color: palette.text,
          },
        ]}
      >
        {normalizedLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dot: {
    borderRadius: radii.pill,
    height: 8,
    marginRight: spacing.xs,
    width: 8,
  },
  text: {
    color: colors.textPrimary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    textTransform: "capitalize",
  },
});

const STATUS_LABELS: Partial<Record<SupportedStatus, string>> = {
  connecting: "Bağlanıyor",
  disabled: "Kapalı",
  empty: "Boş",
  error: "Hata",
  idle: "Beklemede",
  occupied: "Dolu",
  open: "Açık",
  paid: "Ödendi",
  paymentPending: "Bekliyor",
  ready: "Hazır",
};
