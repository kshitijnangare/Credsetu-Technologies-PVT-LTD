import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { DashboardScreen } from "../screens/DashboardScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { colors } from "../theme";

export const RootNavigator = () => {
  const { token, booting } = useAuth();

  if (booting) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  return token ? <DashboardScreen /> : <LoginScreen />;
};

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
