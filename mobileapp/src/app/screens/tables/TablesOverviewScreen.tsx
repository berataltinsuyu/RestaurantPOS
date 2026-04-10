import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "../../../components/common/Button";
import { FilterChip } from "../../../components/common/FilterChip";
import { Screen } from "../../../components/common/Screen";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
import { ROUTES } from "../../../constants/routes";
import { useTablesRealtimeSync } from "../../../hooks/useTablesRealtimeSync";
import { RootStackParamList } from "../../../navigation/types";
import { useAppStore } from "../../../state/app-store";
import {
  colors,
  radii,
  spacing,
  typography,
} from "../../../theme";
import { TableActionsSheet } from "../../../components/tables/TableActionsSheet";
import { TableCard } from "../../../components/tables/TableCard";
import { TableStatCard } from "../../../components/tables/TableStatCard";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.TABLES_OVERVIEW
>;

type TableFilter = "all" | "empty" | "occupied" | "paymentPending";

export function TablesOverviewScreen({ navigation }: Props) {
  useTablesRealtimeSync();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TableFilter>("all");
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const session = useAppStore((state) => state.session);
  const tables = useAppStore((state) => state.tables);

  const filteredTables = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tables.filter((table) => {
      const matchesQuery =
        !normalizedQuery ||
        table.label.toLowerCase().includes(normalizedQuery) ||
        (table.areaLabel?.toLowerCase().includes(normalizedQuery) ?? false);
      const matchesFilter =
        activeFilter === "all" ? true : table.status === activeFilter;

      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, query, tables]);

  const counts = useMemo(
    () => ({
      empty: tables.filter((table) => table.status === "empty").length,
      occupied: tables.filter((table) => table.status === "occupied").length,
      paymentPending: tables.filter(
        (table) => table.status === "paymentPending",
      ).length,
    }),
    [tables],
  );

  const defaultActionTableId =
    filteredTables[0]?.id ?? tables[0]?.id ?? "table-1";
  const waiterLabel = session?.waiterName ?? "Ahmet Yılmaz";
  const roleLabel = "Garson";

  function openTableActionsSheet() {
    setIsActionSheetVisible(true);
  }

  function closeTableActionsSheet() {
    setIsActionSheetVisible(false);
  }

  function navigateToTableActions() {
    closeTableActionsSheet();
    navigation.navigate(ROUTES.TABLE_ACTIONS, {
      tableId: defaultActionTableId,
    });
  }

  function handleOpenEmptyTable(tableId: string) {
    navigation.navigate(ROUTES.TABLE_ACTIONS, { tableId });
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <SectionHeader
        leading={<BrandMark />}
        right={<MenuButton onPress={openTableActionsSheet} />}
        subtitle={`${waiterLabel} - ${roleLabel}`}
        title="Masa Planı"
      />

      <View style={styles.searchShell}>
        <SearchIcon />
        <TextInput
          onChangeText={setQuery}
          placeholder="Masa ara..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={query}
        />
      </View>

      <View style={styles.summaryRow}>
        <TableStatCard
          label="Dolu"
          tone="info"
          value={String(counts.occupied)}
        />
        <TableStatCard label="Müsait" value={String(counts.empty)} />
        <TableStatCard
          label="Bekliyor"
          tone="warning"
          value={String(counts.paymentPending)}
        />
      </View>

      <View style={styles.filtersRow}>
        <FilterChip
          label="Tümü"
          onPress={() => setActiveFilter("all")}
          selected={activeFilter === "all"}
        />
        <FilterChip
          label="Dolu"
          onPress={() => setActiveFilter("occupied")}
          selected={activeFilter === "occupied"}
        />
        <FilterChip
          label="Boş"
          onPress={() => setActiveFilter("empty")}
          selected={activeFilter === "empty"}
        />
        <FilterChip
          label="Ödeme"
          onPress={() => setActiveFilter("paymentPending")}
          selected={activeFilter === "paymentPending"}
          tone="warning"
        />
      </View>

      <Button
        leading={<CogIcon />}
        onPress={openTableActionsSheet}
        style={styles.actionsButton}
        title="Masa İşlemleri"
        variant="brandOutline"
      />

      {filteredTables.length ? (
        <View style={styles.grid}>
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              onOpen={() => handleOpenEmptyTable(table.id)}
              onPress={() =>
                navigation.navigate(ROUTES.TABLE_DETAIL, { tableId: table.id })
              }
              table={table}
            />
          ))}
        </View>
      ) : (
        <SurfaceCard style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Masa bulunamadı</Text>
          <Text style={styles.emptyCopy}>
            Arama veya filtre seçimine uygun masa görünmüyor.
          </Text>
        </SurfaceCard>
      )}

      <TableActionsSheet
        onClose={closeTableActionsSheet}
        onMerge={navigateToTableActions}
        onMove={navigateToTableActions}
        onSplit={navigateToTableActions}
        visible={isActionSheetVisible}
      />
    </Screen>
  );
}

function BrandMark() {
  return (
    <View style={styles.brandBadge}>
      <View style={styles.brandInset} />
    </View>
  );
}

function MenuButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Masa işlemlerini aç"
      accessibilityRole="button"
      android_ripple={{ color: "rgba(39,48,67,0.05)", radius: 22 }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuButton,
        pressed ? styles.iconButtonPressed : null,
      ]}
    >
      <View style={styles.menuLine} />
      <View style={styles.menuLine} />
      <View style={styles.menuLine} />
    </Pressable>
  );
}

function SearchIcon() {
  return (
    <View style={styles.searchIcon}>
      <View style={styles.searchRing} />
      <View style={styles.searchHandle} />
    </View>
  );
}

function CogIcon() {
  return (
    <View style={styles.cogFrame}>
      <View style={styles.cogRing} />
      <View style={[styles.cogTooth, styles.cogToothTop]} />
      <View style={[styles.cogTooth, styles.cogToothBottom]} />
      <View style={[styles.cogTooth, styles.cogToothLeft]} />
      <View style={[styles.cogTooth, styles.cogToothRight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  actionsButton: {
    marginBottom: 0,
  },
  brandBadge: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  brandInset: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    height: 18,
    width: 12,
  },
  cogFrame: {
    height: 16,
    position: "relative",
    width: 16,
  },
  cogRing: {
    borderColor: colors.primary,
    borderRadius: radii.pill,
    borderWidth: 1.6,
    height: 12,
    left: 2,
    position: "absolute",
    top: 2,
    width: 12,
  },
  cogTooth: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    position: "absolute",
  },
  cogToothBottom: {
    bottom: 0,
    height: 3,
    left: 6,
    width: 3,
  },
  cogToothLeft: {
    height: 3,
    left: 0,
    top: 6,
    width: 3,
  },
  cogToothRight: {
    height: 3,
    right: 0,
    top: 6,
    width: 3,
  },
  cogToothTop: {
    height: 3,
    left: 6,
    top: 0,
    width: 3,
  },
  content: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  emptyCopy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
  },
  emptyState: {
    marginBottom: 0,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
    marginBottom: spacing.xs,
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between",
    paddingTop: spacing.sm,
  },
  iconButtonPressed: {
    opacity: 0.9,
  },
  menuButton: {
    alignItems: "center",
    borderRadius: radii.pill,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  menuLine: {
    backgroundColor: colors.textPrimary,
    borderRadius: radii.pill,
    height: 2,
    marginVertical: 1.5,
    width: 18,
  },
  searchHandle: {
    backgroundColor: colors.textMuted,
    borderRadius: radii.pill,
    bottom: -1,
    height: 2,
    position: "absolute",
    right: -1,
    transform: [{ rotate: "45deg" }],
    width: 6,
  },
  searchIcon: {
    height: 18,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
    position: "relative",
    width: 18,
  },
  searchInput: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    minHeight: 52,
    paddingRight: spacing.md,
  },
  searchRing: {
    borderColor: colors.textMuted,
    borderRadius: radii.pill,
    borderWidth: 1.8,
    height: 12,
    left: 1,
    position: "absolute",
    top: 1,
    width: 12,
  },
  searchShell: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 52,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "space-between",
  },
});
