import { invalidateTokenCache } from "@/lib/apollo/client";

let isRefreshing = false;

async function forceLogout(): Promise<void> {
  invalidateTokenCache();
  await fetch("/api/auth/clear-token", { method: "POST" });
  window.location.href = "/login";
}

export async function refreshToken(): Promise<string | null> {
  if (isRefreshing) return null;
  isRefreshing = true;

  try {
    const tokenRes = await fetch("/api/auth/get-token");
    const { token } = await tokenRes.json();

    if (!token) {
      isRefreshing = false;
      return null;
    }

    // Step 2 — call refresh directly via fetch, NOT apolloClient

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      credentials: "include", // sends refresh_token cookie from backend domain
      body: JSON.stringify({
        query: `mutation RefreshToken { refresh }`,
      }),
    });

    const json = await res.json();
    const newToken: string | null = json?.data?.refresh ?? null;
    const hasError = json?.errors?.length > 0;

    if (hasError || !newToken) {
      console.warn("[Auth] Refresh failed — logging out", json?.errors);
      await forceLogout();
      return null;
    }

    const userCookie = document.cookie
      .split("; ")
      .find((r) => r.startsWith("revela_user="))
      ?.split("=")[1];

    const user = userCookie ? JSON.parse(decodeURIComponent(userCookie)) : {};

    await fetch("/api/auth/set-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: newToken, user }),
    });

    invalidateTokenCache();

    return newToken;
  } catch {
    return null;
  } finally {
    isRefreshing = false;
  }
}
