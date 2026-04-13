import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ApiRequestError } from "../../../api/http/api-client";
import { Button } from "../../../components/common/Button";
import { Screen } from "../../../components/common/Screen";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { SurfaceCard } from "../../../components/common/SurfaceCard";
import { ROUTES } from "../../../constants/routes";
import { env } from "../../../config/env";
import { RootStackParamList } from "../../../navigation/types";
import { services } from "../../../services/composition-root";
import { useAppStore } from "../../../state/app-store";
import { colors, radii, spacing, typography } from "../../../theme";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.LOGIN>;

export function LoginScreen({ navigation }: Props) {
  const [waiterName, setWaiterName] = useState("ayse");
  const [pin, setPin] = useState("Ayse123!");
  const setSession = useAppStore((state) => state.setSession);

  async function handleLogin() {
    if (!waiterName.trim() || !pin.trim()) {
      Alert.alert("Giriş gerekli", "Garson adı ve PIN girin.");
      return;
    }

    try {
      const response = await services.backend.login({
        branchId: env.branchId,
        password: pin.trim(),
        userName: waiterName.trim(),
      });

      setSession({
        accessToken: response.token,
        backendUserId: response.user.id,
        branchId: response.branch.id,
        deviceLabel: "Handheld 01",
        permissions: response.permissions,
        shiftId: "shift-live-session",
        userName: response.user.userName,
        waiterId: String(response.user.id),
        waiterName: response.user.fullName,
      });
      navigation.replace(ROUTES.TABLES_OVERVIEW);
    } catch (error) {
      console.error("[LoginScreen] Backend login failed.", error);
      const detail =
        error instanceof ApiRequestError
          ? error.responseBody?.trim() ||
            `HTTP ${error.status} hatası alındı.`
          : error instanceof Error
            ? error.message
            : "Bilinmeyen hata";
      Alert.alert(
        "Giriş başarısız",
        detail,
      );
    }
  }

  return (
    <Screen
      contentContainerStyle={styles.content}
      includeTopSafeArea
      scroll={false}
    >
      <SectionHeader
        eyebrow="Garson El Terminali"
        subtitle="Garson hesabınızla giriş yapın. Masa ve ödeme bilgileri web POS ile aynı canlı akıştan görüntülenir."
        title="Giriş"
      />

      <SurfaceCard elevated>
        <Text style={styles.label}>Garson Adı</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setWaiterName}
          placeholder="Kullanıcı adını girin"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={waiterName}
        />

        <Text style={styles.label}>Şifre</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setPin}
          placeholder="Şifrenizi girin"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
          value={pin}
        />

        <Button onPress={handleLogin} title="Giriş Yap" />
      </SurfaceCard>

      <SurfaceCard tone="brand">
        <Text style={styles.noteTitle}>Bilgilendirme</Text>
        <Text style={styles.noteCopy}>
          Bu uygulama yalnızca garson el terminali akışı için hazırlanmıştır.
          `figmadesign/` yalnızca tasarım referansıdır, üretim uygulamasının
          bir parçası değildir.
        </Text>
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
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
    minHeight: 56,
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
