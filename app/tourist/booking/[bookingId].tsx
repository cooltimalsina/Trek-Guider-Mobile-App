import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { fetchTouristBooking, fetchTrekPublic } from "@/api/touristApi";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { StatusBadge } from "@/components/StatusBadge";
import { TripCard } from "@/components/TripCard";
import { WebsiteLinkButton } from "@/components/WebsiteLinkButton";
import type { MobileBooking } from "@/types/booking";
import { mapTouristBookingRecord } from "@/utils/bookingMappers";
import { formatDateRangeUs } from "@/utils/dateFormat";
import { colors } from "@/theme/colors";

export default function TouristBookingDetailScreen() {
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
        const { booking: raw } = await fetchTouristBooking(accessToken, String(bookingId));
        const row = raw as Record<string, unknown>;
        const trekId = String((row as { trekId?: string }).trekId ?? "");
        let title: string | undefined;
        let image: string | undefined;
        if (trekId) {
          try {
            const trek = await fetchTrekPublic(trekId);
            title = trek.title ?? trek.name;
            image = trek.heroImageUrl ?? trek.coverImageUrl ?? trek.thumbnailUrl ?? trek.imageUrl;
          } catch {
            /* optional */
          }
        }
        const mapped = mapTouristBookingRecord(row, title, image);
        if (!cancelled) setBooking(mapped);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Could not load booking");
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
      <TripCard
        title={booking.tripTitle}
        imageUrl={booking.tripImageUrl}
        subtitle={formatDateRangeUs(booking.startDate, booking.endDate)}
      />
      <View style={styles.row}>
        <Text style={styles.h2}>Status</Text>
        <StatusBadge status={booking.status} />
      </View>
      {booking.guideName ? (
        <Text style={styles.meta}>
          <Text style={styles.bold}>Guide: </Text>
          {booking.guideName}
        </Text>
      ) : null}
      {booking.paymentStatus ? (
        <Text style={styles.meta}>
          <Text style={styles.bold}>Payment: </Text>
          {booking.paymentStatus}
        </Text>
      ) : null}
      {booking.depositAmount != null ? (
        <Text style={styles.meta}>
          <Text style={styles.bold}>Deposit: </Text>${booking.depositAmount.toFixed(2)}
        </Text>
      ) : null}
      {booking.totalAmount != null ? (
        <Text style={styles.meta}>
          <Text style={styles.bold}>Total: </Text>${booking.totalAmount.toFixed(2)}
        </Text>
      ) : null}
      {booking.travelerCount != null ? (
        <Text style={styles.meta}>
          <Text style={styles.bold}>Travelers: </Text>
          {booking.travelerCount}
        </Text>
      ) : null}
      {booking.notes ? (
        <Text style={styles.notes}>
          <Text style={styles.bold}>Notes</Text>
          {"\n"}
          {booking.notes}
        </Text>
      ) : null}
      <View style={styles.gap} />
      <WebsiteLinkButton label="Manage on full website" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 16, paddingBottom: 40 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 },
  h2: { fontSize: 18, fontWeight: "700", color: colors.text },
  meta: { marginTop: 10, fontSize: 15, color: colors.muted },
  bold: { fontWeight: "700", color: colors.text },
  notes: { marginTop: 16, fontSize: 14, color: colors.muted, lineHeight: 20 },
  gap: { height: 20 },
});
