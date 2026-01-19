import { useMemo, useState } from "react"
import { loginWithEmailPassword } from "../api/auth.js"

export default function LoginPage({ onSuccess, onBack }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const canSubmit = useMemo(() => {
    return String(email).trim().length > 0 && String(password).trim().length > 0
  }, [email, password])

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit || loading) return

    setLoading(true)
    setError(null)

    try {
      await loginWithEmailPassword({ email: String(email).trim(), password: String(password) })
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 28, fontFamily: "system-ui, Arial", color: "#111" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: 44, fontWeight: 800, letterSpacing: 0.2 }}>Вход</h1>

        {onBack && (
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
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 18, color: "#777", maxWidth: 720 }}>
        Введите email и пароль. Регистрация пока не доступна.
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: 18, maxWidth: 520 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", rowGap: 12 }}>
          <label style={{ display: "grid", rowGap: 6 }}>
            <div style={{ fontSize: 14, color: "#555" }}>Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="email@example.com"
              style={{
                padding: "12px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                fontSize: 16,
              }}
            />
          </label>

          <label style={{ display: "grid", rowGap: 6 }}>
            <div style={{ fontSize: 14, color: "#555" }}>Пароль</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="Введите пароль"
              style={{
                padding: "12px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                fontSize: 16,
              }}
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit || loading}
            style={{
              marginTop: 8,
              background: "#111",
              color: "#fff",
              border: "none",
              padding: "12px 14px",
              fontSize: 16,
              cursor: !canSubmit || loading ? "default" : "pointer",
              borderRadius: 10,
              whiteSpace: "nowrap",
              opacity: !canSubmit || loading ? 0.6 : 1,
            }}
          >
            {loading ? "Входим..." : "Войти"}
          </button>

          {error && <div style={{ marginTop: 6, color: "#b00020" }}>Ошибка входа: {error}</div>}
        </div>
      </form>
    </div>
  )
}
