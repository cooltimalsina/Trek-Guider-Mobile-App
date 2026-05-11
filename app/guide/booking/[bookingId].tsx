import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { StatusBadge } from "@/components/StatusBadge";
import { WebsiteLinkButton } from "@/components/WebsiteLinkButton";
import type { MobileBooking } from "@/types/booking";
import { loadGuideBookingsEnriched } from "@/utils/guideBookings";
import { colors } from "@/theme/colors";

export default function GuideBookingDetailScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { accessToken } = useAuth();
  const [booking, setBooking] = useState<MobileBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!accessToken || !bookingId) return;
      setLoading(true);
      setErr(null);
      try {
        const list = await loadGuideBookingsEnriched(accessToken);
        const hit = list.find((b) => b.bookingId === String(bookingId));
        if (!hit) {
          if (!cancelled) setErr("Booking not found in your list.");
        } else if (!cancelled) {
          setBooking(hit);
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, bookingId]);

  if (loading) return <LoadingState />;
  if (err || !booking) return <ErrorState message={err ?? "Not found"} />;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
      <Text style={styles.title}>{booking.tripTitle}</Text>
      <View style={styles.row}>
        <Text style={styles.h2}>Status</Text>
        <StatusBadge status={booking.status} />
      </View>
      <Text style={styles.meta}>
        <Text style={styles.bold}>Trip id: </Text>
        {booking.tripId}
      </Text>
      <Text style={styles.meta}>
        <Text style={styles.bold}>Start: </Text>
        {booking.startDate}
      </Text>
      {booking.touristName ? (
        <Text style={styles.meta}>
          <Text style={styles.bold}>Traveler: </Text>
          {booking.touristName}
        </Text>
      ) : null}
      {booking.travelerCount != null ? (
        <Text style={styles.meta}>
          <Text style={styles.bold}>Party size: </Text>
          {booking.travelerCount}
        </Text>
      ) : null}
      {booking.paymentStatus ? (
        <Text style={styles.meta}>
          <Text style={styles.bold}>Payment: </Text>
          {booking.paymentStatus}
        </Text>
      ) : null}
      {booking.notes ? (
        <Text style={styles.notes}>
          <Text style={styles.bold}>Notes</Text>
          {"\n"}
          {booking.notes}
        </Text>
      ) : null}
      {booking.source ? (
        <Text style={styles.hint}>{booking.source === "open" ? "Open request (unassigned)" : "Assigned to you"}</Text>
      ) : null}
      <View style={styles.gap} />
      <WebsiteLinkButton label="Manage on website" path="/guide" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  h2: { fontSize: 18, fontWeight: "700", color: colors.text },
  meta: { marginTop: 8, fontSize: 15, color: colors.muted },
  bold: { fontWeight: "700", color: colors.text },
  notes: { marginTop: 16, fontSize: 14, color: colors.muted, lineHeight: 20 },
  hint: { marginTop: 12, fontSize: 13, color: colors.muted, fontStyle: "italic" },
  gap: { height: 20 },
});
