import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getBackendErrorMessage } from "../../../api/http/api-client";
import { ActionTile } from "../../../components/common/ActionTile";
import { Screen } from "../../../components/common/Screen";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
import { ROUTES } from "../../../constants/routes";
import { RootStackParamList } from "../../../navigation/types";
import { services } from "../../../services/composition-root";
import { OrderDetail, TableSummary } from "../../../types/domain";
import { useAppStore } from "../../../state/app-store";
import { colors, radii, spacing, typography } from "../../../theme";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.TABLE_ACTIONS
>;

type TableActionMode = "open" | "move" | "merge" | "split";

export function TableActionsScreen({ navigation, route }: Props) {
  const initialTableId = route.params?.tableId ?? null;
  const initialAction = route.params?.initialAction ?? null;
  const session = useAppStore((state) => state.session);
  const tables = useAppStore((state) => state.tables);
  const [selectedSourceTableId, setSelectedSourceTableId] = useState<string | null>(
    initialTableId,
  );
  const [activeAction, setActiveAction] = useState<TableActionMode | null>(
    initialAction,
  );
  const selectedSourceTable = tables.find(
    (candidate) => candidate.id === selectedSourceTableId,
  ) ?? null;
  const selectedOrder = useAppStore((state) =>
    selectedSourceTableId ? state.ordersByTableId[selectedSourceTableId] : undefined,
  );
  const upsertOrder = useAppStore((state) => state.upsertOrder);

  useEffect(() => {
    setSelectedSourceTableId(initialTableId);
    setActiveAction(initialAction);
  }, [initialAction, initialTableId]);

  const openableTables = useMemo(
    () => tables.filter((table) => table.status === "empty"),
    [tables],
  );
  const actionSourceTables = useMemo(
    () =>
      tables.filter(
        (table) =>
          table.status === "occupied" || table.status === "paymentPending",
      ),
    [tables],
  );
  const moveTargetTables = useMemo(
    () =>
      selectedSourceTable
        ? tables.filter(
            (table) =>
              table.id !== selectedSourceTable.id && table.status === "empty",
          )
        : [],
    [selectedSourceTable, tables],
  );
  const mergeTargetTables = useMemo(
    () =>
      selectedSourceTable
        ? tables.filter(
            (table) =>
              table.id !== selectedSourceTable.id &&
              (table.status === "occupied" || table.status === "paymentPending") &&
              Boolean(table.activeOrderId),
          )
        : [],
    [selectedSourceTable, tables],
  );
  const sourceSelectionTables = useMemo(() => {
    switch (activeAction) {
      case "open":
        return openableTables;
      case "move":
      case "merge":
      case "split":
        return actionSourceTables;
      default:
        return tables;
    }
  }, [actionSourceTables, activeAction, openableTables, tables]);

  async function handleOpenTable() {
    if (!selectedSourceTable) {
      Alert.alert("Masa Aç", "Önce açılacak masayı seçin.");
      return;
    }

    if (selectedSourceTable.status !== "empty") {
      Alert.alert("Masa Aç", "Yalnızca boş masalar açılabilir.");
      return;
    }

    if (!session?.waiterId) {
      Alert.alert("Masa açılamadı", "Aktif garson oturumu bulunamadı.");
      return;
    }

    try {
      console.info("[TableActionsScreen] Table open requested.", {
        sourceTableId: selectedSourceTable.id,
      });
      const openedTable = await services.tables.openTable({
        guestCount: selectedSourceTable.guestCount || 2,
        tableId: selectedSourceTable.id,
        waiterId: session.waiterId,
      });
      await services.sync.refreshAfterMutation([
        selectedSourceTable.id,
        openedTable.id,
      ]);
      navigation.replace(ROUTES.ORDER_DETAIL, { tableId: selectedSourceTable.id });
    } catch (error) {
      console.error("[TableActionsScreen] Open table failed.", error);
      Alert.alert(
        "Masa açılamadı",
        getBackendErrorMessage(
          error,
          "İşlem backend üzerinde tamamlanamadı. Lütfen tekrar deneyin.",
        ),
      );
    }
  }

  async function handleMoveToTarget(targetTableId: string) {
    if (!selectedSourceTable) {
      Alert.alert("Masa Taşı", "Önce taşınacak masayı seçin.");
      return;
    }

    console.info("[TableActionsScreen] Move target selected.", {
      sourceTableId: selectedSourceTable.id,
      targetTableId,
    });

    try {
      await services.tables.moveTable({
        sourceTableId: selectedSourceTable.id,
        targetTableId,
      });
      await services.sync.refreshAfterMutation([
        selectedSourceTable.id,
        targetTableId,
      ]);
      Alert.alert("Masa Taşı", "İşlem backend üzerinde tamamlandı.");
      navigation.goBack();
    } catch (error) {
      console.error("[TableActionsScreen] Move table failed.", error);
      Alert.alert(
        "Masa Taşı",
        getBackendErrorMessage(
          error,
          "İşlem backend üzerinde tamamlanamadı. Lütfen tekrar deneyin.",
        ),
      );
    }
  }

  async function handleMergeToTarget(targetTableId: string) {
    if (!selectedSourceTable) {
      Alert.alert("Masa Birleştir", "Önce birleştirilecek ana masayı seçin.");
      return;
    }

    try {
      await services.tables.mergeTables({
        sourceTableId: selectedSourceTable.id,
        targetTableId,
      });
      await services.sync.refreshAfterMutation([
        selectedSourceTable.id,
        targetTableId,
      ]);
      Alert.alert("Masa Birleştir", "İşlem backend üzerinde tamamlandı.");
      navigation.goBack();
    } catch (error) {
      console.error("[TableActionsScreen] Merge tables failed.", error);
      Alert.alert(
        "Masa Birleştir",
        getBackendErrorMessage(
          error,
          "İşlem backend üzerinde tamamlanamadı. Lütfen tekrar deneyin.",
        ),
      );
    }
  }

  async function handleSplitTable() {
    if (!selectedSourceTable) {
      Alert.alert("Masa Ayır", "Önce ayrılacak masayı seçin.");
      return;
    }

    const currentOrder = await resolveSelectedOrder({
      selectedOrder,
      selectedSourceTable,
      upsertOrder,
    });
    const itemIds = currentOrder?.items.map((item) => item.id) ?? [];

    if (!itemIds.length) {
      Alert.alert("Masa Ayır", "Ayırma için taşınacak adisyon kalemi bulunamadı.");
      return;
    }

    try {
      const targetTableNo = buildNextSplitTableNo(tables);
      const createdTable = await services.tables.splitTable({
        itemIds,
        sourceTableId: selectedSourceTable.id,
        targetTableId: targetTableNo,
      });
      await services.sync.refreshAfterMutation([
        selectedSourceTable.id,
        createdTable.id,
      ]);
      Alert.alert("Masa Ayır", "İşlem backend üzerinde tamamlandı.");
      navigation.goBack();
    } catch (error) {
      console.error("[TableActionsScreen] Split table failed.", error);
      Alert.alert(
        "Masa Ayır",
        getBackendErrorMessage(
          error,
          "İşlem backend üzerinde tamamlanamadı. Lütfen tekrar deneyin.",
        ),
      );
    }
  }

  function handleSelectSourceTable(tableId: string) {
    console.info("[TableActionsScreen] Source table selected.", {
      action: activeAction ?? "general",
      sourceTableId: tableId,
    });
    setSelectedSourceTableId(tableId);
  }

  function handleChangeSourceTable() {
    console.info("[TableActionsScreen] Source table selection reset.", {
      previousSourceTableId: selectedSourceTableId,
    });
    setSelectedSourceTableId(null);
  }

  const title = selectedSourceTable?.label ?? "Masa İşlemleri";
  const subtitle = selectedSourceTable
    ? `${selectedSourceTable.label} için işlem seçin.`
    : getSelectionSubtitle(activeAction);

  return (
    <Screen>
      <SectionHeader
        eyebrow="Masa İşlemleri"
        subtitle={subtitle}
        title={title}
      />

      {!selectedSourceTable ? (
        <SurfaceCard>
          <Text style={styles.panelTitle}>
            {getSelectionTitle(activeAction)}
          </Text>
          <Text style={styles.panelCopy}>
            Uygun bir masa seçmeden işlem başlatılamaz.
          </Text>

          <View style={styles.selectionList}>
            {sourceSelectionTables.length ? (
              sourceSelectionTables.map((table) => (
                <SelectionRow
                  key={table.id}
                  onPress={() => handleSelectSourceTable(table.id)}
                  subtitle={formatTableMeta(table)}
                  title={table.label}
                />
              ))
            ) : (
              <Text style={styles.emptyCopy}>Uygun masa bulunamadı.</Text>
            )}
          </View>
        </SurfaceCard>
      ) : (
        <>
          <SurfaceCard style={styles.contextCard}>
            <Text style={styles.contextLabel}>Seçili Masa</Text>
            <View style={styles.contextRow}>
              <View style={styles.contextCopy}>
                <Text style={styles.contextTitle}>{selectedSourceTable.label}</Text>
                <Text style={styles.contextSubtitle}>
                  {formatTableMeta(selectedSourceTable)}
                </Text>
              </View>
              {!initialTableId ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={handleChangeSourceTable}
                  style={({ pressed }) => [
                    styles.changeButton,
                    pressed ? styles.changeButtonPressed : null,
                  ]}
                >
                  <Text style={styles.changeButtonText}>Değiştir</Text>
                </Pressable>
              ) : null}
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <ActionTile
              onPress={handleOpenTable}
              subtitle="Boş bir masayı aktif sipariş akışına alın."
              title="Masa Aç"
              tone="brand"
            />
            <ActionTile
              onPress={() => setActiveAction("move")}
              subtitle="Taşınacak kaynak masa seçildikten sonra hedef boş masa seçilir."
              title="Masa Taşı"
              tone="info"
            />
            <ActionTile
              onPress={() => setActiveAction("merge")}
              subtitle="Ana masa seçildikten sonra birleştirilecek aktif masa seçilir."
              title="Masa Birleştir"
              tone="purple"
            />
            <ActionTile
              onPress={handleSplitTable}
              subtitle="Seçili masanın adisyonunu yeni bir masaya ayırın."
              title="Masa Ayır"
              tone="warning"
            />
          </SurfaceCard>

          {activeAction === "move" ? (
            <SurfaceCard>
              <Text style={styles.panelTitle}>Hedef Boş Masa</Text>
              <Text style={styles.panelCopy}>
                Taşıma işlemi için açıkça bir hedef boş masa seçin.
              </Text>

              <View style={styles.selectionList}>
                {moveTargetTables.length ? (
                  moveTargetTables.map((table) => (
                    <SelectionRow
                      key={table.id}
                      onPress={() => handleMoveToTarget(table.id)}
                      subtitle={formatTableMeta(table)}
                      title={table.label}
                    />
                  ))
                ) : (
                  <Text style={styles.emptyCopy}>
                    Taşıma için uygun boş masa bulunamadı.
                  </Text>
                )}
              </View>
            </SurfaceCard>
          ) : null}

          {activeAction === "merge" ? (
            <SurfaceCard>
              <Text style={styles.panelTitle}>Birleştirilecek Hedef Masa</Text>
              <Text style={styles.panelCopy}>
                Ana masa ile birleşecek ikinci aktif masayı seçin.
              </Text>

              <View style={styles.selectionList}>
                {mergeTargetTables.length ? (
                  mergeTargetTables.map((table) => (
                    <SelectionRow
                      key={table.id}
                      onPress={() => handleMergeToTarget(table.id)}
                      subtitle={formatTableMeta(table)}
                      title={table.label}
                    />
                  ))
                ) : (
                  <Text style={styles.emptyCopy}>
                    Birleştirme için uygun aktif masa bulunamadı.
                  </Text>
                )}
              </View>
            </SurfaceCard>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function SelectionRow({
  onPress,
  subtitle,
  title,
}: {
  onPress: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.selectionRow,
        pressed ? styles.selectionRowPressed : null,
      ]}
    >
      <View style={styles.selectionCopy}>
        <Text style={styles.selectionTitle}>{title}</Text>
        <Text style={styles.selectionSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.selectionAction}>Seç</Text>
    </Pressable>
  );
}

function formatTableMeta(table: TableSummary) {
  return `${table.areaLabel ?? "Salon"} · ${table.status}`;
}

function getSelectionTitle(action: TableActionMode | null) {
  switch (action) {
    case "open":
      return "Açılacak Masa";
    case "move":
      return "Taşınacak Kaynak Masa";
    case "merge":
      return "Ana Masa";
    case "split":
      return "Ayırılacak Masa";
    default:
      return "İşlem Yapılacak Masa";
  }
}

function getSelectionSubtitle(action: TableActionMode | null) {
  switch (action) {
    case "open":
      return "Boş masayı seçin, ardından açma işlemini başlatın.";
    case "move":
      return "Önce taşınacak masayı, sonra hedef boş masayı seçin.";
    case "merge":
      return "Önce ana masayı, sonra birleşecek diğer masayı seçin.";
    case "split":
      return "Önce ayrılacak aktif masayı seçin.";
    default:
      return "Önce işlem yapılacak masayı seçin.";
  }
}

function buildNextSplitTableNo(tables: TableSummary[]) {
  const highestTableNumber = tables.reduce((highest, table) => {
    const tableNumber = extractTableNumber(table.label);
    return tableNumber !== null ? Math.max(highest, tableNumber) : highest;
  }, 0);

  return String(highestTableNumber + 1);
}

function extractTableNumber(label: string) {
  const match = label.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

async function resolveSelectedOrder({
  selectedOrder,
  selectedSourceTable,
  upsertOrder,
}: {
  selectedOrder: OrderDetail | undefined;
  selectedSourceTable: TableSummary;
  upsertOrder: (order: OrderDetail) => void;
}) {
  if (selectedOrder) {
    return selectedOrder;
  }

  const activeBillId = Number(selectedSourceTable.activeOrderId);

  if (!Number.isFinite(activeBillId)) {
    console.warn("[TableActionsScreen] Selected source table has no active bill for split.", {
      sourceTableId: selectedSourceTable.id,
    });
    return null;
  }

  console.info("[TableActionsScreen] Fetching bill detail for selected source table.", {
    activeBillId,
    sourceTableId: selectedSourceTable.id,
  });
  const order = await services.bills.getBillDetailById(activeBillId);

  if (order) {
    upsertOrder(order);
  }

  return order;
}

const styles = StyleSheet.create({
  changeButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceBrand,
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 88,
    paddingHorizontal: spacing.md,
  },
  changeButtonPressed: {
    opacity: 0.92,
  },
  changeButtonText: {
    color: colors.primaryContrast,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
  },
  contextCard: {
    marginBottom: spacing.md,
  },
  contextCopy: {
    flex: 1,
  },
  contextLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    marginBottom: spacing.xs,
  },
  contextRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  contextSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginTop: spacing.xxs,
  },
  contextTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
  },
  emptyCopy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  panelCopy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.md,
  },
  panelTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    marginBottom: spacing.xs,
  },
  selectionAction: {
    color: colors.primary,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
  },
  selectionCopy: {
    flex: 1,
  },
  selectionList: {
    gap: spacing.sm,
  },
  selectionRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 74,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectionRowPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.992 }],
  },
  selectionSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginTop: spacing.xxs,
  },
  selectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
  },
});
