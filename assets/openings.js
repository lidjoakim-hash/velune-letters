// Velune Letters · alternative openings: embossed gatefold with a satin bow, and velvet curtains.
// Also the paper finishes applied to the invitation sheet.

const svgURL = (s) => `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(s).replace(/'/g, "%27")}')`;

// one baroque scroll, drawn for the left door; mirrored for the right
const SCROLL = `M70 30c-22 4-34 22-28 40 5 15 24 18 32 6 6-9-1-20-10-17-6 2-6 10-1 11
M42 70c-16 10-20 30-8 44 9 10 24 6 24-6 0-8-9-11-13-5
M74 76c10 16 6 38-10 52-12 10-28 8-30-6-1-9 8-14 14-8
M56 128c18 2 30 18 26 34-3 12-18 14-24 4-4-7 2-14 8-11
M34 150c-14 12-14 34 2 46 12 9 28 2 26-12-1-8-11-10-14-3
M66 182c16 6 22 26 12 40-8 11-24 9-26-3-1-8 8-12 13-6
M48 220c-10 14-6 34 10 42 12 6 24-4 20-15-3-7-12-7-14 0
M30 270c10-8 26-6 30 6M60 262c4 10 0 22-10 26
M88 40c6 14 4 30-6 40M90 110c-8 10-8 24 0 34M88 200c-6 12-4 26 4 34
M20 40c8-6 20-6 26 2M18 110c8 4 12 14 8 22M18 220c8-2 16 4 16 12`;
const LEAF = `M48 96c-12-4-20 2-22 12 10 0 18-4 22-12zM60 152c-12 2-18 10-16 20 9-3 15-10 16-20zM46 236c-12 0-18 8-16 18 9-2 15-9 16-18zM76 58c-10-6-20-2-24 7 10 2 18-1 24-7z`;
function doorArt(flip) {
  const tr = flip ? ` transform="translate(100 0) scale(-1 1)"` : "";
  const g = (stroke, dx, dy, w) => `<g${tr}><g transform="translate(${dx} ${dy})" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"><path d="${SCROLL}"/></g><g transform="translate(${dx} ${dy})" fill="${stroke}" stroke="none"><path d="${LEAF}"/></g></g>`;
  return svgURL(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 300" preserveAspectRatio="xMidYMid meet">${g("rgba(70,50,30,.24)", 1.1, 1.3, 3.2)}${g("rgba(255,255,255,1)", -.9, -1, 2.8)}${g("rgba(170,140,100,.22)", 0, 0, 2.4)}</svg>`);
}
// damask tile for the "embossed" paper finish
const DAMASK = (() => {
  const p = `M40 6c-8 8-8 18 0 26 8-8 8-18 0-26zM40 32c-14-2-22 6-22 16 10 0 18-6 22-16zM40 32c14-2 22 6 22 16-10 0-18-6-22-16zM40 48c-6 6-6 14 0 20 6-6 6-14 0-20zM10 70c6-4 14-2 16 4M70 70c-6-4-14-2-16 4M0 40c6 2 10 8 8 14M80 40c-6 2-10 8-8 14`;
  const g = (c, dx, dy, w) => `<path transform="translate(${dx} ${dy})" d="${p}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  return svgURL(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">${g("rgba(80,60,40,.10)", .8, .9, 1.6)}${g("rgba(255,255,255,.9)", -.6, -.6, 1.3)}</svg>`);
})();

export const OPENINGS = { seal: "Wax seal envelope", bow: "Gatefold with satin bow", curtain: "Velvet curtains" };
export const PAPERS = { smooth: "Smooth", embossed: "Embossed damask", linen: "Linen", watercolour: "Watercolour wash" };

const BOW = `<svg class="g-bow" viewBox="0 0 220 200" aria-hidden="true"><defs>
<linearGradient id="sat1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--g-satin-hi)"/><stop offset=".45" style="stop-color:var(--g-satin)"/><stop offset=".7" style="stop-color:var(--g-satin-lo)"/><stop offset="1" style="stop-color:var(--g-satin)"/></linearGradient>
<linearGradient id="sat2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--g-satin-hi)"/><stop offset=".5" style="stop-color:var(--g-satin)"/><stop offset="1" style="stop-color:var(--g-satin-lo)"/></linearGradient>
<linearGradient id="sat3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--g-satin)"/><stop offset=".5" style="stop-color:var(--g-satin-hi)"/><stop offset="1" style="stop-color:var(--g-satin-lo)"/></linearGradient>
<filter id="bsh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-opacity=".28"/></filter></defs>
<g filter="url(#bsh)">
 <g class="tail l"><path d="M104 92C92 118 74 150 52 192l22-6 10 12c14-40 26-74 30-100z" fill="url(#sat2)"/><path d="M100 104c-8 22-20 50-34 80" stroke="rgba(255,255,255,.5)" stroke-width="2" fill="none"/></g>
 <g class="tail r"><path d="M116 92c12 26 30 58 52 100l-22-6-10 12c-14-40-26-74-30-100z" fill="url(#sat1)"/><path d="M120 104c8 22 20 50 34 80" stroke="rgba(0,0,0,.08)" stroke-width="2" fill="none"/></g>
 <g class="loop l"><path d="M108 84C88 54 44 34 24 50c-18 14-6 44 18 50 22 6 46-2 66-16z" fill="url(#sat1)"/><path d="M100 82C80 64 52 52 36 60" stroke="rgba(255,255,255,.65)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M104 86C84 92 60 96 44 90" stroke="rgba(0,0,0,.1)" stroke-width="3" fill="none"/></g>
 <g class="loop r"><path d="M112 84c20-30 64-50 84-34 18 14 6 44-18 50-22 6-46-2-66-16z" fill="url(#sat2)"/><path d="M120 82c20-18 48-30 64-22" stroke="rgba(255,255,255,.55)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M116 86c20 6 44 10 60 4" stroke="rgba(0,0,0,.1)" stroke-width="3" fill="none"/></g>
 <g class="knot"><path d="M96 72c8-6 20-6 28 0 4 8 4 20 0 28-8 6-20 6-28 0-4-8-4-20 0-28z" fill="url(#sat3)"/><path d="M100 78c6-3 14-3 20 0" stroke="rgba(255,255,255,.7)" stroke-width="2" fill="none" stroke-linecap="round"/></g>
</g></svg>`;

const VALANCE = svgURL(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 70" preserveAspectRatio="none"><defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient></defs><path d="M0 0h400v40c-20 22-46 22-66 0-20 22-46 22-66 0-20 22-46 22-66 0-20 22-46 22-68 0-20 22-46 22-66 0-20 22-46 22-68 0z" fill="url(#v)"/><path d="M0 40c22 22 46 22 68 0 20 22 46 22 66 0 22 22 46 22 68 0 20 22 46 22 66 0 20 22 46 22 66 0 20 22 46 22 66 0" fill="none" stroke="#d8b46a" stroke-width="3"/></svg>`);

/** markup for the gate, placed inside .stage */
export function gateHTML(kind, names, tapText) {
  if (kind === "bow") return `<div class="gate g-gatefold" role="button" tabindex="0" aria-label="${tapText}">
    <div class="g-door l" style="--art:${doorArt(false)}"></div><div class="g-door r" style="--art:${doorArt(true)}"></div>
    <div class="g-band"></div>${BOW}
    <div class="g-label"><p class="g-names">${names}</p><p class="g-tap">${tapText}</p></div></div>`;
  if (kind === "curtain") return `<div class="gate g-curtain" role="button" tabindex="0" aria-label="${tapText}">
    <div class="g-drape l"><i class="tie"></i></div><div class="g-drape r"><i class="tie"></i></div>
    <div class="g-valance" style="--val:${VALANCE}"></div>
    <div class="g-label"><p class="g-names">${names}</p><p class="g-tap">${tapText}</p></div></div>`;
  return "";
}
export const TAP_GATE = { bow: { en: "Untie the bow to open", ro: "Desfaceți fundița pentru a deschide", no: "Løs opp sløyfen for å åpne", it: "Sciogli il fiocco per aprire", es: "Desata el lazo para abrir", fr: "Dénouez le ruban pour ouvrir", de: "Schleife lösen zum Öffnen", pt: "Desate o laço para abrir", sv: "Knyt upp rosetten för att öppna", da: "Løsn sløjfen for at åbne", pl: "Rozwiąż kokardę, aby otworzyć", nl: "Maak de strik los om te openen" },
  curtain: { en: "Tap to draw the curtains", ro: "Atingeți pentru a trage cortina", no: "Trykk for å trekke fra gardinene", it: "Tocca per aprire il sipario", es: "Toca para abrir el telón", fr: "Touchez pour ouvrir le rideau", de: "Tippen, um den Vorhang zu öffnen", pt: "Toque para abrir a cortina", sv: "Tryck för att dra isär draperiet", da: "Tryk for at trække gardinet fra", pl: "Dotknij, aby odsłonić kurtynę", nl: "Tik om het gordijn te openen" } };
export const PAPER_TILE = { embossed: DAMASK };
export const GATE_MS = { bow: 2600, curtain: 2300 };
