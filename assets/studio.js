// Velune Letters · couple studio
import { api, LIVE } from "./api.js";
import { PLANS, PLAN_ORDER, inviteUrl, CONFIG } from "./config.js";
const PAY = !LIVE || CONFIG.PAYMENTS;
const LINKS = LIVE && CONFIG.PAYMENTS && CONFIG.PAYMENT_LINKS;
const pend = { get() { try { return JSON.parse(localStorage.getItem("vl-pay") || "null"); } catch (e) { return null; } }, set(v) { try { v ? localStorage.setItem("vl-pay", JSON.stringify(v)) : localStorage.removeItem("vl-pay"); } catch (e) {} } };
import { T, LANGS, fmtDate } from "./i18n.js";
import { THEMES, draw } from "./themes.js";
import { renderInvite, withDefaults, esc, Music, clone } from "./invite.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const app = $("#app");
const params = new URLSearchParams(location.search);
const euro = (c) => "€" + (c / 100).toLocaleString("en-GB", { minimumFractionDigits: c % 100 ? 2 : 0 });
const RESERVED = ["demo", "admin", "studio", "api", "www", "test"];

function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2600); }
function confirmBox(title, text, okLabel) {
  return new Promise((res) => {
    const m = $("#modal");
    m.innerHTML = `<div class="box" role="dialog" aria-modal="true" aria-labelledby="mt"><h2 id="mt">${esc(title)}</h2><p>${esc(text)}</p><div class="row"><button class="btn small ghost" data-a="0">Cancel</button><button class="btn small danger" data-a="1">${esc(okLabel)}</button></div></div>`;
    m.hidden = false; $("[data-a='0']", m).focus();
    m.onclick = (e) => { const b = e.target.closest("[data-a]"); if (!b && e.target !== m) return; m.hidden = true; res(b ? b.dataset.a === "1" : false); };
  });
}
async function copy(text, msg) {
  try { await navigator.clipboard.writeText(text); toast(msg); }
  catch (e) { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast(msg); } catch (_) { toast("Select the text and copy it"); } ta.remove(); }
}
function download(name, blob) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
const slugify = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ø/g, "o").replace(/æ/g, "ae").replace(/å/g, "a").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

/* ================= state ================= */
let user = null, isAdmin = false;
let inv = null, guests = [], rsvps = [], tab = "design", pollTimer = null;

async function boot() {
  if (!LIVE) $("#demo-banner").hidden = false;
  try { user = await api.user(); } catch (e) { user = null; }
  api.onAuth((u) => { const changed = (u && u.id) !== (user && user.id); user = u; if (changed) start(); });
  start();
}
async function start() {
  Music.stop(); clearInterval(pollTimer);
  $("#nav-out").hidden = !user; $("#nav-list").hidden = !user;
  if (!user) return renderLogin();
  try { isAdmin = await api.isAdmin(); } catch (e) { isAdmin = false; }
  $("#nav-admin").hidden = !isAdmin;
  let id = params.get("id");
  if (!id && params.get("paid") && pend.get()) id = pend.get().id;
  if (id) openWorkspace(id); else renderList();
}
$("#nav-out").onclick = async () => { await api.signOut(); user = null; history.replaceState(null, "", "studio.html"); params.delete("id"); start(); };
$("#nav-list").onclick = (e) => { e.preventDefault(); goList(); };
function goList() { params.delete("id"); history.pushState(null, "", "studio.html"); start(); }
window.addEventListener("popstate", () => { const p = new URLSearchParams(location.search); params.delete("id"); if (p.get("id")) params.set("id", p.get("id")); tab = (location.hash.slice(1) || "design"); start(); });

/* ================= login ================= */
function renderLogin(sentTo) {
  app.innerHTML = `<div class="wrap"><div class="center-card">
    <p class="eyebrow">Velune Letters studio</p>
    <h1>${sentTo ? "Check your email" : "Log in to design"}</h1>
    ${sentTo ? `<p>We sent a login link to <b>${esc(sentTo)}</b>. Open it on this device to continue.</p><button class="btn ghost small" id="again" style="margin-top:20px">Use another email</button>` : `
    <p>No password needed. We email you a link that logs you in.</p>
    <form id="login" novalidate>
      <label class="f">Email<input type="email" id="email" autocomplete="email" required placeholder="you@example.com"></label>
      <p class="msg err" id="lerr" hidden></p>
      <button class="btn primary" type="submit">${LIVE ? "Send me a login link" : "Continue (demo)"}</button>
    </form>`}
  </div></div>`;
  if (sentTo) { $("#again").onclick = () => renderLogin(); return; }
  $("#login").onsubmit = async (e) => {
    e.preventDefault();
    const email = $("#email").value.trim(), err = $("#lerr");
    if (!/^\S+@\S+\.\S+$/.test(email)) { err.textContent = "Please enter a valid email address."; err.hidden = false; return; }
    const b = $("#login button"); b.disabled = true; b.textContent = "Sending…";
    try { const r = await api.signIn(email); if (r.demo) { user = await api.user(); start(); } else renderLogin(email); }
    catch (ex) { err.textContent = ex.message; err.hidden = false; b.disabled = false; b.textContent = "Send me a login link"; }
  };
}

/* ================= list ================= */
async function renderList() {
  app.innerHTML = `<div class="wrap app"><div class="empty">Loading your invitations…</div></div>`;
  let list = [];
  try { list = await api.listInvitations(); } catch (e) { app.innerHTML = `<div class="wrap app"><p class="msg err">${esc(e.message)}</p></div>`; return; }
  if (!list.length && (params.get("theme") || params.get("plan"))) return newInvitation();
  app.innerHTML = `<div class="wrap app">
    <div class="app-head"><div><p class="eyebrow">Your studio</p><h1>My invitations</h1></div><p style="color:var(--muted)">${esc(user.email)}</p></div>
    <div class="cards">
      ${list.map((i) => { const d = withDefaults(i.data); return `<button class="icard" data-id="${i.id}">
        <canvas data-motif="${d.theme}"></canvas>
        <div class="b"><span class="n">${esc(d.p1)} &amp; ${esc(d.p2)}</span>
        <span class="m"><span class="st ${i.status}">${i.status === "live" ? "Live" : i.status === "archived" ? "Archived" : "Draft"}</span>${i.plan ? esc(PLANS[i.plan].name) : "Not published"} · ${esc(fmtDate(d.date, "en", false))}</span>
        <span class="m">${i.replies} ${i.replies === 1 ? "reply" : "replies"} · ${i.coming} coming</span></div></button>`; }).join("")}
      <button class="icard new" id="new"><span>+</span>New invitation</button>
    </div></div>`;
  $$(".icard canvas", app).forEach((c) => draw(c, c.dataset.motif));
  $$(".icard[data-id]", app).forEach((b) => (b.onclick = () => openWorkspace(b.dataset.id, true)));
  $("#new").onclick = newInvitation;
}
async function newInvitation() {
  const data = withDefaults({ theme: THEMES[params.get("theme")] ? params.get("theme") : "tuscany" });
  let slug = slugify(`${data.p1}-${data.p2}`) + "-" + Math.random().toString(36).slice(2, 6);
  try {
    const row = await api.createInvitation(slug, data);
    openWorkspace(row.id, true, params.get("plan") ? "publish" : "details");
  } catch (e) { toast(e.message); }
}

/* ================= workspace ================= */
async function openWorkspace(id, push, startTab) {
  if (push) { params.set("id", id); history.pushState(null, "", `studio.html?id=${id}#${startTab || "design"}`); }
  tab = startTab || location.hash.slice(1) || "design";
  if (!["design", "details", "guests", "replies", "publish"].includes(tab)) tab = "design";
  app.innerHTML = `<div class="wrap app"><div class="empty">Opening…</div></div>`;
  try {
    inv = await api.getInvitation(id);
    inv.data = withDefaults(inv.data);
    [guests, rsvps] = await Promise.all([api.listGuests(id), api.listRsvps(id)]);
  } catch (e) { app.innerHTML = `<div class="wrap app"><p class="msg err">${esc(e.message)}</p><p style="margin-top:14px"><a class="btn small" href="studio.html">Back to my invitations</a></p></div>`; return; }

  if (params.get("paid")) {
    const session = params.get("paid"); params.delete("paid"); history.replaceState(null, "", `studio.html?id=${id}#publish`); tab = "publish";
    if (LINKS) {
      const p = pend.get(); pend.set(null);
      const plan = (p && p.id === id && p.plan) || "signature";
      inv.data.request = { plan, paid: true, session, at: new Date().toISOString() };
      try { await api.updateInvitation(inv.id, { data: inv.data }); } catch (e) {}
      toast("Thank you! Payment received. Your invitation goes live within a few hours.");
    } else waitForPayment();
  }
  renderWorkspace();
}
async function waitForPayment() {
  toast("Payment received. Publishing your invitation…");
  for (let n = 0; n < 8 && !inv.paid_at; n++) {
    await new Promise((r) => setTimeout(r, 2000));
    try { const fresh = await api.getInvitation(inv.id); if (fresh.paid_at) { inv.plan = fresh.plan; inv.paid_at = fresh.paid_at; inv.status = fresh.status; renderWorkspace(); toast("Your invitation is live"); } } catch (e) {}
  }
}

function renderWorkspace() {
  const d = inv.data, live = inv.status === "live";
  const link = inviteUrl(inv.slug);
  const replied = rsvps.length;
  app.innerHTML = `<div class="wrap app">
    <a href="studio.html" id="back" class="navlink" style="padding-left:0">← All invitations</a>
    <div class="ws-top">
      <h1 id="ws-title">${esc(d.p1)} &amp; ${esc(d.p2)}</h1>
      <span class="st ${inv.status}">${live ? "Live" : inv.paid_at ? "Paused" : "Draft"}</span>
      ${inv.plan ? `<span class="tag">${esc(PLANS[inv.plan].name)}${inv.comp ? " · gifted" : ""}</span>` : ""}
      <span class="saving" id="saving" aria-live="polite"></span>
    </div>
    <div class="linkbox" style="margin-top:10px;width:fit-content">
      <code id="link">${esc(link.replace(/^https?:\/\//, ""))}</code>
      <button class="btn small" id="copy-link">Copy</button>
      <a class="btn small ghost" href="${esc(link)}" target="_blank" rel="noopener">${live ? "Open" : "Preview"}</a>
    </div>
    <div class="tabs" role="tablist">
      ${[["design", "Design"], ["details", "Details"], ["guests", "Guests", guests.length], ["replies", "Replies", replied], ["publish", live ? "Share" : "Publish"]].map(([k, l, c]) => `<button role="tab" data-tab="${k}" aria-selected="${tab === k}">${l}${c != null ? `<span class="count">${c}</span>` : ""}</button>`).join("")}
    </div>
    <div class="ws ${["design", "details"].includes(tab) ? "" : "wide"}">
      <div id="pane"></div>
      <div class="preview">
        <div class="phone"><div class="screen" id="screen"><div id="pv"></div></div></div>
        <div class="row"><button class="btn small" id="replay">Replay opening</button><a class="btn small primary" href="${esc(link)}" target="_blank" rel="noopener">Open on full screen</a></div>
        ${!inv.plan ? `<p style="font-size:.8rem;color:var(--muted);text-align:center;max-width:300px">The preview shows every Signature feature. Essential shows one language without music and photos.</p>` : ""}
      </div>
    </div></div>`;
  $("#back").onclick = (e) => { e.preventDefault(); goList(); };
  $("#copy-link").onclick = () => copy(link, "Link copied");
  $$("[data-tab]").forEach((b) => (b.onclick = async () => {
    tab = b.dataset.tab; history.replaceState(null, "", `studio.html?id=${inv.id}#${tab}`);
    if (tab === "guests" || tab === "replies") { try { [rsvps, guests] = await Promise.all([api.listRsvps(inv.id), api.listGuests(inv.id)]); } catch (e) {} }
    renderWorkspace();
  }));
  $("#replay").onclick = () => { Music.stop(); $("#pv").classList.remove("opened"); preview(false); $("#screen").scrollTop = 0; };
  clearInterval(pollTimer);
  ({ design: paneDesign, details: paneDetails, guests: paneGuests, replies: paneReplies, publish: panePublish })[tab]();
  if (["design", "details"].includes(tab)) preview(false);
}

function preview(keep) {
  const pv = $("#pv"); if (!pv) return;
  const sc = $("#screen"), top = sc.scrollTop;
  renderInvite(pv, inv.data, { plan: inv.plan, keepOpen: keep, onRsvp: async () => {}, onLang: (l) => { inv.data.lang = l; change(); } });
  if (keep) requestAnimationFrame(() => (sc.scrollTop = top));
}

/* ---------- autosave ---------- */
let saveT = null;
function change(opts = {}) {
  $("#saving") && ($("#saving").textContent = "Saving…");
  if (!opts.noPreview) { clearTimeout(change._p); change._p = setTimeout(() => preview(true), 180); }
  clearTimeout(saveT);
  saveT = setTimeout(async () => {
    try { await api.updateInvitation(inv.id, { data: inv.data }); $("#saving") && ($("#saving").textContent = "All changes saved"); }
    catch (e) { $("#saving") && ($("#saving").textContent = "Not saved: " + e.message); }
  }, 700);
  const tt = $("#ws-title"); if (tt) tt.innerHTML = `${esc(inv.data.p1)} &amp; ${esc(inv.data.p2)}`;
}
const locked = (feature) => inv.plan === "essential" ? `<p class="hint">${feature} needs Signature. <button class="navlink" data-tab-go="publish" style="border:0;background:none;padding:0;color:var(--accent);cursor:pointer">Upgrade</button></p>` : "";
function bindTabGo(root) { $$("[data-tab-go]", root).forEach((b) => (b.onclick = () => { tab = b.dataset.tabGo; history.replaceState(null, "", `studio.html?id=${inv.id}#${tab}`); renderWorkspace(); })); }

/* ---------- Design ---------- */
function paneDesign() {
  const d = inv.data, ess = inv.plan === "essential";
  const pane = $("#pane");
  pane.innerHTML = `
    <div class="panel" style="margin-top:0"><h2>Design</h2><div class="chips">${Object.entries(THEMES).map(([id, th]) => `<button class="chip" aria-pressed="${id === d.theme}" data-theme="${id}"><span class="sw" style="background:linear-gradient(135deg,${th.v.accent} 50%,${th.v.paper} 50%)"></span>${esc(th.name)}</button>`).join("")}</div>
      <p class="hint" id="theme-tag">${esc(THEMES[d.theme].tag)}</p></div>
    <div class="panel"><h2>Languages</h2>
      <p class="hint" style="margin:0 0 10px">Main language</p>
      <div class="chips">${LANGS.map((l) => `<button class="chip" aria-pressed="${l === d.lang}" data-lang="${l}">${esc(T[l].label)}</button>`).join("")}</div>
      <p class="hint" style="margin:16px 0 10px">Guests can switch between</p>
      <div class="chips">${LANGS.map((l) => `<label class="switch"><input type="checkbox" data-langs="${l}" ${d.langs.includes(l) ? "checked" : ""} ${ess ? "disabled" : ""}>${esc(T[l].label)}</label>`).join("")}</div>
      <p class="hint">Guests see the language of their phone first when you offer it.</p>${locked("Several languages")}</div>
    <div class="panel"><h2>Music</h2><label class="switch"><input type="checkbox" id="music" ${d.music ? "checked" : ""} ${ess ? "disabled" : ""}>Play a music box melody when the seal breaks</label>${locked("Music")}
      <label class="switch" style="margin-top:12px"><input type="checkbox" id="petals" ${d.petals ? "checked" : ""}>Let petals fall when the invitation opens</label>
      <label class="switch" style="margin-top:12px"><input type="checkbox" id="florals" ${d.florals !== false ? "checked" : ""}>Watercolour flowers on the invitation</label></div>
    <div class="panel"><h2>Photos</h2>
      <div class="photos" id="photos">${d.photos.map((p, i) => `<div class="p"><img src="${esc(p)}" alt=""><button data-del="${i}" aria-label="Remove photo">×</button></div>`).join("")}
        ${d.photos.length < 9 ? `<label class="add">+ Add photos<input type="file" accept="image/*" multiple id="addph" ${ess ? "disabled" : ""}></label>` : ""}</div>
      <p class="hint">Up to 9 photos. The first one is shown largest.</p>${locked("The photo gallery")}</div>`;
  $$("[data-theme]", pane).forEach((b) => (b.onclick = () => { d.theme = b.dataset.theme; $$("[data-theme]", pane).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); $("#theme-tag").textContent = THEMES[d.theme].tag; change(); }));
  $$("[data-lang]", pane).forEach((b) => (b.onclick = () => { d.lang = b.dataset.lang; if (!d.langs.includes(d.lang)) d.langs.push(d.lang); paneDesign(); change(); }));
  $$("[data-langs]", pane).forEach((c) => (c.onchange = () => { const l = c.dataset.langs; d.langs = c.checked ? Array.from(new Set([...d.langs, l])) : d.langs.filter((x) => x !== l); if (!d.langs.includes(d.lang)) d.langs.push(d.lang); paneDesign(); change(); }));
  $("#music").onchange = (e) => { d.music = e.target.checked; change(); };
  $("#petals").onchange = (e) => { d.petals = e.target.checked; change(); };
  $("#florals").onchange = (e) => { d.florals = e.target.checked; change(); };
  $$("[data-del]", pane).forEach((b) => (b.onclick = async () => { const [url] = d.photos.splice(+b.dataset.del, 1); paneDesign(); change(); api.deletePhoto(url).catch(() => {}); }));
  const add = $("#addph");
  if (add) add.onchange = async () => {
    const files = Array.from(add.files).slice(0, 9 - d.photos.length);
    $("#saving").textContent = `Uploading ${files.length} ${files.length === 1 ? "photo" : "photos"}…`;
    for (const f of files) { try { d.photos.push(await api.uploadPhoto(inv.id, f)); } catch (e) { toast(e.message); } }
    paneDesign(); change();
  };
  bindTabGo(pane);
}

/* ---------- Details ---------- */
function paneDetails() {
  const d = inv.data, t = T[d.lang], pane = $("#pane");
  const field = (k, label, type = "text", cls = "") => `<label class="f ${cls}">${label}<input type="${type}" id="f-${k}" value="${esc(d[k])}"></label>`;
  pane.innerHTML = `
    <div class="panel" style="margin-top:0"><h2>The couple</h2><div class="fgrid">${field("p1", "First name")}${field("p2", "Second name")}</div></div>
    <div class="panel"><h2>When and where</h2><div class="fgrid">
      ${field("date", "Wedding date", "date")}${field("time", "Ceremony time", "time")}
      ${field("venue", "Venue")}${field("city", "Town and country")}
      ${field("address", "Address for maps", "text", "full")}
      ${field("dress", "Dress code")}${field("rsvpby", "Reply by", "date")}</div></div>
    <div class="panel"><h2>Schedule</h2><div class="sched" id="sched"></div><button class="btn small ghost" id="add-row" style="margin-top:12px">Add a moment</button></div>
    <div class="panel"><h2>Your story</h2><label class="f">A few lines guests will read<textarea id="f-story">${esc(d.story)}</textarea></label></div>
    <div class="panel"><h2>Gifts</h2>
      <label class="switch"><input type="checkbox" id="gifts-on" ${d.showGifts ? "checked" : ""}>Show a gifts section</label>
      <label class="f" style="margin-top:14px">Message (leave empty for our wording in each language)<textarea id="f-giftsText" placeholder="${esc(t.giftsText)}">${esc(d.giftsText)}</textarea></label>
      <label class="f" style="margin-top:14px">Account number, IBAN or registry link (optional)<input id="f-giftsInfo" value="${esc(d.giftsInfo)}" placeholder="IBAN RO49 AAAA 1B31 0075 9384 0000"></label></div>
    <div class="panel"><h2>Replies</h2>
      <label class="switch"><input type="checkbox" id="meals" ${d.showMeals ? "checked" : ""}>Ask guests to choose dinner (${esc(t.meals.join(", "))})</label>
      <label class="f" style="margin-top:14px;max-width:320px">Most guests one reply can bring (general link)<select id="openParty">${Array.from({ length: 10 }, (_, i) => `<option ${+d.openParty === i + 1 ? "selected" : ""}>${i + 1}</option>`).join("")}</select></label>
      <p class="hint">Personal links use the number of seats you set for each guest.</p></div>
    <div class="panel"><h2>Your link</h2>
      <div class="slugrow"><span>${esc(inviteUrl("").replace(/^https?:\/\//, ""))}</span><input id="slug" value="${esc(inv.slug)}" ${inv.paid_at ? "disabled" : ""} aria-label="Link name"></div>
      <p class="hint" id="slug-msg">${inv.paid_at ? "The link is fixed now that guests may have it." : "Letters, numbers and dashes. You can change it until you publish."}</p></div>`;
  ["p1", "p2", "date", "time", "venue", "city", "address", "dress", "rsvpby", "story"].forEach((k) => { const el = $("#f-" + k); el.oninput = () => { d[k] = el.value; change(); }; });
  $("#meals").onchange = (e) => { d.showMeals = e.target.checked; change(); };
  $("#gifts-on").onchange = (e) => { d.showGifts = e.target.checked; change(); };
  ["giftsText", "giftsInfo"].forEach((k) => { const el = $("#f-" + k); el.oninput = () => { d[k] = el.value; change(); }; });
  $("#openParty").onchange = (e) => { d.openParty = +e.target.value; change(); };
  const slug = $("#slug");
  slug.onchange = async () => {
    const v = slugify(slug.value), msg = $("#slug-msg");
    if (v.length < 3) { msg.textContent = "Use at least 3 letters or numbers."; return; }
    if (RESERVED.includes(v)) { msg.textContent = "That name is reserved. Try another one."; return; }
    try { await api.updateInvitation(inv.id, { slug: v }); inv.slug = v; slug.value = v; msg.textContent = "Link updated."; const l = inviteUrl(v); $("#link").textContent = l.replace(/^https?:\/\//, ""); }
    catch (e) { msg.textContent = e.message; slug.value = inv.slug; }
  };
  const renderSched = () => {
    $("#sched").innerHTML = d.schedule.map((s, i) => `<div class="srow"><input type="time" value="${esc(s.t)}" data-i="${i}" data-f="t" aria-label="Time"><input value="${esc(s.x || t[s.k] || "")}" data-i="${i}" data-f="x" aria-label="Moment"><button class="iconbtn" data-rm="${i}" aria-label="Remove">×</button></div>`).join("");
    $$("#sched input").forEach((el) => (el.oninput = () => { const s = d.schedule[+el.dataset.i]; s[el.dataset.f] = el.value; if (el.dataset.f === "x") s.k = ""; change(); }));
    $$("#sched [data-rm]").forEach((b) => (b.onclick = () => { d.schedule.splice(+b.dataset.rm, 1); renderSched(); change(); }));
  };
  renderSched();
  $("#add-row").onclick = () => { d.schedule.push({ t: "23:00", k: "", x: "" }); renderSched(); change(); const ins = $$("#sched input[data-f='x']"); ins[ins.length - 1].focus(); };
}

/* ---------- Guests ---------- */
function guestStatus(g) {
  const r = rsvps.find((x) => x.guest_id === g.id);
  if (r) return r.attending ? ["yes", `Coming · ${r.party}`] : ["no", "Declined"];
  if (g.opened_at) return ["opened", "Opened"];
  return ["", "Not opened"];
}
function inviteMessage(g) {
  const d = inv.data, link = inviteUrl(inv.slug, g.code);
  const m = { en: `Dear ${g.name}, we would love you to celebrate our wedding with us. Open your invitation here: ${link}`,
    ro: `Dragă ${g.name}, ne-ar bucura să sărbătorești nunta noastră alături de noi. Deschide invitația aici: ${link}`,
    no: `Kjære ${g.name}, vi vil gjerne at du feirer bryllupet vårt sammen med oss. Åpne invitasjonen din her: ${link}` };
  return (m[d.lang] || m.en) + `\n\n${d.p1} & ${d.p2}`;
}
function paneGuests() {
  const pane = $("#pane"), live = inv.status === "live", f = inv.plan !== "essential";
  const seats = guests.reduce((a, g) => a + g.party, 0), opened = guests.filter((g) => g.opened_at).length;
  const replied = guests.filter((g) => rsvps.some((r) => r.guest_id === g.id)).length;
  pane.innerHTML = `
    ${!live ? `<p class="msg" style="margin-bottom:16px">You can build your guest list now. Personal links start working when you publish.</p>` : ""}
    <div class="tiles" style="margin-top:0">
      <div class="tile"><div class="k">Households</div><div class="v">${guests.length}</div><div class="x">${seats} seats</div></div>
      <div class="tile"><div class="k">Opened</div><div class="v">${f ? opened : "–"}</div><div class="x">${f ? "of " + guests.length : "Needs Signature"}</div></div>
      <div class="tile"><div class="k">Replied</div><div class="v">${replied}</div><div class="x">from personal links</div></div>
      <div class="tile"><div class="k">Waiting</div><div class="v">${guests.length - replied}</div><div class="x">households</div></div>
    </div>
    <div class="panel"><h2>Add a guest</h2>
      <form class="addguest" id="addg" novalidate>
        <label class="f">Name on the invitation<input id="g-name" placeholder="Ana & Mihai Popescu"></label>
        <label class="f">Seats<select id="g-party">${Array.from({ length: 10 }, (_, i) => `<option ${i === 1 ? "selected" : ""}>${i + 1}</option>`).join("")}</select></label>
        <label class="f">Phone or email (optional)<input id="g-contact" placeholder="+40 7… or name@mail.com"></label>
        <button class="btn primary small" type="submit">Add guest</button>
      </form>
      <details style="margin-top:16px"><summary style="cursor:pointer;color:var(--accent);font-size:.9rem">Paste many guests at once</summary>
        <p class="hint">One household per line: name, seats, phone or email. Example: <code>Ingrid Haugland, 1, +47 912 34 567</code></p>
        <label class="f" style="margin-top:8px"><span class="sr">Guest list</span><textarea id="bulk" rows="6" placeholder="Ana & Mihai Popescu, 2&#10;Ingrid Haugland, 1, ingrid@mail.no"></textarea></label>
        <button class="btn small" id="bulk-add" style="margin-top:10px">Add all</button>
      </details>
    </div>
    ${guests.length ? `<div class="tablewrap"><table class="gtable"><thead><tr><th>Guest</th><th>Seats</th><th>Status</th><th>Send</th><th></th></tr></thead><tbody>
      ${guests.map((g) => { const [cls, label] = guestStatus(g); const wa = (g.contact || "").replace(/[^\d+]/g, ""); const isMail = /@/.test(g.contact || "");
        return `<tr><td>${esc(g.name)}${g.contact ? `<div class="gstat">${esc(g.contact)}</div>` : ""}</td><td class="num">${g.party}</td>
        <td><span class="gstat ${cls}">${esc(label)}</span>${f && g.open_count > 1 ? `<div class="gstat">${g.open_count} visits</div>` : ""}</td>
        <td><div class="actions">
          <button class="btn small" data-copy="${g.id}">Copy link</button>
          <a class="btn small ghost" target="_blank" rel="noopener" href="https://wa.me/${wa.length >= 8 && !isMail ? wa.replace(/^\+/, "") : ""}?text=${encodeURIComponent(inviteMessage(g))}">WhatsApp</a>
          ${isMail ? `<a class="btn small ghost" href="mailto:${esc(g.contact)}?subject=${encodeURIComponent(inv.data.p1 + " & " + inv.data.p2)}&body=${encodeURIComponent(inviteMessage(g))}">Email</a>` : ""}
        </div></td>
        <td><button class="iconbtn" style="width:34px;height:34px" data-gdel="${g.id}" aria-label="Remove ${esc(g.name)}">×</button></td></tr>`; }).join("")}
      </tbody></table></div>` : `<div class="empty">No guests yet. Add your first household above, or share the general link from the Publish tab.</div>`}`;
  const add = async (rows) => {
    rows = rows.filter((r) => r.name);
    if (!rows.length) return;
    try { const out = await api.addGuests(inv.id, rows); guests.push(...out); renderWorkspace(); toast(out.length === 1 ? "Guest added" : `${out.length} guests added`); }
    catch (e) { toast(e.message); }
  };
  $("#addg").onsubmit = (e) => { e.preventDefault(); add([{ name: $("#g-name").value.trim(), party: $("#g-party").value, contact: $("#g-contact").value.trim() }]); };
  $("#bulk-add").onclick = () => add($("#bulk").value.split("\n").map((l) => { const p = l.split(",").map((x) => x.trim()); return { name: p[0], party: parseInt(p[1]) || 1, contact: p.slice(2).join(", ") }; }));
  $$("[data-copy]", pane).forEach((b) => (b.onclick = () => { const g = guests.find((x) => x.id === b.dataset.copy); copy(inviteUrl(inv.slug, g.code), `Personal link for ${g.name} copied`); }));
  $$("[data-gdel]", pane).forEach((b) => (b.onclick = async () => {
    const g = guests.find((x) => x.id === b.dataset.gdel);
    if (!(await confirmBox(`Remove ${g.name}?`, "Their personal link stops working. A reply they already sent stays in your replies.", "Remove guest"))) return;
    try { await api.deleteGuest(g.id); guests = guests.filter((x) => x.id !== g.id); renderWorkspace(); } catch (e) { toast(e.message); }
  }));
}

/* ---------- Replies ---------- */
function paneReplies() {
  const pane = $("#pane"), t = T.en;
  const yes = rsvps.filter((r) => r.attending), no = rsvps.filter((r) => !r.attending);
  const coming = yes.reduce((a, r) => a + r.party, 0), seats = guests.reduce((a, g) => a + g.party, 0);
  const mc = [0, 0, 0]; yes.forEach((r) => { if (r.meal != null && mc[r.meal] != null) mc[r.meal] += r.party || 1; });
  const tot = mc.reduce((a, b) => a + b, 0) || 1, cols = ["var(--accent)", "var(--gold)", "var(--ok)"];
  const gname = (r) => { const g = r.guest_id && guests.find((x) => x.id === r.guest_id); return g && g.name !== r.name ? `<div class="gstat">Invited as ${esc(g.name)}</div>` : ""; };
  pane.innerHTML = `
    <div class="tiles" style="margin-top:0">
      <div class="tile"><div class="k">Coming</div><div class="v">${coming}</div><div class="x">${yes.length} ${yes.length === 1 ? "reply" : "replies"}${seats ? ` · ${seats} seats invited` : ""}</div></div>
      <div class="tile"><div class="k">Declined</div><div class="v">${no.length}</div><div class="x">households</div></div>
      <div class="tile"><div class="k">All replies</div><div class="v">${rsvps.length}</div><div class="x">${inv.data.rsvpby ? "reply by " + esc(fmtDate(inv.data.rsvpby, "en", false)) : ""}</div></div>
      <div class="tile"><div class="k">Waiting</div><div class="v">${Math.max(0, guests.length - guests.filter((g) => rsvps.some((r) => r.guest_id === g.id)).length)}</div><div class="x">guests on your list</div></div>
    </div>
    ${inv.data.showMeals ? `<div class="panel meals"><h2>Dinner choices</h2><div class="mbar">${mc.map((n, i) => `<span style="width:${(n / tot) * 100}%;background:${cols[i]}"></span>`).join("")}</div><div class="legend">${mc.map((n, i) => `<span><i style="background:${cols[i]}"></i>${t.meals[i]} · ${n}</span>`).join("")}</div></div>` : ""}
    <div class="toolbar">
      <button class="btn small primary" id="csv" ${rsvps.length ? "" : "disabled"}>Download guest list (CSV)</button>
      <button class="btn small" id="refresh">Refresh</button>
      <span class="gstat">Updates by itself every 30 seconds.</span>
    </div>
    ${rsvps.length ? `<div class="tablewrap"><table><thead><tr><th>Guest</th><th>Reply</th><th>Party</th><th>Dinner</th><th>Note</th><th>Received</th><th></th></tr></thead><tbody>
      ${rsvps.map((r) => `<tr><td>${esc(r.name)}${gname(r)}</td><td><span class="pill ${r.attending ? "yes" : "no"}">${r.attending ? "Coming" : "Declined"}</span></td><td class="num">${r.attending ? r.party : "–"}</td><td>${r.meal != null && r.attending ? esc(t.meals[r.meal] || "") : "–"}</td><td>${esc(r.note) || "–"}</td><td class="num">${esc(new Date(r.updated_at || r.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }))}</td><td><button class="iconbtn" style="width:34px;height:34px" data-rdel="${r.id}" aria-label="Delete reply">×</button></td></tr>`).join("")}
    </tbody></table></div>` : `<div class="empty">No replies yet. They appear here the moment a guest answers.</div>`}`;
  $("#csv").onclick = () => {
    const q = (s) => '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"';
    const rows = [["Guest", "Invited as", "Reply", "Party", "Dinner", "Note", "Language", "Received"]].concat(rsvps.map((r) => { const g = r.guest_id && guests.find((x) => x.id === r.guest_id); return [r.name, g ? g.name : "", r.attending ? "Coming" : "Declined", r.attending ? r.party : 0, r.attending && r.meal != null ? t.meals[r.meal] : "", r.note, r.lang, r.updated_at || r.created_at]; }));
    download(`guest-list-${inv.slug}.csv`, new Blob(["﻿" + rows.map((r) => r.map(q).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
  };
  const refresh = async () => { try { [rsvps, guests] = await Promise.all([api.listRsvps(inv.id), api.listGuests(inv.id)]); if (tab === "replies") renderWorkspace(); } catch (e) {} };
  $("#refresh").onclick = refresh;
  $$("[data-rdel]", pane).forEach((b) => (b.onclick = async () => {
    if (!(await confirmBox("Delete this reply?", "Use this for test replies or duplicates. It can't be undone.", "Delete reply"))) return;
    try { await api.deleteRsvp(b.dataset.rdel); rsvps = rsvps.filter((r) => r.id !== b.dataset.rdel); renderWorkspace(); } catch (e) { toast(e.message); }
  }));
  clearInterval(pollTimer); pollTimer = setInterval(refresh, 30000);
}

/* ---------- Publish / Share ---------- */
function drawQR(canvas, text) {
  if (!window.qrcode) return false;
  const qr = window.qrcode(0, "M"); qr.addData(text); qr.make();
  const n = qr.getModuleCount(), px = 8, size = n * px + px * 4;
  canvas.width = size; canvas.height = size;
  const c = canvas.getContext("2d"); c.fillStyle = "#fff"; c.fillRect(0, 0, size, size); c.fillStyle = "#1F1622";
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (qr.isDark(r, k)) c.fillRect((k + 2) * px, (r + 2) * px, px, px);
  return true;
}
function panePublish() {
  const pane = $("#pane"), live = inv.status === "live", paid = !!inv.paid_at, link = inviteUrl(inv.slug);
  const curIdx = inv.plan ? PLAN_ORDER.indexOf(inv.plan) : -1;
  const plans = PLAN_ORDER.map((k, i) => {
    const p = PLANS[k], current = k === inv.plan, lower = i < curIdx;
    const cost = paid && inv.plan ? p.price - PLANS[inv.plan].price : p.price;
    return `<div class="price ${current ? "current" : k === "signature" && !paid ? "pop" : ""}">
      ${current ? `<p class="eyebrow" style="color:var(--ok)">Your plan</p>` : k === "signature" && !paid ? `<p class="eyebrow">Most chosen</p>` : ""}
      <h3>${esc(p.name)}</h3><div class="amt">${euro(p.price)} <small>per wedding</small></div>
      <ul>${p.features.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      ${current || lower ? "" : (inv.data.request && inv.data.request.paid && inv.data.request.plan === k) ? `<p class="msg">Paid. We publish your invitation within a few hours.</p>` : PAY && !(LINKS && paid) ? `<button class="btn ${k === "signature" ? "primary" : ""}" data-buy="${k}">${paid ? `Upgrade for ${euro(cost)}` : `Pay ${euro(cost)} and publish`}</button>` : (inv.data.request && inv.data.request.plan === k) ? `<p class="msg">Requested. We publish within 24 hours.</p>` : `<button class="btn ${k === "signature" ? "primary" : ""}" data-req="${k}">Request ${esc(p.name)}</button>`}
    </div>`; }).join("");
  pane.innerHTML = `
    ${paid ? `<div class="panel" style="margin-top:0"><h2>Your invitation</h2>
      <div class="livebox"><div><p style="font-size:1.1rem">${live ? "Live. Guests can open it and reply." : "Paused. Guests see a 'not open yet' page."}</p><p class="hint">Paid ${esc(new Date(inv.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }))}${inv.comp ? " · gifted by Velune Weddings" : ""}</p></div>
      <button class="btn small ${live ? "ghost" : "primary"}" id="toggle">${live ? "Pause invitation" : "Make it live again"}</button></div></div>
      <div class="panel"><h2>Share</h2>
        <div class="qr"><canvas id="qr" width="168" height="168" aria-label="QR code for your invitation"></canvas>
        <div style="display:grid;gap:10px;min-width:0">
          <p>Print this QR code on save-the-date cards, or share the general link in a group chat. For personal greetings and tracking, send links from the Guests tab.</p>
          <div class="toolbar" style="margin-top:0"><button class="btn small primary" id="copy2">Copy general link</button><button class="btn small" id="qrdl">Download QR code</button>
          <a class="btn small ghost" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`${inv.data.p1} & ${inv.data.p2}: ${link}`)}">Share on WhatsApp</a></div>
        </div></div>
        ${inv.plan !== "essential" ? `<div style="margin-top:22px;padding-top:18px;border-top:1px solid var(--line)"><h3 style="margin:0 0 6px">Save the date</h3><p class="hint" style="margin:0 0 12px">A short matching card with your names, date, countdown and calendar buttons. Send it months ahead, then the full invitation later.</p>
          <div class="toolbar" style="margin-top:0"><button class="btn small" id="copystd">Copy save-the-date link</button><a class="btn small ghost" target="_blank" rel="noopener" href="${esc(link + (link.includes("?") ? "&" : "?") + "std")}">Preview</a>
          <a class="btn small ghost" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`${inv.data.p1} & ${inv.data.p2} · Save the date: ${link}${link.includes("?") ? "&" : "?"}std`)}">Share on WhatsApp</a></div></div>` : ""}
      </div>
      ${curIdx < PLAN_ORDER.length - 1 ? `<div class="panel"><h2>Upgrade</h2><p class="hint" style="margin:0 0 16px">You only pay the difference.</p><div class="planrow">${plans}</div></div>` : ""}`
    : `<div class="panel" style="margin-top:0"><h2>Publish</h2><p>Choose a plan to make your invitation live. You pay once, and it stays online until 12 months after the wedding.</p>
      ${LINKS ? `<p class="hint">Secure card payment by Stripe. Booked Velune Weddings? Write to us and we'll gift you Signature.</p>` : PAY ? `<p class="hint">Booked Velune Weddings? Enter the code from your planner on the payment page and Signature is free.</p>` : `<p class="hint">Choose a plan and press Request. We confirm by email and publish within 24 hours.</p>`}</div>
      <div class="planrow" style="margin-top:20px">${plans}</div>
      ${!LIVE ? `<p class="msg" style="margin-top:16px">Demo mode: payment is simulated and the invitation goes live straight away.</p>` : ""}`}
    <div class="panel"><h2>Delete</h2><p class="hint" style="margin:0 0 12px">Removes the invitation, guest list and replies for good.</p><button class="btn small danger" id="del">Delete invitation</button></div>`;
  $$("[data-req]", pane).forEach((b) => (b.onclick = async () => {
    inv.data.request = { plan: b.dataset.req, at: new Date().toISOString() };
    try { await api.updateInvitation(inv.id, { data: inv.data }); toast("Request sent. We'll publish your invitation within 24 hours"); renderWorkspace(); } catch (e) { toast(e.message); }
  }));
  $$("[data-buy]", pane).forEach((b) => (b.onclick = async () => {
    b.disabled = true; const label = b.textContent; b.textContent = "Opening payment…";
    try {
      const r = await api.checkout(inv.id, b.dataset.buy);
      if (r.url) { if (r.link) pend.set({ id: inv.id, plan: b.dataset.buy }); location.href = r.url; return; }
      inv = Object.assign(inv, await api.getInvitation(inv.id)); inv.data = withDefaults(inv.data);
      toast("Payment received. Your invitation is live"); renderWorkspace();
    } catch (e) { toast(e.message); b.disabled = false; b.textContent = label; }
  }));
  if (paid) {
    $("#toggle").onclick = async () => { try { const r = await api.updateInvitation(inv.id, { status: live ? "draft" : "live" }); inv.status = r.status; renderWorkspace(); toast(inv.status === "live" ? "Your invitation is live" : "Invitation paused"); } catch (e) { toast(e.message); } };
    $("#copy2").onclick = () => copy(link, "Link copied");
    if ($("#copystd")) $("#copystd").onclick = () => copy(link + "&std", "Save-the-date link copied");
    const qc = $("#qr"); const ok = drawQR(qc, link);
    $("#qrdl").onclick = () => { if (!ok) return toast("QR code could not load. Check your connection."); qc.toBlob((b) => download(`qr-${inv.slug}.png`, b)); };
  }
  $("#del").onclick = async () => {
    if (!(await confirmBox("Delete this invitation?", `${inv.data.p1} & ${inv.data.p2}, the guest list and all replies will be removed. Guests' links stop working.`, "Delete for good"))) return;
    try { await api.deleteInvitation(inv.id); toast("Invitation deleted"); goList(); } catch (e) { toast(e.message); }
  };
}

document.addEventListener("visibilitychange", () => { if (document.hidden) Music.stop(); });
let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => $$("canvas[data-motif]").forEach((c) => c.offsetParent && draw(c, c.dataset.motif)), 200); });
boot();
