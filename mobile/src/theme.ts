export const colors = {
  // STRICT 3 COLORS ONLY (Light Mode):
  ice: "#CEFEF1",       // Light canvas / button text / surface
  mint: "#A6D6C9",      // Cards / containers / secondary surfaces
  teal: "#4CA7A1",      // High contrast text / borders / buttons / icons

  // Semantic Light Mode tokens strictly mapped to the 3 colors
  canvas: "#CEFEF1",
  background: "#A6D6C9",
  surface: "#CEFEF1",
  border: "#4CA7A1",
  text: "#4CA7A1",
  muted: "#4CA7A1",
  primary: "#4CA7A1",
  primaryText: "#CEFEF1",
} as const;

export const fonts = {
  regular: "Sora_400Regular",
  medium: "Sora_500Medium",
  semiBold: "Sora_600SemiBold",
  bold: "Sora_700Bold",
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};
