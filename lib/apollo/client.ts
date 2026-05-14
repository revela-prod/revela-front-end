import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client"
import { SetContextLink } from "@apollo/client/link/context"
import { ErrorLink } from "@apollo/client/link/error"
import { appToast } from "@/lib/toast"

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
})

// ── Token cache ────────────────────────────────────────────
// Prevents N simultaneous /api/auth/get-token calls
let cachedToken: string | null = null
let fetchPromise: Promise<string | null> | null = null

async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken
  if (fetchPromise) return fetchPromise

  fetchPromise = fetch("/api/auth/get-token")
    .then((res) => res.json())
    .then(({ token }) => {
      cachedToken = token ?? null
      fetchPromise = null
      return cachedToken
    })
    .catch(() => {
      fetchPromise = null
      return null
    })

  return fetchPromise
}

export function clearTokenCache() {
  cachedToken = null
  
}

export function invalidateTokenCache() {
  cachedToken = null
  fetchPromise = null
}

// ── Auth error detection ───────────────────────────────────
function isAuthError(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes("unauthorized") ||
    lower.includes("jwt") ||
    lower.includes("invalid or expired token") ||
    lower.includes("invalid token") ||
    lower.includes("token expired") ||
    lower.includes("no refresh token")
  )
}

// ── Redirect to login — debounced to prevent multiple calls ─
let isRedirecting = false
function redirectToLogin() {
  if (isRedirecting) return
  isRedirecting = true
  invalidateTokenCache()
  fetch("/api/auth/clear-token", { method: "POST" }).finally(() => {
    window.location.href = "/login"
  })
}

// ── Links ──────────────────────────────────────────────────
const authLink = new SetContextLink(async (prevContext) => {
  const token = await getToken()
  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }
})

const errorLink = new ErrorLink((error) => {
  const graphQLErrors = (error as any).graphQLErrors
  const networkError = (error as any).networkError

  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }: { message: string }) => {
      if (isAuthError(message)) {
        invalidateTokenCache()
        appToast.error({
          title: "Session expired",
          description: "Signing you out...",
        })
        setTimeout(redirectToLogin, 1200)
        return
      }
    })
  }

  if (networkError) {
    console.error("[Network error]", networkError)

    const status = (networkError as any).statusCode
    if (status && status !== 0) {
      appToast.error({
        title: "Network Error",
        description: "Check your internet connection",
      })
    }
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})