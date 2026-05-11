import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { AppButton } from "@/components/AppButton";
import { WebsiteLinkButton } from "@/components/WebsiteLinkButton";
import { ShellScrollView, useAppShell } from "@/navigation/AppShellContext";
import { useResetMainHeaderOnFocus } from "@/navigation/useResetMainHeaderOnFocus";
import { colors } from "@/theme/colors";

export default function TouristProfileScreen() {
  useResetMainHeaderOnFocus();
  const { user, signOut } = useAuth();
  const shell = useAppShell();

  return (
    <ShellScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[shell.animatedContentPaddingStyle, styles.body]}
      onScroll={shell.onMainScroll}
      scrollEventThrottle={shell.scrollEventThrottle}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Row label="Display name" value={user?.displayName ?? "—"} />
        <Row label="Email" value={user?.email ?? "—"} />
        <Row label="Role" value="Tourist" />
        <Row label="User id" value={user?.userId ?? "—"} />
      </View>
      <WebsiteLinkButton label="Open full website" />
      <View style={{ height: 12 }} />
      <AppButton title="Log out" variant="danger" onPress={() => void signOut()} />
    </ShellScrollView>
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
  body: { paddingHorizontal: 16, paddingBottom: 40, flexGrow: 1 },
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
