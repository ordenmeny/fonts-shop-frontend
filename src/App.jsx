import { useEffect, useState } from "react"
import FontsListPage from "./pages/FontsListPage.jsx"
import PurchasePage from "./pages/PurchasePage.jsx"
import CartPage from "./pages/CartPage.jsx"

export default function App() {
  const [selectedFont, setSelectedFont] = useState(null)
  const [view, setView] = useState("list")

  useEffect(() => {
    fetch(new URL("/api/csrf/", import.meta.env.VITE_API_ORIGIN).toString(), {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    }).catch(() => {})
  }, [])

  function openCart() {
    setView("cart")
  }

  function openList() {
    setView("list")
    setSelectedFont(null)
  }

  function openPurchase(font) {
    setSelectedFont(font)
    setView("purchase")
  }

  if (view === "cart") {
    return <CartPage onBack={() => (selectedFont ? setView("purchase") : setView("list"))} />
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

  return <FontsListPage onSelectFont={openPurchase} onOpenCart={openCart} />
}
