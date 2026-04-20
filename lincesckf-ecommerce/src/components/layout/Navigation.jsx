import React, { useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ShoppingBag, User2, Languages, MessageCircle } from 'lucide-react'
import { useCart } from '../../context/cart.jsx'
import { useAuth } from '../../context/auth.jsx'
import { useI18n } from '../../i18n/i18n.jsx'

function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        'px-3 py-2 rounded-xl text-sm font-semibold transition ' +
        (isActive ? 'bg-black/5 text-ink' : 'text-ink/70 hover:text-ink hover:bg-black/5')
      }
    >
      {children}
    </NavLink>
  )
}

export default function Navigation({ onOpenAuth }) {
  const [open, setOpen] = useState(false)
  const { count } = useCart()
  const { isAuthed } = useAuth()
  const { toggle, t } = useI18n()
  const location = useLocation()

  const links = useMemo(() => ([
    { to: '/', label: t('navHome') },
    { to: '/catalog', label: t('navCatalog') },
    { to: '/services', label: t('navServices') },
    { to: '/custom', label: t('navCustom') },
    { to: '/contact', label: t('navContact') },
    { to: '/about', label: t('navAbout') },
  ]), [t])

  // Close mobile menu on route change
  React.useEffect(() => { setOpen(false) }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 bg-silk/80 backdrop-blur border-b border-black/5">
      <div className="container-page h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl tracking-wide">Linces'CKF</span>
          <span className="hidden sm:inline text-xs text-ink/60">Silk Atelier</span>
        </NavLink>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          {links.map((l) => (
            <NavItem key={l.to} to={l.to}>{l.label}</NavItem>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="btn-ghost"
            aria-label="Toggle language"
            title={t('language')}
          >
            <Languages className="h-4 w-4" />
          </button>

          <NavLink to="/chat" className="btn-ghost" aria-label="Chat">
              <MessageCircle className="h-5 w-5" />
            </NavLink>
            <NavLink to="/cart" className="btn-ghost relative" aria-label="Cart">
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-gold text-white text-xs flex items-center justify-center">
                {count}
              </span>
            )}
          </NavLink>

          {isAuthed ? (
            <NavLink to="/profile" className="btn-ghost" aria-label="Profile">
              <User2 className="h-4 w-4" />
            </NavLink>
          ) : (
            <button type="button" className="btn-primary" onClick={onOpenAuth}>
              {t('authLogin')}
            </button>
          )}

          <button
            type="button"
            className="lg:hidden btn-ghost"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-black/5 bg-silk">
          <div className="container-page py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavItem key={l.to} to={l.to} onClick={() => setOpen(false)}>
                {l.label}
              </NavItem>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
