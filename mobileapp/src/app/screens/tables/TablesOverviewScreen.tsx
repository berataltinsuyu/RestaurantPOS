import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getBackendErrorMessage } from "../../../api/http/api-client";
import { FeedbackBanner } from "../../../components/common/FeedbackBanner";
import { FilterChip } from "../../../components/common/FilterChip";
import { Screen } from "../../../components/common/Screen";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
import { ROUTES } from "../../../constants/routes";
import { useTablesRealtimeSync } from "../../../hooks/useTablesRealtimeSync";
import { RootStackParamList } from "../../../navigation/types";
import { services } from "../../../services/composition-root";
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
type TableActionMode = "open" | "move" | "merge" | "split";
type FeedbackState = { tone: "success" | "error" | "info"; message: string } | null;

export function TablesOverviewScreen({ navigation }: Props) {
  useTablesRealtimeSync();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TableFilter>("all");
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const session = useAppStore((state) => state.session);
  const tables = useAppStore((state) => state.tables);
  const ordersByTableId = useAppStore((state) => state.ordersByTableId);
  const clearSession = useAppStore((state) => state.clearSession);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }

      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);

  const filteredTables = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...tables]
      .sort(compareTablesByNumericLabel)
      .filter((table) => {
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

  const waiterName = session?.waiterName ?? "Aktif garson oturumu";

  function openTableActionsSheet() {
    if (!tables.length) {
      return;
    }

    setIsActionSheetVisible(true);
  }

  function closeTableActionsSheet() {
    setIsActionSheetVisible(false);
  }

  function navigateToTableActions(initialAction?: TableActionMode) {
    closeTableActionsSheet();
    navigation.navigate(ROUTES.TABLE_ACTIONS, initialAction ? { initialAction } : undefined);
  }

  function showFeedback(nextFeedback: FeedbackState) {
    setFeedback(nextFeedback);

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }

    if (nextFeedback) {
      feedbackTimerRef.current = setTimeout(() => {
        setFeedback(null);
      }, 3200);
    }
  }

  function getPreparationState(tableId: string) {
    const order = ordersByTableId[tableId];
    if (!order?.items.length) {
      return undefined;
    }

    if (order.items.some((item) => item.status === 6)) {
      return "ready" as const;
    }

    if (order.items.some((item) => item.status === 1 || item.status === 5)) {
      return "kitchen" as const;
    }

    return undefined;
  }

  async function handleOpenEmptyTable(tableId: string) {
    const currentTable = tables.find((table) => table.id === tableId);

    if (!currentTable || currentTable.status !== "empty") {
      return;
    }

    try {
      console.info("[TablesOverviewScreen] Direct empty-table open requested.", {
        tableId: currentTable.id,
      });
      await services.tables.openTable({
        guestCount: currentTable.guestCount || 2,
        tableId: currentTable.id,
        waiterId: session?.waiterId ?? "",
      });
      await services.sync.refreshAfterMutation(currentTable.id);
      showFeedback({
        message: `${currentTable.label} açıldı. Sipariş ekranı hazırlanıyor.`,
        tone: "success",
      });
      navigationTimerRef.current = setTimeout(() => {
        navigation.navigate(ROUTES.ORDER_DETAIL, { tableId: currentTable.id });
      }, 450);
    } catch (error) {
      console.error("[TablesOverviewScreen] Open table failed.", error);
      const detail = getBackendErrorMessage(
        error,
        "İşlem backend üzerinde tamamlanamadı. Lütfen tekrar deneyin.",
      );
      showFeedback({
        message: detail,
        tone: "error",
      });
    }
  }

  function handleLogout() {
    services.backend.clearSession();
    clearSession();
    navigation.replace(ROUTES.LOGIN);
  }

  return (
    <Screen contentContainerStyle={styles.content} includeTopSafeArea>
      <View style={styles.infoRow}>
        <View style={styles.infoTopRow}>
          <View style={styles.infoLeftCluster}>
            <BrandMark />
            <View style={styles.waiterBlock}>
              <Text style={styles.screenTitle}>Masalar</Text>
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={styles.waiterName}
              >
                {waiterName}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityHint="Garson oturumunu kapatır ve giriş ekranına döner"
            accessibilityLabel="Garson değiştir"
            accessibilityRole="button"
            android_ripple={{ color: "rgba(214,169,55,0.12)", radius: 18 }}
            hitSlop={8}
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed ? styles.logoutButtonPressed : null,
            ]}
          >
            <SessionExitIcon />
          </Pressable>
        </View>

        <Pressable
          accessibilityLabel="Masa İşlemleri"
          accessibilityRole="button"
          accessibilityState={{ disabled: !tables.length }}
          android_ripple={{ color: "rgba(214,169,55,0.12)" }}
          disabled={!tables.length}
          onPress={openTableActionsSheet}
          style={({ pressed }) => [
            styles.headerActionButton,
            !tables.length ? styles.headerActionButtonDisabled : null,
            pressed && tables.length ? styles.headerActionButtonPressed : null,
          ]}
        >
          <CogIcon />
          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            style={styles.headerActionText}
          >
            Masa İşlemleri
          </Text>
        </Pressable>
      </View>

      {feedback ? (
        <FeedbackBanner
          message={feedback.message}
          onDismiss={() => showFeedback(null)}
          style={styles.feedbackBanner}
          tone={feedback.tone}
        />
      ) : null}

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
        <TableStatCard label="Boş" value={String(counts.empty)} />
        <TableStatCard
          label="Bekliyor"
          tone="warning"
          value={String(counts.paymentPending)}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}
        contentContainerStyle={styles.filtersContent}
      >
        <FilterChip
          label="Tümü"
          onPress={() => setActiveFilter("all")}
          selected={activeFilter === "all"}
          style={styles.filterChip}
        />
        <FilterChip
          label="Dolu"
          onPress={() => setActiveFilter("occupied")}
          selected={activeFilter === "occupied"}
          style={styles.filterChip}
        />
        <FilterChip
          label="Boş"
          onPress={() => setActiveFilter("empty")}
          selected={activeFilter === "empty"}
          style={styles.filterChip}
        />
        <FilterChip
          label="Ödeme"
          onPress={() => setActiveFilter("paymentPending")}
          selected={activeFilter === "paymentPending"}
          style={styles.filterChip}
          tone="warning"
        />
      </ScrollView>

      {filteredTables.length ? (
        <View style={styles.grid}>
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              onOpen={() => handleOpenEmptyTable(table.id)}
              onPress={() =>
                navigation.navigate(ROUTES.TABLE_DETAIL, { tableId: table.id })
              }
              preparationState={getPreparationState(table.id)}
              style={styles.tableCard}
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
        onOpen={() => navigateToTableActions("open")}
        onMerge={() => navigateToTableActions("merge")}
        onMove={() => navigateToTableActions("move")}
        onSplit={() => navigateToTableActions("split")}
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

function compareTablesByNumericLabel(
  left: { label: string },
  right: { label: string },
) {
  const leftNumber = extractTableNumber(left.label);
  const rightNumber = extractTableNumber(right.label);

  if (leftNumber !== null && rightNumber !== null && leftNumber !== rightNumber) {
    return leftNumber - rightNumber;
  }

  if (leftNumber !== null && rightNumber === null) {
    return -1;
  }

  if (leftNumber === null && rightNumber !== null) {
    return 1;
  }

  return left.label.localeCompare(right.label, "tr", { numeric: true });
}

function extractTableNumber(label: string) {
  const match = label.match(/(\d+)/);

  return match ? Number(match[1]) : null;
}

function SearchIcon() {
  return (
    <View style={styles.searchIcon}>
      <View style={styles.searchRing} />
      <View style={styles.searchHandle} />
    </View>
  );
}

function CogIcon({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.cogFrame, compact ? styles.cogFrameCompact : null]}>
      <View style={styles.cogRing} />
      <View style={[styles.cogTooth, styles.cogToothTop]} />
      <View style={[styles.cogTooth, styles.cogToothBottom]} />
      <View style={[styles.cogTooth, styles.cogToothLeft]} />
      <View style={[styles.cogTooth, styles.cogToothRight]} />
    </View>
  );
}

function SessionExitIcon() {
  return (
    <View style={styles.logoutIconFrame}>
      <View style={styles.logoutDoor} />
      <View style={styles.logoutArrowShaft} />
      <View style={[styles.logoutArrowHead, styles.logoutArrowHeadTop]} />
      <View style={[styles.logoutArrowHead, styles.logoutArrowHeadBottom]} />
    </View>
  );
}

const styles = StyleSheet.create({
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
  cogFrameCompact: {
    marginRight: -spacing.xs,
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
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  emptyCopy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    marginBottom: 0,
    paddingVertical: spacing.lg,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  filterChip: {
    flexShrink: 0,
    minWidth: 74,
    paddingHorizontal: spacing.sm,
  },
  feedbackBanner: {
    marginBottom: spacing.sm,
  },
  filtersContent: {
    gap: spacing.xs,
    paddingRight: spacing.xxs,
  },
  filtersRow: {
    flexGrow: 0,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: spacing.xs,
  },
  headerActionButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radii.md,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    marginBottom: 0,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  headerActionButtonDisabled: {
    opacity: 0.52,
  },
  headerActionButtonPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.988 }],
  },
  headerActionText: {
    color: colors.primary,
    flexShrink: 1,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
  },
  infoLeftCluster: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minWidth: 0,
    paddingRight: spacing.sm,
  },
  infoRow: {
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logoutArrowHead: {
    backgroundColor: colors.primary,
    borderRadius: 1,
    height: 2,
    position: "absolute",
    right: 0,
    width: 7,
  },
  logoutArrowHeadBottom: {
    top: 8,
    transform: [{ rotate: "-42deg" }],
  },
  logoutArrowHeadTop: {
    top: 4,
    transform: [{ rotate: "42deg" }],
  },
  logoutArrowShaft: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    height: 2,
    left: 7,
    position: "absolute",
    top: 6,
    width: 9,
  },
  logoutButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    marginLeft: spacing.xs,
    width: 32,
  },
  logoutButtonPressed: {
    opacity: 0.9,
  },
  logoutDoor: {
    borderColor: colors.primary,
    borderRadius: 3,
    borderWidth: 1.6,
    height: 14,
    left: 1,
    position: "absolute",
    top: 0,
    width: 7,
  },
  logoutIconFrame: {
    height: 14,
    position: "relative",
    width: 16,
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
    minHeight: 54,
  },
  screenTitle: {
    color: colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    lineHeight: typography.heading.lineHeight,
    marginBottom: spacing.xxs,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "space-between",
  },
  tableCard: {
    marginBottom: spacing.sm,
    width: "48.4%",
  },
  waiterBlock: {
    flex: 1,
    minWidth: 0,
  },
  waiterName: {
    color: colors.textSecondary,
    flexShrink: 1,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyStrong.fontWeight,
    lineHeight: typography.body.lineHeight,
  },
});
