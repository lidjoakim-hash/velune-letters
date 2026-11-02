// Velune Letters · the invitation guests open
import { T, fmtDate, LANGS } from "./i18n.js";
import { THEMES, draw } from "./themes.js";
import { features } from "./config.js";

export const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const DEFAULT_DATA = {
  theme: "tuscany", lang: "en", langs: ["en", "ro", "no"], music: true, showMeals: true, openParty: 4, petals: true, showGifts: true, giftsText: "", giftsInfo: "",
  p1: "Elena", p2: "Matteo", date: "2027-06-12", time: "16:00",
  venue: "Villa Aurelia", city: "Lake Como, Italy", address: "Villa Aurelia, Lake Como, Italy",
  dress: "Black tie optional", rsvpby: "2027-04-01",
  story: "We met on a rainy evening in Bucharest and have chased the sun together ever since. This summer we are saying yes by the lake, and we would love you there.",
  schedule: [{ t: "15:30", k: "arrive", x: "" }, { t: "16:00", k: "ceremony", x: "" }, { t: "18:30", k: "dinner", x: "" }, { t: "21:00", k: "party", x: "" }],
  photos: [],
};
export const clone = (o) => JSON.parse(JSON.stringify(o));
export function withDefaults(d) {
  const out = Object.assign(clone(DEFAULT_DATA), d || {});
  if (!THEMES[out.theme]) out.theme = "tuscany";
  if (!T[out.lang]) out.lang = "en";
  if (!Array.isArray(out.langs) || !out.langs.length) out.langs = [out.lang];
  if (!Array.isArray(out.schedule)) out.schedule = [];
  if (!Array.isArray(out.photos)) out.photos = [];
  return out;
}

const target = (d) => new Date(d.date + "T" + (d.time || "16:00") + ":00");
const initials = (d) => ((d.p1 || "?")[0] + "&" + (d.p2 || "?")[0]).toUpperCase();

/* ---------- music box ---------- */
export const Music = {
  ctx: null, on: false, timer: null, i: 0,
  notes: [659.25, 783.99, 987.77, 880, 783.99, 659.25, 587.33, 659.25, 523.25, 659.25, 783.99, 739.99, 659.25, 587.33, 493.88, 523.25],
  start() {
    try { this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)(); this.ctx.resume && this.ctx.resume(); } catch (e) { return; }
    if (this.on) return; this.on = true; this.i = 0;
    const step = () => {
      if (!this.on) return;
      const n = this.notes[this.i % this.notes.length];
      this.pluck(n); if (this.i % 4 === 0) this.pluck(n / 2, 0.05);
      this.i++; this.timer = setTimeout(step, this.i % 8 === 0 ? 720 : 420);
    };
    step(); this.sync();
  },
  stop() { this.on = false; clearTimeout(this.timer); this.sync(); },
  toggle() { this.on ? this.stop() : this.start(); },
  pluck(f, vol) {
    const c = this.ctx, t = c.currentTime, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), g2 = c.createGain();
    o.type = "sine"; o2.type = "triangle"; o.frequency.value = f; o2.frequency.value = f * 2;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || 0.09, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    g2.gain.value = 0.25; o.connect(g); o2.connect(g2); g2.connect(g); g.connect(c.destination);
    o.start(t); o2.start(t); o.stop(t + 1.7); o2.stop(t + 1.7);
  },
  sync() { document.querySelectorAll(".mus").forEach((b) => b.setAttribute("aria-pressed", String(this.on))); },
};

/* ---------- countdown ---------- */
export function tick() {
  document.querySelectorAll("[data-cd]").forEach((el) => {
    let ms = Date.parse(el.dataset.cd) - Date.now();
    if (isNaN(ms)) return;
    if (ms < 0) ms = 0;
    const set = (k, v) => { const b = el.querySelector('[data-u="' + k + '"]'); if (b) b.textContent = v; };
    set("d", Math.floor(ms / 864e5));
    set("h", String(Math.floor(ms / 36e5) % 24).padStart(2, "0"));
    set("m", String(Math.floor(ms / 6e4) % 60).padStart(2, "0"));
    set("s", String(Math.floor(ms / 1e3) % 60).padStart(2, "0"));
  });
}
setInterval(tick, 1000);

/* ---------- calendar ---------- */
function calStamp(d, addHours) {
  const t = target(d); t.setHours(t.getHours() + (addHours || 0));
  const p = (n) => String(n).padStart(2, "0");
  return `${t.getFullYear()}${p(t.getMonth() + 1)}${p(t.getDate())}T${p(t.getHours())}${p(t.getMinutes())}00`;
}
function googleCal(d) {
  const q = new URLSearchParams({ action: "TEMPLATE", text: `${d.p1} & ${d.p2}`, dates: `${calStamp(d)}/${calStamp(d, 8)}`, location: d.address || `${d.venue}, ${d.city}`, details: location.href.split("#")[0] });
  return "https://calendar.google.com/calendar/render?" + q.toString();
}
function icsHref(d) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Velune Letters//EN", "BEGIN:VEVENT",
    "UID:" + (d.p1 + d.p2 + d.date).replace(/\W/g, "") + "@veluneletters", "DTSTAMP:" + calStamp(d) ,
    "DTSTART:" + calStamp(d), "DTEND:" + calStamp(d, 8),
    "SUMMARY:" + `${d.p1} & ${d.p2}`.replace(/[,;]/g, " "), "LOCATION:" + (d.address || `${d.venue} ${d.city}`).replace(/[,;]/g, " "),
    "END:VEVENT", "END:VCALENDAR"];
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(lines.join("\r\n"));
}

/* ---------- render ---------- */
const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * opts: { plan, guest:{name,party}, rsvp:{...}, onRsvp: async(payload)=>void,
 *         keepOpen, preview (studio preview), onLang(lang) }
 */
export function renderInvite(root, raw, opts = {}) {
  const d = withDefaults(raw);
  const f = features(opts.plan);
  const t = T[d.lang], th = THEMES[d.theme], v = th.v;
  const wasOpen = root.classList.contains("opened");
  root.className = "inv" + (opts.keepOpen && wasOpen ? " opened" : "");
  root.style.cssText = `--i-bg:${v.bg};--i-paper:${v.paper};--i-ink:${v.ink};--i-muted:${v.muted};--i-accent:${v.accent};--i-seal:${v.seal};--i-env:${v.env};--i-display:${th.display}`;
  const maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(d.address || d.venue + " " + d.city);
  const sched = d.schedule.filter((s) => s.t || s.x || s.k).map((s) => `<li><time>${esc(s.t)}</time><span>${esc(s.x || t[s.k] || "")}</span></li>`).join("");
  const langs = f.multiLang ? d.langs.filter((l) => T[l]) : [];
  const langBtns = langs.length > 1 ? `<div class="sec" style="padding-top:0">${langs.map((k) => `<button type="button" class="ibtn${k === d.lang ? " fill" : ""}" data-ilang="${k}" style="margin:4px;padding:.4em .9em">${k.toUpperCase()}</button>`).join("")}</div>` : "";
  const photos = f.gallery ? d.photos.filter(Boolean).slice(0, 9) : [];
  const g = opts.guest;
  const firstName = g ? g.name.split(/\s|&/)[0] : "";
  const musicOn = f.music && d.music;

  root.innerHTML = `
  <div class="stage">
    ${g ? `<p class="kicker">${esc(t.dear.replace("{n}", g.name))}</p>` : ""}
    <div class="env">
      <div class="env-back"></div>
      <div class="env-letter">${esc(d.p1)} &amp; ${esc(d.p2)}</div>
      <div class="env-front"></div>
      <div class="env-flap"></div>
      <button class="seal" type="button" aria-label="${esc(t.tap)}">${esc(initials(d))}</button>
    </div>
    <p class="names">${esc(d.p1)} &amp; ${esc(d.p2)}</p>
    <p class="tap">${esc(t.tap)}</p>
  </div>
  <article class="sheet">
    ${musicOn ? `<button class="mus" type="button" aria-pressed="${Music.on}" aria-label="${esc(t.music)}"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path class="wave" d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12"/></svg></button>` : ""}
    <canvas class="art" data-motif="${d.theme}"></canvas>
    <div class="sec">
      ${g ? `<p class="kicker" style="margin-bottom:10px">${esc(t.dear.replace("{n}", g.name))}</p>` : ""}
      <p class="kicker">${esc(t.together)}</p>
      <h2 class="couple">${esc(d.p1)}<span class="amp">&amp;</span>${esc(d.p2)}</h2>
      <p class="line">${esc(t.invite)}</p>
      <p class="date">${esc(fmtDate(d.date, d.lang, true))}</p>
      <p class="place">${esc(d.time)} · ${esc(d.venue)} · ${esc(d.city)}</p>
    </div>
    <div class="orn"><span></span></div>
    <div class="sec">
      <p class="kicker" style="margin-bottom:12px">${esc(t.count)}</p>
      <div class="cd" data-cd="${esc(target(d).toISOString())}">
        <div><b data-u="d">0</b><small>${esc(t.days)}</small></div><div><b data-u="h">00</b><small>${esc(t.hours)}</small></div><div><b data-u="m">00</b><small>${esc(t.minutes)}</small></div><div><b data-u="s">00</b><small>${esc(t.seconds)}</small></div>
      </div>
      <div class="cal">
        <a class="ibtn" href="${esc(googleCal(d))}" target="_blank" rel="noopener">${esc(t.google)}</a>
        <a class="ibtn" href="${esc(icsHref(d))}" download="wedding.ics">${esc(t.ics)}</a>
      </div>
    </div>
    ${d.story ? `<div class="orn"><span></span></div><div class="sec"><h3>${esc(t.story)}</h3><p class="story">${esc(d.story)}</p></div>` : ""}
    ${photos.length ? `<div class="orn"><span></span></div><div class="sec"><h3>${esc(t.gallery)}</h3><div class="gal">${photos.map((p, i) => `<button type="button" class="ph" data-ph="${i}"><img src="${esc(p)}" alt="" loading="lazy"></button>`).join("")}</div></div>` : ""}
    ${sched ? `<div class="orn"><span></span></div><div class="sec"><h3>${esc(t.schedule)}</h3><ul class="tl">${sched}</ul></div>` : ""}
    <div class="orn"><span></span></div>
    <div class="sec">
      <h3>${esc(t.venue)}</h3>
      <p class="venue-name">${esc(d.venue)}</p><p style="color:var(--i-muted)">${esc(d.city)}</p>
      <a class="ibtn" href="${esc(maps)}" target="_blank" rel="noopener">${esc(t.maps)}</a>
      ${d.dress ? `<div class="dress"><svg viewBox="0 0 120 64" aria-hidden="true"><path d="M30 14l-9 8 4 4v30h22V26l4-4-9-8-6 6z"/><path d="M33 20l3 4 3-4"/><path d="M36 24v26"/><path d="M84 12c-3 0-5 2-5 5l-2 9-11 30h36L91 26l-2-9c0-3-2-5-5-5z"/><path d="M79 26h10"/></svg><p class="kicker">${esc(t.dress)}</p><p class="venue-name" style="font-size:1.15rem">${esc(d.dress)}</p></div>` : ""}
    </div>
    ${d.showGifts ? `<div class="orn"><span></span></div><div class="sec gifts"><svg viewBox="0 0 64 64" aria-hidden="true"><rect x="12" y="26" width="40" height="28" rx="2"/><rect x="9" y="18" width="46" height="9" rx="2"/><path d="M32 18v36"/><path d="M32 18c-4-8-14-10-14-3 0 4 8 3 14 3zM32 18c4-8 14-10 14-3 0 4-8 3-14 3z"/></svg><h3>${esc(t.gifts)}</h3><p class="story">${esc(d.giftsText || t.giftsText)}</p>${d.giftsInfo ? `<p class="gift-info">${esc(d.giftsInfo)}</p>` : ""}</div>` : ""}
    <div class="orn"><span></span></div>
    <div class="sec rsvp">
      <h3>${esc(t.rsvp)}</h3>
      ${d.rsvpby ? `<p class="kicker">${esc(t.replyBy)} ${esc(fmtDate(d.rsvpby, d.lang, false))}</p>` : ""}
      ${g ? `<p class="line" style="margin-top:8px">${esc(g.party > 1 ? t.seats.replace("{p}", g.party) : t.seat1)}</p>` : ""}
      <div class="rsvp-body"></div>
    </div>
    ${langBtns}
    <p class="ifoot">${esc(t.made)} <b>Velune Letters</b></p>
  </article>
  ${d.petals ? `<canvas class="petals" aria-hidden="true"></canvas>` : ""}
  <div class="lightbox" hidden><img alt=""><button type="button" aria-label="Close">×</button></div>`;

  const paint = () => root.querySelectorAll("canvas[data-motif]").forEach((c) => draw(c, c.dataset.motif));
  requestAnimationFrame(paint);
  const startPetals = () => { const c = root.querySelector("canvas.petals"); if (c && !reduce) petals(c, root, [v.seal, v.accent]); };
  const open = () => { root.classList.add("opened"); requestAnimationFrame(paint); startPetals(); if (opts.onOpen) opts.onOpen(); };
  root.querySelector(".seal").addEventListener("click", () => {
    if (root.classList.contains("opening")) return;
    if (musicOn) Music.start();
    if (reduce) { open(); return; }
    root.classList.add("opening");
    setTimeout(() => { root.classList.remove("opening"); open(); }, 2150);
  });
  const mus = root.querySelector(".mus"); if (mus) mus.addEventListener("click", () => Music.toggle());
  root.querySelectorAll("[data-ilang]").forEach((b) => b.addEventListener("click", () => opts.onLang && opts.onLang(b.dataset.ilang)));
  const lb = root.querySelector(".lightbox");
  root.querySelectorAll("[data-ph]").forEach((b) => b.addEventListener("click", () => { lb.querySelector("img").src = photos[+b.dataset.ph]; lb.hidden = false; }));
  lb.addEventListener("click", () => { lb.hidden = true; });
  rsvpForm(root.querySelector(".rsvp-body"), d, opts, opts.rsvp || null);
  tick();
  if (root.classList.contains("opened")) { requestAnimationFrame(paint); startPetals(); }
  return { open };
}

/* ---------- falling petals ---------- */
function petals(canvas, root, colors) {
  if (canvas._run) return; canvas._run = true;
  const ctx = canvas.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0;
  const size = () => { w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size();
  const P = Array.from({ length: 16 }, (_, i) => ({ x: Math.random() * w, y: -Math.random() * h, r: 5 + Math.random() * 6, s: 0.25 + Math.random() * 0.5, a: Math.random() * 6.28, sp: 0.01 + Math.random() * 0.02, c: colors[i % colors.length], life: 0 }));
  const t0 = performance.now();
  const step = (now) => {
    if (!root.isConnected || !canvas.isConnected) return;
    if (canvas.clientWidth !== w || canvas.clientHeight !== h) size();
    ctx.clearRect(0, 0, w, h);
    const fade = Math.max(0, 1 - Math.max(0, now - t0 - 9000) / 3000); // gentle shower for ~10 s
    for (const p of P) {
      p.y += p.s * 1.6; p.x += Math.sin(p.a) * 0.6; p.a += p.sp;
      if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = 0.55 * fade; ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, 6.29); ctx.fill(); ctx.restore();
    }
    if (fade > 0) requestAnimationFrame(step); else ctx.clearRect(0, 0, w, h);
  };
  requestAnimationFrame(step);
}

let uid = 0;
function rsvpForm(box, d, opts, done) {
  const t = T[d.lang], u = "r" + ++uid, g = opts.guest;
  const maxParty = g ? g.party : Math.max(1, Math.min(10, +d.openParty || 4));
  if (done) {
    const first = String(done.name || "").split(" ")[0];
    box.innerHTML = `<p class="thanks">${esc((done.attending ? t.thanks : t.thanksNo).replace("{n}", first))}</p><button type="button" class="ibtn">${esc(t.again)}</button>`;
    box.querySelector("button").onclick = () => rsvpForm(box, d, opts, null);
    return;
  }
  const prev = opts.rsvp || {};
  box.innerHTML = `<form novalidate>
    <label for="${u}-n">${esc(t.name)}<input id="${u}-n" name="name" autocomplete="name" value="${esc(prev.name || (g ? g.name : ""))}"></label>
    <div><p style="font-size:.78rem;color:var(--i-muted);margin-bottom:6px">${esc(t.attend)}</p>
      <div class="seg"><label><input type="radio" name="att" value="yes" ${prev.attending === true ? "checked" : ""}><span>${esc(t.yes)}</span></label><label><input type="radio" name="att" value="no" ${prev.attending === false ? "checked" : ""}><span>${esc(t.no)}</span></label></div></div>
    <div class="yesonly" style="display:${prev.attending === false ? "none" : "grid"};gap:12px">
      ${maxParty > 1 ? `<label for="${u}-g">${esc(t.guests)}<select id="${u}-g" name="g">${Array.from({ length: maxParty }, (_, i) => `<option ${(prev.party || maxParty) === i + 1 ? "selected" : ""}>${i + 1}</option>`).join("")}</select></label>` : `<input type="hidden" name="g" value="1">`}
      ${d.showMeals ? `<label for="${u}-m">${esc(t.meal)}<select id="${u}-m" name="meal">${t.meals.map((m, i) => `<option value="${i}" ${prev.meal === i ? "selected" : ""}>${esc(m)}</option>`).join("")}</select></label>` : ""}
    </div>
    <label for="${u}-msg">${esc(t.msg)}<textarea id="${u}-msg" name="note" rows="2">${esc(prev.note || "")}</textarea></label>
    <p class="err" hidden></p>
    <button class="ibtn fill" type="submit" style="justify-self:center">${esc(t.send)}</button></form>`;
  const f = box.querySelector("form"), yo = f.querySelector(".yesonly"), err = f.querySelector(".err"), btn = f.querySelector("[type=submit]");
  f.addEventListener("change", () => { yo.style.display = f.att.value === "no" ? "none" : "grid"; });
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = f.name.value.trim(), att = f.att.value;
    if (!name) { err.textContent = t.needName; err.hidden = false; return; }
    if (!att) { err.textContent = t.needAttend; err.hidden = false; return; }
    const payload = { name, attending: att === "yes", party: att === "yes" ? +f.g.value || 1 : 0, meal: att === "yes" && f.meal ? +f.meal.value : null, note: f.note.value.trim(), lang: d.lang };
    err.hidden = true; btn.disabled = true; btn.textContent = t.sending;
    try {
      if (opts.onRsvp) await opts.onRsvp(payload);
      opts.rsvp = payload;
      rsvpForm(box, d, opts, payload);
    } catch (ex) {
      err.textContent = (ex && ex.message) || t.error; err.hidden = false; btn.disabled = false; btn.textContent = t.send;
    }
  });
}
