import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { AppScreen } from "@/components/AppScreen";
import { PasswordInput } from "@/components/PasswordInput";
import type { AuthIntent } from "@/types/auth";
import { ApiError } from "@/types/api";
import { colors } from "@/theme/colors";

function intentFromParam(raw: string | undefined): AuthIntent {
  return raw === "guide" ? "guide" : "tourist";
}

export default function RegisterScreen() {
  const router = useRouter();
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const mode = useMemo(() => intentFromParam(modeParam), [modeParam]);
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit() {
    setErr(null);
    setInfo(null);
    if (!password) {
      setErr("Enter a password.");
      return;
    }
    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await signUp(email.trim(), password, mode);
      setInfo(res.message ?? (res.needsEmailVerification ? "Check your email to verify, then log in." : "You can sign in now."));
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Sign up failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen scroll keyboard centerContent>
      <View style={styles.column}>
        <Text style={styles.title}>{mode === "guide" ? "Create guide account" : "Create traveler account"}</Text>
        {err ? <Text style={styles.err}>{err}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.form}>
          <AppInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <PasswordInput label="Password" value={password} onChangeText={setPassword} />
          <PasswordInput label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} />
          <AppButton title="Register" onPress={onSubmit} loading={loading} />
        </KeyboardAvoidingView>
        <Pressable
          style={styles.mt}
          onPress={() => router.replace({ pathname: "/auth/welcome", params: { mode } })}
        >
          <Text style={styles.link}>Already have an account? Log in</Text>
        </Pressable>
        {mode === "tourist" ? (
          <Pressable style={styles.mt} onPress={() => router.replace({ pathname: "/auth/register", params: { mode: "guide" } })}>
            <Text style={styles.switch}>Registering as a guide instead?</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.mt} onPress={() => router.replace({ pathname: "/auth/register", params: { mode: "tourist" } })}>
            <Text style={styles.switch}>Registering as a traveler instead?</Text>
          </Pressable>
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  column: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginBottom: 20,
  },
  form: { width: "100%" },
  err: { color: colors.danger, marginBottom: 12, fontSize: 14, textAlign: "center", width: "100%" },
  info: { color: colors.primaryDark, marginBottom: 12, fontSize: 14, textAlign: "center", width: "100%" },
  link: { marginTop: 16, color: colors.primary, fontWeight: "600", fontSize: 15, textAlign: "center" },
  switch: { marginTop: 8, color: colors.primary, fontWeight: "600", fontSize: 15, textAlign: "center" },
  mt: { marginTop: 12, alignSelf: "stretch", alignItems: "center" },
});
