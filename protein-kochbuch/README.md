# Proteinreich kochen wie ein Profi – KDP-Projekt

Druckfertiges Taschenbuch (7 × 10 Zoll) für Amazon KDP, Autor Kurt Summer.

## Ordner
- `texte.json` – Titel, Untertitel, Über mich, Einleitung, Abschluss, Danksagung, ISBN, Kapitelliste
- `rezepte/r1.json … r10.json` – 100 Rezepte (10 pro Kapitel), `h1.json … h10.json` – Herkunftstexte
- `bilder/` – hier `k1.jpg … k10.jpg` (Kapitelbilder), `cover.jpg` (Coverbild), `autor.jpg` (Autorenfoto) ablegen; `bild-prompts.docx` enthält alle Prompts
- `kdp/` – Beschreibung (HTML), Kategorien, Schlüsselwörter
- `build/` – Scripts
- `druck.html` / `innen.pdf` – Innenteil (wird erzeugt)
- `cover.html` / `cover.pdf` – Umschlag (wird erzeugt)

## Erzeugen
```bash
cd protein-kochbuch
python3 -I build/check.py        # Rezepte prüfen (Felder, Einheiten, Eiweiß, Duplikate)
node build/build.js              # Innenteil: druck.html + innen.pdf, misst jede Seite
node build/cover.js              # Umschlag: cover.html + cover.pdf (Rückenbreite aus Seitenzahl)
python3 build/prompts.py         # Bild-Prompts neu erzeugen
node build/shot.js 9 10          # Einzelne Seiten als PNG ansehen (build/p9.png …)
```
Nach **jeder** Änderung an Texten, Rezepten oder Bildern `build.js` und danach `cover.js` neu laufen lassen.

## Vor dem Hochladen
1. ISBN von KDP in `texte.json` (Feld `isbn`) eintragen, `build.js` neu laufen lassen.
2. Kapitelbilder, Coverbild und Autorenfoto in `bilder/` ablegen, beide Scripts neu laufen lassen.
3. `build/info.json` prüfen: `ueberlauf` muss leer sein.
4. `build/cover-info.json` prüfen: Gesamtbreite mit der KDP-Cover-Vorlage (7 × 10, Seitenzahl, Standard-Farbe) abgleichen, Auflösung ≥ 300 dpi.
5. `innen.pdf` hochladen, `cover.pdf` hochladen, KDP-Vorschau durchblättern.
