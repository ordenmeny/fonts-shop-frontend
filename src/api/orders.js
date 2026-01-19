import { getCookie } from "./cookies.js"

function buildUrl(path) {
  const origin = import.meta.env.VITE_API_ORIGIN
  if (!origin) throw new Error("VITE_API_ORIGIN is not set")
  return new URL(path, origin).toString()
}

function authHeaders(accessToken) {
  if (!accessToken) return {}
  return { Authorization: `Bearer ${accessToken}` }
}

async function parseMaybeJson(res) {
  const contentType = res.headers.get("content-type") || ""
  if (contentType.includes("application/json")) return res.json()
  const text = await res.text().catch(() => "")
  return text || null
}

export async function createOrder(accessToken) {
  if (!accessToken) throw new Error("Access token is required")

  const csrfToken = getCookie("csrftoken")
  if (!csrfToken) {
    throw new Error("CSRF token missing: cookie 'csrftoken' not found. Open the page and refresh once.")
  }

  const url = buildUrl("/api/fonts/create-order/")

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "X-CSRFToken": csrfToken,
      ...authHeaders(accessToken),
    },
    credentials: "include",
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status} ${res.statusText}${body ? `, ${body}` : ""}`)
  }

  return parseMaybeJson(res)
}

export async function getUserOrders(accessToken) {
  if (!accessToken) throw new Error("Access token is required")

  const url = buildUrl("/api/fonts/user-orders/")

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...authHeaders(accessToken),
    },
    credentials: "include",
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status} ${res.statusText}${body ? `, ${body}` : ""}`)
  }

  return parseMaybeJson(res)
}
