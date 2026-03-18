# Arif Gebeya 🛒

Ethiopia's free classifieds marketplace. Buy and sell cars, phones, electronics, property, and more — peer-to-peer with WhatsApp/phone contact.

## Tech Stack
- **Next.js 15** (App Router, TypeScript)
- **Supabase** (Auth, PostgreSQL, Storage)
- **Plain CSS** (no Tailwind — custom design system)
- **Lucide React** (icons)

## Features (MVP)
- ✅ Browse listings with search + filters (category, city, price, condition)
- ✅ Post ads with up to 8 photos
- ✅ Contact seller via phone or WhatsApp
- ✅ User auth (email + password)
- ✅ Dashboard — manage your listings (edit, delete, pause)
- ✅ Seller profiles
- ✅ Report listings
- ✅ Verified seller badges
- ✅ ETB / USD currency support
- ✅ Mobile-first responsive design
- ✅ Featured listings support

## Local Setup

```bash
# 1. Install deps
npm install

# 2. Set environment variables
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key

# 3. Run dev server
npm run dev
```

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full contents of `supabase/migrations/001_initial_schema.sql`
3. Go to **Authentication → URL Configuration** and add:
   - Site URL: `http://localhost:3000` (dev) or your Vercel URL
   - Redirect URL: `http://localhost:3000/auth/callback`
4. Copy your **Project URL** and **anon key** into `.env.local`

## Deploy to Vercel

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit — Arif Gebeya"
git remote add origin https://github.com/YOUR_USERNAME/arif-gebeya.git
git branch -M main
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo

3. Set environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`

4. Deploy!

5. After deploy, update Supabase → Authentication → URL Configuration:
   - Add `https://your-app.vercel.app/auth/callback` as a redirect URL

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Homepage
│   ├── browse/page.tsx          # Browse + filter
│   ├── listings/
│   │   ├── [id]/page.tsx        # Listing detail
│   │   ├── new/page.tsx         # Post listing
│   │   └── edit/[id]/page.tsx   # Edit listing
│   ├── dashboard/page.tsx       # User dashboard
│   ├── profile/page.tsx         # Edit profile
│   ├── seller/[id]/page.tsx     # Public seller page
│   └── auth/
│       ├── login/page.tsx
│       ├── signup/page.tsx
│       └── callback/route.ts
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── listings/
│       ├── ListingCard.tsx
│       ├── ListingForm.tsx
│       ├── HomeSearch.tsx
│       ├── BrowseFilters.tsx
│       ├── ImageGallery.tsx
│       ├── DashActions.tsx
│       └── ReportModal.tsx
├── lib/supabase/
│   ├── client.ts
│   └── server.ts
└── types/index.ts
```
