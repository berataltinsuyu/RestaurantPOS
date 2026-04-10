import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "../../../components/common/Button";
import { Screen } from "../../../components/common/Screen";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
import { ROUTES } from "../../../constants/routes";
import { RootStackParamList } from "../../../navigation/types";
import { useAppStore } from "../../../state/app-store";
import { colors, radii, spacing, typography } from "../../../theme";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.LOGIN>;

export function LoginScreen({ navigation }: Props) {
  const [waiterName, setWaiterName] = useState("Ayse");
  const [pin, setPin] = useState("1234");
  const setSession = useAppStore((state) => state.setSession);

  function handleLogin() {
    if (!waiterName.trim() || !pin.trim()) {
      Alert.alert("Login required", "Enter waiter name and PIN.");
      return;
    }

    setSession({
      deviceLabel: "Handheld 01",
      shiftId: "shift-demo-1",
      waiterId: "waiter-demo-1",
      waiterName: waiterName.trim(),
    });
    navigation.replace(ROUTES.TABLES_OVERVIEW);
  }

  return (
    <Screen scroll={false} contentContainerStyle={styles.content}>
      <SectionHeader
        eyebrow="Waiter Handheld"
        subtitle="Mobile login remains separate from the web runtime. Real authentication will connect to the backend later."
        title="RestaurantPOS waiter session"
      />

      <SurfaceCard elevated>
        <Text style={styles.label}>Waiter name</Text>
        <TextInput
          autoCapitalize="words"
          onChangeText={setWaiterName}
          placeholder="Enter waiter name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={waiterName}
        />

        <Text style={styles.label}>PIN</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setPin}
          placeholder="Enter PIN"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
          value={pin}
        />

        <Button onPress={handleLogin} title="Start waiter shift" />
      </SurfaceCard>

      <SurfaceCard tone="brand">
        <Text style={styles.noteTitle}>Current scope</Text>
        <Text style={styles.noteCopy}>
          This architecture only establishes the handheld waiter flow.
          `figmadesign/` stays reference-only and is not imported into the app.
        </Text>
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "center",
    paddingBottom: spacing.xxxl,
  },
  input: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.lg,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    marginBottom: spacing.xs,
  },
  noteCopy: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  noteTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    marginBottom: spacing.sm,
  },
});
