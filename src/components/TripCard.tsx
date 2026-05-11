import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

type Props = {
  title: string;
  imageUrl?: string;
  subtitle?: string;
};

export function TripCard({ title, imageUrl, subtitle }: Props) {
  return (
    <View style={styles.card}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.img} resizeMode="cover" />
      ) : (
        <View style={[styles.img, styles.placeholder]}>
          <Text style={styles.phText}>Trek</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
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
  },
  img: { width: "100%", height: 160, backgroundColor: colors.border },
  placeholder: { alignItems: "center", justifyContent: "center" },
  phText: { color: colors.muted, fontWeight: "700" },
  body: { padding: 14 },
  title: { fontSize: 18, fontWeight: "700", color: colors.text },
  sub: { marginTop: 4, fontSize: 14, color: colors.muted },
});
