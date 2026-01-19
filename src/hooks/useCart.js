import { useEffect, useState } from "react"
import { getCart, removeFromCart } from "../api/fonts.js"

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
  const [removingIds, setRemovingIds] = useState(() => new Set())

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

  async function removeItem(pkItem) {
    if (pkItem === null || pkItem === undefined || pkItem === "") {
      throw new Error("pkItem is required")
    }

    setRemovingIds((prev) => {
      const next = new Set(prev)
      next.add(pkItem)
      return next
    })

    try {
      await removeFromCart(pkItem)

      setPayload((prev) => {
        const prevItems = prev?.items
        if (!Array.isArray(prevItems)) return prev
        return { ...prev, items: prevItems.filter((x) => x?.id !== pkItem) }
      })

      setItems((prev) => prev.filter((x) => x?.id !== pkItem))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
      throw e
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev)
        next.delete(pkItem)
        return next
      })
    }
  }

  return { payload, items, loading, error, refresh, removeItem, removingIds }
}
