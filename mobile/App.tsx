import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
} from "@expo-google-fonts/sora";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useAuthStore } from "./src/store/authStore";
import { useUiStore } from "./src/store/uiStore";
import { useTheme } from "./src/theme";

export default function App() {
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const hydrateTheme = useUiStore((state) => state.hydrateTheme);
  const { colors, themeMode } = useTheme();

  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  useEffect(() => {
    void hydrateAuth();
    void hydrateTheme();
  }, [hydrateAuth, hydrateTheme]);

  if (!fontsLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.canvas }]}>
        <ActivityIndicator color={colors.teal} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
