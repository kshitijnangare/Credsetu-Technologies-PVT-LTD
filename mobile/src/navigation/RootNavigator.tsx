import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AnalyticsScreen } from "../screens/AnalyticsScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { colors } from "../theme";

export const RootNavigator = () => {
  const token = useAuthStore((state) => state.token);
  const booting = useAuthStore((state) => state.booting);
  const screen = useUiStore((state) => state.screen);

  if (booting) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.teal} size="large" />
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
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
  },
});
