import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { fetchTouristBookings, fetchTrekPublic } from "@/api/touristApi";
import { BookingCard } from "@/components/BookingCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { TripLifecycleChips } from "@/components/TripLifecycleChips";
import { WebsiteLinkButton } from "@/components/WebsiteLinkButton";
import { ENV } from "@/constants/env";
import { useAppShell } from "@/navigation/AppShellContext";
import { useResetMainHeaderOnFocus } from "@/navigation/useResetMainHeaderOnFocus";
import { colors } from "@/theme/colors";
import type { MobileBooking } from "@/types/booking";
import { filterTripsByLifecycle, type TripLifecycleFilter } from "@/utils/bookingFilters";
import { mapTouristBookingRecord } from "@/utils/bookingMappers";

export default function TouristBookingsScreen() {
  useResetMainHeaderOnFocus();
  const router = useRouter();
  const shell = useAppShell();
  const { accessToken, user } = useAuth();
  const [list, setList] = useState<MobileBooking[]>([]);
  const [lifecycleTab, setLifecycleTab] = useState<TripLifecycleFilter>("all");
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
        const trekId = String((row as { trekId?: string }).trekId ?? "");
        let title: string | undefined;
        let image: string | undefined;
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
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

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

  const filtered = useMemo(() => filterTripsByLifecycle(list, lifecycleTab), [list, lifecycleTab]);

  if (loading) return <LoadingState />;
  if (err) return <ErrorState message={err} onRetry={() => void load()} />;

  return (
    <View style={styles.flex}>
      <Animated.View style={[shell.animatedContentPaddingStyle, styles.headerBlock]}>
        <TripLifecycleChips list={list} selected={lifecycleTab} onSelect={setLifecycleTab} />
        <View style={styles.sectionRow}>
          <Text style={styles.section}>Your trips</Text>
          <Text style={styles.tripCount}>
            {filtered.length} {filtered.length === 1 ? "trip" : "trips"}
          </Text>
        </View>
      </Animated.View>
      <FlatList
        style={{ flex: 1 }}
        data={filtered}
        keyExtractor={(item) => item.bookingId}
        onScroll={shell.onMainScroll}
        scrollEventThrottle={shell.scrollEventThrottle}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState title="No trips in this filter" message="Try another status or book on the website." />
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            viewer="tourist"
            bookerFallbackName={user?.displayName}
            onPress={() => router.push(`/tourist/booking/${item.bookingId}`)}
          />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <WebsiteLinkButton label="Book more trips on website" path="/" />
            {!ENV.webBaseUrl ? <Text style={styles.hint}>Set EXPO_PUBLIC_WEB_BASE_URL in .env</Text> : null}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  headerBlock: { paddingHorizontal: 16, paddingBottom: 4 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 4,
  },
  section: { fontSize: 20, fontWeight: "800", color: colors.text },
  tripCount: { fontSize: 15, color: colors.muted, fontWeight: "500" },
  list: { padding: 16, paddingBottom: 48 },
  footer: { marginTop: 24, gap: 8 },
  hint: { fontSize: 12, color: colors.muted },
});
