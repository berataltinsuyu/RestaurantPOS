import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BottomActionBar } from "../../../components/common/BottomActionBar";
import { Button } from "../../../components/common/Button";
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
  typeof ROUTES.ORDER_DETAIL
>;

export function OrderDetailScreen({ navigation, route }: Props) {
  const { tableId } = route.params;
  useBillRealtimeSync(tableId);
  const table = useAppStore((state) =>
    state.tables.find((candidate) => candidate.id === tableId),
  );
  const order = useAppStore((state) => state.ordersByTableId[tableId]);

  if (!table) {
    return (
      <Screen>
        <SurfaceCard>
          <Text style={styles.emptyCopy}>Masa bilgisi bulunamadı.</Text>
        </SurfaceCard>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <BottomActionBar style={styles.bottomActions}>
          <Button
            fullWidth={false}
            onPress={() =>
              navigation.navigate(ROUTES.MENU_SELECTION, { tableId: table.id })
            }
            style={styles.bottomButton}
            title="Ürün Ekle"
            variant="secondary"
          />
          <Button
            disabled={!order}
            fullWidth={false}
            onPress={() =>
              navigation.navigate(ROUTES.PAYMENT, { tableId: table.id })
            }
            style={styles.bottomButton}
            title="Ödemeye Geç"
          />
        </BottomActionBar>
      }
    >
      <SectionHeader
        eyebrow="Sipariş Detayı"
        right={
          order ? <StatusChip label={order.status} status={order.status} /> : null
        }
        subtitle="Siparişi gözden geçirin, ürün ekleyin ve ödeme adımına geçin."
        title={table.label}
      />

      <SurfaceCard elevated>
        <Text style={styles.sectionTitle}>Sipariş Kalemleri</Text>
        {order?.items.length ? (
          order.items.map((item) => (
            <View key={item.id} style={styles.orderRow}>
              <View style={styles.orderTextBlock}>
                <Text style={styles.orderName}>{item.name}</Text>
                <Text style={styles.orderMeta}>
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                </Text>
              </View>
              <Text style={styles.orderValue}>
                {formatCurrency(item.quantity * item.unitPrice)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyCopy}>
            Henüz ürün eklenmedi. Bu masa için ilk siparişi ürün seçimi
            ekranından başlatabilirsiniz.
          </Text>
        )}
      </SurfaceCard>

      <SurfaceCard tone="brand">
        <Text style={styles.sectionTitle}>İşlem Notu</Text>
        <Text style={styles.emptyCopy}>
          Bölünmüş ödeme ve son düzenleme işlemleri bu sipariş üzerinden devam
          eder. Sipariş bağlamı bu ekranda korunur.
        </Text>
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bottomActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  bottomButton: {
    flex: 1,
  },
  emptyCopy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  orderMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
  orderName: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyStrong.fontWeight,
  },
  orderRow: {
    alignItems: "center",
    borderBottomColor: colors.borderSoft,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  orderTextBlock: {
    flex: 1,
    paddingRight: spacing.md,
  },
  orderValue: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyStrong.fontWeight,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    marginBottom: spacing.md,
  },
});
