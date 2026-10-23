import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { AppScreen } from "../types";

const THEME_STORAGE_KEY = "miniledger_theme_mode";

type ThemeMode = "dark" | "light";

type UiState = {
  screen: AppScreen;
  sidebarOpen: boolean;
  themeMode: ThemeMode;
  openSidebar: () => void;
  closeSidebar: () => void;
  goTo: (screen: AppScreen) => void;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  hydrateTheme: () => Promise<void>;
};

export const useUiStore = create<UiState>((set, get) => ({
  screen: "dashboard",
  sidebarOpen: false,
  themeMode: "dark", // Default is dark mode

  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  goTo: (screen) => set({ screen, sidebarOpen: false }),

  toggleTheme: () => {
    const nextMode: ThemeMode = get().themeMode === "dark" ? "light" : "dark";
    set({ themeMode: nextMode });
    void AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
  },

  setThemeMode: (mode: ThemeMode) => {
    set({ themeMode: mode });
    void AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  },

  hydrateTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        set({ themeMode: saved });
      }
    } catch {
      // keep default dark mode if storage read fails
    }
  },
}));
