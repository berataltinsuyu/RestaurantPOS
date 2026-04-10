import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BottomActionBar } from "../../../components/common/BottomActionBar";
import { Button } from "../../../components/common/Button";
import { Screen } from "../../../components/common/Screen";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
import { formatCurrency } from "../../../constants/formatters";
import { ROUTES } from "../../../constants/routes";
import { RootStackParamList } from "../../../navigation/types";
import { services } from "../../../services/composition-root";
import { useAppStore } from "../../../state/app-store";
import { colors, spacing, typography } from "../../../theme";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.MENU_SELECTION
>;

export function MenuSelectionScreen({ navigation, route }: Props) {
  const { tableId } = route.params;
  const menuCategories = useAppStore((state) => state.menuCategories);
  const menuProducts = useAppStore((state) => state.menuProducts);
  const table = useAppStore((state) =>
    state.tables.find((candidate) => candidate.id === tableId),
  );
  const upsertOrder = useAppStore((state) => state.upsertOrder);
  const upsertTable = useAppStore((state) => state.upsertTable);

  async function handleAddProduct(productId: string) {
    const updatedOrder = await services.orders.addMenuProduct({
      productId,
      quantity: 1,
      tableId,
    });

    upsertOrder(updatedOrder);

    if (table) {
      upsertTable({
        ...table,
        activeOrderId: updatedOrder.id,
        status: "occupied",
        totalAmount: updatedOrder.total,
        updatedAt: new Date().toISOString(),
      });
    }

    Alert.alert(
      "Product added",
      "The menu flow now passes through the orders service. Replace the mock gateway when the real order API is available.",
    );
  }

  return (
    <Screen
      footer={
        <BottomActionBar>
          <Button
            onPress={() => navigation.replace(ROUTES.ORDER_DETAIL, { tableId })}
            title="Siparise Don"
          />
        </BottomActionBar>
      }
    >
      <SectionHeader
        eyebrow="Menu Selection"
        subtitle="This placeholder screen owns product selection for waiters. Product management itself remains outside the handheld scope."
        title={table ? `${table.label} menu` : "Menu"}
      />

      {menuCategories.map((category) => {
        const productsForCategory = menuProducts.filter(
          (product) => product.categoryId === category.id,
        );

        return (
          <SurfaceCard elevated key={category.id}>
            <Text style={styles.sectionTitle}>{category.label}</Text>
            {productsForCategory.map((product) => (
              <View key={product.id} style={styles.productRow}>
                <View style={styles.productTextBlock}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productMeta}>
                    {formatCurrency(product.price)}
                  </Text>
                </View>
                <Button
                  fullWidth={false}
                  onPress={() => handleAddProduct(product.id)}
                  size="md"
                  title="Add"
                />
              </View>
            ))}
          </SurfaceCard>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  productMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
  productName: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyStrong.fontWeight,
  },
  productRow: {
    borderBottomColor: colors.borderSoft,
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  productTextBlock: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    marginBottom: spacing.md,
  },
});
