import { useEffect, useState } from "react"
import { getCart } from "../api/fonts.js"

function normalizeCart(payload) {
  const items = payload?.items
  if (!Array.isArray(items)) return []

  return items.map((x) => ({
    id: x?.id ?? null,
    font_name: x?.font_name ?? "",
    style_name: x?.style_name ?? "",
    price: x?.price ?? "",
    currency: x?.currency ?? "",
    license_type_label: x?.license_type_label ?? "",
    raw: x,
  }))
}

export function useCart() {
  const [payload, setPayload] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function refresh() {
    setLoading(true)
    setError(null)

    try {
      const data = await getCart()
      setPayload(data)
      setItems(normalizeCart(data))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return { payload, items, loading, error, refresh }
}
