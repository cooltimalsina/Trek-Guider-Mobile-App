import FontAwesome from "@expo/vector-icons/FontAwesome";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import type { ComponentProps } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ENV } from "@/constants/env";
import { colors } from "@/theme/colors";
import { initialsFromName } from "@/utils/initials";

const SCREEN_BG = "#F9F9F7";
const SERIF = Platform.select({ ios: "Georgia", android: "serif", default: undefined });
const TAB_BAR_CLEARANCE = 52;

type Props = {
  roleLabel: "Tourist" | "Guide";
  displayName: string;
  email: string;
  websitePath: string;
  websiteMenuTitle: string;
  websiteSubtitle: string;
  onSignOut: () => void;
};

function openUrl(path: string) {
  const base = ENV.webBaseUrl;
  if (!base) return;
  const url = path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base;
  void WebBrowser.openBrowserAsync(url);
}

export function ProfileScreenContent({
  roleLabel,
  displayName,
  email,
  websitePath,
  websiteMenuTitle,
  websiteSubtitle,
  onSignOut,
}: Props) {
  const insets = useSafeAreaInsets();
  const initials = initialsFromName(displayName || email || "?");
  const version = Constants.expoConfig?.version ?? "1.0.0";
  const footer = `Trek Guider · v${version} (MVP)`;
  const bottomPad = TAB_BAR_CLEARANCE + insets.bottom + 8;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: SCREEN_BG }]}
      contentContainerStyle={[
        styles.body,
        { paddingTop: insets.top + 8, paddingBottom: bottomPad },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.pageTitle}>Profile</Text>

      <View style={styles.card}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userMeta}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName || "—"}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {email || "—"}
            </Text>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>{roleLabel}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <MenuRow
          icon="globe"
          title={websiteMenuTitle}
          subtitle={websiteSubtitle}
          onPress={() => openUrl(websitePath)}
          disabled={!ENV.webBaseUrl}
          showDividerBelow
        />
        <MenuRow
          icon="question-circle"
          title="Help & support"
          subtitle="Reach our team 24/7"
          onPress={() => openUrl("/help")}
          disabled={!ENV.webBaseUrl}
          showDividerBelow
        />
        <MenuRow
          icon="shield"
          title="Privacy"
          subtitle="Manage your data"
          onPress={() => openUrl("/privacy")}
          disabled={!ENV.webBaseUrl}
          showDividerBelow={false}
        />
      </View>

      <Pressable
        style={styles.card}
        onPress={onSignOut}
        accessibilityRole="button"
        accessibilityLabel="Log out"
      >
        <View style={styles.logoutRow}>
          <View style={styles.logoutIconWrap}>
            <FontAwesome name="sign-out" size={18} color={colors.danger} />
          </View>
          <Text style={styles.logoutText}>Log out</Text>
        </View>
      </Pressable>

      <Text style={styles.footer}>{footer}</Text>
    </ScrollView>
  );
}

function MenuRow({
  icon,
  title,
  subtitle,
  onPress,
  disabled,
  showDividerBelow,
}: {
  icon: ComponentProps<typeof FontAwesome>["name"];
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
  showDividerBelow: boolean;
}) {
  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed, disabled && styles.menuRowDisabled]}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
      >
        <View style={styles.menuIconWrap}>
          <FontAwesome name={icon} size={18} color={colors.muted} />
        </View>
        <View style={styles.menuTextCol}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
        <FontAwesome name="chevron-right" size={14} color={colors.textMuted} />
      </Pressable>
      {showDividerBelow ? <View style={styles.menuDivider} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  pageTitle: {
    fontFamily: SERIF,
    fontSize: 34,
    fontWeight: "400",
    color: colors.text,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 4,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.terra,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userMeta: { flex: 1, gap: 4 },
  name: { fontSize: 18, fontWeight: "700", color: colors.text },
  email: { fontSize: 14, color: colors.muted },
  rolePill: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.terraLight,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.terra,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  menuRowPressed: { opacity: 0.75 },
  menuRowDisabled: { opacity: 0.45 },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F4F4F2",
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextCol: { flex: 1, gap: 2 },
  menuTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  menuSubtitle: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 66,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 12,
  },
  logoutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FEE4E2",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#991B1B",
  },
  footer: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    letterSpacing: 0.3,
  },
});
