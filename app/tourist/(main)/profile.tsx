import { useAuth } from "@/auth/AuthContext";
import { ProfileScreenContent } from "@/components/ProfileScreenContent";
import { useResetMainHeaderOnFocus } from "@/navigation/useResetMainHeaderOnFocus";

export default function TouristProfileScreen() {
  useResetMainHeaderOnFocus();
  const { user, signOut } = useAuth();
  const displayName = user?.displayName?.trim() || "—";
  const email = user?.email?.trim() || "—";

  return (
    <ProfileScreenContent
      roleLabel="Tourist"
      displayName={displayName}
      email={email}
      websitePath=""
      websiteMenuTitle="Open full website"
      websiteSubtitle="Browse, book and manage everything"
      onSignOut={() => void signOut()}
    />
  );
}
