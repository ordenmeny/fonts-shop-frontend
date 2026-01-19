const ACCESS_TOKEN_KEY = "access_token"

export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAccessToken(token) {
  try {
    if (!token) {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      return
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  } catch {
    // ignore storage errors
  }
}

export function clearAccessToken() {
  setAccessToken(null)
}

export function getAuthHeader() {
  const token = getAccessToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export async function loginWithEmailPassword({ email, password, apiOrigin }) {
  const origin = apiOrigin ?? import.meta.env.VITE_API_ORIGIN
  if (!origin) throw new Error("VITE_API_ORIGIN is not set")

  const url = new URL("/api/token/", origin).toString()

  const res = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? `, ${text}` : ""}`)
  }

  const data = await res.json()
  const access = data?.access
  if (!access) {
    throw new Error("No access token returned")
  }

  setAccessToken(access)
  return access
}
