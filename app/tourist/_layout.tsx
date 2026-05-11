import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/auth/AuthContext";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";

export default function TouristRootLayout() {
  const { isReady, isAuthenticated, intent } = useAuth();

  if (!isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!isAuthenticated || intent !== "tourist") {
    return <Redirect href="/auth/welcome" />;
  }

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
});
