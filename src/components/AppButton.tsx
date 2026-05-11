import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  icon?: ReactNode;
};

export function AppButton({ title, onPress, loading, disabled, variant = "primary", icon }: Props) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const isDark = variant === "dark";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        isDanger && styles.danger,
        isDark && styles.dark,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || isDanger || isDark ? "#fff" : colors.primary} />
      ) : (
        <View style={styles.inner}>
          {icon}
          <Text
            style={[
              styles.text,
              isPrimary && styles.textOnPrimary,
              variant === "secondary" && styles.textSecondary,
              isDanger && styles.textOnPrimary,
              isDark && styles.textOnPrimary,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: { flexDirection: "row", alignItems: "center", gap: 8 },
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: colors.danger },
  dark: { backgroundColor: "#111827" },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.88 },
  text: { fontSize: 16, fontWeight: "600" },
  textOnPrimary: { color: "#fff" },
  textSecondary: { color: colors.text },
});
