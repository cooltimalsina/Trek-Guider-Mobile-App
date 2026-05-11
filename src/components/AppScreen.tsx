import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  /** Use when screen has a text input */
  keyboard?: boolean;
  /** When scroll is true, vertically centers content if it is shorter than the viewport */
  centerContent?: boolean;
};

export function AppScreen({ children, scroll, keyboard, centerContent }: Props) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, centerContent && styles.scrollContentCentered]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.fill}>{children}</View>
  );

  const wrapped =
    keyboard && Platform.OS === "ios" ? (
      <KeyboardAvoidingView behavior="padding" style={styles.fill}>
        {content}
      </KeyboardAvoidingView>
    ) : (
      content
    );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {wrapped}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 32, flexGrow: 1 },
  scrollContentCentered: { justifyContent: "center" },
});
