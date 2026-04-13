import React from "react";
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
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        component={TableDetailScreen}
        name={ROUTES.TABLE_DETAIL}
        options={{ title: "Masa Detayı" }}
      />
      <Stack.Screen
        component={OrderDetailScreen}
        name={ROUTES.ORDER_DETAIL}
        options={{ title: "Sipariş Detayı" }}
      />
      <Stack.Screen
        component={MenuSelectionScreen}
        name={ROUTES.MENU_SELECTION}
        options={{ title: "Ürün Seçimi" }}
      />
      <Stack.Screen
        component={PaymentScreen}
        name={ROUTES.PAYMENT}
        options={{
          presentation: "modal",
          title: "Ödeme",
        }}
      />
      <Stack.Screen
        component={SplitPaymentScreen}
        name={ROUTES.SPLIT_PAYMENT}
        options={{
          presentation: "modal",
          title: "Bölünmüş Ödeme",
        }}
      />
      <Stack.Screen
        component={TableActionsScreen}
        name={ROUTES.TABLE_ACTIONS}
        options={{
          presentation: "modal",
          title: "Masa İşlemleri",
        }}
      />
      <Stack.Screen
        component={CardPosRedirectScreen}
        name={ROUTES.CARD_POS_REDIRECT}
        options={{
          headerShown: false,
          presentation: "modal",
          title: "Kart ile Ödeme",
        }}
      />
      <Stack.Screen
        component={ContactlessPromptScreen}
        name={ROUTES.CONTACTLESS_PROMPT}
        options={{
          headerShown: false,
          presentation: "modal",
          title: "Temassız Kart Okutun",
        }}
      />
      <Stack.Screen
        component={PaymentSuccessScreen}
        name={ROUTES.PAYMENT_SUCCESS}
        options={{
          gestureEnabled: false,
          headerShown: false,
          title: "Ödeme Başarılı",
        }}
      />
    </Stack.Navigator>
  );
}
