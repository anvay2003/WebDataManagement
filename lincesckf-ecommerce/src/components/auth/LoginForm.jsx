import React, { useState } from 'react'
import { useAuth } from '../../context/auth.jsx'
import { useI18n } from '../../i18n/i18n.jsx'

export default function LoginForm({ onSuccess }) {
  const { login } = useAuth()
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      onSuccess?.()
    } catch (err) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label className="label" htmlFor="login-email">{t('email')}</label>
        <input id="login-email" className="input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="label" htmlFor="login-password">{t('password')}</label>
        <input id="login-password" className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>

      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}

      <button className="btn-primary w-full" type="submit" disabled={loading}>
        {loading ? '...' : t('authLogin')}
      </button>


    </form>
  )
}
