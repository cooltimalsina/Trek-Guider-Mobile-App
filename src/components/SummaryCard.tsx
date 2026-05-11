import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

type Props = {
  label: string;
  value: string | number;
  accent?: string;
};

export function SummaryCard({ label, value, accent }: Props) {
  return (
    <View style={[styles.card, accent ? { borderLeftWidth: 4, borderLeftColor: accent } : null]}>
      <Text style={styles.val}>{value}</Text>
      <Text style={styles.lab}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "42%",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  val: { fontSize: 22, fontWeight: "800", color: colors.text },
  lab: { marginTop: 4, fontSize: 12, color: colors.muted, fontWeight: "600" },
});
