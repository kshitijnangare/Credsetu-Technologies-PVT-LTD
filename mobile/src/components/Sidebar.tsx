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
          <Text style={[styles.itemText, screen === "dashboard" && styles.activeText]}>💳 Loans</Text>
        </Pressable>

        <Pressable style={[styles.item, screen === "analytics" && styles.active]} onPress={() => go("analytics")}>
          <Text style={[styles.itemText, screen === "analytics" && styles.activeText]}>📊 Analytics</Text>
        </Pressable>

        <View style={styles.spacer} />

        <Pressable
          style={styles.logout}
          onPress={() => {
            closeSidebar();
            void logout();
          }}
        >
          <Text style={styles.logoutText}>🚪 Log Out</Text>
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
    width: 260,
    backgroundColor: colors.background,
    paddingTop: 56,
    paddingHorizontal: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  scrim: {
    flex: 1,
    backgroundColor: "rgba(11, 18, 17, 0.7)",
  },
  brand: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.ice,
  },
  caption: {
    fontFamily: fonts.regular,
    color: colors.mint,
    marginTop: 4,
    marginBottom: spacing.lg,
    fontSize: 13,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  active: {
    backgroundColor: colors.surface,
    borderColor: colors.teal,
  },
  itemText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.mint,
  },
  activeText: {
    color: colors.ice,
    fontFamily: fonts.semiBold,
  },
  spacer: {
    flex: 1,
  },
  logout: {
    marginBottom: spacing.xl,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255, 123, 123, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 123, 123, 0.3)",
  },
  logoutText: {
    fontFamily: fonts.medium,
    color: "#FF8E8E",
    fontSize: 14,
  },
});
