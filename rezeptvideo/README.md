# Rezeptvideo — Schokoladen-Bananen-Crêpes

Fotorealistische Standbilder pro Zubereitungsschritt, daraus per Ken-Burns-Animation,
Text-Overlays und deutscher KI-Stimme ein 9:16-Video.

## Ergebnis

- **Format:** 1080×1920 (9:16), 30 fps, H.264 + AAC
- **Länge:** 76,24 s
- **Aufbau:** Shot 0 = Zutatenübersicht, Shots 1–9 = die neun Zubereitungsschritte einzeln

## Pipeline

| Schritt | Werkzeug | Kosten |
|---|---|---|
| 10 Bilder, fotorealistisch, 9:16, 1K | Higgsfield `recraft_v4_1` | 1,25 Credits/Bild = 12,50 |
| 10 Sprecherspuren, Deutsch | FishAudio TTS, Stimme „Vorlesen Stimlagen" (`90042f762dbf49baa2e7776d011eee6b`) | 0 Credits berechnet |
| Schnitt, Animation, Overlays, Render | higgsedit im Higgsfield-Sandbox | keine Generierungs-Credits |

Bewusst **keine** KI-Videoclips: Standbilder plus Ken-Burns-Fahrt sind bei diesem
Guthaben um ein Vielfaches günstiger und liefern bei Food-Nahaufnahmen ein
stabileres Bild als generierte Bewegung.

## Dateien

- `rezept.md` — Zutaten, Zeiten, die neun Schritte
- `storyboard.json` — pro Shot: Bildprompt, Text-Overlay, Unterzeile, Sprechertext
- `assets.json` — Quell-URLs der generierten Bilder und Tonspuren
- `gen_edit.py` — misst die Tonspuren und generiert daraus `edit.jsx`
- `build.sh` — kompletter Lauf: init → Fonts → generieren → bauen → rendern

## Reproduzieren

Assets nach `assets/` laden (URLs in `assets.json`), dann `./build.sh` im
Higgsfield-Sandbox ausführen.

## Verifikation des gerenderten Videos

- `higgsedit sweep --every 2`: 38 Stichproben, **0 leere Frames**
- 11 Stichprobenframes: alle 1080×1920, Gesamt-Streuung 69–86, Caption-Band 54–72
  (Text ist gerendert, nicht leer), Delta zwischen benachbarten Beats 44–66
- Upload: HTTP 200, 59.492.401 Bytes = exakte Dateigröße

## Quellenhinweis

Die ursprünglich angefragte Seite `genussatlas.com/rezept/schokoladen-bananen-cr-pes`
ist in dieser Session durch die Egress-Policy blockiert (`EGRESS_BLOCKED`) und konnte
nicht gelesen werden. Das Rezept in `rezept.md` ist eine eigenständige Standard-Version,
**keine Wiedergabe der Originalseite**.
