import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "../../../components/common/Button";
import { InfoRow } from "../../../components/common/InfoRow";
import { Screen } from "../../../components/common/Screen";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { StatusChip } from "../../../components/common/StatusChip";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
import { formatCurrency } from "../../../constants/formatters";
import { ROUTES } from "../../../constants/routes";
import { useBillRealtimeSync } from "../../../hooks/useBillRealtimeSync";
import { RootStackParamList } from "../../../navigation/types";
import { useAppStore } from "../../../state/app-store";
import { colors, spacing, typography } from "../../../theme";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.TABLE_DETAIL
>;

export function TableDetailScreen({ navigation, route }: Props) {
  const { tableId } = route.params;
  useBillRealtimeSync(tableId);
  const setSelectedTableId = useAppStore((state) => state.setSelectedTableId);
  const table = useAppStore((state) =>
    state.tables.find((candidate) => candidate.id === tableId),
  );
  const order = useAppStore((state) => state.ordersByTableId[tableId]);

  useEffect(() => {
    setSelectedTableId(tableId);
    return () => setSelectedTableId(null);
  }, [setSelectedTableId, tableId]);

  if (!table) {
    return (
      <Screen>
        <SurfaceCard>
          <Text style={styles.missingTitle}>Table not found</Text>
          <Text style={styles.missingCopy}>
            The selected masa could not be resolved from the mobile store.
          </Text>
        </SurfaceCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionHeader
        eyebrow={table.areaLabel ?? "Dining Area"}
        right={<StatusChip label={table.status} status={table.status} />}
        subtitle="Table detail is the pivot between masa operations, order flow, and payment flow."
        title={table.label}
      />

      <SurfaceCard elevated>
        <Text style={styles.sectionTitle}>Table summary</Text>
        <InfoRow label="Guests" value={String(table.guestCount)} />
        <InfoRow label="Seats" value={String(table.seats)} />
        <InfoRow
          label="Waiter"
          value={table.assignedWaiterName ?? "Not assigned yet"}
        />
        <InfoRow
          emphasized
          label="Current total"
          value={formatCurrency(table.totalAmount)}
        />
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Connected waiter flows</Text>
        <Text style={styles.sectionCopy}>
          From here the handheld app branches into table actions, live order
          detail, and payment. This keeps the table context available across all
          critical operations.
        </Text>
        <Button
          onPress={() =>
            navigation.navigate(ROUTES.TABLE_ACTIONS, { tableId: table.id })
          }
          title="Open table actions"
          variant="secondary"
        />
        <Button
          onPress={() =>
            navigation.navigate(ROUTES.ORDER_DETAIL, { tableId: table.id })
          }
          title="Open order detail"
        />
        <Button
          disabled={!order}
          onPress={() =>
            navigation.navigate(ROUTES.PAYMENT, { tableId: table.id })
          }
          title="Open payment"
          variant="secondary"
        />
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  missingCopy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  missingTitle: {
    color: colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sectionCopy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    marginBottom: spacing.md,
  },
});
