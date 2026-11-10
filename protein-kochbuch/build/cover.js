// Cover-Datei für KDP: Rückseite + Rücken + Vorderseite als eine PDF.
// Aufruf: node build/cover.js   (nach build.js, liest Seitenzahl aus build/info.json)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'texte.json'), 'utf8'));
const info = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'info.json'), 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const PAPIER = process.env.PAPIER || 'standard-farbe';
const FAKTOR = { 'premium-farbe': 0.002347, 'standard-farbe': 0.002252, 'sw-weiss': 0.002252, 'sw-creme': 0.0025 }[PAPIER];
const SEITEN = info.seiten;
const BLEED = 0.125, TRIM_W = 7, TRIM_H = 10;
const SPINE = +(SEITEN * FAKTOR).toFixed(4);
const W = +(BLEED + TRIM_W + SPINE + TRIM_W + BLEED).toFixed(4);
const H = TRIM_H + 2 * BLEED;

const coverImg = ['jpg', 'jpeg', 'png'].map(e => `bilder/cover.${e}`).find(p => fs.existsSync(path.join(ROOT, p)));

const klappentext = `
<div class="kt">
  <h2>Satt, stark und zufrieden – mit echtem Essen statt Pulver</h2>
  <p>Eiweißreich essen heißt nicht Shakes trinken und Riegel kauen. Es heißt: ein saftiges Hendl aus dem Ofen, eine Linsensuppe, die eine ganze Mahlzeit ist, ein Skyr-Cheesecake, der am Sonntag auf den Tisch darf. Kurt Summer, gelernter Koch aus der Steiermark und viele Jahre Executive Chef auf Kreuzfahrtschiffen, zeigt dir in diesem Buch, wie du mit ganz normalen Zutaten aus dem Supermarkt auf eine ordentliche Eiweißmenge kommst – und dich dabei auf jedes Essen freust.</p>
  <p>${info.rezepte} Rezepte, vom Frühstück bis zum Dessert, jedes mit nachgerechneter Eiweißmenge pro Portion, mit Herkunftstext und einem Tipp aus der Profiküche. Keine Spezialzutaten, keine Geräte, die du nicht hast, kein Proteinpulver.</p>
  <ul>
    <li>➜ Frühstück, Snacks, Suppen, Salate und Bowls</li>
    <li>➜ Geflügel, Rind, Schwein, Lamm, Fisch und Meeresfrüchte</li>
    <li>➜ Ein ganzes Kapitel pflanzlich: Hülsenfrüchte, Tofu, Tempeh</li>
    <li>➜ Aufläufe, Pfannen und Meal-Prep für die ganze Woche</li>
    <li>➜ Desserts mit Topfen, Skyr und Ricotta – süß und eiweißreich</li>
    <li>➜ Alle Mengen in Gramm und Millilitern, Temperaturen in °C</li>
    <li>➜ Eiweiß und Kalorien pro Portion bei jedem Rezept</li>
  </ul>
  <h3>Über den Autor</h3>
  <p>Kurt Summer hat in klassischen Küchen gelernt und danach viele Jahre auf Kreuzfahrtschiffen und Privatjachten gekocht, zuletzt als Executive Chef für mehrere tausend Gäste täglich. Heute lebt er wieder in der Steiermark, schreibt Kochbücher und gibt weiter, was er in über zwanzig Jahren Profiküche gelernt hat: ehrlich kochen, gut essen, jeden Tag.</p>
</div>`;

// Coverbild: scharf mit ~92 % Größe (alle Texte sicher ≥ 0,25" innerhalb der Schnittkante), Rand mit weichgezeichneter Kopie gefüllt
const front = coverImg
  ? `<div class="cbg" style="background-image:url('${coverImg}')"></div><img class="ci" src="${coverImg}">`
  : `<div class="ph"><div class="ph-in"><div class="pt">${esc(T.titel).toUpperCase().replace(' WIE EIN PROFI', '<br><span>WIE EIN PROFI</span>')}</div><div class="ps">${esc(T.untertitel)}</div><div class="pa">KURT SUMMER</div></div></div>`;

const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>
@page { size: ${W}in ${H}in; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; color: #1d1d1b; }
.cover { position: relative; width: ${W}in; height: ${H}in; overflow: hidden; background: #f4f1e8; }
.back { position: absolute; left: 0; top: 0; width: ${BLEED + TRIM_W}in; height: ${H}in; background: #f4f1e8; }
.back .inner { position: absolute; left: ${BLEED + 0.45}in; top: ${BLEED + 0.7}in; width: ${TRIM_W - 0.9}in; bottom: ${BLEED + 0.5}in; }
.kt h2 { font-family: 'Caladea', serif; font-size: 20pt; line-height: 1.2; color: #2f5d3a; margin: 0 0 14pt; }
.kt h3 { font-family: 'Caladea', serif; font-size: 14pt; color: #2f5d3a; margin: 18pt 0 6pt; }
.kt p { font-size: 11pt; line-height: 1.62; margin: 0 0 12pt; text-align: justify; }
.kt ul { list-style: none; padding: 0; margin: 8pt 0 10pt; }
.kt li { font-size: 11pt; line-height: 1.75; }
.barcode { position: absolute; right: ${0.25}in; bottom: ${0.25}in; width: 2in; height: 1.2in; }
.spine { position: absolute; left: ${BLEED + TRIM_W}in; top: 0; width: ${SPINE}in; height: ${H}in; background: #000; }
.spine .txt { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) rotate(90deg); transform-origin: center; white-space: nowrap; color: #fff; font-family: 'Caladea', serif; font-weight: 700; font-size: ${Math.min(13, Math.max(7, SPINE * 72 * 0.45)).toFixed(1)}pt; letter-spacing: .06em; }
.front { position: absolute; left: ${BLEED + TRIM_W + SPINE}in; top: 0; width: ${TRIM_W + BLEED}in; height: ${H}in; overflow: hidden; }
.front .cbg { position: absolute; inset: -0.3in; background-size: cover; background-position: center; filter: blur(14px) brightness(.75); }
.front .ci { position: absolute; left: 4%; top: 2.4%; width: 92%; height: 95.2%; object-fit: contain; display: block; box-shadow: 0 0 0.12in rgba(0,0,0,.35); }
.ph { width: 100%; height: 100%; background: linear-gradient(165deg, #3b7249 0%, #1f3f29 55%, #0f2417 100%); position: relative; }
.ph::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 70% 20%, rgba(201,164,59,.45), transparent 50%); }
.ph-in { position: absolute; left: 0.6in; right: 0.6in; top: 1.2in; bottom: 0.9in; display: flex; flex-direction: column; justify-content: space-between; text-align: center; color: #fff; }
.pt { font-family: 'Caladea', serif; font-weight: 700; font-size: 40pt; line-height: 1.05; letter-spacing: .01em; text-shadow: 0 2px 8px rgba(0,0,0,.4); }
.pt span { color: #e6c35a; }
.ps { font-size: 13pt; line-height: 1.4; max-width: 5in; margin: 0 auto; background: rgba(0,0,0,.25); padding: 10pt 14pt; border-radius: 4pt; }
.pa { font-family: 'Caladea', serif; font-size: 22pt; letter-spacing: .25em; }
.note { position: absolute; left: 0.3in; bottom: 0.05in; font-size: 6pt; color: #999; }
</style></head><body><div class="cover">
<div class="back"><div class="inner">${klappentext}</div><div class="barcode"></div></div>
<div class="spine">${SEITEN >= 100 ? `<div class="txt">${esc(T.titel).toUpperCase()} &nbsp;·&nbsp; KURT SUMMER</div>` : ''}</div>
<div class="front">${front}</div>
</div></body></html>`;
fs.writeFileSync(path.join(ROOT, 'cover.html'), html);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(ROOT, 'cover.html'));
  await page.evaluate(() => document.fonts.ready);
  let dpi = null;
  if (coverImg) {
    const dim = await page.evaluate(() => { const i = document.querySelector('.front img'); return { w: i.naturalWidth, h: i.naturalHeight }; });
    dpi = { w: dim.w, h: dim.h, dpi_x: Math.round(dim.w / (TRIM_W + BLEED)), dpi_y: Math.round(dim.h / H) };
    if (dpi.dpi_x < 300 || dpi.dpi_y < 300) console.warn(`WARNUNG: Coverbild nur ${dpi.dpi_x}×${dpi.dpi_y} dpi (Bild ${dim.w}×${dim.h} px). Für 300 dpi mindestens ${Math.ceil(300 * (TRIM_W + BLEED))}×${Math.ceil(300 * H)} px.`);
  }
  await page.pdf({ path: path.join(ROOT, 'cover.pdf'), width: `${W}in`, height: `${H}in`, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, preferCSSPageSize: true });
  await browser.close();
  const out = { papier: PAPIER, seiten: SEITEN, ruecken_zoll: SPINE, gesamtbreite_zoll: W, hoehe_zoll: H, coverbild: coverImg || null, aufloesung: dpi };
  fs.writeFileSync(path.join(ROOT, 'build', 'cover-info.json'), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out));
})().catch(e => { console.error(e); process.exit(1); });
