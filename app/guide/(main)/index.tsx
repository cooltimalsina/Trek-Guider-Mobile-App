import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { BookingCard } from "@/components/BookingCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { SummaryCard } from "@/components/SummaryCard";
import { WebsiteLinkButton } from "@/components/WebsiteLinkButton";
import { ShellFlatList, useAppShell } from "@/navigation/AppShellContext";
import { useResetMainHeaderOnFocus } from "@/navigation/useResetMainHeaderOnFocus";
import { colors } from "@/theme/colors";
import type { MobileBooking } from "@/types/booking";
import { countByStatus } from "@/utils/bookingFilters";
import { loadGuideBookingsEnriched } from "@/utils/guideBookings";

export default function GuideDashboardScreen() {
  useResetMainHeaderOnFocus();
  const router = useRouter();
  const shell = useAppShell();
  const { accessToken, user, refreshProfile } = useAuth();
  const [list, setList] = useState<MobileBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setErr(null);
    const merged = await loadGuideBookingsEnriched(accessToken);
    setList(merged);
  }, [accessToken]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await load();
        await refreshProfile();
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load bookings");
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
      current: countByStatus(list, "current"),
      upcoming: countByStatus(list, "upcoming"),
      pending: countByStatus(list, "pending"),
      accepted: countByStatus(list, "accepted"),
      cancelled: countByStatus(list, "cancelled"),
    }),
    [list],
  );

  if (loading) return <LoadingState />;
  if (err) return <ErrorState message={err} onRetry={() => void load()} />;

  return (
    <ShellFlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={recent}
      keyExtractor={(item) => `${item.source ?? "x"}-${item.bookingId}`}
      onScroll={shell.onMainScroll}
      scrollEventThrottle={shell.scrollEventThrottle}
      contentContainerStyle={[shell.animatedContentPaddingStyle, { paddingBottom: 32 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      ListHeaderComponent={
        <View style={styles.pad}>
          <Text style={styles.hi}>Hello{user?.displayName ? `, ${user.displayName}` : ""}</Text>
          <Text style={styles.sub}>Bookings and open requests in your region.</Text>
          <View style={styles.grid}>
            <SummaryCard label="Current" value={summary.current} accent={colors.blue} />
            <SummaryCard label="Upcoming" value={summary.upcoming} accent={colors.primary} />
            <SummaryCard label="Pending" value={summary.pending} accent={colors.gold} />
            <SummaryCard label="Accepted" value={summary.accepted} accent={colors.primary} />
            <SummaryCard label="Cancelled" value={summary.cancelled} accent={colors.muted} />
          </View>
          <Text style={styles.section}>Recent activity</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.pad}>
          <EmptyState title="No bookings yet" message="New requests and assignments appear here." />
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.cardPad}>
          <BookingCard booking={item} viewer="guide" onPress={() => router.push(`/guide/booking/${item.bookingId}`)} />
        </View>
      )}
      ListFooterComponent={
        <View style={styles.footer}>
          <WebsiteLinkButton label="Open guide website" path="/guide" />
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
  footer: { padding: 24, paddingBottom: 40 },
});
