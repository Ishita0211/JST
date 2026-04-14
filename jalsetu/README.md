# 💧 JalSetu — Hyperlocal Water Delivery Platform

> **Uber for 20L water cans in India.**  
> Transparent pricing · Verified vendors · Real-time tracking

---

## 📁 Folder Structure

```
jalsetu/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── shared/
│   │       ├── Navbar.jsx
│   │       ├── Footer.jsx
│   │       ├── LoadingScreen.jsx
│   │       └── StatusBadge.jsx
│   ├── context/
│   │   └── AuthContext.jsx         ← Global auth state
│   ├── firebase/
│   │   ├── config.js               ← Firebase init
│   │   └── helpers.js              ← All Firestore helpers
│   ├── pages/
│   │   ├── HomePage.jsx            ← Landing page
│   │   ├── OrderPage.jsx           ← Order form
│   │   ├── OrderStatusPage.jsx     ← Real-time order tracking
│   │   ├── AuthPage.jsx            ← Login / Signup
│   │   ├── VendorDashboard.jsx     ← Vendor panel
│   │   ├── AdminPanel.jsx          ← Admin panel
│   │   └── NotFound.jsx
│   ├── App.jsx                     ← Routes
│   ├── main.jsx                    ← Entry point
│   └── index.css                   ← Tailwind + global styles
├── firestore.rules                 ← Firestore security rules
├── firestore.indexes.json          ← Required composite indexes
├── firebase.json                   ← Firebase hosting config
├── vercel.json                     ← Vercel SPA routing
├── vite.config.js
├── tailwind.config.js
├── .env.example                    ← Copy to .env and fill in
└── package.json
```

---

## ⚡ Quick Start (Local Development)

### Step 1 — Clone and install

```bash
git clone <your-repo>
cd jalsetu
npm install
```

### Step 2 — Set up environment variables

```bash
cp .env.example .env
# Now edit .env and fill in all values (see sections below)
```

### Step 3 — Start dev server

```bash
npm run dev
# Opens at http://localhost:5173
```

---

## 🔥 Firebase Setup (Free Tier)

### 1. Create Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → Name it `jalsetu` → Disable Google Analytics (optional) → Create
3. In the left sidebar: **Build → Authentication** → Get Started
   - Enable **Email/Password** provider → Save
4. In the left sidebar: **Build → Firestore Database** → Create Database
   - Choose **"Start in test mode"** (we'll tighten rules later)
   - Select your nearest region (e.g., `asia-south1` for India)

### 2. Get your Firebase config

1. Go to **Project Settings** (gear icon) → **Your Apps** → Click **`</>`** (Web)
2. Name it `jalsetu-web` → Register app
3. Copy the config object — it looks like:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "jalsetu.firebaseapp.com",
  projectId: "jalsetu",
  storageBucket: "jalsetu.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

4. Paste each value into your `.env` file:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=jalsetu.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jalsetu
VITE_FIREBASE_STORAGE_BUCKET=jalsetu.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Deploy Firestore rules and indexes

```bash
# Install Firebase CLI globally (one-time)
npm install -g firebase-tools

# Login
firebase login

# Initialize (select your project)
firebase use --add

# Deploy rules + indexes
firebase deploy --only firestore
```

### 4. Create your admin account

1. Run the app locally: `npm run dev`
2. Go to `/auth` → Sign Up → use **Customer** role
3. Go to Firebase Console → Firestore → `users` collection
4. Find your document → Edit `role` field → Change to `"admin"`
5. Set `VITE_ADMIN_EMAIL=your@email.com` in `.env`

---

## 🗺️ Google Maps API Setup (Free Tier)

### 1. Create API key

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to **APIs & Services → Library**
4. Enable these APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Places API**
5. Go to **APIs & Services → Credentials**
6. Click **Create Credentials → API Key**
7. Copy the key → Paste into `.env`:

```env
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

### 2. Restrict the API key (important for production!)

In Credentials → Edit your API key:
- **Application restrictions**: HTTP referrers → Add `yourdomain.com/*` and `localhost:5173/*`
- **API restrictions**: Restrict to Maps JavaScript API + Geocoding API + Places API

### 3. Free tier limits

Google Maps gives $200/month free credit which covers:
- ~40,000 map loads/month
- ~40,000 geocoding requests/month

This is more than enough to start.

---

## 🚀 Deployment

### Option A — Vercel (Recommended, Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
3. Framework preset: **Vite**
4. Add all environment variables from your `.env` in the Vercel dashboard
5. Click **Deploy** ✅

Your app will be live at `https://jalsetu.vercel.app` (or custom domain)

### Option B — Firebase Hosting (Alternative)

```bash
# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

---

## 🗃️ Database Structure

### `users` collection
```
users/{uid}
  uid:        string
  name:       string
  email:      string
  phone:      string
  role:       "customer" | "vendor" | "admin"
  createdAt:  timestamp
```

### `vendors` collection
```
vendors/{uid}
  uid:          string
  name:         string
  email:        string
  phone:        string
  city:         string
  location:     { lat: number, lng: number }
  base_price:   number   (₹ per 20L can)
  floor_charge: number   (₹ per floor)
  time_slots:   ["morning", "evening"]
  is_online:    boolean
  is_verified:  boolean
  createdAt:    timestamp
```

### `orders` collection
```
orders/{auto-id}
  customerId:     string
  customerName:   string
  customerPhone:  string
  vendorId:       string | null
  address:        string
  location:       { lat: number, lng: number }
  quantity:       "20L" | "40L"
  floor:          number
  timeSlot:       "morning" | "evening"
  priceBreakdown: { basePrice, floorCharge, floorTotal, totalPrice }
  totalPrice:     number
  status:         "searching" | "accepted" | "on_the_way" | "delivered" | "rejected"
  createdAt:      timestamp
  updatedAt:      timestamp
```

---

## 🧩 How the Matching System Works

1. Customer places order → Firestore document created with `status: "searching"`
2. All online, verified vendors receive the order via **Firestore real-time listener** (`onSnapshot`)
3. Vendor dashboard shows new order card with **Accept / Reject** buttons
4. First vendor to click Accept → `status` updates to `"accepted"`, `vendorId` is set
5. The order is now **locked** — other vendors see it disappear from their queue
6. Vendor marks **On the Way** → `status: "on_the_way"`
7. Vendor marks **Delivered** → `status: "delivered"`
8. Customer's status page updates **in real-time** at every step

---

## 📱 App Flow

```
Customer:
  / (Home) → /order (Order Form) → /order/status/:id (Live Tracking)

Vendor:
  /auth (Login/Signup) → /vendor (Dashboard)
    - Toggle online/offline
    - Accept/reject incoming orders
    - Mark on the way / delivered
    - Configure pricing & time slots

Admin:
  /admin (Panel)
    - Approve/reject vendors
    - View all orders
    - Remove bad actors
```

---

## 📞 Support Buttons

Update WhatsApp and phone numbers in:
- `src/components/shared/Footer.jsx` → `WHATSAPP_NUMBER` and `SUPPORT_PHONE`
- `src/pages/OrderStatusPage.jsx` → WhatsApp href

---

## 🔧 Customization

| What to change | Where |
|---|---|
| Base prices | `src/pages/OrderPage.jsx` → `BASE_PRICES` |
| Default floor charge | `src/pages/OrderPage.jsx` → `FLOOR_CHARGE` |
| App name/branding | `src/components/shared/Navbar.jsx` |
| Colors | `tailwind.config.js` → `jal` palette |
| Admin email | `.env` → `VITE_ADMIN_EMAIL` |
| WhatsApp number | `src/components/shared/Footer.jsx` |
| Search radius (km) | `src/pages/OrderPage.jsx` → `getNearbyVendors(..., 5)` |

---

## ✅ Launch Checklist

- [ ] Firebase project created, Auth + Firestore enabled
- [ ] `.env` file filled with real credentials
- [ ] Firestore rules deployed (`firebase deploy --only firestore`)
- [ ] Admin account created and `role` set to `"admin"` in Firestore
- [ ] Google Maps API key added and restricted
- [ ] WhatsApp/phone support numbers updated
- [ ] Deployed to Vercel with env vars set
- [ ] First vendor signed up and approved via Admin Panel
- [ ] Test order placed end-to-end ✅

---

## 🆓 Free Tier Summary

| Service | Free Limit | Sufficient for |
|---|---|---|
| Firebase Auth | 10,000 users/month | ✅ Full MVP |
| Firestore | 50,000 reads/day, 20,000 writes/day | ✅ ~500 orders/day |
| Google Maps | $200 credit/month | ✅ ~40,000 requests |
| Vercel | 100GB bandwidth/month | ✅ Thousands of users |

---

Built with ❤️ for India's water delivery ecosystem.
