import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { ShellFlatList, useAppShell } from "@/navigation/AppShellContext";
import { useResetMainHeaderOnFocus } from "@/navigation/useResetMainHeaderOnFocus";
import { useAuth } from "@/auth/AuthContext";
import { fetchTouristBookings, fetchTrekPublic } from "@/api/touristApi";
import { BookingCard } from "@/components/BookingCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { TripLifecycleChips } from "@/components/TripLifecycleChips";
import { WebsiteLinkButton } from "@/components/WebsiteLinkButton";
import type { MobileBooking } from "@/types/booking";
import { ENV } from "@/constants/env";
import { colors } from "@/theme/colors";
import { mapTouristBookingRecord } from "@/utils/bookingMappers";
import { filterTripsByLifecycle, type TripLifecycleFilter } from "@/utils/bookingFilters";

export default function TouristDashboardScreen() {
  useResetMainHeaderOnFocus();
  const router = useRouter();
  const shell = useAppShell();
  const { accessToken, user, refreshProfile } = useAuth();
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

  const filtered = useMemo(() => filterTripsByLifecycle(list, lifecycleTab), [list, lifecycleTab]);

  if (loading) {
    return <LoadingState />;
  }

  if (err) {
    return <ErrorState message={err} onRetry={() => void load()} />;
  }

  return (
    <ShellFlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={filtered}
      keyExtractor={(item) => item.bookingId}
      onScroll={shell.onMainScroll}
      scrollEventThrottle={shell.scrollEventThrottle}
      contentContainerStyle={[shell.animatedContentPaddingStyle, { paddingBottom: 32 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      ListHeaderComponent={
        <View style={styles.pad}>
          <Text style={styles.hi}>Welcome{user?.displayName ? `, ${user.displayName}` : ""}</Text>
          <Text style={styles.sub}>Your trips and requests at a glance.</Text>
          <TripLifecycleChips list={list} selected={lifecycleTab} onSelect={setLifecycleTab} />
          <View style={styles.sectionRow}>
            <Text style={styles.section}>Your trips</Text>
            <Text style={styles.tripCount}>
              {filtered.length} {filtered.length === 1 ? "trip" : "trips"}
            </Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.pad}>
          <EmptyState
            title="No trips in this filter"
            message="Try another status or book a trek on the Trek Guider website."
          />
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.cardPad}>
          <BookingCard
            booking={item}
            viewer="tourist"
            bookerFallbackName={user?.displayName}
            onPress={() => router.push(`/tourist/booking/${item.bookingId}`)}
          />
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
  sub: { marginTop: 6, fontSize: 15, color: colors.muted, marginBottom: 12 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 4,
  },
  section: { fontSize: 20, fontWeight: "800", color: colors.text },
  tripCount: { fontSize: 15, color: colors.muted, fontWeight: "500" },
  footer: { padding: 24, paddingBottom: 40, gap: 8 },
});
