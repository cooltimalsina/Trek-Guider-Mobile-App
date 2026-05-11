import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as WebBrowser from "expo-web-browser";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchCatalogTrekById } from "@/api/touristApi";
import { AppButton } from "@/components/AppButton";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { ENV } from "@/constants/env";
import { useResetMainHeaderOnFocus } from "@/navigation/useResetMainHeaderOnFocus";
import { colors } from "@/theme/colors";
import type { CatalogTrek } from "@/types/catalogTrek";

const HERO_H = Math.min(340, Math.round(Dimensions.get("window").width * 0.78));
const SERIF = Platform.select({ ios: "Georgia", android: "serif", default: undefined });

function formatDuration(t: CatalogTrek): string {
  const n = Math.round(t.durationDays);
  if (!n) return "Duration on request";
  if (t.durationUnit === "hours") return `${n} hour${n === 1 ? "" : "s"}`;
  return `${n} day${n === 1 ? "" : "s"}`;
}

function formatMoneyUsd(amount: number | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `$${Math.round(amount)}`;
  }
}

export default function CatalogTrekDetailScreen() {
  useResetMainHeaderOnFocus();
  const { trekId } = useLocalSearchParams<{ trekId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [trek, setTrek] = useState<CatalogTrek | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!trekId) return;
      setLoading(true);
      setErr(null);
      setImgFailed(false);
      try {
        const t = await fetchCatalogTrekById(String(trekId));
        if (!cancelled) {
          if (!t) setErr("Trek not found");
          else setTrek(t);
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Could not load trek");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trekId]);

  const tabPad = 52 + insets.bottom;

  const openBook = () => {
    const base = ENV.webBaseUrl;
    if (!base || !trek) return;
    const url = `${base}/book/${encodeURIComponent(trek.id)}`;
    void WebBrowser.openBrowserAsync(url);
  };

  if (loading) return <LoadingState />;
  if (err || !trek) return <ErrorState message={err ?? "Not found"} />;

  const uri = trek.coverImageUrl && !imgFailed ? trek.coverImageUrl : null;
  const locationLine = [trek.areaLabel, trek.destinationName].filter(Boolean).join(" · ") || "Location TBD";
  const caption = (trek.shortDescription ?? trek.title).trim().slice(0, 96);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: tabPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { height: HERO_H }]}>
          <View style={styles.heroInner}>
            {uri ? (
              <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setImgFailed(true)} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.heroPh]} />
            )}
          </View>
          {caption ? (
            <View style={styles.captionPill}>
              <Text style={styles.captionText} numberOfLines={2}>
                {caption}
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { top: insets.top + 8 }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <FontAwesome name="chevron-left" size={18} color={colors.text} />
        </Pressable>

        <View style={styles.overlapCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Open for booking</Text>
          </View>
          <Text style={styles.tripTitle}>{trek.title}</Text>
          <View style={styles.detailRow}>
            <FontAwesome name="map-marker" size={14} color={colors.muted} style={styles.detailIcon} />
            <Text style={styles.detailText}>{locationLine}</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome name="calendar" size={14} color={colors.muted} style={styles.detailIcon} />
            <Text style={styles.detailText}>{formatDuration(trek)}</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome name="tag" size={14} color={colors.muted} style={styles.detailIcon} />
            <Text style={styles.detailText}>{trek.difficulty}</Text>
          </View>
        </View>

        {trek.shortDescription ? (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>ABOUT THIS TREK</Text>
            <Text style={styles.bodyText}>{trek.shortDescription}</Text>
          </View>
        ) : null}

        {trek.highlights && trek.highlights.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>HIGHLIGHTS</Text>
            {trek.highlights.slice(0, 8).map((line) => (
              <Text key={line} style={styles.bullet}>
                • {line}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.payHead}>
            <Text style={styles.cardEyebrow}>FROM</Text>
            <Text style={styles.payVia}>per person</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Starting at</Text>
            <Text style={styles.paySerif}>{formatMoneyUsd(trek.minPriceUsd)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <AppButton
            title="Book this trip"
            variant="dark"
            icon={<FontAwesome name="external-link" size={16} color="#fff" style={{ marginRight: 4 }} />}
            onPress={openBook}
            disabled={!ENV.webBaseUrl}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  hero: { width: "100%", backgroundColor: "#ebe4d8" },
  heroInner: { flex: 1, overflow: "hidden" },
  heroPh: {
    backgroundColor: "#e8e0d4",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd5c8",
  },
  captionPill: {
    position: "absolute",
    bottom: 56,
    alignSelf: "center",
    maxWidth: "88%",
    backgroundColor: "rgba(255,255,255,0.72)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  captionText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    textAlign: "center",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  overlapCard: {
    marginTop: -36,
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.blueLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: "700", color: colors.blue },
  tripTitle: {
    marginTop: 12,
    fontSize: 26,
    fontWeight: "600",
    color: colors.text,
    fontFamily: SERIF,
    lineHeight: 32,
  },
  detailRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  detailIcon: { width: 18, textAlign: "center", marginRight: 8 },
  detailText: { flex: 1, fontSize: 15, color: colors.muted },
  card: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.muted,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  bodyText: { fontSize: 15, color: colors.text, lineHeight: 22 },
  bullet: { fontSize: 15, color: colors.text, lineHeight: 24, marginTop: 4 },
  payHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  payVia: { fontSize: 12, color: colors.muted },
  payRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  payLabel: { fontSize: 15, color: colors.muted },
  paySerif: { fontSize: 28, fontWeight: "700", color: colors.text, fontFamily: SERIF },
  actions: { marginTop: 20, marginHorizontal: 16, marginBottom: 24 },
});
