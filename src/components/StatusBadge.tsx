import { StyleSheet, Text, View } from "react-native";
import type { MobileBookingStatus } from "@/types/booking";
import { colors } from "@/theme/colors";

const map: Record<MobileBookingStatus, { bg: string; fg: string; label: string }> = {
  pending:   { bg: colors.goldLight,   fg: colors.goldText,   label: "Pending" },
  accepted:  { bg: colors.primaryLight, fg: colors.primary,   label: "Accepted" },
  declined:  { bg: colors.terraLight,  fg: colors.terra,     label: "Declined" },
  cancelled: { bg: colors.borderSubtle, fg: colors.muted,    label: "Cancelled" },
  completed: { bg: colors.blueLight,   fg: colors.blue,      label: "Completed" },
  current:   { bg: colors.blueLight,   fg: colors.blue,      label: "Current" },
  upcoming:  { bg: colors.primaryLight, fg: colors.primary,   label: "Upcoming" },
};

export function StatusBadge({ status }: { status: MobileBookingStatus }) {
  const s = map[status] ?? map.pending;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: { fontSize: 12, fontWeight: "700" },
});
