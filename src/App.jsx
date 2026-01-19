import { useEffect, useState } from "react"
import FontsListPage from "./pages/FontsListPage.jsx"
import PurchasePage from "./pages/PurchasePage.jsx"
import CartPage from "./pages/CartPage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import OrdersPage from "./pages/OrdersPage.jsx"
import { clearAccessToken, getAccessToken } from "./api/auth.js"

export default function App() {
  const [selectedFont, setSelectedFont] = useState(null)
  const [view, setView] = useState("list")
  const [returnView, setReturnView] = useState("list")
  const [accessToken, setAccessToken] = useState(() => getAccessToken())

  useEffect(() => {
    if (!accessToken) return
    fetch(new URL("/api/csrf/", import.meta.env.VITE_API_ORIGIN).toString(), {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    }).catch(() => {})
  }, [accessToken])

  function openLogin(nextView = "list") {
    setReturnView(nextView)
    setView("login")
  }

  function onLoginSuccess() {
    setAccessToken(getAccessToken())
    setView(returnView || "list")
  }

  function onLoginBack() {
    setView(returnView || "list")
  }

  function onLogout() {
    clearAccessToken()
    setAccessToken(null)
    setView("list")
    setSelectedFont(null)
  }

  function openCart() {
    setView("cart")
  }

  function openOrders() {
    if (!accessToken) {
      openLogin("orders")
      return
    }
    setView("orders")
  }

  function openList() {
    setView("list")
    setSelectedFont(null)
  }

  function openPurchase(font) {
    setSelectedFont(font)
    setView("purchase")
  }

  if (view === "login") {
    return <LoginPage onSuccess={onLoginSuccess} onBack={onLoginBack} />
  }

  if (view === "orders") {
    return (
      <OrdersPage
        accessToken={accessToken}
        onBack={() => setView("list")}
        onRequireLogin={() => openLogin("orders")}
      />
    )
  }

  if (view === "cart") {
    return (
      <CartPage
        accessToken={accessToken}
        onBack={() => (selectedFont ? setView("purchase") : setView("list"))}
        onRequireLogin={() => openLogin("cart")}
        onOpenOrders={openOrders}
      />
    )
  }

  if (view === "purchase" && selectedFont) {
    return (
      <PurchasePage
        pkFont={selectedFont.id}
        fontName={selectedFont.name}
        onBack={openList}
        onOpenCart={openCart}
      />
    )
  }

  return (
    <FontsListPage
      onSelectFont={openPurchase}
      onOpenCart={openCart}
      onOpenLogin={() => openLogin("list")}
      onLogout={onLogout}
      onOpenOrders={openOrders}
      accessToken={accessToken}
    />
  )
}
