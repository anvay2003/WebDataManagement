// auth.jsx — no cart import; receives onAuthChange(email) callback from App.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const STORAGE_KEY = 'lincesckf.auth'
const TOKEN_KEY   = 'lincesckf.token'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function apiPost(path, body) {
  const res  = await fetch(`${BASE_URL}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error || data?.errors?.[0]?.msg || 'Request failed'
    throw new Error(msg)
  }
  return data
}

async function apiPatch(path, body, token) {
  const res  = await fetch(`${BASE_URL}${path}`, {
    method:  'PATCH',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Request failed')
  return data
}

// onAuthChange(email | null) is called after login/register/logout
// so the cart context can switch to the right user's cart.
// Passed in from App.jsx — no circular import needed.
export function AuthProvider({ children, onAuthChange }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })

  // On first mount, tell the cart which user is already logged in
  useEffect(() => {
    onAuthChange?.(user?.email ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const persistUser = (u, token) => {
    setUser(u)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    if (token) localStorage.setItem(TOKEN_KEY, token)
  }

  // ── Login ─────────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    if (!email || !password) throw new Error('Missing credentials')
    const { user: u, token } = await apiPost('/auth/login', { email, password })
    persistUser(u, token)
    onAuthChange?.(u.email)
  }

  // ── Register ──────────────────────────────────────────────────
  const register = async (payload) => {
    const { email, password, accountType, fullName, companyName } = payload
    if (!email || !password || !accountType) throw new Error('Missing fields')
    if (accountType === 'customer' && !fullName)    throw new Error('Missing full name')
    if (accountType === 'brand'    && !companyName) throw new Error('Missing company name')

    const { user: u, token } = await apiPost('/auth/register', {
      email, password, accountType,
      fullName:    fullName    || '',
      companyName: companyName || '',
    })
    persistUser(u, token)
    onAuthChange?.(u.email)
  }

  // ── Update profile ────────────────────────────────────────────
  const updateProfile = async ({ fullName, companyName, email: newEmail }) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) throw new Error('Not authenticated')
    await apiPatch('/users/me', { fullName, companyName, email: newEmail }, token)
    const updated = { ...user, fullName, companyName, email: newEmail || user.email }
    persistUser(updated, token)
  }

  // ── Change password ───────────────────────────────────────────
  const changePassword = async ({ currentPassword, newPassword }) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) throw new Error('Not authenticated')
    const res = await fetch(`${BASE_URL}/users/me/change-password`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error || 'Failed to change password')
  }

  // ── Logout ────────────────────────────────────────────────────
  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(TOKEN_KEY)
    onAuthChange?.(null)
  }

  const value = useMemo(
    () => ({ user, isAuthed: !!user, login, register, logout, updateProfile, changePassword }),
    [user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}