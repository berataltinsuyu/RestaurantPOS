import React from "react";
import { StatusBar, View, Text } from "react-native";

import { AppProviders } from "./providers/AppProviders";
import { AppNavigator } from "../navigation/AppNavigator";
import { colors } from "../theme/colors";

function AppShell() {
  return (
    <>
      <StatusBar
        animated
        barStyle="dark-content"
        backgroundColor={colors.surface}
      />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
}