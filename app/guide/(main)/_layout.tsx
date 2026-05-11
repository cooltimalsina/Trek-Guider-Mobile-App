import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/auth/AuthContext";
import { AppShellProvider } from "@/navigation/AppShellContext";
import { colors } from "@/theme/colors";

const shell = {
  homeHref: "/guide",
  tripsHref: "/guide/bookings",
  profileHref: "/guide/profile",
  tripsLabel: "Bookings",
} as const;

export default function GuideTabsLayout() {
  const { guideGate } = useAuth();

  if (guideGate && guideGate !== "approved") {
    return <Redirect href="/guide/onboarding-required" />;
  }

  return (
    <AppShellProvider config={shell}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <FontAwesome name="compass" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
            tabBarIcon: ({ color }) => <FontAwesome name="calendar" size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <FontAwesome name="user" size={20} color={color} />,
          }}
        />
      </Tabs>
    </AppShellProvider>
  );
}
