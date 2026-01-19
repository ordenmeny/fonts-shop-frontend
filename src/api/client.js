import { getAuthHeader } from "./auth.js"

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/"

function joinUrl(base, path) {
  const b = base.endsWith("/") ? base : `${base}/`
  const p = path.startsWith("/") ? path.slice(1) : path
  return `${b}${p}`
}

export async function apiGet(path) {
  const url = joinUrl(BASE_URL, path)

  const authHeader = getAuthHeader()

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...authHeader },
    credentials: "include",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? `, ${text}` : ""}`)
  }

  return res.json()
}
