import React, { PropsWithChildren } from "react";
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { navigationTheme } from "../../theme";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <NavigationContainer
        theme={{
          ...NavigationDefaultTheme,
          ...navigationTheme,
        }}
      >
        {children}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
