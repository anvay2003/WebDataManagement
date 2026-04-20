import React, { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '../../i18n/i18n.jsx'
import LoginForm from './LoginForm.jsx'
import RegisterForm from './RegisterForm.jsx'

export default function AuthModal({ open, onClose }) {
  const { t } = useI18n()
  const [mode, setMode] = useState('login') // 'login' | 'register'

  const title = useMemo(() => (mode === 'login' ? t('authLogin') : t('authRegister')), [mode, t])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="card w-full max-w-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
            <div className="font-display text-lg">{title}</div>
            <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5">
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                className={mode === 'login' ? 'btn-primary' : 'btn-ghost'}
                onClick={() => setMode('login')}
              >
                {t('authLogin')}
              </button>
              <button
                type="button"
                className={mode === 'register' ? 'btn-primary' : 'btn-ghost'}
                onClick={() => setMode('register')}
              >
                {t('authRegister')}
              </button>
            </div>

            {mode === 'login' ? <LoginForm onSuccess={onClose} /> : <RegisterForm onSuccess={onClose} />}
          </div>
        </div>
      </div>
    </div>
  )
}
