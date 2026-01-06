import { useEffect, useState } from "react"
import { getLicense } from "../api/fonts.js"

function extractStyles(payload) {
  if (!Array.isArray(payload)) return []

  const seen = new Set()
  const result = []

  for (const item of payload) {
    const styleName = item?.style_name
    const face = item?.face

    if (!styleName) continue
    if (face === null || face === undefined) continue
    if (seen.has(styleName)) continue

    seen.add(styleName)
    result.push({ id: String(face), name: String(styleName), face })
  }

  return result
}

export function useFontStyles(pkFont) {
  const [payload, setPayload] = useState(null)
  const [styles, setStyles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (pkFont === null || pkFont === undefined || pkFont === "") return

    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const data = await getLicense(pkFont)
        if (cancelled) return

        setPayload(data)
        setStyles(extractStyles(data))
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
  }, [pkFont])

  return { payload, styles, loading, error }
}
