import { useMemo, useState } from "react"
import { useCart } from "../hooks/useCart.js"
import { createOrder } from "../api/orders.js"

function formatMoney(price, currency) {
  const p = String(price ?? "").trim()
  const c = String(currency ?? "").trim()
  if (!p && !c) return ""
  if (!p) return c
  if (!c) return p
  return `${p} ${c}`
}

export default function CartPage({ onBack, accessToken, onRequireLogin, onOpenOrders, onOpenCatalog }) {
  const { items, loading, error, refresh, removeItem, removingIds } = useCart()
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [createSuccess, setCreateSuccess] = useState(null)

  const total = useMemo(() => {
    let sum = 0
    let hasAny = false

    for (const x of items) {
      const v = typeof x.price === "string" ? Number(x.price) : Number(x.price ?? NaN)
      if (!Number.isFinite(v)) continue
      sum += v
      hasAny = true
    }

    return hasAny ? sum : null
  }, [items])

  const currency = items.length > 0 ? items[0].currency : ""
  const canCreateOrder = !loading && !creatingOrder && items.length > 0

  async function onCreateOrder() {
    setCreateError(null)
    setCreateSuccess(null)

    if (!accessToken) {
      onRequireLogin?.()
      return
    }

    if (!canCreateOrder) return

    setCreatingOrder(true)
    try {
      const res = await createOrder(accessToken)
      setCreateSuccess(res ?? { ok: true })
      refresh().catch(() => {})
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setCreatingOrder(false)
    }
  }

  return (
    <div style={{ padding: 28, fontFamily: "system-ui, Arial", color: "#111" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: 44, fontWeight: 800, letterSpacing: 0.2 }}>Корзина</h1>

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
            onClick={() => {
              setCreateError(null)
              setCreateSuccess(null)
              refresh()
            }}
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

      <div style={{ marginTop: 14, maxWidth: 980 }}>
        {createError && <div style={{ color: "#b00020" }}>Ошибка оформления: {createError}</div>}

        {createSuccess && (
          <div
            style={{
              marginTop: createError ? 10 : 0,
              border: "1px solid #dfeee0",
              background: "#f6fff7",
              borderRadius: 12,
              padding: 14,
              color: "#1b5e20",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700 }}>Заказ успешно оформлен</div>

            {onOpenOrders ? (
              <button
                onClick={onOpenOrders}
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
                Перейти в "Мои заказы"
              </button>
            ) : null}
          </div>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        {loading && <div style={{ color: "#777" }}>Загрузка корзины...</div>}

        {!loading && error && <div style={{ color: "#b00020" }}>Ошибка загрузки: {error}</div>}

        {!loading && !error && items.length === 0 && <div style={{ color: "#777" }}>Корзина пустая</div>}

        {!loading && !error && items.length > 0 && (
          <div style={{ maxWidth: 980 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", rowGap: 14 }}>
              {items.map((x) => (
                <div
                  key={x.id ?? `${x.font_name}-${x.style_name}-${x.license_type_label}`}
                  style={{
                    border: "1px solid #e6e6e6",
                    borderRadius: 12,
                    padding: 16,
                    background: "#fff",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                    <div style={{ fontSize: 22, fontWeight: 750 }}>{x.font_name}</div>

                    <button
                      onClick={() => {
                        if (x.id === null || x.id === undefined || x.id === "") return
                        setCreateError(null)
                        setCreateSuccess(null)
                        removeItem(x.id).catch(() => {})
                      }}
                      disabled={loading || (x.id !== null && x.id !== undefined && x.id !== "" && removingIds.has(x.id))}
                      style={{
                        background: "#fff",
                        color: "#111",
                        border: "1px solid #ddd",
                        padding: "10px 14px",
                        fontSize: 16,
                        cursor: loading ? "default" : "pointer",
                        borderRadius: 10,
                        whiteSpace: "nowrap",
                        opacity:
                          loading || (x.id !== null && x.id !== undefined && x.id !== "" && removingIds.has(x.id))
                            ? 0.6
                            : 1,
                      }}
                      title={
                        x.id === null || x.id === undefined || x.id === ""
                          ? "Невозможно удалить: неизвестный id"
                          : "Удалить из корзины"
                      }
                    >
                      {x.id !== null && x.id !== undefined && x.id !== "" && removingIds.has(x.id)
                        ? "Удаление..."
                        : "Удалить"}
                    </button>
                  </div>

                  <div style={{ marginTop: 6, color: "#555", fontSize: 16 }}>Начертание: {x.style_name}</div>
                  <div style={{ marginTop: 6, color: "#555", fontSize: 16 }}>Лицензия: {x.license_type_label}</div>

                  <div style={{ marginTop: 10, fontSize: 18, fontWeight: 700 }}>
                    {formatMoney(x.price, x.currency)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #eee" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 18, color: "#777" }}>Итого</div>
                  <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800 }}>
                    {total === null ? "0" : formatMoney(total.toFixed(2), currency)}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {onOpenOrders && (
                    <button
                      onClick={onOpenOrders}
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
                      Мои заказы
                    </button>
                  )}

                  <button
                    onClick={onCreateOrder}
                    disabled={!canCreateOrder}
                    style={{
                      background: "#111",
                      color: "#fff",
                      border: "none",
                      padding: "10px 14px",
                      fontSize: 16,
                      cursor: !canCreateOrder ? "default" : "pointer",
                      borderRadius: 10,
                      whiteSpace: "nowrap",
                      opacity: !canCreateOrder ? 0.6 : 1,
                    }}
                    title={!accessToken ? "Требуется вход" : "Оформить заказ"}
                  >
                    {creatingOrder ? "Оформляем..." : "Оформить заказ"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
