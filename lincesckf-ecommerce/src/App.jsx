// App.jsx — CartProvider wraps AuthProvider; loadForUser wired via onAuthChange prop
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import CatalogPage from './pages/CatalogPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import CustomPage from './pages/CustomPage.jsx'
import CartPage from './pages/CartPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import { CartProvider, useCart } from './context/cart.jsx'
import { AuthProvider } from './context/auth.jsx'
import { I18nProvider } from './i18n/i18n.jsx'

// Inner component so useCart() can be called inside CartProvider
function AppInner() {
  const { loadForUser } = useCart()

  return (
    <AuthProvider onAuthChange={loadForUser}>
      <Layout>
        <Routes>
          <Route path="/"              element={<HomePage />} />
          <Route path="/catalog"       element={<CatalogPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/services"      element={<ServicesPage />} />
          <Route path="/custom"        element={<CustomPage />} />
          <Route path="/contact"       element={<ContactPage />} />
          <Route path="/about"         element={<AboutPage />} />
          <Route path="/cart"          element={<CartPage />} />
          <Route path="/profile"       element={<ProfilePage />} />
          <Route path="/chat"          element={<ChatPage />} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <CartProvider>
        <AppInner />
      </CartProvider>
    </I18nProvider>
  )
}
