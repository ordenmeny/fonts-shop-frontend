import { useEffect, useState } from "react"
import { getAllFonts } from "../api/fonts.js"

function normalizeFonts(payload) {
  if (!Array.isArray(payload)) return []

  return payload
    .map((x) => ({
      id: x?.id ?? null,
      name: x?.name ?? "",
      author: x?.author ?? "",
      date_release: x?.date_release ?? "",
      desc: x?.desc ?? "",
      raw: x,
    }))
    .filter((x) => x.id !== null && x.id !== undefined)
}

export function useAllFonts() {
  const [payload, setPayload] = useState(null)
  const [fonts, setFonts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const data = await getAllFonts()
        if (cancelled) return

        setPayload(data)
        setFonts(normalizeFonts(data))
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Unknown error")
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [])

  return { payload, fonts, loading, error }
}
