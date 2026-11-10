# Prüft alle Rezepte: Felder, Nummerierung, Einheiten, Eiweiß-Mindestwerte, Tipp, Duplikate.
import json, os, re, sys, difflib, itertools
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, 'texte.json'), encoding='utf-8'))
MIN_EW = {'fruehstueck': 15, 'snacks': 15, 'suess': 15}
alle, fehler, warn = [], [], []
for k in T['kapitel']:
    rp = os.path.join(ROOT, 'rezepte', f"r{k['file']}.json"); hp = os.path.join(ROOT, 'rezepte', f"h{k['file']}.json")
    if not os.path.exists(rp): fehler.append(f"fehlt: {rp}"); continue
    r = json.load(open(rp, encoding='utf-8')); h = json.load(open(hp, encoding='utf-8')) if os.path.exists(hp) else {}
    lo, hi = (k['file'] - 1) * 10 + 1, k['file'] * 10
    nums = sorted(x['n'] for x in r)
    if nums != list(range(lo, hi + 1)): fehler.append(f"{k['k']}: Nummern {nums} statt {lo}-{hi}")
    for x in r:
        for f in ['n', 'k', 't', 'p', 'zeit', 'ew', 'kcal', 'z', 's']:
            if f not in x: fehler.append(f"{x.get('n')}: Feld {f} fehlt")
        if x.get('k') != k['k']: fehler.append(f"{x['n']}: k={x.get('k')} statt {k['k']}")
        if str(x['n']) not in h: fehler.append(f"{x['n']}: Herkunftstext fehlt")
        if x['ew'] < MIN_EW.get(k['k'], 25): fehler.append(f"{x['n']} {x['t']}: nur {x['ew']} g Eiweiß")
        if not x['s'] or not re.match(r'^Tipp vom Profi', x['s'][-1]): fehler.append(f"{x['n']}: letzter Schritt kein Tipp vom Profi")
        txt = ' '.join(x['z'] + x['s'])
        for bad in [r'\bcups?\b', r'\boz\b', r'\bounce', r'°F', r'\bpound', r'\blbs?\b', r'\binch', r'Fahrenheit']:
            if re.search(bad, txt, re.I): fehler.append(f"{x['n']}: US-Einheit '{bad}'")
        if re.search(r'proteinpulver|whey|eiweißpulver', txt, re.I): warn.append(f"{x['n']}: Proteinpulver erwähnt")
        if len([s for s in x['s'] if not s.startswith('Tipp')]) < 3: warn.append(f"{x['n']}: sehr wenige Schritte")
        alle.append(x)
# Duplikate: Titel-Ähnlichkeit und Zutaten-Überschneidung
def norm(t): return re.sub(r'[^a-zäöüß ]', '', t.lower())
def zut(x): return set(re.sub(r'^[\d,./½¼¾\s]*(g|ml|el|tl|stück|bund|prise|zehen?|dose|pck\.?|l)?\s*', '', z.lower()).split('(')[0].strip() for z in x['z'] if not z.endswith(':'))
dups = []
for a, b in itertools.combinations(alle, 2):
    ts = difflib.SequenceMatcher(None, norm(a['t']), norm(b['t'])).ratio()
    za, zb = zut(a), zut(b); jo = len(za & zb) / max(1, len(za | zb))
    if ts > 0.72 or jo > 0.6: dups.append((a['n'], a['t'], b['n'], b['t'], round(ts, 2), round(jo, 2)))
print(f"Rezepte: {len(alle)}")
print(f"Fehler: {len(fehler)}"); [print('  -', f) for f in fehler]
print(f"Warnungen: {len(warn)}"); [print('  -', w) for w in warn]
print(f"Mögliche Duplikate: {len(dups)}"); [print('  -', d) for d in dups]
ews = sorted(x['ew'] for x in alle)
if alle: print(f"Eiweiß min/median/max: {ews[0]}/{ews[len(ews)//2]}/{ews[-1]} g")
sys.exit(1 if fehler else 0)
