import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/theme/colors";

const PEEK_MS = 3000;

type Props = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

/** Password is obscured by default. Tap eye to show for 3s (or tap again to hide sooner). */
export function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = "none",
}: Props) {
  const [obscured, setObscured] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current != null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  const toggleVisibility = useCallback(() => {
    if (obscured) {
      setObscured(false);
      clearHideTimer();
      hideTimerRef.current = setTimeout(() => {
        setObscured(true);
        hideTimerRef.current = null;
      }, PEEK_MS);
    } else {
      clearHideTimer();
      setObscured(true);
    }
  }, [obscured, clearHideTimer]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.fieldRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={obscured}
          autoCapitalize={autoCapitalize}
          style={styles.input}
          accessibilityLabel={label}
        />
        <Pressable
          onPress={toggleVisibility}
          hitSlop={10}
          style={styles.eyeBtn}
          accessibilityRole="button"
          accessibilityLabel={obscured ? "Show password" : "Hide password"}
        >
          <FontAwesome name={obscured ? "eye-slash" : "eye"} size={20} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14, width: "100%" },
  label: { fontSize: 12, fontWeight: "700", color: colors.muted, marginBottom: 6, letterSpacing: 0.5 },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  eyeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
