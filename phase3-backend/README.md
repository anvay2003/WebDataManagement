# lincesckf E-Commerce — Phase 3 README
## CSE-5335 Web Data Management
**Team:** Sen, Sharma, Seethini, Tatineni, Singireddy

---

## Cloud Hosting Address
https://peppy-cobbler-b8fc42.netlify.app/

---

## Demo Login Credentials

| Role     | Email                  | Password  |
|----------|------------------------|-----------|
| Customer | customer@lincesckf.com | Test1234! |
| Brand    | brand1@lincesckf.com    | Test1234! |

> You can also register a new account directly on the site.

> **Note for chat testing:** Use two different browsers (e.g. Chrome + Firefox) or one normal + one incognito window to test chat between two users simultaneously. This is required because `localStorage` is shared across tabs in the same browser.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS      |
| Backend   | Node.js, Express.js               |
| Database  | MySQL (UTA Cloud)                 |
| Real-time | Socket.IO (chat)                  |
| Auth      | JWT (jsonwebtoken) + bcryptjs     |

---

## Project Structure

```
/
├── lincesckf-ecommerce/               ← React frontend
│   ├── src/
│   │   ├── api/                       ← API service modules
│   │   │   ├── client.js              ← Fetch wrapper with JWT injection
│   │   │   ├── auth.js                ← Register / login / logout
│   │   │   ├── products.js            ← Product listing, detail, reviews
│   │   │   ├── cart.js                ← Cart CRUD + checkout
│   │   │   ├── users.js               ← Profile, password, notifications, orders
│   │   │   ├── contact.js             ← Contact form submission
│   │   │   └── chat.js                ← Socket.IO hook + history fetch
│   │   ├── components/
│   │   │   └── products/
│   │   │       └── ProductCard.jsx    ← Updated: works with DB product fields
│   │   ├── context/
│   │   │   ├── auth.jsx               ← Real API login/register/profile
│   │   │   └── cart.jsx               ← Updated: supports DB image_url field
│   │   └── pages/
│   │       ├── HomePage.jsx           ← Updated: live products + recommendations from DB
│   │       ├── CatalogPage.jsx        ← Updated: server-side filter/sort/pagination
│   │       ├── ProductDetailPage.jsx  ← Updated: live product + real DB reviews
│   │       ├── CartPage.jsx           ← Updated: DB cart sync + checkout
│   │       ├── ProfilePage.jsx        ← Updated: profile, password, notifs, orders
│   │       ├── ContactPage.jsx        ← Updated: persists to DB
│   │       └── ChatPage.jsx           ← Real-time Socket.IO chat
│   ├── App.jsx                        ← Updated: route uses /product/:slug
│   └── package.json                   ← Includes socket.io-client
│
└── phase3-backend/                    ← Express backend
    ├── server.js                      ← Entry point
    ├── database.sql                   ← Full MySQL schema + seed data
    ├── config/db.js                   ← MySQL2 connection pool
    ├── middleware/auth.js             ← JWT middleware
    ├── routes/
    │   ├── auth.js                    ← POST /api/auth/register|login
    │   ├── products.js                ← GET /api/products, /api/products/:slug, reviews
    │   ├── cart.js                    ← GET/POST/PATCH/DELETE /api/cart + /checkout
    │   ├── users.js                   ← /api/users/me + prefs + orders + user list
    │   ├── contact.js                 ← POST /api/contact
    │   └── chat.js                    ← GET /api/chat/:otherId (message history)
    ├── socket/chat.js                 ← Socket.IO real-time chat handler
    └── package.json
```

---

## API Endpoints

| Method | Endpoint                      | Auth | Description                      |
|--------|-------------------------------|------|----------------------------------|
| POST   | /api/auth/register            | No   | Register new account             |
| POST   | /api/auth/login               | No   | Login, returns JWT               |
| GET    | /api/products                 | No   | List products (filter/sort/page) |
| GET    | /api/products/:slug           | No   | Product detail + reviews         |
| POST   | /api/products/:slug/reviews   | Yes  | Submit a review                  |
| GET    | /api/cart                     | Yes  | Get user's cart                  |
| POST   | /api/cart                     | Yes  | Add item to cart                 |
| PATCH  | /api/cart/:id                 | Yes  | Update cart item quantity        |
| DELETE | /api/cart/:id                 | Yes  | Remove cart item                 |
| DELETE | /api/cart                     | Yes  | Clear entire cart                |
| POST   | /api/cart/checkout            | Yes  | Place order, clear cart          |
| GET    | /api/users/me                 | Yes  | Get profile                      |
| PATCH  | /api/users/me                 | Yes  | Update profile                   |
| POST   | /api/users/me/change-password | Yes  | Change password                  |
| GET    | /api/users/me/notifications   | Yes  | Get notification preferences     |
| PATCH  | /api/users/me/notifications   | Yes  | Update notification preferences  |
| GET    | /api/users/me/orders          | Yes  | Order history                    |
| GET    | /api/users                    | Yes  | List all other users (for chat)  |
| POST   | /api/contact                  | No   | Submit contact form              |
| GET    | /api/chat/:otherId            | Yes  | Load chat message history        |
| GET    | /api/health                   | No   | Health check                     |

### Socket.IO Events

| Event                          | Direction        | Description                        |
|--------------------------------|------------------|------------------------------------|
| `joinRoom({ otherId })`        | Client → Server  | Join private room with another user |
| `sendMessage({ receiverId, body })` | Client → Server | Send a message                |
| `newMessage`                   | Server → Client  | Receive a new message (broadcast)  |
| `chatError`                    | Server → Client  | Error sending a message            |

---

## Local Setup Instructions

### 1. Database
```bash
mysql -u root -p < phase3-backend/database.sql
```

### 2. Backend
```bash
cd phase3-backend
cp .env.example .env        # fill in DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
npm install
npm run dev                  # runs on http://localhost:5000
```

### 3. Frontend
```bash
cd lincesckf-ecommerce
cp .env.example .env         # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                  # runs on http://localhost:5173
```

### 4. Seed demo users (run once after DB setup)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@lincesckf.com","password":"Test1234!","accountType":"customer","fullName":"Demo Customer"}'

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"brand@lincesckf.com","password":"Test1234!","accountType":"brand","companyName":"Lincesckf Brand"}'
```

---

## Key Features — Phase 3

### All data dynamically loaded from MySQL
- Products, reviews, cart items, orders, contact messages, and chat messages are all stored in and retrieved from the MySQL database.
- No static product data is used on any page.

### Homepage
- Hero section, special offer banner, category grid.
- Personalised product recommendations based on the user's current cart contents, fetched live from the DB.

### Product Listing (Catalog)
- Server-side filtering by category, sorting by price, and pagination (6 per page).

### Product Detail
- Full product information loaded from DB by slug.
- Customer reviews loaded from DB; logged-in users can submit a new review.
- Related products fetched from the same category.

### Shopping Cart
- Add, update quantity, remove items.
- Checkout syncs cart to backend DB and creates a real order record.
- Order history visible in the Profile page under My Orders.

### User Account (Profile)
- Update name/email, change password, manage email/SMS notification preferences — all persisted to DB.

### Contact Us
- Contact form saves submissions to the `contact_messages` table.
- Includes email, phone, business hours, and an embedded Google Maps location.

### Chat
- Real-time private messaging between any two registered users via Socket.IO.
- Messages are persisted to the `chat_messages` table in MySQL.
- Sender names correctly resolved for both customer (full_name) and brand (company_name) account types.

---

## Database Schema Summary

| Table                | Purpose                                  |
|----------------------|------------------------------------------|
| `users`              | All registered accounts (customer/brand) |
| `notification_prefs` | Email/SMS notification settings per user |
| `categories`         | Product categories (blouses, dresses…)   |
| `products`           | Product catalogue with pricing and stock |
| `reviews`            | User reviews per product (1 per user)    |
| `cart_items`         | Active cart items per user               |
| `orders`             | Placed orders                            |
| `order_items`        | Line items for each order                |
| `contact_messages`   | Contact form submissions                 |
| `chat_messages`      | Real-time chat messages between users    |

---

## CSS / Font Notes
See `src/styles/tailwind.css` for full details. Primary font: **Cormorant Garamond** (display headings), **Inter** (body). Brand colour: `#C9A84C` (gold).

---

## Code Integrity
All backend code written by the team. References:
- Express.js routing: https://expressjs.com/en/guide/routing.html
- Socket.IO v4 docs: https://socket.io/docs/v4/
- MySQL2: https://github.com/sidorares/node-mysql2