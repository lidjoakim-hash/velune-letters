// Velune Letters · paper stickers (original artwork): postage stamp, postmark, washi tape,
// pocket watch, pearl brooch, satin bow, pressed botanicals, skeleton key, envelope, rings, tag.
// Each is painted once into a cached <img> (data URI) with a soft baked-in shadow.

const CACHE = new Map();
const url = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const f = (n) => Math.round(n * 10) / 10;
const SH = `<filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2.2" stdDeviation="2.2" flood-color="#2a1a10" flood-opacity=".28"/></filter>`;
function img(key, cls, make) {
  if (!CACHE.has(key)) CACHE.set(key, url(make()));
  return `<img class="stk ${cls}" alt="" aria-hidden="true" decoding="async" draggable="false" src="${CACHE.get(key)}">`;
}
// soft paper grain inside stickers
const GRAIN = `<filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .15  0 0 0 .09 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;

/* ---------- postage stamp with perforated edge ---------- */
export function stamp(col, ink, label = "VELUNE", value = "1st") {
  return img("stamp" + col + ink + label, "stamp", () => {
    const W = 120, H = 146, r = 4.2;
    let holes = "";
    for (let x = 6; x <= W - 6; x += 10.8) holes += `<circle cx="${f(x)}" cy="0" r="${r}"/><circle cx="${f(x)}" cy="${H}" r="${r}"/>`;
    for (let y = 6; y <= H - 6; y += 10.4) holes += `<circle cx="0" cy="${f(y)}" r="${r}"/><circle cx="${W}" cy="${f(y)}" r="${r}"/>`;
    // engraved rose spray
    let lines = "";
    for (let i = 0; i < 26; i++) lines += `<path d="M14 ${30 + i * 3.6}H106" stroke="${ink}" stroke-width=".35" opacity=".25"/>`;
    const rose = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${ink}" stroke-width="1.1" stroke-linecap="round">
      <path d="M0 0c-6-1-9-7-5-11 3-3 8-2 9 2 2-5 9-5 10 0 1 5-4 9-10 9"/><path d="M-1-4c2-3 6-3 7 0"/><path d="M-3 1c-7 2-11 9-8 14 3 4 10 3 13-2 3 6 11 6 13 0 2-5-3-10-10-11"/><path d="M2 3c-2 5 0 9 3 10"/></g>`;
    const leaf = (x, y, a) => `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 0c6-6 15-6 20 0-5 6-14 6-20 0z" fill="${ink}" opacity=".18" stroke="${ink}" stroke-width=".8"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 ${W + 16} ${H + 16}"><defs>${SH}${GRAIN}<mask id="m"><rect x="-8" y="-8" width="${W + 16}" height="${H + 16}" fill="#fff"/><g fill="#000">${holes}</g></mask></defs>
      <g filter="url(#sh)"><rect width="${W}" height="${H}" fill="#FBF6EC" mask="url(#m)"/></g>
      <rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="${col}"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="#fff" filter="url(#gr)"/>
      ${lines}<path d="M60 112C58 92 62 74 60 52" stroke="${ink}" stroke-width="1.2" fill="none"/>
      ${leaf(60, 96, -150)}${leaf(60, 82, -30)}${leaf(60, 70, -160)}${rose(56, 50, 1.25)}${rose(40, 76, .75)}${rose(80, 70, .7)}
      <rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="none" stroke="${ink}" stroke-width=".8" opacity=".6"/>
      <text x="20" y="31" font-family="Cinzel,Georgia,serif" font-size="11" letter-spacing="2" fill="${ink}">${label}</text>
      <text x="${W - 20}" y="${H - 18}" text-anchor="end" font-family="Georgia,serif" font-style="italic" font-size="16" fill="${ink}">${value}</text></svg>`;
  });
}

/* ---------- round postmark with wavy cancellation lines ---------- */
export function postmark(ink, top, bottom) {
  return img("pm" + ink + top + bottom, "postmark", () => {
    const tp = (s) => s.toUpperCase().replace(/[<&>]/g, "");
    let waves = "";
    for (let i = 0; i < 5; i++) waves += `<path d="M66 ${34 + i * 8}q10-5 20 0t20 0 20 0 20 0 20 0" fill="none" stroke="${ink}" stroke-width="1.6"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 100" opacity=".78"><defs>
      <path id="pa" d="M14 50a36 36 0 1 1 72 0"/><path id="pb" d="M10 50a40 40 0 0 0 80 0"/>
      <filter id="rough"><feTurbulence baseFrequency=".6" numOctaves="2" seed="9"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter></defs>
      <g filter="url(#rough)" fill="none" stroke="${ink}"><circle cx="50" cy="50" r="44" stroke-width="2"/><circle cx="50" cy="50" r="29" stroke-width="1.2"/>
      <text font-family="Cinzel,Georgia,serif" font-size="10" letter-spacing="2" fill="${ink}" stroke="none"><textPath href="#pa" startOffset="50%" text-anchor="middle">${tp(top)}</textPath></text>
      <text font-family="Cinzel,Georgia,serif" font-size="9" letter-spacing="2" fill="${ink}" stroke="none"><textPath href="#pb" startOffset="50%" text-anchor="middle" dominant-baseline="hanging">${tp(bottom)}</textPath></text>
      <path d="M50 38l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="${ink}" stroke="none" opacity=".8"/>${waves}</g></svg>`;
  });
}

/* ---------- washi tape strip ---------- */
export function tape(col, w = 120) {
  return img("tape" + col + w, "tape", () => {
    const H = 30; let r = "M3 0", l = "";
    for (let y = 0; y <= H; y += 3) r += `L${f(w - 3 + Math.sin(y * 1.7) * 2.2)} ${y}`;
    for (let y = H; y >= 0; y -= 3) l += `L${f(3 + Math.sin(y * 2.3 + 1) * 2.2)} ${y}`;
    let stripes = ""; for (let x = 4; x < w; x += 9) stripes += `<path d="M${x} 0V${H}" stroke="#fff" stroke-width="2.5" opacity=".18"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${H}"><defs>${GRAIN}<clipPath id="c"><path d="${r}${l}Z"/></clipPath></defs>
      <g clip-path="url(#c)" opacity=".8"><rect width="${w}" height="${H}" fill="${col}"/>${stripes}<rect width="${w}" height="${H}" fill="#fff" filter="url(#gr)"/><rect width="${w}" height="${H * .4}" fill="#fff" opacity=".14"/></g></svg>`;
  });
}

/* ---------- gold pocket watch, hands set to a time ---------- */
export function watch(time = "16:00") {
  const [hh, mm] = String(time).split(":").map((n) => +n || 0);
  return img("watch" + hh + mm, "watch", () => {
    const ha = ((hh % 12) + mm / 60) * 30, ma = mm * 6;
    let nums = "";
    const R = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
    R.forEach((n, i) => { const a = (i * 30 - 90) * Math.PI / 180; nums += `<text x="${f(Math.cos(a) * 33)}" y="${f(Math.sin(a) * 33 + 3)}" text-anchor="middle" font-family="Georgia,serif" font-size="7.5" fill="#3a2a18">${n}</text>`; });
    let ticks = ""; for (let i = 0; i < 60; i++) { const a = i * 6 * Math.PI / 180; const r1 = i % 5 ? 41 : 39; ticks += `<path d="M${f(Math.sin(a) * r1)} ${f(-Math.cos(a) * r1)}L${f(Math.sin(a) * 43)} ${f(-Math.cos(a) * 43)}" stroke="#3a2a18" stroke-width="${i % 5 ? .4 : .9}"/>`; }
    let chain = ""; for (let i = 0; i < 9; i++) chain += `<ellipse cx="${f(-2 + Math.sin(i * .5) * 8)}" cy="${f(-74 - i * 7)}" rx="3.4" ry="2.2" transform="rotate(${i % 2 ? 70 : 0} ${f(-2 + Math.sin(i * .5) * 8)} ${f(-74 - i * 7)})" fill="none" stroke="url(#gd)" stroke-width="1.6"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -140 120 200"><defs>${SH}
      <linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a5a26"/><stop offset=".3" stop-color="#f3dc9a"/><stop offset=".55" stop-color="#b28a43"/><stop offset=".8" stop-color="#f0d891"/><stop offset="1" stop-color="#6e5020"/></linearGradient>
      <radialGradient id="dial" cx="40%" cy="35%" r="80%"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#e9dcc2"/></radialGradient>
      <radialGradient id="glass" cx="30%" cy="25%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      <g filter="url(#sh)">${chain}<rect x="-8" y="-70" width="16" height="14" rx="3" fill="url(#gd)"/><circle cx="0" cy="-74" r="7" fill="none" stroke="url(#gd)" stroke-width="3"/>
      <circle r="52" fill="url(#gd)"/><circle r="47" fill="none" stroke="#5e441a" stroke-width=".8" opacity=".6"/><circle r="45" fill="url(#dial)"/></g>
      ${ticks}${nums}<circle r="12" fill="none" stroke="#3a2a18" stroke-width=".4"/>
      <path d="M0 0L0 -22" transform="rotate(${f(ha)})" stroke="#2a1d10" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M0 0L0 -34" transform="rotate(${f(ma)})" stroke="#2a1d10" stroke-width="1.6" stroke-linecap="round"/>
      <circle r="2.4" fill="#b28a43"/><circle r="45" fill="url(#glass)"/></svg>`;
  });
}

/* ---------- pearl brooch ---------- */
export function brooch() {
  return img("brooch", "brooch", () => {
    const pearl = (x, y, r) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="url(#pl)"/>`;
    let ring = ""; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; ring += pearl(Math.cos(a) * 26, Math.sin(a) * 26, 5.2); }
    let fil = ""; for (let i = 0; i < 8; i++) fil += `<path transform="rotate(${i * 45})" d="M0-15c6-2 10 3 8 8-2 4-7 3-7-1" fill="none" stroke="url(#gd)" stroke-width="1.6"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-44 -44 88 88"><defs>${SH}
      <radialGradient id="pl" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#f3ece2"/><stop offset=".85" stop-color="#cfc3b2"/><stop offset="1" stop-color="#a99a86"/></radialGradient>
      <linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a5a26"/><stop offset=".4" stop-color="#f3dc9a"/><stop offset=".7" stop-color="#b28a43"/><stop offset="1" stop-color="#6e5020"/></linearGradient></defs>
      <g filter="url(#sh)"><circle r="31" fill="url(#gd)"/><circle r="22" fill="#f4ead8"/>${fil}${ring}${pearl(0, 0, 11)}</g></svg>`;
  });
}

/* ---------- satin ribbon bow ---------- */
export function bow(col) {
  return img("bow" + col, "bow", () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-80 -50 160 130"><defs>${SH}
    <linearGradient id="s1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, ${col} 70%, #fff)"/><stop offset=".45" style="stop-color:${col}"/><stop offset=".7" style="stop-color:color-mix(in srgb, ${col} 80%, #fff)"/><stop offset="1" style="stop-color:color-mix(in srgb, ${col} 65%, #000)"/></linearGradient>
    <linearGradient id="s2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, ${col} 65%, #000)"/><stop offset=".5" style="stop-color:color-mix(in srgb, ${col} 75%, #fff)"/><stop offset="1" style="stop-color:${col}"/></linearGradient></defs>
    <g filter="url(#sh)">
    <path d="M-6 6C-20 30-34 52-44 76l12-4 6 10C-14 56-6 30 2 10z" fill="url(#s2)"/><path d="M6 6C20 30 30 54 38 78l-12-3-7 9C12 58 4 30-2 10z" fill="url(#s1)"/>
    <path d="M-4-2C-30-34-70-40-72-12-74 14-36 14-4 4z" fill="url(#s1)"/><path d="M4-2C30-34 70-40 72-12 74 14 36 14 4 4z" fill="url(#s2)"/>
    <path d="M-10-4C-34-24-58-26-60-12" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/><path d="M10-4C34-24 58-26 60-12" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
    <rect x="-10" y="-11" width="20" height="20" rx="6" fill="url(#s1)"/><path d="M-7-6Q0-9 7-6" stroke="#fff" stroke-opacity=".4" stroke-width="1.4" fill="none"/></g></svg>`);
}

/* ---------- pressed botanical sprig ---------- */
export function sprig(leaf, bloom, seed = 1) {
  return img("sprig" + leaf + bloom + seed, "sprig", () => {
    let rnd = seed * 9301 + 49297; const R = () => ((rnd = (rnd * 9301 + 49297) % 233280) / 233280);
    let s = "";
    const L = (x, y, a, l, w) => `<path transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})" d="M0 0C${f(w)} ${f(-l * .3)} ${f(w * .8)} ${f(-l * .8)} 0 ${f(-l)}C${f(-w * .8)} ${f(-l * .8)} ${f(-w)} ${f(-l * .3)} 0 0Z" fill="url(#lf)" stroke="color-mix(in srgb, ${leaf} 70%, #000)" stroke-width=".5"/><path transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})" d="M0 0V${f(-l * .9)}" stroke="color-mix(in srgb, ${leaf} 60%, #000)" stroke-width=".4" opacity=".6"/>`;
    // main stem curve
    s += `<path d="M10 190C30 140 40 90 70 20" fill="none" stroke="color-mix(in srgb, ${leaf} 60%, #3a2a18)" stroke-width="1.8" stroke-linecap="round"/>`;
    s += `<path d="M34 130C52 112 70 100 96 92" fill="none" stroke="color-mix(in srgb, ${leaf} 60%, #3a2a18)" stroke-width="1.2"/>`;
    for (let i = 0; i < 9; i++) { const t = i / 9, x = 10 + 60 * t + 10 * Math.sin(t * 3), y = 190 - 170 * t; s += L(x, y, -40 + R() * 20 + (i % 2 ? 70 : -60), 22 + R() * 10, 7 + R() * 3); }
    for (let i = 0; i < 4; i++) s += L(40 + i * 15, 125 - i * 8, (i % 2 ? 40 : -30) + 60, 16, 5);
    // small blooms
    const fl = (x, y, r) => { let p = ""; for (let k = 0; k < 5; k++) p += `<ellipse cx="0" cy="${-r}" rx="${f(r * .62)}" ry="${f(r)}" transform="rotate(${k * 72})" fill="url(#bl)"/>`; return `<g transform="translate(${x} ${y}) rotate(${f(R() * 70)})">${p}<circle r="${f(r * .35)}" fill="#d9b25c"/></g>`; };
    s += fl(72, 20, 7) + fl(96, 90, 6) + fl(58, 48, 5) + fl(24, 150, 4.5);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -10 140 215"><defs>${SH}
      <linearGradient id="lf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" style="stop-color:color-mix(in srgb, ${leaf} 85%, #000)"/><stop offset="1" style="stop-color:color-mix(in srgb, ${leaf} 70%, #fff)"/></linearGradient>
      <radialGradient id="bl"><stop offset="0" style="stop-color:color-mix(in srgb, ${bloom} 60%, #fff)"/><stop offset="1" style="stop-color:${bloom}"/></radialGradient></defs><g filter="url(#sh)" opacity=".95">${s}</g></svg>`;
  });
}

/* ---------- skeleton key with a ribbon ---------- */
export function key(col = "#b28a43", ribbon = "#7d5a4a") {
  return img("key" + col + ribbon, "key", () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 90"><defs>${SH}
    <linearGradient id="kg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dc9a"/><stop offset=".5" stop-color="${col}"/><stop offset="1" stop-color="#5e441a"/></linearGradient></defs>
    <g filter="url(#sh)"><path d="M28 30c-14 6-24 2-26-6 8 4 16 2 22-4" fill="${ribbon}"/><path d="M28 36c-12 10-20 22-18 34 6-8 12-14 22-22" fill="${ribbon}" opacity=".9"/>
    <g fill="url(#kg)"><circle cx="40" cy="38" r="20"/><rect x="58" y="34" width="118" height="8" rx="3"/><rect x="150" y="42" width="8" height="18"/><rect x="162" y="42" width="8" height="24"/><rect x="172" y="42" width="6" height="14"/><circle cx="66" cy="38" r="6"/></g>
    <g fill="#f4ead8"><circle cx="40" cy="38" r="9"/><circle cx="40" cy="22" r="3"/><circle cx="26" cy="44" r="3"/><circle cx="54" cy="44" r="3"/></g></g></svg>`);
}

/* ---------- envelope with a card peeking out ---------- */
export function envelope(paper, seal) {
  return img("env" + paper + seal, "envs", () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 140"><defs>${SH}${GRAIN}</defs>
    <g filter="url(#sh)" transform="rotate(-6 90 80)"><rect x="18" y="40" width="144" height="92" fill="color-mix(in srgb, ${paper} 92%, #000)"/>
    <rect x="30" y="18" width="120" height="84" fill="#fffdf7" transform="rotate(4 90 60)"/><path d="M48 46h84M48 58h70M48 70h78" stroke="#bbb0a0" stroke-width="1.4" transform="rotate(4 90 60)"/>
    <path d="M18 40L90 96 162 40V132H18z" fill="${paper}"/><path d="M18 132L80 86M162 132L100 86" stroke="#000" stroke-opacity=".08" stroke-width="1.4"/>
    <rect x="18" y="40" width="144" height="92" fill="#fff" filter="url(#gr)"/><circle cx="90" cy="92" r="11" fill="${seal}"/><circle cx="90" cy="92" r="7" fill="none" stroke="#fff" stroke-opacity=".35"/></g></svg>`);
}

/* ---------- two gold rings ---------- */
export function rings() {
  return img("rings", "rings", () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -50 120 100"><defs>${SH}
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6e5020"/><stop offset=".35" stop-color="#f6e2a6"/><stop offset=".6" stop-color="#b28a43"/><stop offset="1" stop-color="#f0d891"/></linearGradient>
    <radialGradient id="dm" cx="40%" cy="30%"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#dfe7ee"/><stop offset="1" stop-color="#9fb0c0"/></radialGradient></defs>
    <g filter="url(#sh)"><ellipse cx="-14" cy="6" rx="26" ry="24" fill="none" stroke="url(#g1)" stroke-width="6"/><ellipse cx="16" cy="10" rx="24" ry="22" fill="none" stroke="url(#g1)" stroke-width="5"/>
    <path d="M-22-24l8-10 8 10-8 8z" fill="url(#dm)" stroke="#8a9aa8" stroke-width=".6"/></g></svg>`);
}

/* ---------- luggage tag on a string ---------- */
export function tag(paper, ink, text) {
  return img("tag" + paper + ink + text, "tagk", () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 110"><defs>${SH}${GRAIN}</defs>
    <path d="M0 30C30 10 50 60 62 52" fill="none" stroke="#8a6d4d" stroke-width="1.4"/>
    <g filter="url(#sh)" transform="rotate(-8 130 55)"><path d="M60 30L80 14H210V96H80L60 80z" fill="${paper}"/><path d="M60 30L80 14H210V96H80L60 80z" fill="#fff" filter="url(#gr)"/>
    <circle cx="76" cy="55" r="6" fill="#efe6d6" stroke="#b9a07a" stroke-width="2"/><rect x="90" y="24" width="110" height="62" fill="none" stroke="${ink}" stroke-width=".7" stroke-dasharray="3 2" opacity=".6"/>
    <text x="145" y="62" text-anchor="middle" font-family="Pinyon Script,Georgia,serif" font-size="22" fill="${ink}">${String(text).replace(/[<&>]/g, "")}</text></g></svg>`);
}
