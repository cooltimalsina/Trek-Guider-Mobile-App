import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { AppScreen } from "@/components/AppScreen";
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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit() {
    setErr(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await signUp(email.trim(), password, mode, name.trim() || undefined);
      setInfo(res.message ?? (res.needsEmailVerification ? "Check your email to verify, then log in." : "You can sign in now."));
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Sign up failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen scroll keyboard>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Text style={styles.title}>{mode === "guide" ? "Create guide account" : "Create traveler account"}</Text>
        <Text style={styles.sub}>
          Same as the website: <Text style={styles.em}>/auth/register</Text> with intent{" "}
          <Text style={styles.em}>{mode}</Text>.
        </Text>
        {err ? <Text style={styles.err}>{err}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}
        <AppInput label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
        <AppInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <AppButton title="Register" onPress={onSubmit} loading={loading} />
        <Pressable style={styles.mt} onPress={() => router.replace("/auth/welcome")}>
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
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800", color: colors.text },
  sub: { marginTop: 8, marginBottom: 20, fontSize: 14, color: colors.muted, lineHeight: 20 },
  em: { fontSize: 14, fontWeight: "700", color: colors.text },
  err: { color: colors.danger, marginBottom: 12, fontSize: 14 },
  info: { color: colors.primaryDark, marginBottom: 12, fontSize: 14 },
  link: { marginTop: 16, color: colors.primary, fontWeight: "600", fontSize: 15 },
  switch: { marginTop: 8, color: colors.primary, fontWeight: "600", fontSize: 15 },
  mt: { marginTop: 12 },
});
