import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { colors } from "@/theme/colors";

export default function Index() {
  const { isReady, isAuthenticated, intent, guideGate } = useAuth();

  if (!isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/welcome" />;
  }

  if (intent === "tourist") {
    return <Redirect href="/tourist" />;
  }

  if (intent === "guide" && guideGate === "approved") {
    return <Redirect href="/guide" />;
  }

  if (intent === "guide") {
    return <Redirect href="/guide/onboarding-required" />;
  }

  return <Redirect href="/auth/welcome" />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
});
