import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BackHandler, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/auth/AuthContext";
import { fetchTreksCatalog } from "@/api/touristApi";
import { DifficultyFilterChips, type DifficultyFilter } from "@/components/DifficultyFilterChips";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { TrekCatalogCard } from "@/components/TrekCatalogCard";
import { WebsiteLinkButton } from "@/components/WebsiteLinkButton";
import { ENV } from "@/constants/env";
import { ShellFlatList, useAppShell } from "@/navigation/AppShellContext";
import { useResetMainHeaderOnFocus } from "@/navigation/useResetMainHeaderOnFocus";
import type { CatalogSortId, CatalogTrek } from "@/types/catalogTrek";
import { colors } from "@/theme/colors";
import { filterAndSortTreks } from "@/utils/trekCatalogQuery";

const SORT_OPTIONS: { id: CatalogSortId; label: string; hint: string }[] = [
  { id: "popular", label: "Top rated", hint: "Most reviewed first" },
  { id: "price", label: "Lowest price", hint: "Cheapest first" },
  { id: "duration", label: "Shortest first", hint: "Fewest days or hours" },
];

export default function TouristDashboardScreen() {
  useResetMainHeaderOnFocus();
  const router = useRouter();
  const shell = useAppShell();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { user, refreshProfile } = useAuth();

  const [treks, setTreks] = useState<CatalogTrek[]>([]);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [sort, setSort] = useState<CatalogSortId>("popular");
  const [filterOpen, setFilterOpen] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandWasOpen = useRef(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const items = await fetchTreksCatalog();
      setTreks(items);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load treks");
    }
  }, []);

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

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (searchExpanded && !expandWasOpen.current) {
      setSearchDraft(searchQuery);
    }
    expandWasOpen.current = searchExpanded;
  }, [searchExpanded, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchExpanded(false);
      };
    }, []),
  );

  useEffect(() => {
    if (!isFocused || !searchExpanded) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setSearchExpanded(false);
      return true;
    });
    return () => sub.remove();
  }, [isFocused, searchExpanded]);

  const onSearchDraftChange = useCallback((text: string) => {
    setSearchDraft(text);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(text.trim());
    }, 400);
  }, []);

  const onFilterPress = useCallback(() => {
    setFilterOpen(true);
  }, []);

  const { setTouristCatalogHeader } = shell;

  useLayoutEffect(() => {
    if (!isFocused) {
      setTouristCatalogHeader(null);
      return;
    }
    setTouristCatalogHeader({
      searchExpanded,
      setSearchExpanded,
      searchDraft,
      onSearchDraftChange,
      onFilterPress,
      hasActiveSearchDot: Boolean(searchQuery.trim()),
    });
  }, [
    isFocused,
    searchExpanded,
    searchDraft,
    searchQuery,
    onSearchDraftChange,
    onFilterPress,
    setTouristCatalogHeader,
  ]);

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

  const filtered = useMemo(
    () => filterAndSortTreks(treks, { q: searchQuery, difficulty, sort }),
    [treks, searchQuery, difficulty, sort],
  );

  const pickSort = (id: CatalogSortId) => {
    setSort(id);
    setFilterOpen(false);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (err && treks.length === 0) {
    return <ErrorState message={err} onRetry={() => void load()} />;
  }

  return (
    <View style={styles.screenRoot}>
      <ShellFlatList
        style={{ flex: 1, backgroundColor: colors.bg }}
        data={filtered}
        keyExtractor={(item) => item.id}
        onScroll={shell.onMainScroll}
        scrollEventThrottle={shell.scrollEventThrottle}
        contentContainerStyle={[shell.animatedContentPaddingStyle, { paddingBottom: 32 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.pad}>
            <Text style={styles.hi}>Welcome{user?.displayName ? `, ${user.displayName}` : ""}</Text>
            <Text style={styles.sub}>Browse treks below. Your bookings stay under the Trips tab.</Text>

            <Text style={styles.sortHint}>
              Sort: <Text style={styles.sortHintEm}>{SORT_OPTIONS.find((o) => o.id === sort)?.label}</Text>
            </Text>

            <DifficultyFilterChips selected={difficulty} onSelect={setDifficulty} />

            <View style={styles.countRow}>
              <Text style={styles.count}>
                <Text style={styles.countEm}>{filtered.length}</Text> treks
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.pad}>
            {treks.length === 0 ? (
              <EmptyState
                title="No treks in catalog"
                message="Add treks in admin or check EXPO_PUBLIC_API_BASE_URL. Open the website to browse when the API is empty."
              />
            ) : (
              <EmptyState
                title="No treks match"
                message="Try a different search, difficulty, or sort option."
              />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardPad}>
            <TrekCatalogCard trek={item} onPress={() => router.push(`/tourist/trek/${encodeURIComponent(item.id)}`)} />
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            {err && treks.length > 0 ? <Text style={styles.warn}>{err}</Text> : null}
            <WebsiteLinkButton label="Open full website" />
            {ENV.webBaseUrl ? (
              <View style={{ marginTop: 10 }}>
                <WebsiteLinkButton label="Book on website" path="/treks" />
              </View>
            ) : null}
          </View>
        }
      />

      <Modal visible={filterOpen} animationType="fade" transparent onRequestClose={() => setFilterOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setFilterOpen(false)} accessibilityLabel="Dismiss" />
        <View style={[styles.filterSheet, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.modalTitle}>Sort treks</Text>
          <Text style={styles.modalSub}>Match the trek explorer on the website.</Text>
          {SORT_OPTIONS.map((opt) => {
            const on = sort === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => pickSort(opt.id)}
                style={[styles.sortRow, on && styles.sortRowOn]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sortLabel, on && styles.sortLabelOn]}>{opt.label}</Text>
                  <Text style={styles.sortHintRow}>{opt.hint}</Text>
                </View>
                {on ? <FontAwesome name="check" size={18} color={colors.primary} /> : null}
              </Pressable>
            );
          })}
          <Pressable style={styles.doneBtnSecondary} onPress={() => setFilterOpen(false)}>
            <Text style={styles.doneBtnTextMuted}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: { flex: 1, backgroundColor: colors.bg },
  pad: { paddingHorizontal: 16, paddingTop: 8 },
  cardPad: { paddingHorizontal: 16, paddingBottom: 14 },
  hi: { fontSize: 24, fontWeight: "800", color: colors.text },
  sub: { marginTop: 6, fontSize: 15, color: colors.muted, marginBottom: 16 },
  sortHint: { fontSize: 13, color: colors.muted, marginBottom: 8 },
  sortHintEm: { fontWeight: "700", color: colors.text },
  countRow: { marginBottom: 8 },
  count: { fontSize: 14, color: colors.muted },
  countEm: { fontWeight: "800", color: colors.text },
  footer: { padding: 24, paddingBottom: 40, gap: 8 },
  warn: { color: colors.goldText, marginBottom: 8, fontSize: 13 },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  filterSheet: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: "12%",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  modalSub: { marginTop: 6, fontSize: 14, color: colors.muted, marginBottom: 14 },
  doneBtnSecondary: { marginTop: 12, alignItems: "center", paddingVertical: 8 },
  doneBtnTextMuted: { fontSize: 15, fontWeight: "600", color: colors.muted },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  sortRowOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  sortLabel: { fontSize: 16, fontWeight: "700", color: colors.text },
  sortLabelOn: { color: colors.primaryDark },
  sortHintRow: { fontSize: 13, color: colors.muted, marginTop: 2 },
});
