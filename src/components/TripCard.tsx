import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

type Props = {
  title: string;
  imageUrl?: string;
  subtitle?: string;
};

export function TripCard({ title, imageUrl, subtitle }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const uri = imageUrl && !imgFailed ? imageUrl : null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {uri ? (
        <Image source={{ uri }} style={styles.img} resizeMode="cover" onError={() => setImgFailed(true)} />
      ) : (
        <View style={[styles.img, styles.placeholder]}>
          <FontAwesome name="image" size={36} color={colors.textMuted} />
        </View>
      )}
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingBottom: 14,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.text, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12 },
  img: { width: "100%", height: 160, backgroundColor: colors.borderSubtle },
  placeholder: { alignItems: "center", justifyContent: "center" },
  sub: { marginTop: 12, paddingHorizontal: 14, fontSize: 14, color: colors.muted },
});
