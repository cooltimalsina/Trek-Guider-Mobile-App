import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { CatalogTrek } from "@/types/catalogTrek";
import { colors } from "@/theme/colors";

function formatDuration(t: CatalogTrek): string {
  const n = Math.round(t.durationDays);
  if (!n) return "Flexible duration";
  if (t.durationUnit === "hours") return `${n} hour${n === 1 ? "" : "s"}`;
  return `${n} day${n === 1 ? "" : "s"}`;
}

function formatUsd(n: number): string {
  if (!n || Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${Math.round(n)}`;
  }
}

type Props = {
  trek: CatalogTrek;
  onPress: () => void;
};

/** Card layout aligned with web `TrekCard`: hero, category, title, meta, rating + from price. */
export function TrekCatalogCard({ trek, onPress }: Props) {
  const category = trek.areaLabel || trek.destinationName || trek.difficulty || "Adventure";
  const durationLine = formatDuration(trek);
  const metaBits = [durationLine, "Small group", trek.meetingPoint ? "Pickup available" : ""].filter(Boolean);
  const ratingValue = typeof trek.rating === "number" && trek.rating > 0 ? trek.rating : 5;
  const hasReviewCount = typeof trek.reviewCount === "number" && trek.reviewCount > 0;
  const ratingText = ratingValue.toFixed(1).replace(/\.0$/, "");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${trek.title}, from ${formatUsd(trek.minPriceUsd)}`}
    >
      <View style={styles.hero}>
        {trek.coverImageUrl ? (
          <Image source={{ uri: trek.coverImageUrl }} style={styles.heroImg} resizeMode="cover" />
        ) : (
          <View style={styles.heroPh}>
            <Text style={styles.heroPhText} numberOfLines={2}>
              {trek.title}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {trek.title}
        </Text>
        <Text style={styles.meta}>{metaBits.join(" • ")}</Text>
        <View style={styles.footer}>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingNum}>{ratingText}</Text>
            <Text style={styles.star}>★</Text>
            {hasReviewCount ? <Text style={styles.reviewCount}>({trek.reviewCount})</Text> : null}
          </View>
          <View style={styles.priceCol}>
            <Text style={styles.fromLabel}>From</Text>
            <Text style={styles.price}>{formatUsd(trek.minPriceUsd)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: { opacity: 0.92 },
  hero: { height: 176, width: "100%", backgroundColor: "#e2e8f0" },
  heroImg: { width: "100%", height: "100%" },
  heroPh: { flex: 1, padding: 16, justifyContent: "center", backgroundColor: "#e2e8f0" },
  heroPhText: { fontSize: 14, fontWeight: "600", color: colors.muted, textAlign: "center" },
  body: { padding: 16 },
  category: { fontSize: 14, fontWeight: "500", color: colors.muted },
  title: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 24,
  },
  meta: { marginTop: 8, fontSize: 14, color: colors.muted },
  footer: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f4",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingNum: { fontSize: 20, fontWeight: "600", color: "#1e293b" },
  star: { fontSize: 18, color: "#0f172a", marginTop: -2 },
  reviewCount: { fontSize: 14, color: colors.muted, fontWeight: "400" },
  priceCol: { alignItems: "flex-end" },
  fromLabel: { fontSize: 11, color: colors.muted },
  price: { fontSize: 28, fontWeight: "800", color: "#1e293b" },
});
