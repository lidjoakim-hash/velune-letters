// Velune Letters · vintage ornaments (original line art): lace edges, lace oval & heart,
// baroque frame, flourishes, timeline icons, venue sketch. Returned as cached <img> data URIs
// (painted once, smooth scrolling) or as CSS url() for repeating backgrounds.

const CACHE = new Map();
const svgURL = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const img = (key, cls, make) => {
  if (!CACHE.has(key)) CACHE.set(key, `<img class="${cls}" alt="" aria-hidden="true" decoding="async" draggable="false" src="${svgURL(make())}">`);
  return CACHE.get(key);
};
const f = (n) => Math.round(n * 10) / 10;

/* ---------- lace edge: tileable scalloped strip (use as background repeat-x) ---------- */
export function laceEdgeURL(col, bg = "none") {
  const k = "edge" + col + bg;
  if (!CACHE.has(k)) {
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 46" width="80" height="46">`;
    if (bg !== "none") s += `<rect width="80" height="46" fill="${bg}"/>`;
    // mesh band
    s += `<g stroke="${col}" stroke-width=".5" opacity=".55">`;
    for (let x = -46; x < 80; x += 6) s += `<path d="M${x} 0L${x + 18} 18M${x + 18} 0L${x} 18"/>`;
    s += `</g><path d="M0 18H80" stroke="${col}" stroke-width="1.2"/>`;
    // scallops with eyelets and petals
    s += `<path d="M0 18Q10 44 20 18Q30 44 40 18Q50 44 60 18Q70 44 80 18" fill="${col}" fill-opacity=".9"/>`;
    s += `<path d="M2 18Q10 39 18 18M22 18Q30 39 38 18M42 18Q50 39 58 18M62 18Q70 39 78 18" fill="none" stroke="${bg === "none" ? "#fff" : bg}" stroke-width=".8" opacity=".7"/>`;
    for (let c = 10; c < 80; c += 20) {
      s += `<circle cx="${c}" cy="26" r="3.2" fill="${bg === "none" ? "#fff" : bg}" opacity=".85"/>`;
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; s += `<circle cx="${f(c + Math.cos(a) * 6.5)}" cy="${f(26 + Math.sin(a) * 5)}" r="1" fill="${bg === "none" ? "#fff" : bg}" opacity=".75"/>`; }
    }
    for (let c = 0; c <= 80; c += 20) s += `<circle cx="${c}" cy="20" r="1.6" fill="${col}"/>`;
    s += `<path d="M0 3H80" stroke="${col}" stroke-width=".6" stroke-dasharray="2 2"/></svg>`;
    CACHE.set(k, `url("${svgURL(s)}")`);
  }
  return CACHE.get(k);
}

/* ---------- lace oval cartouche (frame for names / photo) ---------- */
export function laceOval(col, fill) {
  return img("oval" + col + fill, "lace-oval", () => {
    const cx = 150, cy = 190, rx = 120, ry = 160;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380">`;
    // scalloped outer rim
    const n = 44; let d = "";
    for (let i = 0; i <= n; i++) {
      const a = i / n * Math.PI * 2, a2 = (i + .5) / n * Math.PI * 2;
      const x = cx + Math.cos(a) * (rx + 22), y = cy + Math.sin(a) * (ry + 22);
      const qx = cx + Math.cos(a2) * (rx + 34), qy = cy + Math.sin(a2) * (ry + 34);
      const ex = cx + Math.cos((i + 1) / n * Math.PI * 2) * (rx + 22), ey = cy + Math.sin((i + 1) / n * Math.PI * 2) * (ry + 22);
      d += (i ? "" : `M${f(x)} ${f(y)}`) + `Q${f(qx)} ${f(qy)} ${f(ex)} ${f(ey)}`;
    }
    s += `<path d="${d}Z" fill="${col}" fill-opacity=".92"/>`;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx + 20}" ry="${ry + 20}" fill="none" stroke="${fill}" stroke-width="1" opacity=".6"/>`;
    // eyelet ring
    for (let i = 0; i < n; i++) { const a = (i + .5) / n * Math.PI * 2; s += `<circle cx="${f(cx + Math.cos(a) * (rx + 27))}" cy="${f(cy + Math.sin(a) * (ry + 27))}" r="2.4" fill="${fill}"/>`; }
    // floral motifs in the lace band
    for (let i = 0; i < 22; i++) {
      const a = i / 22 * Math.PI * 2, x = cx + Math.cos(a) * (rx + 11), y = cy + Math.sin(a) * (ry + 11);
      s += `<g transform="translate(${f(x)} ${f(y)})" fill="${fill}" opacity=".85">`;
      for (let p = 0; p < 5; p++) { const b = p * 72 * Math.PI / 180; s += `<ellipse cx="${f(Math.cos(b) * 3.2)}" cy="${f(Math.sin(b) * 3.2)}" rx="2.2" ry="1.4" transform="rotate(${p * 72} ${f(Math.cos(b) * 3.2)} ${f(Math.sin(b) * 3.2)})"/>`; }
      s += `</g>`;
    }
    // inner mesh ring + field
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx - 6}" ry="${ry - 6}" fill="none" stroke="${col}" stroke-width=".8" stroke-dasharray="1.5 3"/>`;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx - 11}" ry="${ry - 11}" fill="none" stroke="${col}" stroke-width=".6" opacity=".7"/>`;
    return s + `</svg>`;
  });
}

/* ---------- lace heart (countdown / closing) ---------- */
export function laceHeart(col, fill) {
  return img("heart" + col + fill, "lace-heart", () => {
    const H = (k) => { const pts = []; for (let i = 0; i <= 120; i++) { const t = i / 120 * Math.PI * 2; pts.push([150 + k * 16 * Math.pow(Math.sin(t), 3), 140 - k * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); } return pts; };
    const path = (p) => "M" + p.map(([x, y]) => `${f(x)} ${f(y)}`).join("L") + "Z";
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 290">`;
    const o = H(8.6);
    s += `<path d="${path(o)}" fill="${col}" fill-opacity=".92"/>`;
    o.forEach(([x, y], i) => { if (i % 3 === 0) s += `<circle cx="${f(x)}" cy="${f(y)}" r="6" fill="${col}"/>`; });
    H(7.6).forEach(([x, y], i) => { if (i % 3 === 0) s += `<circle cx="${f(x)}" cy="${f(y)}" r="2.2" fill="${fill}"/>`; });
    s += `<path d="${path(H(6.9))}" fill="${fill}"/>`;
    s += `<path d="${path(H(6.5))}" fill="none" stroke="${col}" stroke-width=".8" stroke-dasharray="1.5 3"/>`;
    return s + `</svg>`;
  });
}

/* ---------- baroque mirror frame ---------- */
export function baroqueFrame(col, fill) {
  return img("baroque" + col + fill, "baroque", () => {
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".75"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="${col}"/></linearGradient></defs>
      <path d="M40 30Q150 0 260 30Q300 60 290 120Q300 200 290 280Q300 340 260 370Q150 400 40 370Q0 340 10 280Q0 200 10 120Q0 60 40 30Z" fill="${col}"/>
      <path d="M40 30Q150 0 260 30Q300 60 290 120Q300 200 290 280Q300 340 260 370Q150 400 40 370Q0 340 10 280Q0 200 10 120Q0 60 40 30Z" fill="url(#g)" opacity=".7"/>
      <path d="M52 48Q150 24 248 48Q274 70 268 124Q276 200 268 276Q274 330 248 352Q150 376 52 352Q26 330 32 276Q24 200 32 124Q26 70 52 48Z" fill="${fill}" stroke="${col}" stroke-width="2"/>`;
    const curl = (x, y, sx, sy) => `<g transform="translate(${x} ${y}) scale(${sx} ${sy})" fill="none" stroke="${fill}" stroke-width="2.2" stroke-linecap="round"><path d="M0 0C10-14 30-14 34 0C36 10 24 14 18 8"/><path d="M0 0C-4 16 6 30 20 28"/><circle cx="20" cy="4" r="2.2" fill="${fill}"/></g>`;
    s += curl(30, 30, 1, 1) + curl(270, 30, -1, 1) + curl(30, 370, 1, -1) + curl(270, 370, -1, -1);
    s += `<g fill="none" stroke="${fill}" stroke-width="2"><path d="M120 18Q150 -2 180 18M135 14Q150 4 165 14"/><path d="M120 382Q150 402 180 382"/></g><circle cx="150" cy="12" r="5" fill="${fill}"/>`;
    for (let i = 0; i < 9; i++) s += `<circle cx="${110 + i * 10}" cy="${388 - Math.abs(i - 4) * 1.5}" r="3.3" fill="#fbf7ee" stroke="${col}" stroke-width=".6"/>`;
    return s + `</svg>`;
  });
}

/* ---------- flourish divider ---------- */
export function flourish(col) {
  return img("fl" + col, "flourish", () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 30"><g fill="none" stroke="${col}" stroke-width="1.1" stroke-linecap="round">
    <path d="M10 15H96"/><path d="M144 15H230"/><path d="M96 15C104 4 116 4 120 15C124 4 136 4 144 15"/><path d="M96 15C104 26 116 26 120 15C124 26 136 26 144 15"/>
    <path d="M60 15C66 8 74 8 78 13"/><path d="M180 15C174 8 166 8 162 13"/></g><circle cx="120" cy="15" r="2.6" fill="${col}"/><circle cx="8" cy="15" r="1.8" fill="${col}"/><circle cx="232" cy="15" r="1.8" fill="${col}"/></svg>`);
}

/* ---------- line-art timeline icons (stroke = currentColor via CSS mask) ---------- */
const ICONS = {
  welcome: `<path d="M20 14h12l-1 9a5 5 0 01-10 0z"/><path d="M26 28v12M21 40h10"/><path d="M38 10h12l-1 9a5 5 0 01-10 0z"/><path d="M44 24v16M39 40h10"/><path d="M32 8l3-5M35 9l5-3"/><circle cx="24" cy="18" r=".8"/><circle cx="43" cy="14" r=".8"/>`,
  ceremony: `<circle cx="24" cy="28" r="11"/><circle cx="38" cy="28" r="11"/><path d="M34 12l4-6 4 6-4 4z"/>`,
  dinner: `<circle cx="32" cy="26" r="13"/><circle cx="32" cy="26" r="8"/><path d="M12 12v8a3 3 0 006 0v-8M15 20v20"/><path d="M50 12c-4 2-4 10 0 12v16"/>`,
  cake: `<path d="M16 40h32"/><path d="M18 40V30h28v10"/><path d="M22 30v-8h20v8"/><path d="M26 22v-6h12v6"/><path d="M32 16v-5"/><path d="M30 8c2-3 4 0 2 3"/><path d="M18 34c4 3 8-3 12 0s8-3 12 0 4 0 4 0"/>`,
  dance: `<circle cx="24" cy="10" r="3.5"/><circle cx="40" cy="10" r="3.5"/><path d="M24 14v12l-6 14M24 26l5 14M24 18l8 4 8-4"/><path d="M40 14l-3 12h10z"/><path d="M38 26l-2 14M44 26l2 14"/>`,
  car: `<path d="M8 34h48v-6l-6-2-6-8H22l-6 8-8 2z"/><circle cx="18" cy="36" r="4"/><circle cx="46" cy="36" r="4"/><path d="M24 20h16"/><path d="M56 30c4-2 6 2 4 4M60 30l4-4M60 34l4 2"/>`,
};
export const ICON_KEYS = Object.keys(ICONS);
export function icon(name, col) {
  const k = ICONS[name] ? name : "welcome";
  return img("ic" + k + col, "tl-icon", () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48"><g fill="none" stroke="${col}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</g></svg>`);
}

/* ---------- generic manor sketch for the venue ---------- */
export function manor(col) {
  return img("manor" + col, "manor", () => {
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150"><g fill="none" stroke="${col}" stroke-width="1.1" stroke-linecap="round">`;
    s += `<path d="M10 140H310"/><path d="M40 140V70H280V140"/><path d="M30 70L60 48H260L290 70Z"/><path d="M130 48L160 24L190 48"/><circle cx="160" cy="38" r="5"/>`;
    s += `<path d="M138 140V96a22 22 0 0144 0V140"/><path d="M160 74v66"/><path d="M128 140l-10 10M192 140l10 10"/>`;
    for (const x of [56, 84, 212, 240]) s += `<rect x="${x}" y="84" width="16" height="24" rx="8"/><path d="M${x + 8} 84v24M${x} 96h16"/><rect x="${x}" y="116" width="16" height="18"/>`;
    for (const x of [112, 200]) s += `<path d="M${x} 70v70"/><path d="M${x + 8} 70v70"/>`;
    for (let i = 0; i < 14; i++) { const x = 12 + i * 3.4, h = 18 + (i % 3) * 6; s += `<path d="M${x} 140c-2-${h / 2} 4-${h} 0-${h}"/>`; }
    for (let i = 0; i < 14; i++) { const x = 266 + i * 3.4, h = 18 + (i % 3) * 6; s += `<path d="M${x} 140c-2-${h / 2} 4-${h} 0-${h}"/>`; }
    return s + `</g></svg>`;
  });
}
