import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AnalyticsScreen } from "../screens/AnalyticsScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { useTheme } from "../theme";

export const RootNavigator = () => {
  const token = useAuthStore((state) => state.token);
  const booting = useAuthStore((state) => state.booting);
  const screen = useUiStore((state) => state.screen);
  const { colors } = useTheme();

  if (booting) {
    return (
      <View style={[styles.boot, { backgroundColor: colors.canvas }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!token) {
    return <LoginScreen />;
  }

  return screen === "analytics" ? <AnalyticsScreen /> : <DashboardScreen />;
};

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
