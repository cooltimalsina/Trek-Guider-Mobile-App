import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { AppButton } from "@/components/AppButton";
import { WebsiteLinkButton } from "@/components/WebsiteLinkButton";
import { colors } from "@/theme/colors";

export default function GuideProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Row label="Display name" value={user?.displayName ?? "—"} />
        <Row label="Email" value={user?.email ?? "—"} />
        <Row label="Role" value="Guide" />
        <Row label="Onboarding status" value={user?.onboardingStatus ?? "—"} />
        <Row label="User id" value={user?.userId ?? "—"} />
      </View>
      <WebsiteLinkButton label="Open guide website" path="/guide" />
      <View style={{ height: 12 }} />
      <AppButton title="Log out" variant="danger" onPress={() => void signOut()} />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.lab}>{label}</Text>
      <Text style={styles.val}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, padding: 16, backgroundColor: colors.bg },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    gap: 12,
  },
  row: { gap: 4 },
  lab: { fontSize: 12, fontWeight: "700", color: colors.muted, textTransform: "uppercase" },
  val: { fontSize: 16, color: colors.text, fontWeight: "600" },
});
