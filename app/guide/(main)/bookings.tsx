import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { BookingCard } from "@/components/BookingCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { WebsiteLinkButton } from "@/components/WebsiteLinkButton";
import { useAppShell } from "@/navigation/AppShellContext";
import { useResetMainHeaderOnFocus } from "@/navigation/useResetMainHeaderOnFocus";
import { colors } from "@/theme/colors";
import type { MobileBooking } from "@/types/booking";
import { filterBookings, type BookingFilterTab } from "@/utils/bookingFilters";
import { loadGuideBookingsEnriched } from "@/utils/guideBookings";

const TABS: BookingFilterTab[] = [
  "all",
  "upcoming",
  "current",
  "pending",
  "accepted",
  "declined",
  "cancelled",
  "completed",
];

export default function GuideBookingsScreen() {
  useResetMainHeaderOnFocus();
  const router = useRouter();
  const shell = useAppShell();
  const { accessToken } = useAuth();
  const [list, setList] = useState<MobileBooking[]>([]);
  const [tab, setTab] = useState<BookingFilterTab>("all");
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

  const filtered = useMemo(() => filterBookings(list, tab), [list, tab]);

  if (loading) return <LoadingState />;
  if (err) return <ErrorState message={err} onRetry={() => void load()} />;

  return (
    <View style={styles.flex}>
      <Animated.View style={[shell.animatedContentPaddingStyle, styles.tabsBlock]}>
        <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabOn]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>{t === "all" ? "All" : t}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
      <FlatList
        style={{ flex: 1 }}
        data={filtered}
        keyExtractor={(item) => `${item.source ?? "x"}-${item.bookingId}`}
        onScroll={shell.onMainScroll}
        scrollEventThrottle={shell.scrollEventThrottle}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState title="Nothing in this filter" message="Try another tab." />}
        renderItem={({ item }) => (
          <BookingCard booking={item} viewer="guide" onPress={() => router.push(`/guide/booking/${item.bookingId}`)} />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <WebsiteLinkButton label="Open full website" />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  tabsBlock: { paddingBottom: 4 },
  tabs: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: "row" },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.muted, textTransform: "capitalize" },
  tabTextOn: { color: "#fff" },
  list: { padding: 16, paddingBottom: 48 },
  footer: { marginTop: 24 },
});
