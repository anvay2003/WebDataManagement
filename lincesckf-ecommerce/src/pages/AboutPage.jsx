// AboutPage.jsx — fully bilingual

import React from 'react'
import { useI18n } from '../i18n/i18n.jsx'

export default function AboutPage() {
  const { t } = useI18n()
  return (
    <section className="container-page py-12">
      <div className="card p-8">
        <h1 className="font-display text-3xl">{t('aboutTitle')}</h1>
        <p className="mt-4 text-ink/70 max-w-3xl">{t('aboutSub')}</p>
        <div className="mt-6 grid sm:grid-cols-2 gap-6">
          <div className="card p-6 bg-rose/30">
            <div className="font-semibold">{t('aboutD2CTitle')}</div>
            <p className="muted mt-2">{t('aboutD2CDesc')}</p>
          </div>
          <div className="card p-6 bg-rose/30">
            <div className="font-semibold">{t('aboutB2BTitle')}</div>
            <p className="muted mt-2">{t('aboutB2BDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
