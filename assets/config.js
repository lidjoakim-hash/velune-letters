// =====================================================================
// Velune Letters · settings
// Leave SUPABASE_URL empty to run in DEMO MODE (everything is saved only
// in your own browser, payments are simulated). Fill both keys to go live.
// Find them in Supabase → Project Settings → API.
// =====================================================================
export const CONFIG = {
  SUPABASE_URL: "https://hotkkzulmgmrmqzmvvsg.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdGtrenVsbWdtcm1xem12dnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTE4OTEsImV4cCI6MjEwOTE2Nzg5MX0.CLRXFqbItKPORWnf6N2DRcXiUYp37c-qVe-a4HCAz0U", // public key, safe here

  // Your website address, without a slash at the end. Leave empty to use
  // whatever address the site is opened from.
  SITE_URL: "https://lidjoakim-hash.github.io/velune-letters",

  // false = no Stripe yet. Couples press "Request" and you publish them
  // from admin.html with the Give button. Set to true once Stripe is set up.
  PAYMENTS: true,

  // Stripe Payment Links, one per plan (LIVE, real payments).
  PAYMENT_LINKS: {
    essential: "https://buy.stripe.com/4gM3cw89H3zu9CZ7jJ5sA01",
    signature: "https://buy.stripe.com/9B6cN689H5HC2axavV5sA00",
    atelier:   "https://buy.stripe.com/28E5kEdu14Dy8yVavV5sA02",
  },

  BRAND: "Velune Letters",
  CONTACT_EMAIL: "hello@veluneletters.com",
};

// Prices are in euro cents. Signature is at the €79 launch price (normally 14900).
// Keep them the same as in
// supabase/functions/create-checkout/index.ts
export const PLANS = {
  essential: { name: "Essential", price: 6900,  features: ["Any of the twelve designs", "One language", "RSVP and guest list", "Personal guest links", "Countdown, schedule and map", "Unlimited guests"] },
  signature: { name: "Signature", price: 7900, features: ["Launch price for the first 20 couples (normally €149)", "Everything in Essential", "All 27 languages", "Satin bow or velvet curtain opening", "Embossed, linen or watercolour paper", "Music box melody", "Photo gallery", "See who opened their invitation", "Guest list export"] },
  atelier:   { name: "Atelier",   price: 39000, features: ["Everything in Signature", "A bespoke design made with our designer", "Two revision rounds", "Wedding film and photos added after the day", "Printable card for guests without phones"] },
};
export const PLAN_ORDER = ["essential", "signature", "atelier"];

// What each plan unlocks inside the invitation. Drafts and the demo show everything.
export function features(plan) {
  const full = { multiLang: true, music: true, gallery: true, opens: true, openings: true };
  if (!plan) return full;
  if (plan === "essential") return { multiLang: false, music: false, gallery: false, opens: false, openings: false };
  return full;
}

export function siteUrl() {
  if (CONFIG.SITE_URL) return CONFIG.SITE_URL.replace(/\/$/, "");
  const p = location.pathname.replace(/\/(i\/)?[^/]*$/, "");
  return location.origin + p;
}
export function inviteUrl(slug, code) {
  return `${siteUrl()}/i/?${slug}${code ? "&g=" + code : ""}`;
}
