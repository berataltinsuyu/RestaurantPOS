import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LoginScreen } from "../app/screens/auth/LoginScreen";
import { MenuSelectionScreen } from "../app/screens/orders/MenuSelectionScreen";
import { OrderDetailScreen } from "../app/screens/orders/OrderDetailScreen";
import { CardPosRedirectScreen } from "../app/screens/payments/CardPosRedirectScreen";
import { ContactlessPromptScreen } from "../app/screens/payments/ContactlessPromptScreen";
import { PaymentScreen } from "../app/screens/payments/PaymentScreen";
import { PaymentSuccessScreen } from "../app/screens/payments/PaymentSuccessScreen";
import { SplitPaymentScreen } from "../app/screens/payments/SplitPaymentScreen";
import { TableActionsScreen } from "../app/screens/tables/TableActionsScreen";
import { TableDetailScreen } from "../app/screens/tables/TableDetailScreen";
import { TablesOverviewScreen } from "../app/screens/tables/TablesOverviewScreen";
import { ROUTES } from "../constants/routes";
import { useAppStore } from "../state/app-store";
import { colors, typography } from "../theme";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const session = useAppStore((state) => state.session);
  const clearSession = useAppStore((state) => state.clearSession);

  return (
    <Stack.Navigator
      initialRouteName={session ? ROUTES.TABLES_OVERVIEW : ROUTES.LOGIN}
      screenOptions={{
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: colors.canvas,
        },
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          color: colors.textPrimary,
          fontSize: typography.subtitle.fontSize,
          fontWeight: typography.subtitle.fontWeight,
        },
      }}
    >
      <Stack.Screen
        component={LoginScreen}
        name={ROUTES.LOGIN}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={TablesOverviewScreen}
        name={ROUTES.TABLES_OVERVIEW}
        options={({ navigation }) => ({
          headerRight: () => (
            <Pressable
              onPress={() => {
                clearSession();
                navigation.replace(ROUTES.LOGIN);
              }}
            >
              <Text style={styles.headerAction}>Logout</Text>
            </Pressable>
          ),
          title: "Masa Plani",
        })}
      />
      <Stack.Screen
        component={TableDetailScreen}
        name={ROUTES.TABLE_DETAIL}
        options={{ title: "Table Detail" }}
      />
      <Stack.Screen
        component={OrderDetailScreen}
        name={ROUTES.ORDER_DETAIL}
        options={{ title: "Order Detail" }}
      />
      <Stack.Screen
        component={MenuSelectionScreen}
        name={ROUTES.MENU_SELECTION}
        options={{ title: "Menu Selection" }}
      />
      <Stack.Screen
        component={PaymentScreen}
        name={ROUTES.PAYMENT}
        options={{
          presentation: "modal",
          title: "Payment",
        }}
      />
      <Stack.Screen
        component={SplitPaymentScreen}
        name={ROUTES.SPLIT_PAYMENT}
        options={{
          presentation: "modal",
          title: "Split Payment",
        }}
      />
      <Stack.Screen
        component={TableActionsScreen}
        name={ROUTES.TABLE_ACTIONS}
        options={{
          presentation: "modal",
          title: "Table Actions",
        }}
      />
      <Stack.Screen
        component={CardPosRedirectScreen}
        name={ROUTES.CARD_POS_REDIRECT}
        options={{
          headerShown: false,
          presentation: "modal",
          title: "Card POS",
        }}
      />
      <Stack.Screen
        component={ContactlessPromptScreen}
        name={ROUTES.CONTACTLESS_PROMPT}
        options={{
          headerShown: false,
          presentation: "modal",
          title: "Contactless",
        }}
      />
      <Stack.Screen
        component={PaymentSuccessScreen}
        name={ROUTES.PAYMENT_SUCCESS}
        options={{
          gestureEnabled: false,
          headerShown: false,
          title: "Payment Success",
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    color: colors.primary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyStrong.fontWeight,
  },
});
