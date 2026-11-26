import { Dimensions, PixelRatio } from "react-native";

const { width } = Dimensions.get("window");

// Référence : un écran de ~375px de large (iPhone SE / Android compact courant).
// Tout est mis à l'échelle par rapport à cette base, avec un plafond et un plancher
// pour ne jamais devenir illisible sur un très petit écran, ni disproportionné sur un grand.
const BASE_WIDTH = 375;
const scaleRaw = width / BASE_WIDTH;
const scale = Math.min(Math.max(scaleRaw, 0.85), 1.2);

function rs(size: number): number {
  // round to nearest pixel on this device's density
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
}

export const colors = {
  background: "#EAF6F3",
  backgroundCard: "#FFFFFF",
  backgroundChip: "#EEF2FF",

  primary: "#5C7CE0",
  primaryText: "#FFFFFF",

  textPrimary: "#1B1F3B",
  textSecondary: "#5A6072",
  textMuted: "#9AA0B4",

  statusGreen: "#4CAF7D",
  statusAmber: "#E8A93D",
  statusRose: "#E85D75",

  border: "#E0E6F0",
  statusGray: "#A0A6B8",

  dangerSoftBg: "#F8D7DC",
  dangerSoftText: "#B23A4E",
};

export const spacing = {
  xs: rs(4),
  sm: rs(8),
  md: rs(16),
  lg: rs(24),
  xl: rs(32),
  xxl: rs(42),
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 24 }; // rayons : pas besoin de les mettre à l'échelle

export const fontSize = {
  sm: rs(12),
  base: rs(14),
  md: rs(16),
  lg: rs(20),
  xl: rs(32),
  huge: rs(48),
  hugeX: rs(70),
};
