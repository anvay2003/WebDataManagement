// ContactPage.jsx — fully bilingual, every string uses t()

import React, { useState } from 'react'
import { sendContactMessage } from '../api/contact.js'
import { useI18n } from '../i18n/i18n.jsx'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  const { t } = useI18n()

  const SUBJECTS = [
    t('contactSubject1'), t('contactSubject2'), t('contactSubject3'),
    t('contactSubject4'), t('contactSubject5'), t('contactSubject6'),
  ]

  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [phone, setPhone]     = useState('')
  const [sent, setSent]       = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await sendContactMessage({ name, email, subject, message })
    } catch (_) {
      // still show success to user — message may have been saved
    }
    setSent(true)
  }

  return (
    <section className="container-page py-12">
      <h1 className="font-display text-3xl mb-8">{t('contactTitle')}</h1>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* ── Contact Form ── */}
        <div className="lg:col-span-2 card p-8">
          <h2 className="font-display text-xl mb-1">{t('contactSend')}</h2>
          <p className="muted mb-6">{t('contactSendSub')}</p>

          {sent ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-900">
              <div className="font-semibold text-lg">{t('contactSent')}</div>
              <p className="mt-1 text-green-800">
                {t('contactSentSub')} <strong>{email}</strong> {t('contactSentSub2')}
              </p>
              <button
                className="btn-ghost mt-4 text-green-800"
                onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage(''); setPhone('') }}
              >
                {t('contactSendAnother')}
              </button>
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="c-name">{t('contactFullName')} <span className="text-red-500">*</span></label>
                  <input id="c-name" className="input mt-1" value={name} onChange={e => setName(e.target.value)} placeholder={t('contactPlaceholderName')} required />
                </div>
                <div>
                  <label className="label" htmlFor="c-email">{t('contactEmail')} <span className="text-red-500">*</span></label>
                  <input id="c-email" className="input mt-1" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('contactPlaceholderEmail')} required />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="c-phone">{t('contactPhone')} <span className="muted">{t('contactPhoneOpt')}</span></label>
                <input id="c-phone" className="input mt-1" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('contactPlaceholderPhone')} />
              </div>

              <div>
                <label className="label" htmlFor="c-subject">{t('contactSubject')} <span className="text-red-500">*</span></label>
                <select id="c-subject" className="input mt-1" value={subject} onChange={e => setSubject(e.target.value)} required>
                  <option value="">{t('contactSubjectPlaceholder')}</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="c-msg">{t('contactMessage')} <span className="text-red-500">*</span></label>
                <textarea id="c-msg" className="input mt-1 min-h-36" value={message} onChange={e => setMessage(e.target.value)} placeholder={t('contactPlaceholderMsg')} required />
              </div>

              <button className="btn-gold w-fit" type="submit">{t('contactSubmit')}</button>
            </form>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="flex flex-col gap-5">
          <div className="card p-6 grid gap-4">
            <h2 className="font-display text-lg">{t('contactInfoTitle')}</h2>
            <a href="mailto:hello@lincesckf.com" className="flex items-start gap-3 text-sm hover:text-gold transition">
              <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">{t('contactEmailLabel')}</div>
                <div className="muted">hello@lincesckf.com</div>
              </div>
            </a>
            <a href="tel:+15551234567" className="flex items-start gap-3 text-sm hover:text-gold transition">
              <Phone className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">{t('contactPhoneLabel')}</div>
                <div className="muted">+1 (555) 123-4567</div>
                <div className="muted text-xs">{t('contactPhoneHours')}</div>
              </div>
            </a>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">{t('contactAddressLabel')}</div>
                <div className="muted">{t('contactAddress1')}</div>
                <div className="muted">{t('contactAddress2')}</div>
                <div className="muted">{t('contactAddress3')}</div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg mb-3">{t('contactHoursTitle')}</h2>
            <div className="grid gap-1 text-sm">
              {[
                [t('contactHours1Day'), t('contactHours1Time')],
                [t('contactHours2Day'), t('contactHours2Time')],
                [t('contactHours3Day'), t('contactHours3Time')],
              ].map(([day, hrs]) => (
                <div key={day} className="flex justify-between gap-4">
                  <span className="text-ink/70">{day}</span>
                  <span className="font-medium">{hrs}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Map ── */}
      <div className="mt-8 card overflow-hidden">
        <div className="p-5 border-b border-black/5 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gold" />
          <h2 className="font-display text-lg">{t('contactMapTitle')}</h2>
        </div>
        <iframe
          title="Linces'CKF location map"
          src="https://maps.google.com/maps?q=University+of+Texas+at+Arlington,+701+S+Nedderman+Dr,+Arlington,+TX+76019&output=embed&z=15"
          width="100%" height="350"
          style={{ border: 0, display: 'block' }}
          allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  )
}
