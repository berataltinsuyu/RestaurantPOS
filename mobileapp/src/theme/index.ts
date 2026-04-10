import { DefaultTheme } from "@react-navigation/native";

import { colors, statusPalette, tonePalette } from "./colors";
import { radii } from "./radii";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

export {
  colors,
  radii,
  shadows,
  spacing,
  statusPalette,
  tonePalette,
  typography,
};

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    border: colors.border,
    card: colors.surface,
    notification: colors.primary,
    primary: colors.primary,
    text: colors.textPrimary,
  },
};
