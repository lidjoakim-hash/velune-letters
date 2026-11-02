// Velune Letters · owner dashboard
import { api, LIVE } from "./api.js";
import { PLANS, PLAN_ORDER, inviteUrl } from "./config.js";
import { esc } from "./invite.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const app = $("#app");
const euro = (c) => "€" + (c / 100).toLocaleString("en-GB", { maximumFractionDigits: 0 });
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2400); }
let rows = [], filter = "", statusF = "all";

async function boot() {
  if (!LIVE) $("#demo-banner").hidden = false;
  $("#nav-studio").hidden = false;
  const user = await api.user().catch(() => null);
  if (!user) { app.innerHTML = `<div class="wrap"><div class="center-card"><h1>Admin</h1><p>Log in through the studio first.</p><a class="btn primary" href="studio.html" style="margin-top:18px">Go to the studio</a></div></div>`; return; }
  $("#nav-out").hidden = false;
  $("#nav-out").onclick = async () => { await api.signOut(); location.href = "studio.html"; };
  if (!(await api.isAdmin().catch(() => false))) { app.innerHTML = `<div class="wrap"><div class="center-card"><h1>Admins only</h1><p>${esc(user.email)} is not an admin. Add yourself with the last line of supabase/schema.sql.</p></div></div>`; return; }
  load();
}
async function load() {
  app.innerHTML = `<div class="wrap app"><div class="empty">Loading…</div></div>`;
  try { rows = await api.adminOverview(); } catch (e) { app.innerHTML = `<div class="wrap app"><p class="msg err">${esc(e.message)}</p></div>`; return; }
  render();
}
function render() {
  const paid = rows.filter((r) => r.paid_at && !r.comp), live = rows.filter((r) => r.status === "live");
  const revenue = rows.reduce((a, r) => a + Number(r.revenue || 0), 0);
  const month = new Date().toISOString().slice(0, 7);
  const monthRev = rows.filter((r) => (r.paid_at || "").startsWith(month)).reduce((a, r) => a + Number(r.revenue || 0), 0);
  const byPlan = PLAN_ORDER.map((p) => rows.filter((r) => r.plan === p).length);
  const f = filter.toLowerCase();
  const shown = rows.filter((r) => (statusF === "all" || (statusF === "paid" ? r.paid_at : r.status === statusF)) && (!f || [r.couple, r.email, r.slug].join(" ").toLowerCase().includes(f)));
  app.innerHTML = `<div class="wrap app">
    <div class="app-head"><div><p class="eyebrow">Velune Letters</p><h1>Business overview</h1></div><button class="btn small" id="reload">Refresh</button></div>
    <div class="tiles" style="margin-top:0">
      <div class="tile"><div class="k">Revenue</div><div class="v">${euro(revenue)}</div><div class="x">${euro(monthRev)} this month</div></div>
      <div class="tile"><div class="k">Paying couples</div><div class="v">${paid.length}</div><div class="x">${rows.filter((r) => r.comp).length} gifted</div></div>
      <div class="tile"><div class="k">Live invitations</div><div class="v">${live.length}</div><div class="x">${rows.length - live.length} drafts or paused</div></div>
      <div class="tile"><div class="k">Guests replied</div><div class="v">${rows.reduce((a, r) => a + Number(r.replies || 0), 0)}</div><div class="x">${rows.reduce((a, r) => a + Number(r.coming || 0), 0)} coming in total</div></div>
    </div>
    <div class="panel"><h2>Plans sold</h2><div class="legend">${PLAN_ORDER.map((p, i) => `<span>${esc(PLANS[p].name)} · ${byPlan[i]}</span>`).join("")}<span>Drafts · ${rows.filter((r) => !r.plan).length}</span></div>
      <p class="hint">Drafts are couples who started but haven't paid. They're your warmest leads: email them.</p></div>
    <div class="toolbar">
      <input class="search" id="q" placeholder="Search couple, email or link" value="${esc(filter)}" aria-label="Search">
      <div class="chips">${[["all", "All"], ["paid", "Paid"], ["live", "Live"], ["draft", "Drafts"]].map(([k, l]) => `<button class="chip" data-f="${k}" aria-pressed="${statusF === k}">${l}</button>`).join("")}</div>
    </div>
    <div class="tablewrap"><table style="min-width:900px"><thead><tr><th>Couple</th><th>Email</th><th>Wedding</th><th>Status</th><th>Plan</th><th>Paid</th><th>Guests</th><th>Replies</th><th>Give plan</th></tr></thead><tbody>
    ${shown.map((r) => `<tr><td><a href="${esc(inviteUrl(r.slug))}" target="_blank" rel="noopener" style="color:inherit">${esc(r.couple || "–")}</a><div class="gstat">${esc(r.slug)}</div></td>
      <td>${r.email ? `${esc(r.email)}` : "–"}</td><td class="num">${esc(r.wedding_date || "–")}</td>
      <td><span class="st ${r.status}">${r.status === "live" ? "Live" : r.paid_at ? "Paused" : "Draft"}</span></td>
      <td>${r.plan ? esc(PLANS[r.plan].name) + (r.comp ? " · gifted" : "") : "–"}${r.requested && r.requested !== r.plan ? `<div class="gstat opened">Requested / paid ${esc(PLANS[r.requested] ? PLANS[r.requested].name : r.requested)}</div>` : ""}</td><td class="num">${euro(Number(r.revenue || 0))}</td>
      <td class="num">${r.guests}</td><td class="num">${r.replies} <span class="gstat">(${r.coming} coming)</span></td>
      <td><div style="display:flex;gap:6px"><select data-plan="${r.id}" data-req="${esc(r.requested || "")}" aria-label="Plan" style="border:1px solid var(--line);background:var(--bg);border-radius:8px;padding:.3em">${PLAN_ORDER.map((p) => `<option value="${p}" ${p === (r.requested || r.plan || "signature") ? "selected" : ""}>${esc(PLANS[p].name)}</option>`).join("")}</select><button class="btn small" data-give="${r.id}">Give</button></div></td></tr>`).join("") || `<tr><td colspan="9" class="empty">No invitations match.</td></tr>`}
    </tbody></table></div>
    <p class="hint" style="margin-top:12px">"Give" publishes an invitation for free, for example for Velune Weddings couples. Real payments come in through Stripe automatically.</p>
  </div>`;
  $("#reload").onclick = load;
  const q = $("#q"); q.oninput = () => { filter = q.value; const pos = q.selectionStart; render(); const n = $("#q"); n.focus(); n.setSelectionRange(pos, pos); };
  $$("[data-f]").forEach((b) => (b.onclick = () => { statusF = b.dataset.f; render(); }));
  $$("[data-give]").forEach((b) => (b.onclick = async () => {
    const plan = $(`[data-plan="${b.dataset.give}"]`).value;
    try { await api.adminSetPlan(b.dataset.give, plan, !b.closest("tr").querySelector("[data-req]").dataset.req); toast(`${PLANS[plan].name} given and published`); load(); } catch (e) { toast(e.message); }
  }));
}
boot();
