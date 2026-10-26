# KĀYA — online store

A complete e-commerce site for KĀYA: refillable cotton-rag journals with a solid brass spine and hand-loomed Indian fabric covers.
It has a customer storefront and a private admin panel, much like Shopify.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, React Three Fiber (3D), Framer Motion, Zustand and libSQL/SQLite.

## Run it on your computer

```bash
npm install
npm run dev          # http://localhost:3000
```

The first visit creates the database (`data/kaya.db`) and fills it with the full catalogue.

## Store pages

| Page | What it does |
| --- | --- |
| `/` | Home: hero, shop by mood, journals, how the brass spine works, makers, gift set, journal posts, newsletter |
| `/shop` | All products with category tabs, mood filters and sorting |
| `/products/[slug]` | Photo gallery plus an interactive **3D viewer** (drag to turn, open the journal), size and page options, stock levels, delivery estimate by PIN code, reviews, related products, sticky mobile add-to-bag |
| `/story` | Scroll-driven notebook: the cover opens and each spread writes itself in handwriting, with the page colour setting the mood |
| `/makers`, `/journal` | Craft regions, and blog posts |
| `/cart`, `/checkout` | Bag with free-shipping progress; checkout with discount codes, standard or express shipping, COD/UPI/card, gift notes |
| `/order/[number]` | Confirmation and live order status (private link) |
| `/track`, `/account` | Order lookup, plus customer sign-up, sign-in and order history |
| `/search`, `/help`, `/contact`, `/legal/*` | Search, FAQ/shipping/returns, contact form, privacy and terms |

## Admin panel

The admin lives at a **private address** set by `ADMIN_PATH` in `.env.local`. Plain `/admin` returns 404 on purpose.
Sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the same file.

- **Dashboard:** revenue, orders, average order value, conversion rate, sales chart, shopper funnel, low stock, top products, payment mix
- **Orders:** tabs (unfulfilled, unpaid, shipped…), search, CSV export; on each order you can pack, ship with courier and tracking number, mark delivered or paid, refund, cancel (restocks), add notes and print a packing slip
- **Products:** create and edit, upload photos, variants with SKU, price and stock, draft or active, featured
- **Inventory:** add deliveries or set stock, with days-of-cover from the last 30 days of sales
- **Customers:** lifetime spend, order history, repeat and subscriber tags
- **Discounts:** percent, fixed or free-shipping codes with minimums, usage limits and end dates (`WELCOME10` is included)
- **Analytics:** visitors, page views, referrers, devices, product view → add-to-bag rates. Uses the store's own anonymous tracking, no third-party scripts
- **Reviews:** moderate shopper reviews (verified-buyer badge when the email matches an order)
- **Messages:** contact-form inbox and the newsletter list
- **Settings:** store details, shipping prices, free-shipping threshold, COD fee and GST. **Load sample data** fills the dashboard with 60 days of labelled test orders; remove it before launch

## Environment variables (`.env.local`, never committed)

```
ADMIN_PATH=studio-xxxxxxxx      # private admin address
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=a-long-password
SESSION_SECRET=64-random-hex-characters
DATABASE_URL=file:data/kaya.db  # or a libsql:// URL in production
DATABASE_AUTH_TOKEN=            # only for hosted libSQL/Turso
```

## Going live

1. **Database.** Vercel's servers can't keep a local file, so create a free libSQL database (for example Turso) and set `DATABASE_URL` and `DATABASE_AUTH_TOKEN`.
   Alternatively, host on a service with a persistent disk (Railway, Render, a VPS) and keep the file database.
2. **Environment.** Add all the variables above in your host's dashboard, using a new password and secret.
3. **Payments.** UPI and card checkout run in **test mode**: orders are marked paid without charging anything. To take real payments, connect Razorpay or
   Stripe in `checkout()` in `src/app/(store)/actions.ts`: create the payment before `placeOrder`, and mark the order paid from the provider's webhook.
4. **Emails.** Order confirmation emails are not sent yet. Add a provider (Resend, Postmark…) where `placeOrder` succeeds.
5. **Copy to confirm.** Craft descriptions, hand-hour figures, batch sizes, support email and phone, and the legal pages are starting points. Check them before launch.

## Images

- `public/images/fabric/` holds public-domain museum textile scans, cropped into cover textures (the rose jamdani is re-dyed from a real hand-spun weave).
- `public/images/*.jpg` are CC0 or public-domain stock photographs. Sources and licences are in `public/images/CREDITS.json`.
- `public/images/renders/` are 3D product renders of the actual notebook model (`src/components/three/NotebookModel.tsx`).
  To re-render after changing a fabric, open `/render?scene=hero&fabric=dabu` in development (scenes: `hero`, `front`, `open`, `set-wardrobe`, `set-archive`, `refill`, `rod`).
