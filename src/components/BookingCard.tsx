import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MobileBooking } from "@/types/booking";
import { colors } from "@/theme/colors";
import { StatusBadge } from "./StatusBadge";

type Props = {
  booking: MobileBooking;
  onPress: () => void;
};

export function BookingCard({ booking, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.top}>
        <Text style={styles.title} numberOfLines={2}>
          {booking.tripTitle}
        </Text>
        <StatusBadge status={booking.status} />
      </View>
      <Text style={styles.meta}>
        {booking.startDate}
        {booking.guideName ? ` · ${booking.guideName}` : ""}
        {booking.touristName ? ` · ${booking.touristName}` : ""}
      </Text>
      {booking.travelerCount != null ? (
        <Text style={styles.small}>{booking.travelerCount} travelers</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.92 },
  top: { flexDirection: "row", justifyContent: "space-between", gap: 8, alignItems: "flex-start" },
  title: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.text },
  meta: { marginTop: 8, fontSize: 14, color: colors.muted },
  small: { marginTop: 4, fontSize: 12, color: colors.muted },
});
