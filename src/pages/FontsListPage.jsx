import { useAllFonts } from "../hooks/useAllFonts.js"

export default function FontsListPage({
  onSelectFont,
  onOpenCart,
  onOpenLogin,
  onLogout,
  onOpenOrders,
  onOpenCatalog,
  accessToken,
}) {
  const { fonts, loading, error } = useAllFonts()
  const isAuthed = !!accessToken

  return (
    <div style={{ padding: 28, fontFamily: "system-ui, Arial", color: "#111" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: 44, fontWeight: 800, letterSpacing: 0.2 }}>Каталог шрифтов</h1>

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
            onClick={onOpenCart}
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
            Корзина
          </button>

          <button
            onClick={onOpenOrders}
            disabled={!onOpenOrders}
            style={{
              background: "#fff",
              color: "#111",
              border: "1px solid #ddd",
              padding: "10px 14px",
              fontSize: 16,
              cursor: !onOpenOrders ? "default" : "pointer",
              borderRadius: 10,
              whiteSpace: "nowrap",
              opacity: !onOpenOrders ? 0.6 : 1,
            }}
            title="Мои заказы"
          >
            Мои заказы
          </button>

          {!isAuthed && (
            <button
              onClick={onOpenLogin}
              disabled={!onOpenLogin}
              style={{
                background: "#fff",
                color: "#111",
                border: "1px solid #ddd",
                padding: "10px 14px",
                fontSize: 16,
                cursor: !onOpenLogin ? "default" : "pointer",
                borderRadius: 10,
                whiteSpace: "nowrap",
                opacity: !onOpenLogin ? 0.6 : 1,
              }}
              title={!onOpenLogin ? "Переход на страницу входа недоступен" : "Войти в систему"}
            >
              Войти
            </button>
          )}

          {isAuthed && (
            <button
              onClick={onLogout}
              disabled={!onLogout}
              style={{
                background: "#fff",
                color: "#111",
                border: "1px solid #ddd",
                padding: "10px 14px",
                fontSize: 16,
                cursor: !onLogout ? "default" : "pointer",
                borderRadius: 10,
                whiteSpace: "nowrap",
                opacity: !onLogout ? 0.6 : 1,
              }}
              title="Выйти из системы"
            >
              Выйти
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 18, color: "#777" }}>Выбери шрифт, чтобы перейти к выбору лицензий</div>

      <div style={{ marginTop: 18 }}>
        {loading && <div style={{ color: "#777" }}>Загрузка шрифтов...</div>}

        {!loading && error && <div style={{ color: "#b00020" }}>Ошибка загрузки: {error}</div>}

        {!loading && !error && fonts.length === 0 && <div style={{ color: "#777" }}>Шрифты не найдены</div>}

        {!loading && !error && fonts.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", rowGap: 14, maxWidth: 920 }}>
            {fonts.map((f) => (
              <div
                key={f.id}
                style={{
                  border: "1px solid #e6e6e6",
                  borderRadius: 12,
                  padding: 16,
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14 }}>
                  <div style={{ fontSize: 26, fontWeight: 750 }}>{f.name}</div>

                  <button
                    onClick={() => onSelectFont(f)}
                    style={{
                      background: "#111",
                      color: "#fff",
                      border: "none",
                      padding: "10px 14px",
                      fontSize: 16,
                      cursor: "pointer",
                      borderRadius: 10,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Выбрать
                  </button>
                </div>

                <div style={{ marginTop: 8, color: "#555", fontSize: 16 }}>Автор: {f.author || "Не указан"}</div>

                <div style={{ marginTop: 4, color: "#555", fontSize: 16 }}>
                  Дата релиза: {f.date_release || "Не указана"}
                </div>

                {f.desc && (
                  <div style={{ marginTop: 10, color: "#333", fontSize: 16, lineHeight: 1.4 }}>{f.desc}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
