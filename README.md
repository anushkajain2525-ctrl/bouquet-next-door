# Bouquet Next Door (BND)

A web app for Delhi NCR that helps you design a bouquet around your girlfriend's preferences, learn what she actually liked, and get seasonal suggestions.

**Live:** https://booking-next-door-bnd.netlify.app

## What it does
- **Her profile:** favourite colours and flowers, flowers to avoid, vibe.
- **Bouquet builder:** pick stems, wrapping and a note card with a live preview and running price (server-side price check).
- **Feedback loop:** on the next visit it asks "Did she like the bouquet?" and stores the answer.
- **Seasonal suggestions:** ranked from her profile, past feedback and the Delhi NCR season.
- **Order at home:** delivery request with address, pincode (Delhi NCR only) and time slot. No payment yet.
- **Intro:** soft blush linen curtains open on "Bouquet Next Door", then shrink to the BND logo in the sticky navbar.

## Stack
Next.js (App Router) · Tailwind CSS · Supabase (Postgres, server-side access only) · Netlify

## Run locally
```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```
Create the tables once: paste `supabase/schema.sql` into the Supabase SQL Editor and run it.

## Environment variables
| Name | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key. Never expose to the browser. |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for metadata |

## Notes
- Identity is a phone number saved in the browser (a lookup key, not a verified login). Row-level security is on with no public policies; all access goes through server routes.
- Flower prices are nominal prototype prices.
