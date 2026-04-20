// products.js — 12 products, descriptions use translation keys for bilingual support

export const PRODUCTS = [
  // ── BLOUSES ──────────────────────────────────────────────────────────────
  {
    id: 'blouse-aurora',
    name: 'Aurora Silk Blouse',
    category: 'blouses',
    price: 189,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1614251055880-ee96e4803393?auto=format&fit=crop&w=1200&q=80',
    descKey: 'descBlouseAurora'
  },
  {
    id: 'blouse-celeste',
    name: 'Celeste Wrap Blouse',
    category: 'blouses',
    price: 165,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?auto=format&fit=crop&w=1200&q=80',
    descKey: 'descBlouseCeleste'
  },
  {
    id: 'blouse-ivory',
    name: 'Ivory Pleat Blouse',
    category: 'blouses',
    price: 199,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1622445272461-c6580cab8755?auto=format&fit=crop&w=1200&q=80',
    descKey: 'descBlouseIvory'
  },

  // ── DRESSES ──────────────────────────────────────────────────────────────
  {
    id: 'dress-marisol',
    name: 'Marisol Slip Dress',
    category: 'dresses',
    price: 249,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80',
    descKey: 'descDressMarisol'
  },
  {
    id: 'dress-soleil',
    name: 'Soleil Midi Dress',
    category: 'dresses',
    price: 295,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=80',
    descKey: 'descDressSoleil'
  },
  {
    id: 'dress-luna',
    name: 'Luna Evening Dress',
    category: 'dresses',
    price: 349,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80',
    descKey: 'descDressLuna'
  },

  // ── SHIRTS ───────────────────────────────────────────────────────────────
  {
    id: 'shirt-valencia',
    name: 'Valencia Silk Shirt',
    category: 'shirts',
    price: 210,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=80',
    descKey: 'descShirtValencia'
  },
  {
    id: 'shirt-monaco',
    name: 'Monaco Button Shirt',
    category: 'shirts',
    price: 225,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1200&q=80',
    descKey: 'descShirtMonaco'
  },
  {
    id: 'shirt-rio',
    name: 'Rio Oversized Shirt',
    category: 'shirts',
    price: 195,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1603251578711-3290ca1a0187?auto=format&fit=crop&w=1200&q=80',
    descKey: 'descShirtRio'
  },

  // ── SCARVES ──────────────────────────────────────────────────────────────
  {
    id: 'scarf-noir',
    name: 'Noir Silk Scarf',
    category: 'scarves',
    price: 79,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80',
    descKey: 'descScarfNoir'
  },
  {
    id: 'scarf-saffron',
    name: 'Saffron Printed Scarf',
    category: 'scarves',
    price: 95,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
    descKey: 'descScarfSaffron'
  },
  {
    id: 'scarf-alpine',
    name: 'Alpine Square Scarf',
    category: 'scarves',
    price: 89,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80',
    descKey: 'descScarfAlpine'
  },
]
