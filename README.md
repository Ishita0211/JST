# 💧 JalSetu — Water Delivery App

A simple water delivery web app built with **Next.js 14**, **Tailwind CSS**, and **Supabase** (realtime database).

---

## 📁 Folder Structure

```
jalsetu/
├── src/
│   ├── app/
│   │   ├── globals.css          ← Global styles + font
│   │   ├── layout.tsx           ← Root layout
│   │   ├── page.tsx             ← Customer order form (/)
│   │   └── vendor/
│   │       └── page.tsx         ← Vendor dashboard (/vendor)
│   └── lib/
│       └── supabase.ts          ← Supabase client + types
├── .env.example                 ← Copy → .env.local and fill in
├── supabase-setup.sql           ← Run this in Supabase SQL Editor
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🚀 Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → "New Project"
2. Note your **Project URL** and **anon key** from:
   - Settings → API → Project URL
   - Settings → API → Project API Keys → `anon public`

### 2. Run the SQL Setup

1. In your Supabase dashboard → **SQL Editor** → **New Query**
2. Paste the contents of `supabase-setup.sql`
3. Click **Run**

### 3. Enable Realtime (if not auto-enabled)

1. In Supabase dashboard → **Database** → **Replication**
2. Under **Tables**, toggle **orders** ON

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Install and Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- **Customer form:** `http://localhost:3000`
- **Vendor dashboard:** `http://localhost:3000/vendor`

---

## ☁️ Deploy to Vercel

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Option B — Vercel Dashboard (easier)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy**

That's it! 🎉

---

## 🔄 How Realtime Works

The vendor page at `/vendor` uses a **Supabase Realtime subscription**:

```ts
supabase
  .channel("orders-realtime")
  .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, callback)
  .subscribe();
```

This means the vendor sees **new orders instantly** without refreshing the page, and status changes update live too.

---

## 📝 Order Flow

```
Customer places order  →  status: "pending"
          ↓
Vendor clicks Accept   →  status: "accepted"
          ↓
Vendor clicks Deliver  →  status: "delivered"
```

---

## 🛠️ Tech Stack

| Tech | Purpose |
|------|---------|
| Next.js 14 App Router | Frontend framework |
| Tailwind CSS | Styling |
| Supabase | Database + Realtime |
| TypeScript | Type safety |
| Vercel | Deployment |
