import React from 'react'
import { Instagram, Mail, MessageCircle } from 'lucide-react'
import { useI18n } from '../../i18n/i18n.jsx'

export default function Footer() {
  const { t } = useI18n()
  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="container-page py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-display text-xl">Linces'CKF</div>
          <p className="muted mt-2">{t('tagline')}</p>
        </div>

        <div>
          <div className="text-sm font-semibold">Links</div>
          <ul className="mt-3 space-y-2 text-sm text-ink/70">
            <li><a className="hover:text-ink" href="/catalog">{t('navCatalog')}</a></li>
            <li><a className="hover:text-ink" href="/services">{t('navServices')}</a></li>
            <li><a className="hover:text-ink" href="/custom">{t('navCustom')}</a></li>
            <li><a className="hover:text-ink" href="/contact">{t('navContact')}</a></li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold">B2B</div>
          <p className="muted mt-3">
            Premium confection services: sampling, grading, small-batch & production.
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold">{t('contactTitle')}</div>
          <div className="mt-3 flex items-center gap-3">
            <a className="btn-ghost" href="mailto:hello@lincesckf.com" aria-label="Email"><Mail className="h-4 w-4" /></a>
            <a className="btn-ghost" href="https://wa.me/0000000000" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></a>
            <a className="btn-ghost" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-black/5">
        <div className="container-page py-5 text-xs text-ink/60 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Linces'CKF. All rights reserved.</span>
          <span>Made with React + Tailwind</span>
        </div>
      </div>
    </footer>
  )
}
