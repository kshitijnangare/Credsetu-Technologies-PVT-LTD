import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { fonts, spacing, useTheme } from "../theme";
import type { AppScreen } from "../types";

export const Sidebar = () => {
  const { sidebarOpen, screen, closeSidebar, goTo } = useUiStore();
  const logout = useAuthStore((state) => state.logout);
  const { colors, isDark, toggleTheme } = useTheme();

  if (!sidebarOpen) {
    return null;
  }

  const go = (next: AppScreen) => {
    goTo(next);
  };

  return (
    <View style={styles.overlay}>
      <View style={[styles.sidebar, { backgroundColor: colors.background, borderRightColor: colors.border }]}>
        <Text style={[styles.brand, { color: colors.text }]}>MiniLedger</Text>
        <Text style={[styles.caption, { color: colors.muted }]}>Money lent, remembered.</Text>

        <Pressable
          style={[styles.item, screen === "dashboard" && { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => go("dashboard")}
        >
          <Text style={[styles.itemText, { color: colors.text }]}>💳 Loans</Text>
        </Pressable>

        <Pressable
          style={[styles.item, screen === "analytics" && { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => go("analytics")}
        >
          <Text style={[styles.itemText, { color: colors.text }]}>📊 Analytics</Text>
        </Pressable>

        {/* Theme Toggle Button */}
        <Pressable
          style={[styles.themeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={toggleTheme}
        >
          <Text style={[styles.themeToggleText, { color: colors.text }]}>
            {isDark ? "🌙 Dark Theme" : "☀️ Light Theme"}
          </Text>
          <View style={[styles.themePill, { backgroundColor: colors.primary }]}>
            <Text style={[styles.themePillText, { color: colors.primaryText }]}>
              {isDark ? "Dark" : "Light"}
            </Text>
          </View>
        </Pressable>

        <View style={styles.spacer} />

        <Pressable
          style={[styles.logout, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => {
            closeSidebar();
            void logout();
          }}
        >
          <Text style={[styles.logoutText, { color: colors.text }]}>🚪 Log Out</Text>
        </Pressable>
      </View>
      <Pressable
        style={[styles.scrim, { backgroundColor: isDark ? "rgba(11, 18, 17, 0.75)" : "rgba(76, 167, 161, 0.3)" }]}
        onPress={closeSidebar}
      />
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
    width: 270,
    paddingTop: 56,
    paddingHorizontal: spacing.md,
    borderRightWidth: 1.5,
  },
  scrim: {
    flex: 1,
  },
  brand: {
    fontFamily: fonts.bold,
    fontSize: 24,
  },
  caption: {
    fontFamily: fonts.medium,
    marginTop: 4,
    marginBottom: spacing.lg,
    fontSize: 13,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  itemText: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1.5,
  },
  themeToggleText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  themePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  themePillText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  spacer: {
    flex: 1,
  },
  logout: {
    marginBottom: spacing.xl,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  logoutText: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});
