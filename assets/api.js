// Velune Letters · data layer
// Live mode talks to Supabase. Demo mode keeps everything in this browser.
import { CONFIG, siteUrl } from "./config.js";
import { DEFAULT_DATA, clone } from "./invite.js";

export const LIVE = !!(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);

let sb = null;
async function client() {
  if (sb) return sb;
  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm");
  sb = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, { auth: { persistSession: true, detectSessionInUrl: true } });
  return sb;
}
function check({ data, error }) {
  if (error) {
    if (error.code === "23505") throw new Error("That link is already taken. Try another one.");
    throw new Error(error.message || "Something went wrong.");
  }
  return data;
}

/* ===================== demo store ===================== */
const KEY = "vl-demo-db";
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
const code = () => Math.random().toString(36).slice(2, 12);
function load() {
  try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && v.invitations) return v; } catch (e) {}
  return { user: null, invitations: [], guests: [], rsvps: [], payments: [] };
}
function persist(db) { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { throw new Error("Your browser storage is full. Remove some photos and try again."); } }
const now = () => new Date().toISOString();

export const DEMO_EXAMPLE = {
  id: "demo", slug: "demo", plan: "signature", status: "live",
  data: Object.assign(clone(DEFAULT_DATA), { theme: "tuscany" }),
};

/* ===================== API ===================== */
export const api = {
  live: LIVE,

  /* ---- auth ---- */
  async user() {
    if (!LIVE) return load().user;
    const c = await client(); const { data } = await c.auth.getSession();
    return data.session ? { id: data.session.user.id, email: data.session.user.email } : null;
  },
  async onAuth(cb) {
    if (!LIVE) return;
    const c = await client();
    c.auth.onAuthStateChange((_e, s) => cb(s ? { id: s.user.id, email: s.user.email } : null));
  },
  async signIn(email) {
    if (!LIVE) { const db = load(); db.user = { id: "demo-user", email }; persist(db); return { demo: true }; }
    const c = await client();
    check(await c.auth.signInWithOtp({ email, options: { emailRedirectTo: siteUrl() + "/studio.html" } }));
    return { sent: true };
  },
  async signOut() {
    if (!LIVE) { const db = load(); db.user = null; persist(db); return; }
    const c = await client(); await c.auth.signOut();
  },
  async isAdmin() {
    if (!LIVE) return true;
    const c = await client(); return !!check(await c.rpc("is_admin"));
  },

  /* ---- invitations ---- */
  async listInvitations() {
    if (!LIVE) {
      const db = load();
      return db.invitations.map((i) => Object.assign({}, i, {
        replies: db.rsvps.filter((r) => r.invitation_id === i.id).length,
        coming: db.rsvps.filter((r) => r.invitation_id === i.id && r.attending).reduce((a, r) => a + r.party, 0),
      })).sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    const c = await client();
    const rows = check(await c.from("invitations").select("*, rsvps(attending, party)").order("created_at", { ascending: false }));
    return rows.map((i) => Object.assign(i, { replies: i.rsvps.length, coming: i.rsvps.filter((r) => r.attending).reduce((a, r) => a + r.party, 0) }));
  },
  async getInvitation(id) {
    if (!LIVE) { const i = load().invitations.find((x) => x.id === id); if (!i) throw new Error("Invitation not found."); return i; }
    const c = await client(); return check(await c.from("invitations").select("*").eq("id", id).single());
  },
  async createInvitation(slug, data) {
    if (!LIVE) {
      const db = load();
      if (db.invitations.some((i) => i.slug === slug)) throw new Error("That link is already taken. Try another one.");
      const row = { id: uuid(), slug, data, plan: null, status: "draft", paid_at: null, comp: false, created_at: now(), updated_at: now(), owner_email: db.user && db.user.email };
      db.invitations.push(row); persist(db); return row;
    }
    const c = await client(); return check(await c.from("invitations").insert({ slug, data }).select().single());
  },
  async updateInvitation(id, patch) {
    if (!LIVE) {
      const db = load(); const i = db.invitations.find((x) => x.id === id);
      if (!i) throw new Error("Invitation not found.");
      if (patch.slug && patch.slug !== i.slug) {
        if (i.paid_at) throw new Error("The link can't change after publishing.");
        if (db.invitations.some((x) => x.slug === patch.slug && x.id !== id)) throw new Error("That link is already taken. Try another one.");
      }
      if (patch.status === "live" && !i.paid_at) delete patch.status;
      Object.assign(i, patch, { updated_at: now() }); persist(db); return i;
    }
    const c = await client(); return check(await c.from("invitations").update(patch).eq("id", id).select().single());
  },
  async deleteInvitation(id) {
    if (!LIVE) { const db = load(); db.invitations = db.invitations.filter((i) => i.id !== id); db.guests = db.guests.filter((g) => g.invitation_id !== id); db.rsvps = db.rsvps.filter((r) => r.invitation_id !== id); persist(db); return; }
    const c = await client(); check(await c.from("invitations").delete().eq("id", id));
  },

  /* ---- guests ---- */
  async listGuests(invId) {
    if (!LIVE) return load().guests.filter((g) => g.invitation_id === invId).sort((a, b) => a.created_at.localeCompare(b.created_at));
    const c = await client(); return check(await c.from("guests").select("*").eq("invitation_id", invId).order("created_at"));
  },
  async addGuests(invId, rows) {
    rows = rows.map((r) => ({ invitation_id: invId, name: String(r.name).slice(0, 120), party: Math.max(1, Math.min(20, +r.party || 1)), contact: (r.contact || "").slice(0, 200) || null }));
    if (!LIVE) { const db = load(); const out = rows.map((r) => Object.assign({ id: uuid(), code: code(), opened_at: null, open_count: 0, created_at: now() }, r)); db.guests.push(...out); persist(db); return out; }
    const c = await client(); return check(await c.from("guests").insert(rows).select());
  },
  async updateGuest(id, patch) {
    if (!LIVE) { const db = load(); const g = db.guests.find((x) => x.id === id); Object.assign(g, patch); persist(db); return g; }
    const c = await client(); return check(await c.from("guests").update(patch).eq("id", id).select().single());
  },
  async deleteGuest(id) {
    if (!LIVE) { const db = load(); db.guests = db.guests.filter((g) => g.id !== id); db.rsvps.forEach((r) => { if (r.guest_id === id) r.guest_id = null; }); persist(db); return; }
    const c = await client(); check(await c.from("guests").delete().eq("id", id));
  },

  /* ---- replies ---- */
  async listRsvps(invId) {
    if (!LIVE) return load().rsvps.filter((r) => r.invitation_id === invId).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    const c = await client(); return check(await c.from("rsvps").select("*").eq("invitation_id", invId).order("updated_at", { ascending: false }));
  },
  async deleteRsvp(id) {
    if (!LIVE) { const db = load(); db.rsvps = db.rsvps.filter((r) => r.id !== id); persist(db); return; }
    const c = await client(); check(await c.from("rsvps").delete().eq("id", id));
  },

  /* ---- public (guests) ---- */
  async publicInvitation(slug, gcode) {
    if (slug === "demo") return { ...clone(DEMO_EXAMPLE), guest: null, rsvp: null }; // reserved public example
    if (!LIVE) {
      const db = load(); const i = db.invitations.find((x) => x.slug === slug);
      if (!i || i.status !== "live") return null;
      let guest = null, rsvp = null;
      if (gcode) {
        const g = db.guests.find((x) => x.code === gcode && x.invitation_id === i.id);
        if (g) { g.opened_at = g.opened_at || now(); g.open_count++; persist(db); guest = { name: g.name, party: g.party }; rsvp = db.rsvps.find((r) => r.guest_id === g.id) || null; }
      }
      return { id: i.id, slug: i.slug, plan: i.plan, data: i.data, guest, rsvp };
    }
    const c = await client();
    const res = check(await c.rpc("get_invitation", { p_slug: slug, p_code: gcode || null }));
    if (!res && slug === "demo") return { ...clone(DEMO_EXAMPLE), guest: null, rsvp: null };
    return res;
  },
  async submitRsvp(slug, gcode, p) {
    if (slug === "demo") return { ok: true, demo: true }; // the public example never stores replies
    if (!LIVE) {
      const db = load(); const i = db.invitations.find((x) => x.slug === slug);
      if (!i) throw new Error("This invitation is not open for replies.");
      const g = gcode ? db.guests.find((x) => x.code === gcode && x.invitation_id === i.id) : null;
      const row = { invitation_id: i.id, guest_id: g ? g.id : null, name: p.name, attending: p.attending, party: p.party, meal: p.meal, note: p.note, lang: p.lang, updated_at: now() };
      const existing = g && db.rsvps.find((r) => r.guest_id === g.id);
      if (existing) Object.assign(existing, row); else db.rsvps.push(Object.assign({ id: uuid(), created_at: now() }, row));
      persist(db); return { ok: true };
    }
    const c = await client();
    return check(await c.rpc("submit_rsvp", { p_slug: slug, p_code: gcode || null, p_name: p.name, p_attending: p.attending, p_party: p.party, p_meal: p.meal, p_note: p.note, p_lang: p.lang }));
  },

  // lets a logged-in couple preview their own draft from the guest link
  async ownerInvitationBySlug(slug) {
    if (!LIVE) { const i = load().invitations.find((x) => x.slug === slug); return i ? { id: i.id, slug: i.slug, plan: i.plan, data: i.data, guest: null, rsvp: null, draft: i.status !== "live" } : null; }
    const u = await api.user(); if (!u) return null;
    const c = await client(); const { data } = await c.from("invitations").select("id,slug,plan,data,status").eq("slug", slug).maybeSingle();
    return data ? { id: data.id, slug: data.slug, plan: data.plan, data: data.data, guest: null, rsvp: null, draft: data.status !== "live" } : null;
  },

  /* ---- photos ---- */
  async uploadPhoto(invId, file) {
    const blob = await resize(file, LIVE ? 1600 : 900, LIVE ? 0.85 : 0.78);
    if (!LIVE) return await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
    const c = await client(); const u = await api.user();
    const path = `${u.id}/${invId}/${Date.now()}.jpg`;
    check(await c.storage.from("photos").upload(path, blob, { contentType: "image/jpeg", upsert: false }));
    return c.storage.from("photos").getPublicUrl(path).data.publicUrl;
  },
  async deletePhoto(url) {
    if (!LIVE || !url.includes("/storage/v1/object/public/photos/")) return;
    const c = await client(); await c.storage.from("photos").remove([url.split("/storage/v1/object/public/photos/")[1]]);
  },

  /* ---- payments ---- */
  async checkout(invId, plan) {
    if (!LIVE) {
      const db = load(); const i = db.invitations.find((x) => x.id === invId);
      const prices = { essential: 6900, signature: 7900, atelier: 39000 };
      const paidBefore = i.paid_at && i.plan ? prices[i.plan] : 0;
      db.payments.push({ id: uuid(), invitation_id: invId, plan, amount: prices[plan] - paidBefore, created_at: now() });
      Object.assign(i, { plan, paid_at: i.paid_at || now(), status: "live" }); persist(db);
      return { demo: true };
    }
    const link = CONFIG.PAYMENT_LINKS && CONFIG.PAYMENT_LINKS[plan];
    if (link) {
      const c0 = await client(); const { data: u } = await c0.auth.getUser();
      const email = u && u.user && u.user.email;
      return { url: `${link}?client_reference_id=${encodeURIComponent(invId)}${email ? "&prefilled_email=" + encodeURIComponent(email) : ""}`, link: true };
    }
    const c = await client();
    const { data, error } = await c.functions.invoke("create-checkout", { body: { invitation_id: invId, plan } });
    if (error) {
      let msg = error.message;
      try { const b = await error.context.json(); if (b && b.error) msg = b.error; } catch (e) {}
      throw new Error(msg);
    }
    if (data && data.error) throw new Error(data.error);
    return { url: data.url };
  },

  /* ---- admin ---- */
  async adminOverview() {
    if (!LIVE) {
      const db = load();
      return db.invitations.map((i) => ({
        id: i.id, slug: i.slug, status: i.status, plan: i.plan, comp: i.comp, paid_at: i.paid_at, created_at: i.created_at,
        email: i.owner_email || "demo@example.com", couple: `${i.data.p1} & ${i.data.p2}`, wedding_date: i.data.date, requested: i.data.request && i.data.request.plan,
        revenue: db.payments.filter((p) => p.invitation_id === i.id).reduce((a, p) => a + p.amount, 0),
        guests: db.guests.filter((g) => g.invitation_id === i.id).length,
        replies: db.rsvps.filter((r) => r.invitation_id === i.id).length,
        coming: db.rsvps.filter((r) => r.invitation_id === i.id && r.attending).reduce((a, r) => a + r.party, 0),
      })).sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    const c = await client(); return check(await c.rpc("admin_overview"));
  },
  async adminSetPlan(id, plan, comp) {
    if (!LIVE) { const db = load(); const i = db.invitations.find((x) => x.id === id); Object.assign(i, { plan, comp, paid_at: i.paid_at || now(), status: "live" }); persist(db); return; }
    const c = await client(); check(await c.rpc("admin_set_plan", { p_id: id, p_plan: plan, p_comp: comp }));
  },
};

/* ---------- image resize ---------- */
function resize(file, max, q) {
  return new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? res(b) : rej(new Error("Could not read this photo."))), "image/jpeg", q);
    };
    img.onerror = () => rej(new Error("This file is not a photo we can read."));
    img.src = url;
  });
}
