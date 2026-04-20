import React from 'react'
import { useI18n } from '../i18n/i18n.jsx'
import { Link } from 'react-router-dom'

function Step({ n, title, text }) {
  return (
    <div className="card p-6">
      <div className="text-xs uppercase tracking-widest text-ink/60">Step {n}</div>
      <div className="font-semibold mt-1">{title}</div>
      <p className="muted mt-2">{text}</p>
    </div>
  )
}

export default function ServicesPage() {
  const { t } = useI18n()

  return (
    <section className="container-page py-12">
      <div className="card p-8 bg-white">
        <h1 className="font-display text-3xl">{t('servicesTitle')}</h1>
        <p className="mt-3 text-ink/70 max-w-2xl">{t('servicesSub')}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a className="btn-gold" href="https://wa.me/0000000000" target="_blank" rel="noreferrer">{t('whatsapp')}</a>
          <Link className="btn-ghost" to="/contact">{t('ctaQuote')}</Link>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-2xl">{t('processTitle')}</h2>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Step n="1" title={t('step1')} text="We align on goals, fabrics, quantities, and timelines." />
          <Step n="2" title={t('step2')} text="We create samples for fit, construction, and finish." />
          <Step n="3" title={t('step3')} text="Precision manufacturing with premium materials." />
          <Step n="4" title={t('step4')} text="Final inspection and packaging standards." />
        </div>
      </div>
    </section>
  )
}
