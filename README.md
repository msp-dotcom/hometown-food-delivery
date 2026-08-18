# Hometown Food Delivery — v1 Scaffold

Real, working codebase for the core loop we designed: **Home → Hotel/Menu → Cart
(multi-hotel, COD/Online) → Track**, plus an **Admin** panel to add hotels and
manage menus.

This was written by hand (not run/tested in a live environment), so double-check
everything on first run — but it follows all the rules we locked in together:
GST + combined delivery fee, max-2-hotels-per-order, quantity steppers, Cash on
Delivery default, no self-cancel button, and an Edit option on every menu item.

## What's NOT built yet (on purpose, per our "Still Open" list)
- WhatsApp send-to-hotel integration (the code has a clear comment marking exactly
  where this plugs in, inside `app/api/orders/route.ts`)
- Customer OTP login (currently just asks for a phone number — add MSG91/similar
  before going live)
- Rider app / Live Delivery dashboard / Settlements exports (these exist as HTML
  prototypes already — not yet wired into this real codebase)
- Payment gateway (Razorpay) — the "Pay Online" option is just a placeholder for now

## Going straight online — the plan (updated)

Good news: since we're skipping local testing, **you don't need `npx prisma migrate dev` or
`npm run seed` to work on your PC at all.** The code is now set up so Vercel builds the
database tables automatically when it deploys — this avoids any local firewall/network
issues on your PC entirely, since Vercel's servers talk to Supabase directly, not your PC.

### 1. Create a Supabase project (your real, online database)
- Go to supabase.com → sign up (free) → "New Project"
- Choose a project name and a database password (save this password somewhere)
- Once created, click the green **"Connect"** button → choose **Session pooler**
  (this is the one that worked for you) → copy the connection string

### 2. Add that connection string to this project
- Open `.env` in this folder
- Replace the `DATABASE_URL` line with the string you copied (fill in your real password,
  remove the `[` `]` brackets, keep the quotes)

### 3. Push this code to GitHub
```bash
git init
git add .
git commit -m "Initial v1"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

### 4. Deploy on Vercel — this builds the database AND makes it live
- Go to vercel.com → sign up (free) with your GitHub account
- Click "Add New Project" → import the GitHub repo you just pushed
- In the project's **Environment Variables**, add `DATABASE_URL` with the same
  Supabase connection string from step 2
- Click Deploy

During this deploy, Vercel automatically runs `prisma migrate deploy`, which builds all
the tables inside your Supabase project — no local command needed. You'll get a real
public URL (e.g. `yourapp.vercel.app`) once it finishes.

### 5. Load the demo data (one-time, after deploy)
The seed script still needs to run once against your live database. Easiest way:
open the Supabase **SQL Editor** and paste the contents of `prisma/seed.sql`
(included in this project) and run it — this avoids your PC's network entirely too.


## 5. Suggested next build steps (in order)
1. Wire up MSG91 (or similar) for real OTP on the phone number field.
2. Add the WhatsApp send in `app/api/orders/route.ts` using a BSP (AiSensy/Interakt).
3. Add Razorpay for the "Pay Online" option.
4. Port the Rider app and Admin's Live Delivery/Settlements sections from the HTML
   prototypes into real pages, backed by the `Rider` and `Order` models already in
   `prisma/schema.prisma`.

## Project structure
```
app/
  page.tsx                  Home (hotel list)
  hotel/[id]/page.tsx        Hotel + menu, add to cart
  cart/page.tsx               Cart, checkout
  track/page.tsx               Order tracking
  admin/page.tsx                Admin: hotels list + add hotel
  admin/menu/[hotelId]/page.tsx  Admin: menu items for one hotel
  api/                            All backend routes (see below)
lib/
  prisma.ts                 Database client
  cart-context.tsx           Cart state (persisted to browser storage)
prisma/
  schema.prisma              Database structure (Hotel, MenuItem, Order, Rider, etc.)
  seed.ts                     Demo data matching our earlier prototypes
```
