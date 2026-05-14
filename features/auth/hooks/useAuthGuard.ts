import { getUser, type StoredUser } from "@/lib/auth/token";
import { refreshToken } from "@/lib/auth/refresh";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthGuardResult = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: StoredUser | null;
};

export function useAuthGuard(): AuthGuardResult {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const storedUser = getUser();

      if (!storedUser) {
        router.replace("/login");
        return;
      }

      // Set auth state immediately — don't wait for refresh
      // This means the page renders right away
      if (mounted) {
        setUser(storedUser);
        setAuthenticated(true);
        setIsLoading(false);
      }

      // Refresh in background — doesn't block page render
      // If it fails → forceLogout() inside refreshToken() handles it
      refreshToken();
    }

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(() => refreshToken(), 9 * 60 * 1000);
    return () => clearInterval(interval);
  }, [authenticated]);

  return { isAuthenticated: authenticated, isLoading, user };
}
