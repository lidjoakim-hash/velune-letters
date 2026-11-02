// Velune Letters · hand-built watercolour florals (SVG, no images)
// Peonies, garden roses, eucalyptus, leaf sprigs, buds, blossoms and berries,
// composed into corner bouquets, dividers, wreaths, meadows and envelope sprigs.

let UID = 0;
const f = (n) => Math.round(n * 10) / 10;

/* ---------- per-design palettes ---------- */
export const FLORA = {
  lace:       { p1: "#F6E3DA", p2: "#D9A496", p3: "#B9786A", l1: "#B7C3A6", l2: "#7F8F6C", e: "#A9BBB0", b: "#C9B48F", gold: "#C2A46E" },
  stained:    { p1: "#C85A72", p2: "#8E2F48", p3: "#561A2B", l1: "#5E7B5C", l2: "#2F4A33", e: "#6E8C86", b: "#D8B86A", gold: "#D8B86A" },
  tuscany:    { p1: "#F8D2B2", p2: "#E59A6B", p3: "#B5652F", l1: "#A7AE76", l2: "#6E7A44", e: "#9FAE9A", b: "#9C4E25", gold: "#C08A4A" },
  midnight:   { p1: "#FBF3E2", p2: "#E9D3A6", p3: "#B8924F", l1: "#C9AE72", l2: "#9C7F45", e: "#B8A57A", b: "#D9B76A", gold: "#D9B76A" },
  fjord:      { p1: "#FFFFFF", p2: "#CBD9E3", p3: "#7E9CB2", l1: "#A6B9B4", l2: "#5F7C78", e: "#9DB2B0", b: "#3E6A86", gold: "#8EA6B5" },
  carpathian: { p1: "#F0898E", p2: "#C8323A", p3: "#8E1C22", l1: "#5E7A55", l2: "#2E4529", e: "#7A8F76", b: "#1A1A1A", gold: "#B3202A" },
  peony:      { p1: "#FCE3E0", p2: "#EFA9AA", p3: "#C9707A", l1: "#B9C7A8", l2: "#7D9170", e: "#A7BDB6", b: "#E7B9A6", gold: "#C9A36B" },
  meadow:     { p1: "#FFF4D6", p2: "#B9A6D9", p3: "#E99A7A", l1: "#B3C38E", l2: "#6F8452", e: "#A8BCA0", b: "#F2C65B", gold: "#B8964F" },
};
export const flora = (id) => FLORA[id] || FLORA.lace;

/* ---------- primitives ---------- */
const petalPath = (l, w) => `M0 0C${f(w * .95)} ${f(-l * .22)} ${f(w)} ${f(-l * .78)} 0 ${f(-l)}C${f(-w)} ${f(-l * .78)} ${f(-w * .95)} ${f(-l * .22)} 0 0Z`;
const cupPath = (l, w) => `M0 0C${f(w * 1.05)} ${f(-l * .1)} ${f(w * 1.1)} ${f(-l * .85)} ${f(w * .35)} ${f(-l)}Q0 ${f(-l * .9)} ${f(-w * .35)} ${f(-l)}C${f(-w * 1.1)} ${f(-l * .85)} ${f(-w * 1.05)} ${f(-l * .1)} 0 0Z`;
const leafPath = (l, w) => `M0 0C${f(w)} ${f(-l * .28)} ${f(w * .7)} ${f(-l * .78)} 0 ${f(-l)}C${f(-w * .7)} ${f(-l * .78)} ${f(-w)} ${f(-l * .28)} 0 0Z`;

function defs(u, P) {
  return `<defs>
  <filter id="wc${u}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="${u % 9 + 2}"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
  <radialGradient id="pa${u}" cx="50%" cy="100%" r="100%"><stop offset="0" stop-color="${P.p3}"/><stop offset=".45" stop-color="${P.p2}"/><stop offset="1" stop-color="${P.p1}"/></radialGradient>
  <radialGradient id="pb${u}" cx="50%" cy="100%" r="100%"><stop offset="0" stop-color="${P.p2}"/><stop offset=".6" stop-color="${P.p1}"/><stop offset="1" stop-color="${P.p1}" stop-opacity=".7"/></radialGradient>
  <linearGradient id="lf${u}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${P.l2}"/><stop offset="1" stop-color="${P.l1}"/></linearGradient>
  <linearGradient id="eu${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.e}"/><stop offset="1" stop-color="${P.l2}" stop-opacity=".85"/></linearGradient>
  </defs>`;
}

function peony(u, x, y, r, rot = 0) {
  let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})" filter="url(#wc${u})">`;
  const ring = (n, l, w, off, fill, op) => { for (let i = 0; i < n; i++) s += `<path d="${cupPath(l, w)}" transform="rotate(${f(i * 360 / n + off)})" fill="url(#${fill}${u})" opacity="${op}" stroke="url(#pa${u})" stroke-opacity=".35" stroke-width=".8"/>`; };
  ring(9, r, r * .62, 0, "pb", .9);
  ring(8, r * .78, r * .5, 20, "pa", .55);
  ring(7, r * .55, r * .38, 8, "pb", .85);
  ring(6, r * .36, r * .26, 30, "pa", .7);
  for (let i = 0; i < 9; i++) { const a = i * 40 * Math.PI / 180, d = r * .1; s += `<circle cx="${f(Math.cos(a) * d)}" cy="${f(Math.sin(a) * d)}" r="${f(r * .05)}" fill="url(#pa${u})" opacity=".8"/>`; }
  return s + `</g>`;
}

function rose(u, x, y, r, rot = 0) {
  let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})" filter="url(#wc${u})">`;
  for (let i = 0; i < 6; i++) s += `<path d="${petalPath(r, r * .78)}" transform="rotate(${i * 60})" fill="url(#pb${u})" opacity=".9" stroke="url(#pa${u})" stroke-opacity=".4" stroke-width=".8"/>`;
  s += `<circle r="${f(r * .62)}" fill="url(#pa${u})" opacity=".55"/>`;
  // spiralling centre
  let d = ""; for (let k = 0; k < 26; k++) { const a = k * .62, rr = r * .58 * (1 - k / 28); d += (k ? "L" : "M") + f(Math.cos(a) * rr) + " " + f(Math.sin(a) * rr); }
  s += `<path d="${d}" fill="none" stroke="url(#pa${u})" stroke-width="${f(r * .07)}" stroke-linecap="round" opacity=".75"/>`;
  return s + `</g>`;
}

function leaf(u, x, y, l, w, rot, op = .9) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"><path d="${leafPath(l, w)}" fill="url(#lf${u})" opacity="${op}" filter="url(#wc${u})"/><path d="M0 0Q${f(w * .12)} ${f(-l * .5)} 0 ${f(-l * .95)}" stroke="#fff" stroke-opacity=".35" stroke-width=".8" fill="none"/></g>`;
}

function sprig(u, x, y, len, rot, n = 5, size = 1) {
  const R = rot * Math.PI / 180, ex = x + Math.sin(R) * len, ey = y - Math.cos(R) * len;
  let s = `<path d="M${f(x)} ${f(y)}Q${f((x + ex) / 2 + Math.cos(R) * len * .12)} ${f((y + ey) / 2 + Math.sin(R) * len * .12)} ${f(ex)} ${f(ey)}" stroke="url(#lf${u})" stroke-width="1.6" fill="none"/>`;
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1), px = x + (ex - x) * t, py = y + (ey - y) * t, ls = (22 - t * 8) * size;
    s += leaf(u, px, py, ls, ls * .42, rot - 48, .85) + leaf(u, px, py, ls, ls * .42, rot + 48, .85);
  }
  return s + leaf(u, ex, ey, 18 * size, 7 * size, rot);
}

function eucalyptus(u, x, y, len, rot, n = 7) {
  const R = rot * Math.PI / 180, ex = x + Math.sin(R) * len, ey = y - Math.cos(R) * len;
  let s = `<path d="M${f(x)} ${f(y)}Q${f((x + ex) / 2 - Math.cos(R) * len * .15)} ${f((y + ey) / 2 - Math.sin(R) * len * .15)} ${f(ex)} ${f(ey)}" stroke="${"url(#eu" + u + ")"}" stroke-width="1.3" fill="none"/>`;
  for (let i = 1; i <= n; i++) {
    const t = i / (n + .5), px = x + (ex - x) * t, py = y + (ey - y) * t, side = i % 2 ? 1 : -1, rr = 11 - t * 5;
    const ox = Math.cos(R) * rr * side, oy = Math.sin(R) * rr * side;
    s += `<ellipse cx="${f(px + ox)}" cy="${f(py + oy)}" rx="${f(rr)}" ry="${f(rr * .82)}" fill="url(#eu${u})" opacity=".78" filter="url(#wc${u})"/>`;
  }
  return s;
}

function bud(u, x, y, s, rot) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})" filter="url(#wc${u})"><path d="M0 0L0 ${f(s * 1.4)}" stroke="url(#lf${u})" stroke-width="1.3"/><path d="${petalPath(s * 1.1, s * .55)}" fill="url(#pa${u})" opacity=".9"/><path d="${leafPath(s * .7, s * .3)}" transform="rotate(-30)" fill="url(#lf${u})"/><path d="${leafPath(s * .7, s * .3)}" transform="rotate(30)" fill="url(#lf${u})"/></g>`;
}

function blossom(u, x, y, r, col, centre) {
  let s = `<g transform="translate(${f(x)} ${f(y)})" filter="url(#wc${u})">`;
  for (let i = 0; i < 5; i++) s += `<path d="${petalPath(r, r * .62)}" transform="rotate(${i * 72})" fill="${col}" opacity=".88"/>`;
  return s + `<circle r="${f(r * .26)}" fill="${centre}"/></g>`;
}

const berries = (P, pts) => pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r || 3}" fill="${P.b}" opacity=".85"/>`).join("");

/* ---------- compositions ---------- */
// Corner bouquet, drawn for the top-left corner (mirror with CSS for others)
export function bouquet(id, opts = {}) {
  const P = flora(id), u = ++UID, big = opts.big !== false;
  let s = `<svg class="fl-bq" viewBox="0 0 300 300" aria-hidden="true">${defs(u, P)}<g transform="translate(-14 -14)">`;
  // leafy backing tucked behind the blooms
  for (const [a, l] of [[-10, 70], [18, 84], [40, 64], [62, 90], [84, 70], [108, 86], [128, 66], [150, 80], [172, 60]]) s += leaf(u, 72, 72, l + 30, (l + 30) * .34, a, .9);
  s += eucalyptus(u, 40, 46, 250, 78, 9) + eucalyptus(u, 46, 40, 230, 168, 8) + eucalyptus(u, 60, 60, 200, 128, 7);
  s += sprig(u, 60, 60, 200, 52, 6, 1.25) + sprig(u, 60, 60, 185, 118, 6, 1.25) + sprig(u, 70, 70, 130, 86, 4, 1.1) + sprig(u, 50, 50, 120, 28, 3, 1) + sprig(u, 50, 50, 120, 150, 3, 1);
  s += bud(u, 214, 58, 11, 70) + bud(u, 62, 214, 11, 160) + bud(u, 168, 150, 8, 120);
  s += blossom(u, 132, 128, 9, P.p1, P.b) + blossom(u, 196, 104, 7, P.p1, P.b) + blossom(u, 104, 196, 7, P.p1, P.b);
  s += berries(P, [[236, 92, 3], [244, 100, 2.6], [228, 104, 2.4], [92, 236, 3], [100, 246, 2.5], [108, 232, 2.2]]);
  s += blossom(u, 176, 40, 8, P.p2, P.b) + blossom(u, 40, 176, 8, P.p2, P.b);
  s += rose(u, 150, 62, 32, 15) + rose(u, 58, 152, 29, -20) + rose(u, 128, 112, 20, 40);
  if (big) s += peony(u, 78, 78, 56, 10);
  else s += rose(u, 80, 80, 40, 5);
  return s + `</g></svg>`;
}

// Horizontal botanical divider
export function divider(id) {
  const P = flora(id), u = ++UID;
  let s = `<svg class="fl-div" viewBox="0 0 260 44" aria-hidden="true">${defs(u, P)}`;
  s += sprig(u, 112, 24, 96, -90, 4, .62) + sprig(u, 148, 24, 96, 90, 4, .62);
  s += blossom(u, 108, 18, 5, P.p1, P.b) + blossom(u, 152, 30, 5, P.p1, P.b);
  s += rose(u, 130, 22, 13, 10);
  return s + `</svg>`;
}

// Round wreath with an open centre (for monograms)
export function wreath(id, text = "") {
  const P = flora(id), u = ++UID, cx = 150, cy = 150, R = 104;
  let s = `<svg class="fl-wr" viewBox="0 0 300 300" aria-hidden="true">${defs(u, P)}`;
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="url(#lf${u})" stroke-width="1.2" opacity=".7"/>`;
  for (let i = 0; i < 30; i++) {
    const a = i / 30 * Math.PI * 2, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R, deg = a * 180 / Math.PI;
    s += i % 2 ? leaf(u, x, y, 20, 8, deg + 140, .85) : leaf(u, x, y, 18, 7, deg + 40, .85);
  }
  for (let i = 0; i < 10; i++) { const a = (i / 10 + .03) * Math.PI * 2; s += `<ellipse cx="${f(cx + Math.cos(a) * (R + 10))}" cy="${f(cy + Math.sin(a) * (R + 10))}" rx="7" ry="6" fill="url(#eu${u})" opacity=".7" filter="url(#wc${u})"/>`; }
  s += sprig(u, 70, 230, 70, 210, 3, .7) + sprig(u, 230, 70, 70, 30, 3, .7);
  s += bud(u, 228, 214, 9, 140) + bud(u, 72, 88, 9, -40);
  s += blossom(u, 98, 250, 7, P.p1, P.b) + blossom(u, 250, 100, 7, P.p1, P.b);
  s += rose(u, 108, 226, 22, 0) + peony(u, 70, 200, 34, 15) + rose(u, 232, 92, 20, 40) + peony(u, 204, 66, 28, -10);
  if (text) s += `<text x="150" y="170" text-anchor="middle" font-family="Pinyon Script, cursive" font-size="64" fill="${P.gold}">${text}</text>`;
  return s + `</svg>`;
}

// Wildflower meadow strip
export function meadow(id) {
  const P = flora(id), u = ++UID;
  const cols = [[P.p2, P.b], ["#FFFFFF", P.b], [P.p3, "#8E5A3C"], [P.b, "#9C6B2B"], ["#F3D7E6", P.b]];
  let s = `<svg class="fl-md" viewBox="0 0 400 130" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${defs(u, P)}`;
  let seed = 11; const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 70; i++) { const x = r() * 400, h = 30 + r() * 70, b = (r() - .5) * 30; s += `<path d="M${f(x)} 130Q${f(x + b * .4)} ${f(130 - h * .6)} ${f(x + b)} ${f(130 - h)}" stroke="url(#lf${u})" stroke-width="${f(.8 + r())}" fill="none" opacity=".8"/>`; }
  for (let i = 0; i < 12; i++) s += sprig(u, 20 + r() * 360, 130, 40 + r() * 40, (r() - .5) * 40, 3, .55);
  for (let i = 0; i < 34; i++) { const c = cols[i % cols.length], x = 8 + r() * 384, y = 40 + r() * 70; s += `<path d="M${f(x)} 130L${f(x)} ${f(y)}" stroke="url(#lf${u})" stroke-width="1" opacity=".7"/>` + blossom(u, x, y, 4 + r() * 5, c[0], c[1]); }
  for (let i = 0; i < 8; i++) s += bud(u, 20 + r() * 360, 50 + r() * 50, 6, (r() - .5) * 40);
  return s + `</svg>`;
}

// Small sprig tucked beside the wax seal
export function sealSprig(id) {
  const P = flora(id), u = ++UID;
  let s = `<svg class="fl-sp" viewBox="0 0 160 120" aria-hidden="true">${defs(u, P)}`;
  s += eucalyptus(u, 80, 70, 70, -70, 5) + eucalyptus(u, 80, 70, 70, 70, 5);
  s += sprig(u, 80, 66, 56, -110, 3, .6) + sprig(u, 80, 66, 56, 110, 3, .6);
  s += bud(u, 30, 52, 7, -80) + bud(u, 130, 52, 7, 80);
  s += rose(u, 44, 66, 15, 0) + rose(u, 116, 66, 15, 30);
  return s + `</svg>`;
}
