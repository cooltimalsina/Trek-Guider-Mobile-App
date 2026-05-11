import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { AppShellProvider } from "@/navigation/AppShellContext";
import { colors } from "@/theme/colors";

const shell = {
  homeHref: "/tourist",
  tripsHref: "/tourist/bookings",
  profileHref: "/tourist/profile",
  tripsLabel: "Trips",
} as const;

export default function TouristTabsLayout() {
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
            tabBarIcon: ({ color }) => <FontAwesome name="home" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Trips",
            tabBarLabel: "Trips",
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
        <Tabs.Screen
          name="booking/[bookingId]"
          options={{
            href: null,
            title: "Trip",
          }}
        />
        <Tabs.Screen
          name="trek/[trekId]"
          options={{
            href: null,
            title: "Trek",
          }}
        />
      </Tabs>
    </AppShellProvider>
  );
}
