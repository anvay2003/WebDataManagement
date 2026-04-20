import React from 'react'
import { useCart } from '../../context/cart.jsx'
import { useI18n } from '../../i18n/i18n.jsx'

export default function CartTable() {
  const { items, subtotal, remove, setQty } = useCart()
  const { t } = useI18n()

  if (items.length === 0) {
    return <div className="card p-6">{t('emptyCart')}</div>
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-black/5 text-ink/70">
            <tr>
              <th className="text-left px-4 py-3">Item</th>
              <th className="text-left px-4 py-3">{t('qty')}</th>
              <th className="text-left px-4 py-3">{t('total')}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.productId} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={i.image} alt={i.name} className="h-12 w-12 rounded-lg object-cover bg-black/5" />
                    <div>
                      <div className="font-semibold">{i.name}</div>
                      <div className="muted">${i.price}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input
                    className="input w-24"
                    type="number"
                    min="1"
                    value={i.qty}
                    onChange={(e) => setQty(i.productId, e.target.value)}
                  />
                </td>
                <td className="px-4 py-3 font-semibold">${(i.qty * i.price).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <button className="btn-ghost" onClick={() => remove(i.productId)}>{t('remove')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-black/5 flex items-center justify-between">
        <div className="font-semibold">{t('total')}</div>
        <div className="font-semibold">${subtotal.toFixed(2)}</div>
      </div>
    </div>
  )
}
