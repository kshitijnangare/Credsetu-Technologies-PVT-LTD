import { create } from "zustand";
import type { AppScreen } from "../types";

type UiState = {
  screen: AppScreen;
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  goTo: (screen: AppScreen) => void;
};

export const useUiStore = create<UiState>((set) => ({
  screen: "dashboard",
  sidebarOpen: false,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  goTo: (screen) => set({ screen, sidebarOpen: false }),
}));
