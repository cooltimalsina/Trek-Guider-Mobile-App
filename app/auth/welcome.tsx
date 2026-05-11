import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "@/auth/AuthContext";
import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { AppScreen } from "@/components/AppScreen";
import { ENV } from "@/constants/env";
import type { AuthIntent } from "@/types/auth";
import { ApiError } from "@/types/api";
import { colors } from "@/theme/colors";

/**
 * Same model as Trek-Guider web: only API Gateway + `intent` on `/auth/login`.
 * No user pool id on the client — backend selects the Cognito app client.
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [mode, setMode] = useState<AuthIntent>("tourist");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onLogin() {
    setErr(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password, mode);
      router.replace("/");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Sign in failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  function openWebPasswordHelp() {
    const base = ENV.webBaseUrl;
    if (!base) return;
    const q = mode === "guide" ? "?role=guide" : "";
    void WebBrowser.openBrowserAsync(`${base}/login${q}`);
  }

  return (
    <AppScreen scroll keyboard>
      <View style={styles.hero}>
        <Text style={styles.logo}>Trek Guider</Text>
        <Text style={styles.tag}>Plan treks. Match with trusted guides.</Text>
      </View>

      <View style={styles.modeRow}>
        <Text style={styles.modeLabel}>Signing in as</Text>
        <Text style={styles.modeValue}>{mode === "tourist" ? "Traveler" : "Guide"}</Text>
      </View>

      {err ? <Text style={styles.err}>{err}</Text> : null}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <AppInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <AppButton title="Log in" onPress={onLogin} loading={loading} />
      </KeyboardAvoidingView>

      <Pressable style={styles.registerWrap} onPress={() => router.push({ pathname: "/auth/register", params: { mode } })}>
        <Text style={styles.registerText}>
          Need an account? <Text style={styles.registerBold}>Register</Text>
        </Text>
      </Pressable>

      {mode === "tourist" ? (
        <Pressable style={styles.switchWrap} onPress={() => setMode("guide")}>
          <Text style={styles.switchText}>Are you a guide? Switch to guide</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.switchWrap} onPress={() => setMode("tourist")}>
          <Text style={styles.switchText}>Traveling as a guest? Switch to traveler</Text>
        </Pressable>
      )}

      <Pressable style={styles.forgotWrap} onPress={openWebPasswordHelp} disabled={!ENV.webBaseUrl}>
        <Text style={[styles.forgot, !ENV.webBaseUrl && styles.forgotDisabled]}>Forgot password? (website)</Text>
      </Pressable>

      <Text style={styles.foot}>
        Bookings and checkout use your browser. Only your API base URL is required here — same as the website.
      </Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: { marginBottom: 24, marginTop: 8 },
  logo: { fontSize: 32, fontWeight: "800", color: colors.text },
  tag: { marginTop: 8, fontSize: 16, color: colors.muted, lineHeight: 22 },
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeLabel: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  modeValue: { fontSize: 15, fontWeight: "800", color: colors.primary },
  err: { color: colors.danger, marginBottom: 12, fontSize: 14 },
  registerWrap: { marginTop: 20, alignItems: "center" },
  registerText: { fontSize: 15, color: colors.muted },
  registerBold: { color: colors.primary, fontWeight: "700" },
  switchWrap: { marginTop: 16, alignItems: "center", paddingVertical: 8 },
  switchText: { fontSize: 15, color: colors.primary, fontWeight: "600" },
  forgotWrap: { marginTop: 8, alignItems: "center" },
  forgot: { fontSize: 14, color: colors.muted, fontWeight: "500" },
  forgotDisabled: { opacity: 0.45 },
  foot: { marginTop: 28, fontSize: 12, color: colors.muted, lineHeight: 18 },
});
