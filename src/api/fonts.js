import { getJson } from "./http.js"
import { getCookie } from "./cookies.js"


export function getLicense(pkFont) {
  if (pkFont === null || pkFont === undefined || pkFont === "") {
    throw new Error("pkFont is required")
  }
  return getJson(`/api/fonts/get-license/${pkFont}/`)
}

export function getLicensesByFace(pkFace) {
  if (pkFace === null || pkFace === undefined || pkFace === "") {
    throw new Error("pkFace is required")
  }

  // ВАЖНО: путь берется ровно из твоего сообщения
  // Если на бэке окажется префикс /api/fonts/, то поменяем тут одну строку
  return getJson(`/api/fonts/get-licenses-by-face/${pkFace}/`)
}


export async function addToCart(pkItem) {
  if (pkItem === null || pkItem === undefined || pkItem === "") {
    throw new Error("pkItem is required")
  }

  const csrfToken = getCookie("csrftoken")
  if (!csrfToken) {
    throw new Error("CSRF token missing: cookie 'csrftoken' not found. Open the page and refresh once.")
  }

  const url = `/api/fonts/add-to-cart/${pkItem}/`
  const fullUrl = new URL(url, import.meta.env.VITE_API_ORIGIN).toString()

  const res = await fetch(fullUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "X-CSRFToken": csrfToken,
    },
    credentials: "include",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? `, ${text}` : ""}`)
  }

  return null
}