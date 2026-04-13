import React from "react";
import { StatusBar, View } from "react-native";

import { AppProviders } from "./providers/AppProviders";
import { AppNavigator } from "../navigation/AppNavigator";
import { colors } from "../theme/colors";

import { useAppBootstrap } from "../hooks/useAppBootstrap";

function AppShell() {
  useAppBootstrap();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        animated
        barStyle="dark-content"
        backgroundColor={colors.surface}
      />
      <AppNavigator />
    </View>
  );
}

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <AppProviders>
        <AppShell />
      </AppProviders>
    </View>
  );
}
