import React from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ActionTile } from "../../../components/common/ActionTile";
import { Screen } from "../../../components/common/Screen";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
import { ROUTES } from "../../../constants/routes";
import { RootStackParamList } from "../../../navigation/types";
import { services } from "../../../services/composition-root";
import { useAppStore } from "../../../state/app-store";
import { colors, typography } from "../../../theme";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.TABLE_ACTIONS
>;

export function TableActionsScreen({ navigation, route }: Props) {
  const { tableId } = route.params;
  const session = useAppStore((state) => state.session);
  const table = useAppStore((state) =>
    state.tables.find((candidate) => candidate.id === tableId),
  );
  const order = useAppStore((state) => state.ordersByTableId[tableId]);
  const upsertTable = useAppStore((state) => state.upsertTable);

  if (!table) {
    return (
      <Screen>
        <SurfaceCard>
          <Text style={styles.copy}>Table context is missing.</Text>
        </SurfaceCard>
      </Screen>
    );
  }

  const currentTable = table;

  async function handleOpenTable() {
    const updatedTable = await services.tables.openTable({
      guestCount: currentTable.guestCount || 2,
      tableId: currentTable.id,
      waiterId: session?.waiterId ?? "waiter-demo-1",
    });

    upsertTable({
      ...updatedTable,
      activeOrderId: currentTable.activeOrderId,
    });
    navigation.replace(ROUTES.ORDER_DETAIL, { tableId: currentTable.id });
  }

  async function handlePlaceholderAction(
    actionName: string,
    action: () => Promise<void>,
  ) {
    await action();
    Alert.alert(
      actionName,
      "The waiter flow boundary is ready. Replace the mock gateway with the real API integration later.",
    );
  }

  return (
    <Screen>
      <SectionHeader
        eyebrow="Table Actions"
        subtitle="Open, move, merge, and split remain table-domain operations. They should stay behind the tables service."
        title={currentTable.label}
      />

      <SurfaceCard>
        <ActionTile
          onPress={handleOpenTable}
          subtitle="Bos bir masayi aktif siparis akisina al."
          title="Masayi Ac"
          tone="brand"
        />
        <ActionTile
          onPress={() =>
            handlePlaceholderAction("Move table", () =>
              services.tables.moveTable({
                sourceTableId: currentTable.id,
                targetTableId: "table-8",
              }),
            )
          }
          subtitle="Masayi farkli bir numaraya veya alana tasi."
          title="Masa Tasi"
          tone="info"
        />
        <ActionTile
          onPress={() =>
            handlePlaceholderAction("Merge tables", () =>
              services.tables.mergeTables({
                sourceTableId: currentTable.id,
                targetTableId: "table-6",
              }),
            )
          }
          subtitle="Birden fazla masayi tek sipariste birlestir."
          title="Masa Birlestir"
          tone="purple"
        />
        <ActionTile
          onPress={() =>
            handlePlaceholderAction("Split table", () =>
              services.tables.splitTable({
                itemIds: order?.items.map((item) => item.id) ?? [],
                sourceTableId: currentTable.id,
                targetTableId: "table-9",
              }),
            )
          }
          subtitle="Adisyonu farkli masalara bolmek icin hazirlik yap."
          title="Masa Ayir"
          tone="warning"
        />
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
});
