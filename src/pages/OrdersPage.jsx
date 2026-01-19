import { useEffect, useMemo, useState } from "react"
import { getUserOrders } from "../api/orders.js"

function parseNumber(value) {
  const n = typeof value === "string" ? Number(value) : Number(value ?? NaN)
  return Number.isFinite(n) ? n : null
}

function formatMoney(value, currency) {
  const v = value === null || value === undefined ? "" : String(value).trim()
  const c = currency === null || currency === undefined ? "" : String(currency).trim()
  if (!v && !c) return ""
  if (!v) return c
  if (!c) return v
  return `${v} ${c}`
}

function formatIsoDate(iso) {
  if (!iso) return ""
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return String(iso)
    return d.toLocaleString()
  } catch {
    return String(iso)
  }
}

function normalizeOrders(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.orders)) return payload.orders
  return []
}

function calcOrderTotal(order) {
  const items = Array.isArray(order?.items) ? order.items : []
  let total = 0
  let currency = ""

  for (const it of items) {
    const f = it?.font_face_with_price
    const priceNum = parseNumber(f?.price)
    if (priceNum === null) continue
    total += priceNum
    if (!currency && f?.currency) currency = String(f.currency)
  }

  return { total, currency }
}

export default function OrdersPage({ onBack, accessToken, onRequireLogin, onOpenCatalog }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [orders, setOrders] = useState([])

  async function refresh() {
    setLoading(true)
    setError(null)

    try {
      if (!accessToken) {
        onRequireLogin?.()
        return
      }

      const data = await getUserOrders(accessToken)
      setOrders(normalizeOrders(data))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sortedOrders = useMemo(() => {
    const list = Array.isArray(orders) ? [...orders] : []
    list.sort((a, b) => {
      const ta = Date.parse(a?.created_at ?? "")
      const tb = Date.parse(b?.created_at ?? "")
      const na = Number.isFinite(ta) ? ta : 0
      const nb = Number.isFinite(tb) ? tb : 0
      return nb - na
    })
    return list
  }, [orders])

  return (
    <div style={{ padding: 28, fontFamily: "system-ui, Arial", color: "#111" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: 44, fontWeight: 800, letterSpacing: 0.2 }}>Мои заказы</h1>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={onOpenCatalog}
            disabled={!onOpenCatalog}
            style={{
              background: "#fff",
              color: "#111",
              border: "1px solid #ddd",
              padding: "10px 14px",
              fontSize: 16,
              cursor: !onOpenCatalog ? "default" : "pointer",
              borderRadius: 10,
              whiteSpace: "nowrap",
              opacity: !onOpenCatalog ? 0.6 : 1,
            }}
            title="Каталог шрифтов"
          >
            Каталог шрифтов
          </button>

          <button
            onClick={refresh}
            style={{
              background: "#fff",
              color: "#111",
              border: "1px solid #ddd",
              padding: "10px 14px",
              fontSize: 16,
              cursor: "pointer",
              borderRadius: 10,
              whiteSpace: "nowrap",
            }}
          >
            Обновить
          </button>

          <button
            onClick={onBack}
            style={{
              background: "#fff",
              color: "#111",
              border: "1px solid #ddd",
              padding: "10px 14px",
              fontSize: 16,
              cursor: "pointer",
              borderRadius: 10,
              whiteSpace: "nowrap",
            }}
          >
            Назад
          </button>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        {loading && <div style={{ color: "#777" }}>Загрузка заказов...</div>}

        {!loading && error && <div style={{ color: "#b00020" }}>Ошибка загрузки: {error}</div>}

        {!loading && !error && sortedOrders.length === 0 && <div style={{ color: "#777" }}>Заказы не найдены</div>}

        {!loading && !error && sortedOrders.length > 0 && (
          <div style={{ maxWidth: 980, display: "grid", gridTemplateColumns: "1fr", rowGap: 14 }}>
            {sortedOrders.map((o) => {
              const orderId = o?.id
              const orderNumber = o?.number ? String(o.number) : ""
              const createdAt = formatIsoDate(o?.created_at)
              const items = Array.isArray(o?.items) ? o.items : []
              const { total, currency } = calcOrderTotal(o)

              return (
                <div
                  key={String(orderId ?? orderNumber)}
                  style={{
                    border: "1px solid #e6e6e6",
                    borderRadius: 12,
                    padding: 16,
                    background: "#fff",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>
                        Заказ {orderNumber ? `№ ${orderNumber}` : orderId ? `#${orderId}` : ""}
                      </div>

                      {createdAt ? (
                        <div style={{ marginTop: 6, color: "#555", fontSize: 16 }}>Дата: {createdAt}</div>
                      ) : null}

                      <div style={{ marginTop: 6, color: "#555", fontSize: 16 }}>Позиций: {items.length}</div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, color: "#777" }}>Сумма</div>
                      <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800 }}>
                        {items.length > 0 ? formatMoney(total.toFixed(2), currency) : "0"}
                      </div>
                    </div>
                  </div>

                  {items.length > 0 && (
                    <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr", rowGap: 10 }}>
                      {items.map((it) => {
                        const id = it?.id
                        const f = it?.font_face_with_price
                        const fontName = f?.font_name ?? ""
                        const styleName = f?.style_name ?? ""
                        const licenseLabel = f?.license_type_label ?? f?.license_type ?? ""
                        const price = f?.price ?? ""
                        const cur = f?.currency ?? ""

                        return (
                          <div
                            key={String(id)}
                            style={{
                              border: "1px solid #f0f0f0",
                              borderRadius: 12,
                              padding: 12,
                              background: "#fafafa",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "baseline",
                                justifyContent: "space-between",
                                gap: 12,
                              }}
                            >
                              <div style={{ fontSize: 18, fontWeight: 800 }}>{fontName || "Шрифт"}</div>
                              <div style={{ fontSize: 16, fontWeight: 800 }}>{formatMoney(price, cur)}</div>
                            </div>

                            <div style={{ marginTop: 6, color: "#555", fontSize: 15 }}>
                              Начертание: {styleName || "Не указано"}
                            </div>

                            <div style={{ marginTop: 4, color: "#555", fontSize: 15 }}>
                              Лицензия: {licenseLabel || "Не указана"}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
