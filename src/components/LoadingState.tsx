import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";

export function LoadingState() {
  return (
    <View style={styles.box}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 40, alignItems: "center", justifyContent: "center" },
});
