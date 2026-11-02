# Velune Letters · how to put it online

No Lovable, no terminal. Everything below is clicking in websites. All the services are free to start; you only pay Stripe a small fee per sale.

| What | Service | Cost |
|---|---|---|
| Website hosting | Cloudflare Pages | Free |
| Database, logins, photos | Supabase | Free plan |
| Payments | Stripe | ~1.5–3% per sale |
| Emails to couples (optional) | Resend | Free up to 3,000/month |

---

## Step 1 · Put the site online (demo mode, 5 minutes)

1. Unzip `velune-letters.zip` on your computer.
2. Go to **dash.cloudflare.com** → create a free account.
3. Left menu: **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
4. Project name: `velune-letters` → drag the unzipped **velune-letters** folder in → **Deploy**.
5. You get an address like `velune-letters.pages.dev`. Open it.

It already works in **demo mode**: you can design, add guests, "pay" and reply. Everything is saved only in your own browser.

> To update the site later: Cloudflare → your project → **Create deployment** → drag the folder in again.
> If Cloudflare doesn't show "Upload assets", use **app.netlify.com/drop** instead: drag the folder onto the page and it works the same way.

---

## Step 2 · Database and logins (Supabase, 10 minutes)

1. Go to **supabase.com** → **New project**. Name: `velune-letters`. Region: **Frankfurt (eu-central-1)**. Save the database password somewhere safe.
2. When it's ready: left menu **SQL Editor** → **New query**.
3. Open `supabase/schema.sql` from the folder (Notepad is fine), copy everything, paste, press **Run**. You should see "Success".
4. Left menu **Authentication** → **URL Configuration**:
   - **Site URL**: `https://velune-letters.pages.dev` (your address from step 1)
   - **Redirect URLs** → add: `https://velune-letters.pages.dev/**`
5. Left menu **Project Settings** → **API**. Copy the **Project URL** and the **anon public** key.
6. Open `assets/config.js` in Notepad and paste them:
   ```js
   SUPABASE_URL: "https://xxxx.supabase.co",
   SUPABASE_ANON_KEY: "eyJhbGciOi...",
   ```
7. Upload the folder to Cloudflare again (see the tip in step 1). The yellow "Demo mode" bar is now gone.

### Make yourself admin

1. Open `your-site/studio.html` and log in with **lidjoakim@gmail.com** (you get an email link).
2. In Supabase **SQL Editor**, run this one line:
   ```sql
   insert into public.admins(user_id) select id from auth.users where email = 'lidjoakim@gmail.com' on conflict do nothing;
   ```
3. Refresh the studio. An **Admin** link appears in the top menu: revenue, every couple, and a **Give** button to publish an invitation for free (for Velune Weddings couples).

---

## Step 3 · Payments (Stripe, 15 minutes)

1. Create an account at **stripe.com**. Stay in **Test mode** (switch top right) until everything works.
2. Stripe → **Developers** → **API keys** → copy the **Secret key** (`sk_test_…`).
3. Supabase → **Edge Functions** → **Deploy a new function** → **Via Editor**:
   - Name: `create-checkout`. Delete the example code, paste everything from `supabase/functions/create-checkout/index.ts` → **Deploy**.
   - Again: name `stripe-webhook`, paste `supabase/functions/stripe-webhook/index.ts` → **Deploy**. Then open its **Details/Settings** and turn **Verify JWT** **OFF** → Save.
4. Supabase → **Edge Functions** → **Secrets** → add:
   - `STRIPE_SECRET_KEY` = your `sk_test_…` key
   - `SITE_URL` = `https://velune-letters.pages.dev`
5. Stripe → **Developers** → **Webhooks** → **Add endpoint**:
   - URL: `https://xxxx.supabase.co/functions/v1/stripe-webhook` (your Supabase project URL + `/functions/v1/stripe-webhook`)
   - Event: `checkout.session.completed` → **Add endpoint**
   - Copy the **Signing secret** (`whsec_…`) → add it in Supabase Secrets as `STRIPE_WEBHOOK_SECRET`.
6. Test: create an invitation in the studio → **Publish** → pay with card `4242 4242 4242 4242`, any future date, any CVC. You come back to the studio and the invitation turns **Live**.
7. When it all works: switch Stripe to **Live mode**, repeat steps 2, 4 and 5 with the live keys.

---

## Step 4 · Emails (do this before real customers)

Supabase's built-in email only sends a few login emails per hour. For real use:

1. Create an account at **resend.com**, add your domain, create an **API key**.
2. Supabase → **Authentication** → **Emails** → **SMTP Settings** → enable custom SMTP:
   Host `smtp.resend.com`, port `465`, user `resend`, password = your Resend API key, sender `hello@veluneletters.com`.

**Optional: email the couple when a guest replies**

1. Deploy `supabase/functions/notify-rsvp/index.ts` the same way as in step 3 (keep Verify JWT **ON**).
2. Secrets: `RESEND_API_KEY`, `MAIL_FROM` = `Velune Letters <hello@veluneletters.com>`.
3. Supabase → **Database** → **Webhooks** → **Create**: table `rsvps`, events **Insert** and **Update**, type **Supabase Edge Functions**, function `notify-rsvp`.

---

## Step 5 · Your own domain

1. Buy `veluneletters.com` (Cloudflare Registrar is cheapest, or one.com).
2. Cloudflare Pages → your project → **Custom domains** → add it.
3. Update the address in three places: `SITE_URL` in `assets/config.js`, `SITE_URL` in Supabase Secrets, and the two URLs in Supabase **Authentication → URL Configuration**.

---

## What's in the folder

| File | What it is |
|---|---|
| `index.html` | The public sales page |
| `studio.html` | Where couples log in, design, add guests, see replies and pay |
| `admin.html` | Your dashboard: revenue, couples, free plans |
| `i/index.html` | The invitation guests open (`/i/?their-link`) |
| `assets/config.js` | Your keys and prices |
| `supabase/schema.sql` | The database, with security rules |
| `supabase/functions/` | Payments and emails |

Prices live in two places: `assets/config.js` (what the site shows) and `supabase/functions/create-checkout/index.ts` (what Stripe charges). Change both together.

## Security, in short

- Couples only ever see their own invitations, guests and replies.
- Nobody can publish or change their plan without a real Stripe payment (the database blocks it, not only the website).
- Guests can only open invitations that are live and send replies. They can't read other guests' replies.
- The link is locked once an invitation is paid, so links already sent keep working.
