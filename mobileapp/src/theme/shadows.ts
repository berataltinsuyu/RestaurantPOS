import { Platform } from "react-native";

import { colors } from "./colors";

function shadow(
  elevation: number,
  shadowOpacity: number,
  shadowRadius: number,
  height: number,
) {
  return Platform.select({
    android: {
      elevation,
      shadowColor: colors.shadow,
    },
    default: {
      elevation,
      shadowColor: colors.shadow,
      shadowOffset: {
        height,
        width: 0,
      },
      shadowOpacity,
      shadowRadius,
    },
  });
}

export const shadows = {
  bottomAction: shadow(12, 0.1, 20, -4),
  card: shadow(3, 0.06, 14, 4),
  floating: shadow(8, 0.1, 24, 10),
  sheet: shadow(14, 0.16, 30, -8),
} as const;
