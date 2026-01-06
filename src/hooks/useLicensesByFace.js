import { useEffect, useState } from "react"
import { getLicensesByFace } from "../api/fonts.js"

function extractLicenseLabels(payload) {
  if (!Array.isArray(payload)) return []

  const result = []
  for (const item of payload) {
    const label = item?.license_type_label
    if (!label) continue
    result.push({ label: String(label), raw: item })
  }
  return result
}

export function useLicensesByFace(pkFace) {
  const [payload, setPayload] = useState(null)
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (pkFace === null || pkFace === undefined || pkFace === "") return

    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const data = await getLicensesByFace(pkFace)
        if (cancelled) return

        setPayload(data)
        setLicenses(extractLicenseLabels(data))
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
  }, [pkFace])

  return { payload, licenses, loading, error }
}
