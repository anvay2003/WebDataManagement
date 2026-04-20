import React, { useState } from 'react'
import Navigation from './Navigation.jsx'
import Footer from './Footer.jsx'
import AuthModal from '../auth/AuthModal.jsx'

export default function Layout({ children }) {
  const [authOpen, setAuthOpen] = useState(false)
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation onOpenAuth={() => setAuthOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
