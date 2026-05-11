import FontAwesome from "@expo/vector-icons/FontAwesome";
import type { Href } from "expo-router";
import { useRouter, usePathname } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  FlatList,
  type FlatListProps,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/auth/AuthContext";
import { colors } from "@/theme/colors";
import { initialsFromName } from "@/utils/initials";

const HEADER_INNER = 52;
const DRAWER_WIDTH = Math.min(320, Dimensions.get("window").width * 0.88);

export type AppShellConfig = {
  homeHref: string;
  tripsHref: string;
  profileHref: string;
  tripsLabel: string;
};

type AppShellContextValue = {
  /** Merge into list `contentContainerStyle` for top inset under chrome */
  animatedContentPaddingStyle: { paddingTop: Animated.AnimatedInterpolation<number> };
  onMainScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle: number;
  openDrawer: () => void;
  closeDrawer: () => void;
  /** Full show: bar visible, same as initial (use on tab focus). */
  resetMainHeader: () => void;
};

const AppShellContext = createContext<AppShellContextValue | undefined>(undefined);

const HEADER_ANIM_MS = 260;

/** Smooth show/hide for header bar + content padding (must use nativeDriver: false for layout-linked values). */
function animateHeaderProgress(v: Animated.Value, target: number) {
  Animated.timing(v, {
    toValue: target,
    duration: HEADER_ANIM_MS,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: false,
  }).start();
}

export function AppShellProvider({ children, config }: { children: ReactNode; config: AppShellConfig }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const headerProgress = useRef(new Animated.Value(1)).current;
  const drawerSlide = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const [drawerVisible, setDrawerVisible] = useState(false);

  const lastY = useRef(0);

  /** Full chrome height: safe area + inner bar (+ hairline). */
  const headerTotal = insets.top + HEADER_INNER + 1;

  const resetMainHeader = useCallback(() => {
    lastY.current = 0;
    headerProgress.stopAnimation();
    animateHeaderProgress(headerProgress, 1);
  }, [headerProgress]);

  useEffect(() => {
    resetMainHeader();
  }, [pathname, resetMainHeader]);

  const expandedPadding = headerTotal;
  const collapsedPadding = insets.top + 8;

  const animatedContentPaddingStyle = useMemo(
    () => ({
      paddingTop: headerProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [collapsedPadding, expandedPadding],
      }),
    }),
    [headerProgress, collapsedPadding, expandedPadding],
  );

  /** Move entire chrome (notch + bar) fully off-screen when hidden. */
  const headerTranslate = useMemo(
    () =>
      headerProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [-headerTotal, 0],
      }),
    [headerProgress, headerTotal],
  );

  const showHeader = useCallback(() => {
    headerProgress.stopAnimation();
    animateHeaderProgress(headerProgress, 1);
  }, [headerProgress]);

  const hideHeader = useCallback(() => {
    headerProgress.stopAnimation();
    animateHeaderProgress(headerProgress, 0);
  }, [headerProgress]);

  const onMainScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const dy = y - lastY.current;
      lastY.current = y;
      if (y <= 2) {
        showHeader();
        return;
      }
      if (dy > 8) hideHeader();
      else if (dy < -8) showHeader();
    },
    [hideHeader, showHeader],
  );

  const openDrawer = useCallback(() => {
    drawerSlide.setValue(-DRAWER_WIDTH);
    setDrawerVisible(true);
    requestAnimationFrame(() => {
      Animated.spring(drawerSlide, {
        toValue: 0,
        useNativeDriver: true,
        friction: 9,
        tension: 65,
      }).start();
    });
  }, [drawerSlide]);

  const closeDrawer = useCallback(() => {
    Animated.spring(drawerSlide, {
      toValue: -DRAWER_WIDTH,
      useNativeDriver: true,
      friction: 9,
      tension: 80,
    }).start(({ finished }) => {
      if (finished) setDrawerVisible(false);
    });
  }, [drawerSlide]);

  useEffect(() => {
    if (!drawerVisible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      closeDrawer();
      return true;
    });
    return () => sub.remove();
  }, [drawerVisible, closeDrawer]);

  const goProfile = useCallback(() => {
    closeDrawer();
    setTimeout(() => router.push(config.profileHref as Href), 0);
  }, [closeDrawer, router, config.profileHref]);

  const goTrips = useCallback(() => {
    closeDrawer();
    setTimeout(() => router.push(config.tripsHref as Href), 0);
  }, [closeDrawer, router, config.tripsHref]);

  const goHome = useCallback(() => {
    closeDrawer();
    setTimeout(() => router.push(config.homeHref as Href), 0);
  }, [closeDrawer, router, config.homeHref]);

  const onLogout = useCallback(async () => {
    closeDrawer();
    await signOut();
    router.replace("/auth/welcome");
  }, [closeDrawer, signOut, router]);

  const displayName = user?.displayName?.trim() || user?.email?.trim() || "Account";
  const initials = initialsFromName(displayName);

  const ctx = useMemo<AppShellContextValue>(
    () => ({
      animatedContentPaddingStyle,
      onMainScroll,
      scrollEventThrottle: 16,
      openDrawer,
      closeDrawer,
      resetMainHeader,
    }),
    [animatedContentPaddingStyle, onMainScroll, openDrawer, closeDrawer, resetMainHeader],
  );

  return (
    <AppShellContext.Provider value={ctx}>
      <View style={[styles.fill, { backgroundColor: colors.bg }]}>{children}</View>
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            styles.headerClip,
            {
              paddingTop: insets.top,
              opacity: headerProgress,
              transform: [{ translateY: headerTranslate }],
            },
          ]}
        >
          <View style={styles.headerRow}>
            <Pressable onPress={openDrawer} hitSlop={12} style={styles.iconBtn} accessibilityLabel="Open menu">
              <FontAwesome name="bars" size={22} color={colors.text} />
            </Pressable>
            <Pressable onPress={goHome} style={styles.brandWrap}>
              <Text style={styles.brand}>Trek Guider</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>

      <Modal visible={drawerVisible} transparent animationType="none" onRequestClose={closeDrawer}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={closeDrawer} accessibilityRole="button" />
          <Animated.View style={[styles.drawer, { width: DRAWER_WIDTH, transform: [{ translateX: drawerSlide }] }]}>
            <View style={{ paddingTop: insets.top + 8, flex: 1 }}>
              <Pressable hitSlop={8} onPress={closeDrawer} style={styles.drawerCloseRow}>
                <FontAwesome name="close" size={22} color={colors.muted} />
              </Pressable>
              <View style={styles.drawerCenter}>
                <Pressable onPress={goProfile} style={styles.profileBlock}>
                  <View style={styles.drawerAvatar}>
                    <Text style={styles.drawerAvatarText}>{initials}</Text>
                  </View>
                  <Text style={styles.drawerName}>{displayName}</Text>
                  <Text style={styles.drawerHint}>View profile</Text>
                </Pressable>
              </View>
              <View style={[styles.drawerFooter, { paddingBottom: insets.bottom + 16 }]}>
                <Pressable
                  onPress={goTrips}
                  style={[
                    styles.drawerLink,
                    (pathname === config.tripsHref || pathname.endsWith("/bookings")) && styles.drawerLinkOn,
                  ]}
                >
                  <FontAwesome name="calendar" size={18} color={colors.text} />
                  <Text style={styles.drawerLinkText}>{config.tripsLabel}</Text>
                </Pressable>
                <Pressable onPress={() => void onLogout()} style={styles.drawerLogout}>
                  <FontAwesome name="sign-out" size={18} color={colors.danger} />
                  <Text style={styles.drawerLogoutText}>Log out</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AppShellContext.Provider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  headerClip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    zIndex: 20,
    overflow: "hidden",
  },
  headerRow: {
    height: HEADER_INNER,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 12,
    gap: 4,
  },
  iconBtn: { padding: 8 },
  brandWrap: { paddingVertical: 8, paddingHorizontal: 4, flexShrink: 1 },
  brand: { fontSize: 20, fontWeight: "800", color: colors.text, letterSpacing: -0.3 },
  modalRoot: { flex: 1, flexDirection: "row" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  drawerCloseRow: { alignSelf: "flex-end", paddingHorizontal: 16, paddingBottom: 8 },
  drawerCenter: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  profileBlock: { alignItems: "center", gap: 10 },
  drawerAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  drawerAvatarText: { fontSize: 28, fontWeight: "800", color: colors.primary },
  drawerName: { fontSize: 18, fontWeight: "700", color: colors.text, textAlign: "center" },
  drawerHint: { fontSize: 13, color: colors.muted },
  drawerFooter: { paddingHorizontal: 16, gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  drawerLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.bg,
  },
  drawerLinkOn: { backgroundColor: colors.primaryLight },
  drawerLinkText: { fontSize: 16, fontWeight: "700", color: colors.text },
  drawerLogout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  drawerLogoutText: { fontSize: 16, fontWeight: "700", color: colors.danger },
});

export function useAppShell(): AppShellContextValue {
  const v = useContext(AppShellContext);
  if (!v) throw new Error("useAppShell must be used within AppShellProvider");
  return v;
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

/** Animated FlatList wired to shell padding + scroll hide/show header. */
export function ShellFlatList<T>(props: FlatListProps<T>) {
  return <AnimatedFlatList {...(props as FlatListProps<unknown>)} />;
}

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

/** Animated ScrollView for profile etc. */
export function ShellScrollView(props: ScrollViewProps) {
  return <AnimatedScrollView {...props} />;
}
