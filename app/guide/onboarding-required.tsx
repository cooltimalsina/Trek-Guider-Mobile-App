import * as WebBrowser from "expo-web-browser";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { ENV } from "@/constants/env";
import { colors } from "@/theme/colors";

export default function GuideOnboardingRequiredScreen() {
  const { signOut, guideGate } = useAuth();

  const title = "Complete Your Guide Profile";
  let message =
    "To start receiving bookings and trips, please complete your guide onboarding on our website.";
  if (guideGate === "pending_review") {
    message = "Your application is under review. Check status and notifications on the website.";
  }
  if (guideGate === "rejected") {
    message = "Your guide application needs attention. Please review feedback on the website.";
  }

  return (
    <AppScreen scroll>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.msg}>{message}</Text>
      <AppButton
        title="Continue on website"
        onPress={() => {
          const url = ENV.guideOnboardingUrl || ENV.webBaseUrl;
          if (url) void WebBrowser.openBrowserAsync(url);
        }}
        disabled={!ENV.guideOnboardingUrl && !ENV.webBaseUrl}
      />
      <View style={{ height: 12 }} />
      <AppButton title="Log out" variant="secondary" onPress={() => void signOut()} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "800", color: colors.text, marginBottom: 12 },
  msg: { fontSize: 16, color: colors.muted, lineHeight: 24, marginBottom: 24 },
});
