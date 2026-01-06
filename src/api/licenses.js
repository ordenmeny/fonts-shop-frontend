import { apiGet } from "./client.js"

function normalizeStyles(payload) {
  // Популярные варианты ключей, чтобы не упереться в точную схему ответа
  const candidates = [
    payload?.styles,
    payload?.font_styles,
    payload?.weights,
    payload?.data?.styles,
    payload?.data?.font_styles,
  ]

  const arr = candidates.find(Array.isArray) ?? []

  // Нормализуем к единому виду
  return arr
    .map((s, idx) => {
      const id = s?.id ?? s?.pk ?? s?.uuid ?? String(idx)
      const name = s?.name ?? s?.title ?? s?.label ?? s?.weight_name ?? `Style ${idx + 1}`
      return { id: String(id), name }
    })
    .filter((s) => s.id && s.name)
}

export async function getLicenseByFontId(pkFont) {
  const payload = await apiGet(`get-license/${pkFont}/`)
  const styles = normalizeStyles(payload)
  return { payload, styles }
}
