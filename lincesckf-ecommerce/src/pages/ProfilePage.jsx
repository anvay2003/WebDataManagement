// ProfilePage.jsx — Phase 3: Account, Password, Notifications, My Orders
// Wired to real backend API via auth context
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth.jsx'
import { useI18n } from '../i18n/i18n.jsx'
import { api } from '../api/client.js'
import { User2, Bell, Lock, ShieldCheck, ShoppingBag, Package } from 'lucide-react'

function TabButton({ label, Icon, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
        active ? 'bg-gold text-white' : 'text-ink/70 hover:text-ink hover:bg-black/5'
      }`}>
      <Icon className="h-4 w-4" />{label}
    </button>
  )
}

function AccountTab({ user, updateProfile }) {
  const { t } = useI18n()
  const [name,   setName]   = useState(user.fullName || user.companyName || '')
  const [email,  setEmail]  = useState(user.email || '')
  const [saved,  setSaved]  = useState(false)
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const isCustomer = user.accountType === 'customer'
      await updateProfile({
        fullName:    isCustomer ? name : undefined,
        companyName: !isCustomer ? name : undefined,
        email,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="grid gap-5 max-w-lg" onSubmit={save}>
      <div>
        <label className="label" htmlFor="p-name">
          {user.accountType === 'brand' ? t('profileCompanyName') : t('profileFullName')}
        </label>
        <input id="p-name" className="input mt-1" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="p-email">{t('profileEmailLabel')}</label>
        <input id="p-email" className="input mt-1" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="label">{t('profileAccountType')}</label>
        <div className="mt-1 input bg-black/5 cursor-default capitalize">{user.accountType}</div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-gold" disabled={saving}>
          {saving ? 'Saving…' : t('profileSave')}
        </button>
        {saved && <span className="text-sm text-green-700 flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> {t('profileSaved')}</span>}
      </div>
    </form>
  )
}

function PasswordTab({ changePassword }) {
  const { t } = useI18n()
  const [current, setCurrent] = useState('')
  const [next,    setNext]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [saving,  setSaving]  = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setError('')
    if (!current)         { setError(t('profileErrCurrent')); return }
    if (next.length < 6)  { setError(t('profileErrLength'));  return }
    if (next !== confirm) { setError(t('profileErrMatch'));   return }
    setSaving(true)
    try {
      await changePassword({ currentPassword: current, newPassword: next })
      setSuccess(true)
      setCurrent(''); setNext(''); setConfirm('')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="grid gap-5 max-w-lg" onSubmit={save}>
      <div>
        <label className="label" htmlFor="pw-cur">{t('profileCurPassword')}</label>
        <input id="pw-cur" className="input mt-1" type="password" value={current} onChange={e => setCurrent(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="pw-new">{t('profileNewPassword')}</label>
        <input id="pw-new" className="input mt-1" type="password" value={next} onChange={e => setNext(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="pw-conf">{t('profileConfirmPassword')}</label>
        <input id="pw-conf" className="input mt-1" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-gold" disabled={saving}>
          {saving ? 'Updating…' : t('profileUpdatePassword')}
        </button>
        {success && <span className="text-sm text-green-700 flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> {t('profilePasswordUpdated')}</span>}
      </div>
    </form>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {description && <div className="muted mt-0.5">{description}</div>}
      </div>
      <div onClick={onChange} className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors ${checked ? 'bg-gold' : 'bg-black/20'}`}>
        <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : ''}`} />
      </div>
    </label>
  )
}

function NotificationsTab() {
  const { t } = useI18n()
  const [prefs,   setPrefs]   = useState(null)
  const [saved,   setSaved]   = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  // Load prefs from backend on mount
  useEffect(() => {
    api.get('/users/me/notifications')
      .then((data) => {
        setPrefs({
          orderEmail:    !!data.email_orders,
          promoEmail:    !!data.email_promos,
          orderSms:      !!data.sms_orders,
          promoSms:      !!data.sms_promos,
          newCollection: true,
          weeklyDigest:  false,
        })
      })
      .catch(() => {
        setPrefs({ orderEmail: true, promoEmail: false, orderSms: false, promoSms: false, newCollection: true, weeklyDigest: false })
      })
  }, [])

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const save = async () => {
    if (!prefs) return
    setSaving(true)
    setError('')
    try {
      await api.patch('/users/me/notifications', {
        emailOrders: prefs.orderEmail,
        emailPromos: prefs.promoEmail,
        smsOrders:   prefs.orderSms,
        smsPromos:   prefs.promoSms,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!prefs) return <p className="muted text-sm py-4">Loading preferences…</p>

  return (
    <div className="max-w-lg grid gap-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-ink/50 mb-3">{t('profileNotifEmail')}</h3>
        <div className="card p-4 grid gap-4">
          <Toggle checked={prefs.orderEmail}    onChange={() => toggle('orderEmail')}    label={t('profileNotifOrder')}    description={t('profileNotifOrderDesc')} />
          <Toggle checked={prefs.promoEmail}    onChange={() => toggle('promoEmail')}    label={t('profileNotifPromo')}    description={t('profileNotifPromoDesc')} />
          <Toggle checked={prefs.newCollection} onChange={() => toggle('newCollection')} label={t('profileNotifNewCol')}   description={t('profileNotifNewColDesc')} />
          <Toggle checked={prefs.weeklyDigest}  onChange={() => toggle('weeklyDigest')}  label={t('profileNotifDigest')}   description={t('profileNotifDigestDesc')} />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-ink/50 mb-3">{t('profileNotifSms')}</h3>
        <div className="card p-4 grid gap-4">
          <Toggle checked={prefs.orderSms} onChange={() => toggle('orderSms')} label={t('profileNotifOrderSms')} description={t('profileNotifOrderSmsDesc')} />
          <Toggle checked={prefs.promoSms} onChange={() => toggle('promoSms')} label={t('profileNotifPromoSms')} description={t('profileNotifPromoSmsDesc')} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="button" className="btn-gold" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : t('profileSavePrefs')}
        </button>
        {saved && <span className="text-sm text-green-700 flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> {t('profilePrefsSaved')}</span>}
      </div>
    </div>
  )
}

function OrdersTab() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/me/orders')
      .then(({ orders: o }) => { setOrders(o); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="muted text-sm py-4">Loading orders…</p>

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-ink/20 mb-3" />
        <p className="font-semibold">No orders yet</p>
        <p className="muted mt-1 text-sm">Your orders will appear here after checkout.</p>
        <Link to="/catalog" className="btn-gold mt-5 inline-block">Shop Now</Link>
      </div>
    )
  }

  return (
    <div className="grid gap-5">
      {orders.map(order => (
        <div key={order.id} className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div>
              <p className="font-semibold">Order #{order.id}</p>
              <p className="muted text-xs mt-0.5">
                {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1 rounded-full bg-gold/15 text-gold font-semibold capitalize">{order.status}</span>
              <span className="font-bold">${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProfilePage() {
  const { user, isAuthed, logout, updateProfile, changePassword } = useAuth()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState('account')

  const TABS = [
    { id: 'account',       label: t('profileAccountTab'),  Icon: User2 },
    { id: 'password',      label: t('profilePasswordTab'), Icon: Lock },
    { id: 'notifications', label: t('profileNotifTab'),    Icon: Bell },
    { id: 'orders',        label: 'My Orders',              Icon: ShoppingBag },
  ]

  if (!isAuthed) {
    return (
      <section className="container-page py-12">
        <div className="card p-8 max-w-md mx-auto text-center">
          <User2 className="h-10 w-10 mx-auto text-ink/30 mb-4" />
          <h1 className="font-display text-2xl">{t('navProfile')}</h1>
          <p className="mt-2 text-ink/70">{t('profileLoginPrompt')}</p>
          <Link className="btn-gold mt-6 inline-block" to="/">{t('navHome')}</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="container-page py-12">
      <div className="card p-6 flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl">{t('navProfile')}</h1>
          <p className="muted mt-1">{user.email}</p>
        </div>
        <button className="btn-ghost" onClick={logout}>{t('logout')}</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <aside className="flex sm:flex-col gap-1 sm:w-48 flex-shrink-0 flex-wrap">
          {TABS.map(tab => (
            <TabButton key={tab.id} label={tab.label} Icon={tab.Icon}
              active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
          ))}
        </aside>
        <div className="card p-6 flex-1">
          {activeTab === 'account'       && <AccountTab  user={user} updateProfile={updateProfile} />}
          {activeTab === 'password'      && <PasswordTab changePassword={changePassword} />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'orders'        && <OrdersTab />}
        </div>
      </div>
    </section>
  )
}
