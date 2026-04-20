import React, { useMemo, useState } from 'react'
import { useAuth } from '../../context/auth.jsx'
import { useI18n } from '../../i18n/i18n.jsx'

export default function RegisterForm({ onSuccess }) {
  const { register } = useAuth()
  const { t } = useI18n()

  const [accountType, setAccountType] = useState('customer')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const needsName = accountType === 'customer'
  const needsCompany = accountType === 'brand'

  const validationError = useMemo(() => {
    if (!email) return null
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email format'
    if (password && password.length < 6) return 'Password must be at least 6 characters'
    if (confirmPassword && password !== confirmPassword) return 'Passwords do not match'
    return null
  }, [email, password, confirmPassword])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (validationError) return setError(validationError)
    if (needsName && !fullName.trim()) return setError('Full name required')
    if (needsCompany && !companyName.trim()) return setError('Company name required')

    setLoading(true)
    try {
      await register({ accountType, fullName, companyName, email, password })
      onSuccess?.()
    } catch (err) {
      setError(err?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className={accountType === 'customer' ? 'btn-primary' : 'btn-ghost'}
          onClick={() => setAccountType('customer')}
        >
          {t('authCustomer')}
        </button>
        <button
          type="button"
          className={accountType === 'brand' ? 'btn-primary' : 'btn-ghost'}
          onClick={() => setAccountType('brand')}
        >
          {t('authBrand')}
        </button>
      </div>

      {needsName && (
        <div>
          <label className="label" htmlFor="reg-name">{t('fullName')}</label>
          <input id="reg-name" className="input mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
      )}

      {needsCompany && (
        <div>
          <label className="label" htmlFor="reg-company">{t('companyName')}</label>
          <input id="reg-company" className="input mt-1" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        </div>
      )}

      <div>
        <label className="label" htmlFor="reg-email">{t('email')}</label>
        <input id="reg-email" className="input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div>
        <label className="label" htmlFor="reg-password">{t('password')}</label>
        <input id="reg-password" className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>

      <div>
        <label className="label" htmlFor="reg-confirm">{t('confirmPassword')}</label>
        <input id="reg-confirm" className="input mt-1" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
      </div>

      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}

      <button className="btn-primary w-full" type="submit" disabled={loading}>
        {loading ? '...' : t('authRegister')}
      </button>
    </form>
  )
}
