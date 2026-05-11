import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as WebBrowser from "expo-web-browser";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import { useAuth } from "@/auth/AuthContext";
import { fetchTrekPublic } from "@/api/touristApi";
import { AppButton } from "@/components/AppButton";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { StatusBadge } from "@/components/StatusBadge";
import { ENV } from "@/constants/env";
import { useResetMainHeaderOnFocus } from "@/navigation/useResetMainHeaderOnFocus";
import { colors } from "@/theme/colors";
import type { MobileBooking } from "@/types/booking";
import type { TrekSummaryDto } from "@/types/trip";
import { buildTouristTripTimeline, type TripTimelineStep } from "@/utils/bookingTimeline";
import { formatDateRangeLong } from "@/utils/dateFormat";
import { initialsFromName } from "@/utils/initials";
import { loadGuideBookingsEnriched } from "@/utils/guideBookings";

const HERO_H = Math.min(340, Math.round(Dimensions.get("window").width * 0.78));
const SERIF = Platform.select({ ios: "Georgia", android: "serif", default: undefined });

function formatMoney(amount: number | undefined, currency = "USD"): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `$${amount.toFixed(0)}`;
  }
}

function TimelineRow({ step, isLast }: { step: TripTimelineStep; isLast: boolean }) {
  const doneOrange = step.state === "done" && step.tone === "orange";
  const doneOther = step.state === "done" && (step.tone === "green" || step.tone === "blue");
  const current = step.state === "current";
  const failed = step.state === "failed";
  const pending = step.state === "pending";
  const blueDot = current && step.tone === "blue";

  let fill = "transparent";
  if (failed) fill = "#b91c1c";
  else if (doneOrange) fill = "#ea580c";
  else if (doneOther) fill = "#16a34a";
  else if (current && !blueDot) fill = "#16a34a";

  const showCheck = step.state === "done" && !failed;

  return (
    <View style={styles.tlRow}>
      <View style={styles.tlCol}>
        <View
          style={[
            styles.tlDot,
            {
              backgroundColor: blueDot ? "#2563eb" : pending ? "transparent" : fill,
              borderWidth: pending ? 2 : 0,
              borderColor: colors.border,
            },
          ]}
        >
          {failed ? <FontAwesome name="times" size={12} color="#fff" /> : null}
          {!failed && showCheck ? <FontAwesome name="check" size={11} color="#fff" /> : null}
        </View>
        {!isLast ? (
          <View
            style={[
              styles.tlLine,
              { backgroundColor: doneOrange ? "#fdba74" : doneOther || (current && !blueDot) ? "#86efac" : colors.border },
            ]}
          />
        ) : null}
      </View>
      <View style={styles.tlTextCol}>
        <Text style={[styles.tlLabel, pending && styles.tlMuted]}>{step.label}</Text>
        {step.sublabel ? <Text style={styles.tlSub}>{step.sublabel}</Text> : null}
      </View>
    </View>
  );
}

export default function GuideTripDetailScreen() {
  useResetMainHeaderOnFocus();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accessToken, isReady } = useAuth();
  const [booking, setBooking] = useState<MobileBooking | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !accessToken || !bookingId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      setImgFailed(false);
      try {
        const list = await loadGuideBookingsEnriched(accessToken);
        const hit = list.find((b) => b.bookingId === String(bookingId));
        if (!hit) {
          if (!cancelled) setErr("Booking not found in your list.");
          return;
        }
        let trek: TrekSummaryDto | undefined;
        try {
          trek = await fetchTrekPublic(hit.tripId);
        } catch {
          /* optional */
        }
        const title = trek?.title ?? trek?.name ?? hit.tripTitle;
        const image =
          trek?.heroImageUrl ?? trek?.coverImageUrl ?? trek?.thumbnailUrl ?? trek?.imageUrl ?? hit.tripImageUrl;
        const locJoined = [trek?.regionName, trek?.startLocation, trek?.meetingPoint].filter(Boolean).join(", ");
        const loc = (trek?.locationLabel ?? (locJoined || undefined))?.trim() || undefined;
        const cap = (trek?.description ?? trek?.summary ?? title ?? "").trim().slice(0, 72);

        const merged: MobileBooking = {
          ...hit,
          tripTitle: title,
          tripImageUrl: image,
          tripLocationLabel: loc,
          tripHeroCaption: cap || undefined,
        };
        if (!cancelled) setBooking(merged);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isReady, accessToken, bookingId]);

  const timeline = useMemo(
    () =>
      booking
        ? buildTouristTripTimeline(booking.lifecycleStatus, booking.status, booking.paymentStatus)
        : [],
    [booking],
  );

  const tabPad = 52 + insets.bottom;

  const openWeb = (path: string) => {
    const base = ENV.webBaseUrl;
    if (!base) return;
    const url = path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
    void WebBrowser.openBrowserAsync(url);
  };

  const openHelp = () => {
    const base = ENV.webBaseUrl;
    if (base) void WebBrowser.openBrowserAsync(`${base}/help`);
  };

  if (loading) return <LoadingState />;
  if (err || !booking) return <ErrorState message={err ?? "Not found"} />;

  const uri = booking.tripImageUrl && !imgFailed ? booking.tripImageUrl : null;
  const locationLine = booking.tripLocationLabel?.trim() || "Location TBD";
  const traveler = booking.touristName ?? "Traveler";
  const travelerInitials = initialsFromName(traveler);
  const dateLine = formatDateRangeLong(booking.startDate, booking.endDate);
  const caption = booking.tripHeroCaption || booking.tripTitle;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: tabPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { height: HERO_H }]}>
          <View style={styles.heroStripes}>
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
          <StatusBadge status={booking.status} />
          <Text style={styles.tripTitle}>{booking.tripTitle}</Text>
          <View style={styles.detailRow}>
            <FontAwesome name="map-marker" size={14} color={colors.muted} style={styles.detailIcon} />
            <Text style={styles.detailText}>{locationLine}</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome name="calendar" size={14} color={colors.muted} style={styles.detailIcon} />
            <Text style={styles.detailText}>{dateLine}</Text>
          </View>
          {booking.travelerCount != null ? (
            <View style={styles.detailRow}>
              <FontAwesome name="user" size={14} color={colors.muted} style={styles.detailIcon} />
              <Text style={styles.detailText}>
                {booking.travelerCount} {booking.travelerCount === 1 ? "traveler" : "travelers"}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>TRAVELER</Text>
          <View style={styles.guideRow}>
            <View style={styles.guideAvatar}>
              <Text style={styles.guideAvatarText}>{travelerInitials}</Text>
            </View>
            <View style={styles.guideMeta}>
              <Text style={styles.guideName}>{traveler}</Text>
              {booking.source === "open" ? <Text style={styles.guideCo}>Open pool request</Text> : null}
            </View>
            <Pressable onPress={() => openWeb("/guide")} style={styles.msgBtn}>
              <Text style={styles.msgBtnText}>Message</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.payHead}>
            <Text style={styles.cardEyebrow}>PAYMENT</Text>
            <Text style={styles.payVia}>via Stripe</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Trip total</Text>
            <Text style={styles.paySerif}>{formatMoney(booking.totalAmount)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Deposit</Text>
            <Text style={styles.depositBold}>
              {booking.depositAmount != null ? `${formatMoney(booking.depositAmount)} paid` : "—"}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>STATUS</Text>
          <View style={styles.tl}>
            {timeline.map((step, i) => (
              <TimelineRow key={step.key} step={step} isLast={i === timeline.length - 1} />
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <AppButton
            title="Manage on website"
            variant="dark"
            icon={<FontAwesome name="external-link" size={16} color="#fff" style={{ marginRight: 4 }} />}
            onPress={() => openWeb("/guide")}
          />
          <View style={{ height: 12 }} />
          <AppButton
            title="Get help with this trip"
            variant="secondary"
            icon={<FontAwesome name="question-circle" size={18} color={colors.text} />}
            onPress={openHelp}
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
  hero: {
    width: "100%",
    backgroundColor: "#ebe4d8",
  },
  heroStripes: { flex: 1, overflow: "hidden" },
  heroPh: {
    backgroundColor: "#e8e0d4",
    opacity: 1,
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
  tripTitle: {
    marginTop: 12,
    fontSize: 26,
    fontWeight: "600",
    color: colors.text,
    fontFamily: SERIF,
    lineHeight: 32,
  },
  detailRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  detailIcon: { width: 22 },
  detailText: { flex: 1, fontSize: 15, color: colors.muted },
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 1.2,
  },
  guideRow: { flexDirection: "row", alignItems: "center", marginTop: 14, gap: 12 },
  guideAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#e0ecff",
    alignItems: "center",
    justifyContent: "center",
  },
  guideAvatarText: { fontSize: 16, fontWeight: "800", color: "#1e40af" },
  guideMeta: { flex: 1, minWidth: 0 },
  guideName: { fontSize: 17, fontWeight: "700", color: colors.text },
  guideCo: { fontSize: 14, color: colors.muted, marginTop: 2 },
  msgBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  msgBtnText: { fontSize: 14, fontWeight: "700", color: colors.text },
  payHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  payVia: { fontSize: 11, fontWeight: "600", color: colors.muted, letterSpacing: 0.8 },
  payRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 16 },
  payLabel: { fontSize: 15, color: colors.muted },
  paySerif: { fontSize: 24, fontWeight: "600", color: colors.text, fontFamily: SERIF },
  depositBold: { fontSize: 15, fontWeight: "800", color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginTop: 16 },
  tl: { marginTop: 8 },
  tlRow: { flexDirection: "row", minHeight: 44 },
  tlCol: { width: 28, alignItems: "center" },
  tlDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  tlLine: { width: 2, flex: 1, minHeight: 18, marginVertical: 2 },
  tlTextCol: { flex: 1, paddingBottom: 8 },
  tlLabel: { fontSize: 15, fontWeight: "600", color: colors.text },
  tlMuted: { color: colors.muted, fontWeight: "500" },
  tlSub: { fontSize: 12, color: colors.muted, marginTop: 4 },
  actions: { marginHorizontal: 16, marginTop: 20, marginBottom: 8 },
});
