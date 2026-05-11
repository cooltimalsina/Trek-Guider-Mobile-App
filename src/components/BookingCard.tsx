import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { MobileBooking } from "@/types/booking";
import { colors } from "@/theme/colors";
import { formatDateRangeUs } from "@/utils/dateFormat";
import { initialsFromName } from "@/utils/initials";
import { StatusBadge } from "./StatusBadge";

type Props = {
  booking: MobileBooking;
  onPress: () => void;
  /** Tourist home: booker row uses customer name; guide list uses traveler name. */
  viewer?: "tourist" | "guide";
  /** When API omits `touristName`, show this (e.g. logged-in display name). */
  bookerFallbackName?: string;
};

export function BookingCard({ booking, onPress, viewer = "tourist", bookerFallbackName }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const uri = booking.tripImageUrl && !imgFailed ? booking.tripImageUrl : null;

  const bookerDisplay =
    viewer === "tourist"
      ? (booking.touristName?.trim() || bookerFallbackName?.trim() || "You")
      : (booking.touristName?.trim() || "Traveler");

  const initials = initialsFromName(bookerDisplay);
  const dateLine = formatDateRangeUs(booking.startDate, booking.endDate);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Text style={styles.title} numberOfLines={2}>
        {booking.tripTitle}
      </Text>

      <View style={styles.imageWrap}>
        {uri ? (
          <Image
            source={{ uri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <FontAwesome name="image" size={36} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.badgeOnImage}>
          <StatusBadge status={booking.status} />
        </View>
      </View>

      <View style={styles.dateRow}>
        <FontAwesome name="calendar" size={14} color={colors.muted} style={styles.dateIcon} />
        <Text style={styles.dateText}>{dateLine}</Text>
      </View>

      <View style={styles.personRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.personName} numberOfLines={1}>
          {bookerDisplay}
        </Text>
        <FontAwesome name="chevron-right" size={14} color={colors.textMuted} style={styles.chevron} />
      </View>

      {booking.travelerCount != null ? (
        <Text style={styles.travelers}>
          {booking.travelerCount} {booking.travelerCount === 1 ? "traveler" : "travelers"}
        </Text>
      ) : null}

      {viewer === "tourist" && booking.guideName?.trim() ? (
        <Text style={styles.guideHint} numberOfLines={1}>
          Guide: {booking.guideName}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.92 },
  title: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 12 },
  imageWrap: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  image: { width: "100%", height: 168, backgroundColor: colors.borderSubtle },
  placeholder: { alignItems: "center", justifyContent: "center" },
  badgeOnImage: { position: "absolute", top: 10, left: 10 },
  dateRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  dateIcon: { marginRight: 8 },
  dateText: { fontSize: 14, color: colors.muted, flex: 1 },
  personRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "700", color: colors.primary },
  personName: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.text },
  chevron: { marginLeft: 4 },
  travelers: { marginTop: 8, fontSize: 13, color: colors.muted },
  guideHint: { marginTop: 6, fontSize: 13, color: colors.muted, fontStyle: "italic" },
});
