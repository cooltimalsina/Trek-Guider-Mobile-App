import { useAuth } from "@/auth/AuthContext";
import { ProfileScreenContent } from "@/components/ProfileScreenContent";
import { useResetMainHeaderOnFocus } from "@/navigation/useResetMainHeaderOnFocus";

export default function GuideProfileScreen() {
  useResetMainHeaderOnFocus();
  const { user, signOut } = useAuth();
  const displayName = user?.displayName?.trim() || "—";
  const email = user?.email?.trim() || "—";

  return (
    <ProfileScreenContent
      roleLabel="Guide"
      displayName={displayName}
      email={email}
      websitePath="/guide"
      websiteMenuTitle="Open guide website"
      websiteSubtitle="Manage your guide listing, trips, and bookings"
      onSignOut={() => void signOut()}
    />
  );
}
