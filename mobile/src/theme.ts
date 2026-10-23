import { useUiStore } from "./store/uiStore";

export const darkColors = {
  mode: "dark" as const,
  canvas: "#0B1211",
  background: "#121C1B",
  surface: "#182624",
  border: "#2A403D",
  text: "#CEFEF1",
  muted: "#A6D6C9",
  primary: "#4CA7A1",
  primaryText: "#0B1211",
  ice: "#CEFEF1",
  mint: "#A6D6C9",
  teal: "#4CA7A1",
};

export const lightColors = {
  mode: "light" as const,
  canvas: "#CEFEF1",
  background: "#A6D6C9",
  surface: "#CEFEF1",
  border: "#4CA7A1",
  text: "#4CA7A1",
  muted: "#4CA7A1",
  primary: "#4CA7A1",
  primaryText: "#CEFEF1",
  ice: "#CEFEF1",
  mint: "#A6D6C9",
  teal: "#4CA7A1",
};

export type ThemeColors = typeof darkColors;

// Default is Dark Mode
export const colors = darkColors;

export const getThemeColors = (mode: "dark" | "light"): ThemeColors =>
  mode === "dark" ? darkColors : lightColors;

export const useTheme = () => {
  const themeMode = useUiStore((state) => state.themeMode);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const colors = getThemeColors(themeMode);

  return {
    colors,
    themeMode,
    isDark: themeMode === "dark",
    toggleTheme,
  };
};

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
