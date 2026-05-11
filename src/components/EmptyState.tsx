import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

type Props = {
  title: string;
  message?: string;
};

export function EmptyState({ title, message }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.msg}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: 24,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.text, textAlign: "center" },
  msg: { marginTop: 8, fontSize: 14, color: colors.muted, textAlign: "center", lineHeight: 20 },
});
