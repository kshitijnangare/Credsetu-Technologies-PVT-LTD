import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { colors, fonts, spacing } from "../theme";
import type { AppScreen } from "../types";

export const Sidebar = () => {
  const { sidebarOpen, screen, closeSidebar, goTo } = useUiStore();
  const logout = useAuthStore((state) => state.logout);

  if (!sidebarOpen) {
    return null;
  }

  const go = (next: AppScreen) => {
    goTo(next);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.sidebar}>
        <Text style={styles.brand}>MiniLedger</Text>
        <Text style={styles.caption}>Money lent, remembered.</Text>
        <Pressable style={[styles.item, screen === "dashboard" && styles.active]} onPress={() => go("dashboard")}>
          <Text style={[styles.itemText, screen === "dashboard" && styles.activeText]}>Loans</Text>
        </Pressable>
        <Pressable style={[styles.item, screen === "analytics" && styles.active]} onPress={() => go("analytics")}>
          <Text style={[styles.itemText, screen === "analytics" && styles.activeText]}>Analytics</Text>
        </Pressable>
        <Pressable
          style={styles.logout}
          onPress={() => {
            closeSidebar();
            void logout();
          }}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
      <Pressable style={styles.scrim} onPress={closeSidebar} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 20,
  },
  sidebar: {
    width: 248,
    backgroundColor: colors.background,
    paddingTop: 56,
    paddingHorizontal: spacing.md,
  },
  scrim: {
    flex: 1,
    backgroundColor: "rgba(26, 26, 26, 0.55)",
  },
  brand: {
    fontFamily: fonts.regular,
    fontSize: 22,
    color: colors.text,
  },
  caption: {
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  active: {
    backgroundColor: colors.surface,
  },
  itemText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.muted,
  },
  activeText: {
    color: colors.text,
  },
  logout: {
    marginTop: spacing.lg,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  logoutText: {
    fontFamily: fonts.regular,
    color: colors.text,
    fontSize: 16,
  },
});
