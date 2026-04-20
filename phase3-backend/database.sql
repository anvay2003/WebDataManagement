-- ============================================================
--  lincesckf E-Commerce — Phase 3 MySQL Schema
--  CSE-5335 Web Data Management
--  Team: Sen, Sharma, Seethini, Tatineni, Singireddy
-- ============================================================

CREATE DATABASE IF NOT EXISTS lincesckf_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE lincesckf_db;

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(120)     NOT NULL DEFAULT '',
  company_name  VARCHAR(120)     NOT NULL DEFAULT '',
  email         VARCHAR(255)     NOT NULL UNIQUE,
  password_hash VARCHAR(255)     NOT NULL,
  account_type  ENUM('customer','brand') NOT NULL DEFAULT 'customer',
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── NOTIFICATION PREFERENCES ─────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_prefs (
  id            INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED     NOT NULL UNIQUE,
  email_orders  TINYINT(1)       NOT NULL DEFAULT 1,
  email_promos  TINYINT(1)       NOT NULL DEFAULT 1,
  sms_orders    TINYINT(1)       NOT NULL DEFAULT 0,
  sms_promos    TINYINT(1)       NOT NULL DEFAULT 0,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── CATEGORIES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id            INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(80)      NOT NULL UNIQUE,
  name          VARCHAR(120)     NOT NULL
);

INSERT IGNORE INTO categories (slug, name) VALUES
  ('blouses',  'Blouses'),
  ('dresses',  'Dresses'),
  ('shirts',   'Shirts'),
  ('scarves',  'Scarves');

-- ── PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(120)     NOT NULL UNIQUE,
  name          VARCHAR(200)     NOT NULL,
  description   TEXT             DEFAULT NULL,
  price         DECIMAL(10,2)    NOT NULL,
  currency      CHAR(3)          NOT NULL DEFAULT 'USD',
  image_url     VARCHAR(500)     DEFAULT NULL,
  stock         INT UNSIGNED     NOT NULL DEFAULT 100,
  category_id   INT UNSIGNED     NOT NULL,
  is_active     TINYINT(1)       NOT NULL DEFAULT 1,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT IGNORE INTO products (slug, name, description, price, image_url, stock, category_id) VALUES
  ('blouse-aurora',   'Aurora Silk Blouse',      'Effortlessly elegant in 100% Mulberry silk with a fluid drape.',          189.00, 'https://images.unsplash.com/photo-1614251055880-ee96e4803393?auto=format&fit=crop&w=1200&q=80', 50, 1),
  ('blouse-celeste',  'Celeste Wrap Blouse',     'Floaty wrap silhouette in premium georgette — relaxed yet refined.',       165.00, 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?auto=format&fit=crop&w=1200&q=80', 40, 1),
  ('blouse-ivory',    'Ivory Pleat Blouse',      'Structured front pleats on crisp cotton-voile. Effortless elegance.',     199.00, 'https://images.unsplash.com/photo-1622445272461-c6580cab8755?auto=format&fit=crop&w=1200&q=80', 35, 1),
  ('dress-marisol',   'Marisol Slip Dress',      'Minimal bias-cut slip in duchess satin. Your evening essential.',         249.00, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80', 30, 2),
  ('dress-soleil',    'Soleil Midi Dress',       'Tiered cotton-lawn midi with adjustable straps and a playful hem.',       295.00, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=80', 25, 2),
  ('dress-luna',      'Luna Evening Dress',      'Floor-length column dress in matte crepe. Understated glamour.',          349.00, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80', 20, 2),
  ('shirt-valencia',  'Valencia Silk Shirt',     'Relaxed-fit silk shirt with mother-of-pearl buttons. Day to evening.',    210.00, 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=80', 45, 3),
  ('shirt-monaco',    'Monaco Button Shirt',     'Tailored poplin shirt with a hidden placket and contrast stitching.',     225.00, 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1200&q=80', 40, 3),
  ('shirt-rio',       'Rio Oversized Shirt',     'Breezy oversized cut in washed linen-silk blend. Easy weekend style.',   195.00, 'https://images.unsplash.com/photo-1603251578711-3290ca1a0187?auto=format&fit=crop&w=1200&q=80', 50, 3),
  ('scarf-noir',      'Noir Silk Scarf',         'Classic 90×90 cm silk twill in a timeless noir palette.',                 79.00, 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80', 60, 4),
  ('scarf-saffron',   'Saffron Printed Scarf',   'Hand-rolled edges on a vibrant botanical-print silk. A collector piece.',  95.00, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80', 55, 4),
  ('scarf-alpine',    'Alpine Square Scarf',     'Wool-silk blend in an alpine plaid — warm, luxurious, versatile.',        89.00, 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80', 50, 4);

-- ── PRODUCT REVIEWS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  product_id    INT UNSIGNED     NOT NULL,
  user_id       INT UNSIGNED     NOT NULL,
  rating        TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body          TEXT             DEFAULT NULL,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  UNIQUE KEY uq_review (product_id, user_id)
);

-- ── CART ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id            INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED     NOT NULL,
  product_id    INT UNSIGNED     NOT NULL,
  quantity      INT UNSIGNED     NOT NULL DEFAULT 1,
  size          VARCHAR(10)      DEFAULT NULL,
  color         VARCHAR(40)      DEFAULT NULL,
  added_at      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ── ORDERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED     NOT NULL,
  total         DECIMAL(10,2)    NOT NULL,
  status        ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id            INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  order_id      INT UNSIGNED     NOT NULL,
  product_id    INT UNSIGNED     NOT NULL,
  quantity      INT UNSIGNED     NOT NULL,
  unit_price    DECIMAL(10,2)    NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ── CONTACT MESSAGES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id            INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)     NOT NULL,
  email         VARCHAR(255)     NOT NULL,
  subject       VARCHAR(255)     NOT NULL,
  message       TEXT             NOT NULL,
  sent_at       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── CHAT MESSAGES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sender_id   INT UNSIGNED NOT NULL,
  receiver_id INT UNSIGNED NOT NULL,
  room        VARCHAR(50) NOT NULL,
  body        TEXT NOT NULL,
  sent_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id)   REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  INDEX idx_room (room)
);