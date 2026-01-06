import { useMemo, useState } from "react"
import { useFontStyles } from "./hooks/useFontStyles.js"
import { useLicensesByFace } from "./hooks/useLicensesByFace.js"
import { addToCart } from "./api/fonts.js"


function chunkIntoTwoColumns(items) {
  const left = []
  const right = []
  items.forEach((x, i) => {
    ;(i % 2 === 0 ? left : right).push(x)
  })
  return [left, right]
}

export default function App() {
  const pkFont = 1

  const {
    payload: licensePayload,
    styles,
    loading: stylesLoading,
    error: stylesError,
  } = useFontStyles(pkFont)

  const [selectedFace, setSelectedFace] = useState(null)
  const [cartLoading, setCartLoading] = useState(false)
  const [cartError, setCartError] = useState(null)
  const [cartSuccess, setCartSuccess] = useState(false)


  const {
    payload: licensesPayload,
    licenses,
    loading: licensesLoading,
    error: licensesError,
  } = useLicensesByFace(selectedFace)

  const [selectedLicenseIndex, setSelectedLicenseIndex] = useState(null)

  const [left, right] = useMemo(() => chunkIntoTwoColumns(styles), [styles])

  const canSubmit =
    !stylesLoading &&
    !stylesError &&
    selectedFace !== null &&
    !licensesLoading &&
    !licensesError &&
    selectedLicenseIndex !== null &&
    !cartLoading

    async function onSubmit() {
    setCartError(null)
    setCartSuccess(false)

    const selected = selectedLicenseIndex === null ? null : licenses[selectedLicenseIndex]
    const pkItem = selected?.raw?.id

    if (!pkItem) {
      setCartError("Не удалось определить id выбранной лицензии")
      return
    }

    try {
      setCartLoading(true)
      await addToCart(pkItem)
      setCartSuccess(true)
    } catch (e) {
      setCartError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setCartLoading(false)
    }
  }


  return (
    <div style={{ padding: 28, fontFamily: "system-ui, Arial", color: "#111" }}>
      <h1 style={{ margin: 0, fontSize: 44, fontWeight: 800, letterSpacing: 0.2 }}>
        Покупка шрифта
      </h1>

      <div style={{ marginTop: 18, fontSize: 18, color: "#777" }}>Начертания</div>

      <div style={{ marginTop: 14 }}>
        {stylesLoading && <div style={{ color: "#777" }}>Загрузка начертаний...</div>}

        {!stylesLoading && stylesError && (
          <div style={{ color: "#b00020" }}>
            Ошибка загрузки: {stylesError}
          </div>
        )}

        {!stylesLoading && !stylesError && styles.length === 0 && (
          <div style={{ color: "#777" }}>
            Начертания не найдены
          </div>
        )}

        {!stylesLoading && !stylesError && styles.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 40 }}>
            <div>
              {left.map((s) => (
                <label
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 26,
                    color: selectedFace === s.face ? "#111" : "#888",
                    margin: "10px 0",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="style"
                    value={s.id}
                    checked={selectedFace === s.face}
                    onChange={() => {
                      setSelectedFace(s.face)
                      setSelectedLicenseIndex(null)
                    }}
                  />
                  {s.name}
                </label>
              ))}
            </div>

            <div>
              {right.map((s) => (
                <label
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 26,
                    color: selectedFace === s.face ? "#111" : "#888",
                    margin: "10px 0",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="style"
                    value={s.id}
                    checked={selectedFace === s.face}
                    onChange={() => {
                      setSelectedFace(s.face)
                      setSelectedLicenseIndex(null)
                    }}
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 18, color: "#777" }}>Типы лицензий</div>

        {selectedFace === null && (
          <div style={{ marginTop: 12, color: "#777" }}>
            Выбери начертание, чтобы показать доступные лицензии
          </div>
        )}

        {selectedFace !== null && licensesLoading && (
          <div style={{ marginTop: 12, color: "#777" }}>
            Загрузка лицензий...
          </div>
        )}

        {selectedFace !== null && !licensesLoading && licensesError && (
          <div style={{ marginTop: 12, color: "#b00020" }}>
            Ошибка загрузки: {licensesError}
          </div>
        )}

        {selectedFace !== null && !licensesLoading && !licensesError && licenses.length === 0 && (
          <div style={{ marginTop: 12, color: "#777" }}>
            Лицензии не найдены
          </div>
        )}

        {selectedFace !== null && !licensesLoading && !licensesError && licenses.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {licenses.map((l, idx) => (
              <label
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 22,
                  color: selectedLicenseIndex === idx ? "#111" : "#888",
                  margin: "10px 0",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="license"
                  checked={selectedLicenseIndex === idx}
                  onChange={() => setSelectedLicenseIndex(idx)}
                />
                {l.label}
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        style={{
          marginTop: 34,
          background: "#111",
          color: "#fff",
          border: "none",
          padding: "12px 18px",
          fontSize: 18,
          cursor: canSubmit ? "pointer" : "not-allowed",
          opacity: canSubmit ? 1 : 0.4,
        }}
      >
        Добавить в корзину
      </button>

      <div style={{ marginTop: 12 }}>
        {cartLoading && <div style={{ color: "#777" }}>Добавляем в корзину...</div>}
        {!cartLoading && cartError && <div style={{ color: "#b00020" }}>{cartError}</div>}
        {!cartLoading && !cartError && cartSuccess && <div style={{ color: "#1b5e20" }}>Добавлено в корзину</div>}
      </div>


      <div style={{ marginTop: 26 }}>
        <div style={{ fontSize: 14, color: "#777", marginBottom: 8 }}>
          Debug JSON, get-license для pkFont=1
        </div>
        <pre
          style={{
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
            maxHeight: 360,
          }}
        >
          {licensePayload ? JSON.stringify(licensePayload, null, 2) : "null"}
        </pre>

        <div style={{ marginTop: 18, fontSize: 14, color: "#777", marginBottom: 8 }}>
          Debug JSON, get-licenses-by-face для выбранного face
        </div>
        <pre
          style={{
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
            maxHeight: 360,
          }}
        >
          {licensesPayload ? JSON.stringify(licensesPayload, null, 2) : "null"}
        </pre>
      </div>
    </div>
  )
}
