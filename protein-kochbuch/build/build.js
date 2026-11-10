// Build-Script: erzeugt druck.html (alles fest eingebaut, gemessene Seitenaufteilung)
// und innen.pdf (7,125 x 10,25 Zoll inkl. Beschnitt) für Amazon KDP.
// Aufruf: node build/build.js   (aus dem Ordner protein-kochbuch)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'texte.json'), 'utf8'));
const PX = 96; // CSS px pro Zoll
const BODY_W = 5.625, BODY_H = 8.75; // Zoll
const BODY_H_PX = BODY_H * PX;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- Rezepte laden ----------
const kapitel = T.kapitel.filter(k => !process.env.PARTIAL || fs.existsSync(path.join(ROOT, 'rezepte', `r${k.file}.json`))).map(k => {
  const r = JSON.parse(fs.readFileSync(path.join(ROOT, 'rezepte', `r${k.file}.json`), 'utf8'));
  const h = JSON.parse(fs.readFileSync(path.join(ROOT, 'rezepte', `h${k.file}.json`), 'utf8'));
  r.forEach(x => { x.herkunft = h[String(x.n)] || ''; });
  r.sort((a, b) => a.n - b.n);
  return { ...k, rezepte: r };
});
const alle = kapitel.flatMap(k => k.rezepte);
const ANZ = alle.length;

// ---------- CSS ----------
const CSS = `
@page { size: 7.125in 10.25in; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; }
body { font-family: 'Inter', 'Liberation Sans', sans-serif; font-size: 9pt; line-height: 1.38; color: #1d1d1b; }
.page { width: 7.125in; height: 10.25in; position: relative; overflow: hidden; background: #fff; page-break-after: always; break-after: page; }
.page:last-child { page-break-after: auto; }
.body { position: absolute; left: 0.75in; top: 0.7in; width: ${BODY_W}in; height: ${BODY_H}in; overflow: hidden; }
.ft { position: absolute; left: 0.75in; right: 0.75in; bottom: 0.42in; display: flex; justify-content: space-between; font-size: 7.2pt; color: #7a7a76; letter-spacing: .01em; }
.ft .pn { font-weight: 600; color: #2f5d3a; }
h1, h2, h3, .serif { font-family: 'Caladea', 'DejaVu Serif', serif; }
p { margin: 0 0 7pt 0; text-align: justify; hyphens: auto; -webkit-hyphens: auto; }
/* Titelseite */
.tp { text-align: center; padding-top: 2.4in; }
.tp h1 { font-size: 30pt; line-height: 1.12; margin: 0 0 14pt; color: #2f5d3a; }
.tp .sub { font-family: 'Caladea', serif; font-size: 14pt; color: #444; line-height: 1.35; margin: 0 auto 0.5in; max-width: 4.6in; }
.tp .rule { width: 1.2in; height: 3px; background: #c9a43b; margin: 0 auto 0.5in; }
.tp .imp { font-size: 9.5pt; color: #666; letter-spacing: .04em; }
/* Inhaltsverzeichnis */
.toc h2 { font-size: 20pt; color: #2f5d3a; margin: 0 0 10pt; }
.tl { display: flex; align-items: baseline; margin: 0 0 2.2pt; }
.tl .t { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tl .d { flex: 1; border-bottom: 1px dotted #b8b8b4; margin: 0 5px; min-width: 12px; position: relative; top: -3px; }
.tl .p { font-variant-numeric: tabular-nums; }
.tl.k { font-weight: 700; margin-top: 7pt; font-size: 9.5pt; color: #2f5d3a; }
.tl.k .d { border-bottom-color: #2f5d3a; }
.tl.s { padding-left: 14pt; font-size: 8.6pt; }
.tl.s .n { display: inline-block; width: 18pt; color: #8a8a86; }
/* Kapitel-Trennseite */
.div { background: #2f5d3a; }
.div img, .div .ph { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.div .ph { background: linear-gradient(160deg, #3b7249 0%, #1f3f29 60%, #0f2417 100%); }
.div .ph::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 30% 25%, rgba(201,164,59,.35), transparent 45%); }
.div .box { position: absolute; left: 0.75in; right: 0.75in; top: 3.6in; background: rgba(255,255,255,.94); padding: 0.32in 0.35in 0.36in; text-align: center; border-top: 4px solid #c9a43b; }
.div .box .kn { font-size: 10pt; letter-spacing: .25em; color: #2f5d3a; font-weight: 600; margin-bottom: 8pt; }
.div .box h2 { font-size: 26pt; line-height: 1.15; margin: 0; color: #1d1d1b; }
/* Textseiten */
.sec h2 { font-size: 20pt; color: #2f5d3a; margin: 0 0 4pt; line-height: 1.15; }
.sec .kn { font-size: 9pt; letter-spacing: .25em; color: #c9a43b; font-weight: 600; margin-bottom: 6pt; }
.sec h3 { font-size: 13pt; color: #2f5d3a; margin: 4pt 0 5pt; }
.sec p { font-size: 9.4pt; line-height: 1.45; }
.um { overflow: hidden; }
.um .foto { float: left; width: 2.05in; height: 2.6in; margin: 4pt 14pt 6pt 0; background: #e9ebe6; border: 1px solid #cfd3cb; display: flex; align-items: center; justify-content: center; color: #8a8a86; font-size: 8pt; text-align: center; padding: 8px; }
.um .foto:has(img) { padding: 0; border: none; background: none; }
.um .foto img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 22%; display: block; }
.sig { font-family: 'Caladea', serif; font-size: 12pt; color: #2f5d3a; }
.cp { font-size: 8.8pt; color: #333; padding-top: 5.2in; }
.cp p { text-align: left; margin-bottom: 5pt; }
/* Rezepte */
.rh { margin-bottom: 6pt; }
.rh .nr { font-size: 8.5pt; letter-spacing: .2em; color: #c9a43b; font-weight: 600; }
.rh h2 { font-size: 17pt; line-height: 1.15; margin: 1pt 0 5pt; color: #1d1d1b; }
.meta { display: flex; gap: 6pt; flex-wrap: wrap; margin-bottom: 6pt; }
.meta span { font-size: 7.6pt; border: 1px solid #d5d8d1; border-radius: 3px; padding: 1.5pt 6pt; color: #333; background: #f7f8f5; }
.meta span b { color: #2f5d3a; }
.hk { font-style: italic; color: #4a4a47; font-size: 8.8pt; margin: 0 0 7pt; }
.zh { font-size: 8pt; letter-spacing: .18em; font-weight: 700; color: #2f5d3a; text-transform: uppercase; margin: 2pt 0 3pt; border-bottom: 1px solid #2f5d3a; padding-bottom: 1.5pt; }
.zt { display: grid; grid-template-columns: 1fr 1fr; column-gap: 14pt; row-gap: 0; margin-bottom: 7pt; }
.zt div { font-size: 8.7pt; line-height: 1.32; padding: 1pt 0; border-bottom: 1px dotted #e1e3dd; }
.zt div.g { grid-column: 1 / -1; font-weight: 700; color: #2f5d3a; border-bottom: none; margin-top: 3pt; font-size: 8.3pt; }
.st { display: flex; gap: 7pt; margin-bottom: 4.5pt; }
.st .no { flex: 0 0 15pt; height: 15pt; border-radius: 50%; background: #2f5d3a; color: #fff; font-size: 8pt; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 1pt; }
.st p { margin: 0; flex: 1; text-align: left; font-size: 9pt; }
.tip { background: #f3f0e4; border-left: 3px solid #c9a43b; padding: 5pt 8pt; font-size: 8.7pt; margin: 3pt 0 0; }
.tip b { color: #8a6d1a; }
.sep { height: 14pt; border-bottom: 1px solid #d5d8d1; margin-bottom: 12pt; }
.cont { font-size: 11pt; color: #2f5d3a; margin: 0 0 8pt; padding-bottom: 3pt; border-bottom: 1px solid #c9a43b; }
.cont small { font-weight: 400; color: #8a8a86; font-size: 8.5pt; }
#measure { position: absolute; left: 0; top: 0; width: ${BODY_W}in; visibility: hidden; }
#measure > .mb, .blk { display: flow-root; }
`;

// ---------- Block-Erzeugung ----------
// Ein Block: { html, keepNext, newPage, rec, kind }
const blocks = [];
const B = (html, o = {}) => { const b = { html, ...o }; blocks.push(b); return b; };

function rezeptBlocks(r) {
  const head = `<div class="rh"><div class="nr">REZEPT ${r.n}</div><h2>${esc(r.t)}</h2>` +
    `<div class="meta"><span><b>${esc(r.p)}</b></span><span>${esc(r.zeit)}</span><span><b>${esc(r.ew)} g Eiweiß</b> pro Portion</span><span>${esc(r.kcal)} kcal</span></div>` +
    (r.herkunft ? `<p class="hk">${esc(r.herkunft)}</p>` : '') + `</div>`;
  const zut = `<div class="zh">Zutaten</div><div class="zt">` + r.z.map(z => /:\s*$/.test(z) ? `<div class="g">${esc(z)}</div>` : `<div>${esc(z)}</div>`).join('') + `</div><div class="zh">Zubereitung</div>`;
  const list = [];
  list.push(B(head, { rec: r.n, kind: 'head', keepNext: true }));
  list.push(B(zut, { rec: r.n, kind: 'zut', keepNext: true }));
  let n = 0;
  r.s.forEach(s => {
    if (/^Tipp vom Profi/i.test(s)) {
      const txt = s.replace(/^Tipp vom Profi:?\s*/i, '');
      list.push(B(`<div class="tip"><b>Tipp vom Profi:</b> ${esc(txt)}</div>`, { rec: r.n, kind: 'tip' }));
    } else {
      n++;
      list.push(B(`<div class="st"><div class="no">${n}</div><p>${esc(s)}</p></div>`, { rec: r.n, kind: 'step' }));
    }
  });
  return list;
}

// Fortsetzungs-Köpfe (werden mitgemessen, aber nur bei Bedarf verwendet)
const contBlocks = {};
alle.forEach(r => { contBlocks[r.n] = { html: `<h3 class="cont">${esc(r.t)} <small>(Fortsetzung)</small></h3>` }; });
const sepBlock = { html: `<div class="sep"></div>` };

// ---------- Seitenaufbau ----------
// Struktur: Liste von "Abschnitten": { type:'static', html } | { type:'flow', blocks:[...] , twoPerPage:bool } | { type:'divider', kap }
const sections = [];
sections.push({ type: 'static', id: 'titel', html: `<div class="tp"><h1>${esc(T.titel).replace(' wie ein Profi', '<br>wie ein Profi')}</h1><div class="rule"></div><div class="sub">${esc(T.untertitel)}</div><div class="imp">${esc(T.auflage)} | ${esc(T.monat)} | ${esc(T.autor)}</div></div>`, noFooter: true });
sections.push({ type: 'toc' });

// Über mich
const fotoPath = ['bilder/autor.jpg', 'bilder/autor.png'].map(p => path.join(ROOT, p)).find(p => fs.existsSync(p));
const foto = fotoPath ? `<div class="foto"><img src="${path.relative(ROOT, fotoPath)}"></div>` : `<div class="foto">Autorenfoto<br>(bilder/autor.jpg)</div>`;
sections.push({ type: 'static', id: 'ueber', html: `<div class="sec um"><div class="kn">DER AUTOR</div><h2>Über mich</h2>${foto}${T.ueber_mich.map(p => `<p>${esc(p)}</p>`).join('')}</div>` });

// Einleitung als Flow
const einl = [];
const E = (html, o = {}) => einl.push({ html, ...o });
E(`<div class="sec"><div class="kn">01</div><h2>Einleitung</h2></div>`, { keepNext: true });
E(`<div class="sec"><h3>Warum dieses Kochbuch?</h3></div>`, { keepNext: true });
T.einleitung.warum.forEach(p => E(`<div class="sec"><p>${esc(p)}</p></div>`));
E(`<div class="sec"><h3>Wie man dieses Buch benutzt</h3></div>`, { keepNext: true });
T.einleitung.benutzen.forEach(p => E(`<div class="sec"><p>${esc(p)}</p></div>`));
E(`<div class="sec"><h3>Motivation für dich als Leser</h3></div>`, { keepNext: true });
T.einleitung.motivation.forEach(p => E(`<div class="sec"><p>${esc(p)}</p></div>`));
sections.push({ type: 'flow', id: 'einleitung', blocks: einl });

// Kapitel
kapitel.forEach(k => {
  sections.push({ type: 'divider', kap: k });
  const fb = [];
  k.rezepte.forEach(r => fb.push(...rezeptBlocks(r)));
  sections.push({ type: 'flow', id: k.k, blocks: fb, recipes: true });
});

// Abschluss, Danksagung, Copyright
const ab = [];
ab.push({ html: `<div class="sec"><div class="kn">12</div><h2>Abschlussworte</h2></div>`, keepNext: true });
T.abschluss.forEach((p, i) => ab.push({ html: i === T.abschluss.length - 1 ? `<div class="sec"><p class="sig">${esc(p)}</p></div>` : `<div class="sec"><p>${esc(p)}</p></div>` }));
sections.push({ type: 'flow', id: 'abschluss', blocks: ab });
const dk = [];
dk.push({ html: `<div class="sec"><div class="kn">13</div><h2>Danksagung</h2></div>`, keepNext: true });
T.danksagung.forEach(p => dk.push({ html: `<div class="sec"><p>${esc(p)}</p></div>` }));
sections.push({ type: 'flow', id: 'danksagung', blocks: dk });
sections.push({ type: 'static', id: 'copyright', html: `<div class="cp"><p><b>${esc(T.titel)}</b><br>${esc(T.untertitel)}</p><p>Copyright © ${esc(T.jahr)} ${esc(T.autor)}<br>Alle Rechte vorbehalten.</p><p>Kein Teil dieses Buches darf ohne schriftliche Genehmigung des Autors in irgendeiner Form reproduziert, gespeichert oder übertragen werden, mit Ausnahme kurzer Zitate in Rezensionen.</p><p>Die Nährwertangaben in diesem Buch sind sorgfältig geschätzte Richtwerte und ersetzen keine ärztliche oder ernährungswissenschaftliche Beratung.</p><p>Alle Bilder wurden mit Hilfe von KI erstellt.</p><p>${esc(T.isbn)}<br>Imprint: ${esc(T.imprint)}</p><p>${esc(T.auflage)}, ${esc(T.monat)}</p></div>` });

// ---------- Messen im Browser ----------
async function measure(page, items) {
  // items: [{html}] -> Höhen in px (inkl. margin-bottom)
  const html = items.map((b, i) => `<div class="mb" data-i="${i}">${b.html}</div>`).join('');
  await page.evaluate(h => { document.getElementById('measure').innerHTML = h; }, html);
  return await page.evaluate(() => Array.from(document.querySelectorAll('#measure > .mb')).map(el => el.getBoundingClientRect().height));
}

function paginateFlow(fb, opts) {
  // fb: Blöcke mit .h ; opts.recipes: zwei kurze Rezepte pro Seite erlauben, Fortsetzungsköpfe
  const pages = [];
  let cur = null, curRec = null, curComplete = true;
  const open = () => { cur = { html: [], used: 0, spanned: false }; pages.push(cur); };
  const close = () => { cur = null; };
  const fits = h => cur && cur.used + h <= BODY_H_PX + 0.5;
  const recTotal = {};
  if (opts.recipes) fb.forEach(b => { recTotal[b.rec] = (recTotal[b.rec] || 0) + b.h; });

  for (let i = 0; i < fb.length; i++) {
    const b = fb[i];
    if (opts.recipes && b.kind === 'head') {
      // neues Rezept: auf aktuelle Seite nur, wenn komplett passt und die Seite nur komplette Rezepte enthält
      const tot = recTotal[b.rec] + sepBlock.h;
      if (cur && cur.used > 0 && !cur.spanned && fits(tot)) {
        cur.html.push(`<div class="blk">${sepBlock.html}</div>`); cur.used += sepBlock.h;
      } else { if (cur) close(); open(); }
      curRec = b.rec;
    }
    if (!cur) open();
    // keepNext: Block zusammen mit dem nächsten halten
    let need = b.h;
    if (b.keepNext && fb[i + 1]) need += fb[i + 1].h;
    if (!fits(need)) {
      if (cur.used === 0) { console.warn('WARNUNG: Block größer als Seite', (b.html || '').slice(0, 80)); }
      else {
        close(); open();
        if (opts.recipes && b.kind !== 'head') { const c = contBlocks[b.rec]; cur.html.push(`<div class="blk">${c.html}</div>`); cur.used += c.h; cur.spanned = true; }
      }
    }
    cur.html.push(`<div class="blk">${b.html}</div>`); cur.used += b.h;
    if (opts.recipes && b.kind !== 'head' && b.kind !== 'zut') { /* Rezept läuft */ }
    if (opts.recipes) {
      // Seite gilt als "spanned", wenn ein Rezept hier begonnen hat und auf der nächsten weitergeht -> beim Umbruch gesetzt
    }
  }
  return pages;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1200 } });
  await page.setContent(`<!doctype html><html lang="de"><head><meta charset="utf-8"><style>${CSS}</style></head><body><div id="measure"></div></body></html>`);
  await page.evaluate(() => document.fonts.ready);

  // Alle Flow-Blöcke messen
  const flows = sections.filter(s => s.type === 'flow');
  for (const s of flows) { const hs = await measure(page, s.blocks); s.blocks.forEach((b, i) => b.h = hs[i]); }
  const contArr = alle.map(r => contBlocks[r.n]);
  const ch = await measure(page, contArr); contArr.forEach((c, i) => c.h = ch[i]);
  sepBlock.h = (await measure(page, [sepBlock]))[0];
  // Statische Seiten prüfen
  for (const s of sections.filter(x => x.type === 'static')) { s.h = (await measure(page, [s]))[0]; if (s.h > BODY_H_PX) console.warn(`WARNUNG: statische Seite "${s.id}" zu hoch: ${(s.h / PX).toFixed(2)} in`); }

  // Flows paginieren
  for (const s of flows) s.pages = paginateFlow(s.blocks, { recipes: !!s.recipes });

  // Seitenzahlen bestimmen: Inhaltsverzeichnis-Länge iterativ
  let tocPages = 2;
  let result;
  for (let iter = 0; iter < 4; iter++) {
    // Seiten durchnummerieren
    let pn = 0; const out = []; const pageOf = {}; // id -> Seite
    for (const s of sections) {
      if (s.type === 'static') { pn++; out.push({ pn, html: `<div class="blk">${s.html}</div>`, noFooter: s.noFooter, cls: '' }); pageOf[s.id] = pn; }
      else if (s.type === 'toc') { for (let t = 0; t < tocPages; t++) { pn++; out.push({ pn, toc: t, cls: '' }); } pageOf.toc = pn - tocPages + 1; }
      else if (s.type === 'divider') { pn++; out.push({ pn, divider: s.kap, noFooter: true }); pageOf['kap_' + s.kap.k] = pn; }
      else if (s.type === 'flow') {
        s.pages.forEach((p, idx) => { pn++; out.push({ pn, html: p.html.join('') }); if (idx === 0) pageOf[s.id] = pn; });
      }
    }
    // Rezept-Seiten: erste Seite, auf der der Kopf des Rezepts steht
    const recPage = {};
    for (const s of flows.filter(f => f.recipes)) {
      let p0 = pageOf[s.id];
      s.pages.forEach((p, idx) => { p.html.forEach(h => { const m = h.match(/REZEPT (\d+)<\/div>/); if (m && !recPage[m[1]]) recPage[m[1]] = p0 + idx; }); });
    }
    // TOC-Zeilen bauen
    const tl = [];
    const line = (cls, t, p, n) => `<div class="tl ${cls}">${n ? `<span class="n">${n}</span>` : ''}<span class="t">${esc(t)}</span><span class="d"></span><span class="p">${p}</span></div>`;
    tl.push({ html: `<div class="toc"><h2>Inhaltsverzeichnis</h2></div>` });
    tl.push({ html: line('k', 'Über mich', pageOf.ueber) });
    tl.push({ html: line('k', '01 Einleitung', pageOf.einleitung) });
    const einlFlow = flows.find(f => f.id === 'einleitung');
    ['Warum dieses Kochbuch?', 'Wie man dieses Buch benutzt', 'Motivation für dich als Leser'].forEach(x => {
      const idx = einlFlow.pages.findIndex(p => p.html.some(h => h.includes('<h3>' + esc(x) + '</h3>')));
      tl.push({ html: line('s', x, pageOf.einleitung + Math.max(0, idx)) });
    });
    kapitel.forEach(k => {
      tl.push({ html: line('k', `${k.nr} ${k.name}`, pageOf['kap_' + k.k]) });
      k.rezepte.forEach(r => tl.push({ html: line('s', r.t, recPage[r.n] || '?', r.n) }));
    });
    tl.push({ html: line('k', '12 Abschlussworte', pageOf.abschluss) });
    tl.push({ html: line('k', '13 Danksagung', pageOf.danksagung) });
    tl.push({ html: line('k', 'Copyright', pageOf.copyright) });
    const th = await measure(page, tl); tl.forEach((b, i) => b.h = th[i]);
    const tp = paginateFlow(tl, {});
    if (tp.length !== tocPages) { tocPages = tp.length; continue; }
    out.filter(o => o.toc !== undefined).forEach(o => { o.html = tp[o.toc].html.join(''); });
    result = out; break;
  }
  if (!result) throw new Error('Inhaltsverzeichnis konvergiert nicht');

  // ---------- HTML der Druckversion ----------
  const footer = pn => `<div class="ft"><span>${esc(T.titel)} · ${esc(T.untertitel)}</span><span class="pn">${pn}</span></div>`;
  const pagesHtml = result.map(o => {
    if (o.divider) {
      const k = o.divider;
      const img = ['jpg', 'png', 'jpeg'].map(e => `bilder/k${k.file}.${e}`).find(p => fs.existsSync(path.join(ROOT, p)));
      return `<div class="page div" data-pn="${o.pn}">${img ? `<img src="${img}">` : `<div class="ph"></div>`}<div class="box"><div class="kn">KAPITEL ${k.nr}</div><h2>${esc(k.name)}</h2></div></div>`;
    }
    return `<div class="page" data-pn="${o.pn}"><div class="body">${o.html}</div>${o.noFooter ? '' : footer(o.pn)}</div>`;
  }).join('\n');
  const doc = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${esc(T.titel)} – Druckversion</title><style>${CSS}</style></head><body>${pagesHtml}</body></html>`;
  fs.writeFileSync(path.join(ROOT, 'druck.html'), doc);

  // ---------- Überlauf prüfen & PDF ----------
  await page.goto('file://' + path.join(ROOT, 'druck.html'));
  await page.evaluate(() => document.fonts.ready);
  const over = await page.evaluate(() => Array.from(document.querySelectorAll('.page')).filter(p => { const b = p.querySelector('.body'); return b && b.scrollHeight > b.clientHeight + 1; }).map(p => p.dataset.pn));
  if (over.length) console.warn('WARNUNG: Überlauf auf Seiten', over.join(', '));
  await page.pdf({ path: path.join(ROOT, 'innen.pdf'), width: '7.125in', height: '10.25in', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, preferCSSPageSize: true });
  await browser.close();

  const info = { seiten: result.length, rezepte: ANZ, inhaltsverzeichnis_seiten: tocPages, ueberlauf: over, erstellt: new Date().toISOString() };
  fs.writeFileSync(path.join(ROOT, 'build', 'info.json'), JSON.stringify(info, null, 2));
  console.log(JSON.stringify(info));
})().catch(e => { console.error(e); process.exit(1); });
