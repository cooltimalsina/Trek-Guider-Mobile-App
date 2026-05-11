import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { colors } from "@/theme/colors";

export default function GuideRootLayout() {
  const { isReady, isAuthenticated, intent, user } = useAuth();

  if (!isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!isAuthenticated || intent !== "guide") {
    return <Redirect href="/auth/welcome" />;
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>We could not load your profile.</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-required" options={{ title: "Guide setup", headerShown: true }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg, padding: 24 },
  err: { color: colors.danger, textAlign: "center", fontSize: 16 },
});
