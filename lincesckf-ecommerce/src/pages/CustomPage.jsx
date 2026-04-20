// CustomPage.jsx — fully bilingual

import React, { useState } from 'react'
import { useI18n } from '../i18n/i18n.jsx'

export default function CustomPage() {
  const { t } = useI18n()
  const [type, setType]       = useState('')
  const [details, setDetails] = useState('')
  const [contact, setContact] = useState('')
  const [done, setDone]       = useState(false)

  const onSubmit = (e) => { e.preventDefault(); setDone(true) }

  return (
    <section className="container-page py-12">
      <div className="card p-8">
        <h1 className="font-display text-3xl">{t('customTitle')}</h1>
        <p className="mt-3 text-ink/70 max-w-2xl">{t('customSub')}</p>

        {done ? (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-900">
            {t('customDone')}
          </div>
        ) : (
          <form className="mt-6 grid gap-4 max-w-2xl" onSubmit={onSubmit}>
            <div>
              <label className="label" htmlFor="o-type">{t('customOrderType')}</label>
              <select className="input mt-1" id="o-type" value={type} onChange={e => setType(e.target.value)} required>
                <option value="">{t('customSelectPlaceholder')}</option>
                <option value="d2c">{t('customOptionD2C')}</option>
                <option value="b2b">{t('customOptionB2B')}</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="o-details">{t('customDetails')}</label>
              <textarea className="input mt-1 min-h-32" id="o-details" value={details} onChange={e => setDetails(e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="o-contact">{t('email')}</label>
              <input className="input mt-1" id="o-contact" type="email" value={contact} onChange={e => setContact(e.target.value)} required />
            </div>
            <button className="btn-gold w-fit" type="submit">{t('customSubmit')}</button>
          </form>
        )}
      </div>
    </section>
  )
}
