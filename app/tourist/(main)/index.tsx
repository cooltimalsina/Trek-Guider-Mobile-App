import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { fetchTouristBookings, fetchTrekPublic } from "@/api/touristApi";
import { BookingCard } from "@/components/BookingCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { SummaryCard } from "@/components/SummaryCard";
import { WebsiteLinkButton } from "@/components/WebsiteLinkButton";
import type { MobileBooking } from "@/types/booking";
import { mapTouristBookingRecord } from "@/utils/bookingMappers";
import { countByStatus } from "@/utils/bookingFilters";
import { colors } from "@/theme/colors";
import { ENV } from "@/constants/env";

export default function TouristDashboardScreen() {
  const router = useRouter();
  const { accessToken, user, refreshProfile } = useAuth();
  const [list, setList] = useState<MobileBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setErr(null);
    const res = await fetchTouristBookings(accessToken);
    const rawItems = (res.items ?? []) as Record<string, unknown>[];
    const trekCache = new Map<string, { title?: string; image?: string }>();
    const enriched = await Promise.all(
      rawItems.map(async (row) => {
        let title: string | undefined;
        let image: string | undefined;
        const trekId = typeof row.trekId === "string" ? row.trekId : "";
        if (trekId) {
          const hit = trekCache.get(trekId);
          if (hit) {
            title = hit.title;
            image = hit.image;
          } else {
            try {
              const trek = await fetchTrekPublic(trekId);
              title = trek.title ?? trek.name;
              image = trek.heroImageUrl ?? trek.coverImageUrl ?? trek.thumbnailUrl ?? trek.imageUrl;
              trekCache.set(trekId, { title, image });
            } catch {
              trekCache.set(trekId, {});
            }
          }
        }
        return mapTouristBookingRecord(row, title, image);
      }),
    );
    enriched.sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));
    setList(enriched);
  }, [accessToken]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await load();
        await refreshProfile();
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load, refreshProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const recent = useMemo(() => list.slice(0, 5), [list]);

  const summary = useMemo(
    () => ({
      upcoming: countByStatus(list, "upcoming"),
      current: countByStatus(list, "current"),
      pending: countByStatus(list, "pending"),
      accepted: countByStatus(list, "accepted"),
      cancelled: countByStatus(list, "cancelled"),
    }),
    [list],
  );

  if (loading) {
    return <LoadingState />;
  }

  if (err) {
    return <ErrorState message={err} onRetry={() => void load()} />;
  }

  return (
    <FlatList
      data={recent}
      keyExtractor={(item) => item.bookingId}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      ListHeaderComponent={
        <View style={styles.pad}>
          <Text style={styles.hi}>Welcome{user?.displayName ? `, ${user.displayName}` : ""}</Text>
          <Text style={styles.sub}>Your trips and requests at a glance.</Text>
          <View style={styles.grid}>
            <SummaryCard label="Upcoming" value={summary.upcoming} accent={colors.primary} />
            <SummaryCard label="Current" value={summary.current} accent={colors.blue} />
            <SummaryCard label="Pending" value={summary.pending} accent={colors.gold} />
            <SummaryCard label="Accepted" value={summary.accepted} accent={colors.primary} />
            <SummaryCard label="Cancelled" value={summary.cancelled} accent={colors.muted} />
          </View>
          <Text style={styles.section}>Recent bookings</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.pad}>
          <EmptyState
            title="No bookings yet"
            message="Browse and book treks on the Trek Guider website — your trips will show up here."
          />
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.cardPad}>
          <BookingCard booking={item} onPress={() => router.push(`/tourist/booking/${item.bookingId}`)} />
        </View>
      )}
      ListFooterComponent={
        <View style={styles.footer}>
          <WebsiteLinkButton label="Open full website" />
          {ENV.webBaseUrl ? (
            <View style={{ marginTop: 10 }}>
              <WebsiteLinkButton label="Book more trips" path="/" />
            </View>
          ) : null}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 16, paddingTop: 8 },
  cardPad: { paddingHorizontal: 16 },
  hi: { fontSize: 24, fontWeight: "800", color: colors.text },
  sub: { marginTop: 6, fontSize: 15, color: colors.muted, marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  section: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 10 },
  footer: { padding: 24, paddingBottom: 40, gap: 8 },
});
