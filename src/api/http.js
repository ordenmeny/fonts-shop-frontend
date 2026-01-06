const ORIGIN = import.meta.env.VITE_API_ORIGIN

function isAbsoluteUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value)
}

function buildUrl(input) {
  if (isAbsoluteUrl(input)) return input
  if (!ORIGIN) throw new Error("VITE_API_ORIGIN is not set")

  const base = ORIGIN.endsWith("/") ? ORIGIN : `${ORIGIN}/`
  return new URL(String(input ?? ""), base).toString()
}

export async function getJson(urlOrPath) {
  const url = buildUrl(urlOrPath)

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? `, ${text}` : ""}`)
  }

  return res.json()
}
