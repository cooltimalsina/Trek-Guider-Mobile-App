import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { AppButton } from "./AppButton";

type Props = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.msg}>{message}</Text>
      {onRetry ? <AppButton title="Try again" onPress={onRetry} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 20, gap: 12 },
  title: { fontSize: 17, fontWeight: "700", color: colors.danger },
  msg: { fontSize: 14, color: colors.muted, lineHeight: 20 },
});
