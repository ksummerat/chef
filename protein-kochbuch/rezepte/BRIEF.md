# Schreib-Brief: „Proteinreich kochen wie ein Profi" (Kurt Summer, Amazon KDP)

Zielgruppe: Deutschland/Österreich, Hobbyköche, Sportler, Abnehmwillige, Familien. Sprache: Deutsch, Du-Form, warm, klar, profi-nah ("Tipp vom Profi"), KEIN Fitness-Influencer-Jargon, KEINE Proteinpulver, KEINE Markennamen.
Alle Mengen metrisch: g, ml, EL, TL, °C, cm. Keine Cups/Unzen/°F. Umluft-Temperaturen angeben ("180 °C Umluft").
Jedes Rezept: 4 Portionen (außer Snacks/Desserts: Stückzahl angeben), mind. 25 g Eiweiß pro Portion bei Hauptgerichten, mind. 15 g bei Frühstück/Snacks/Desserts. Eiweiß realistisch aus Zutaten schätzen.
Zutaten: jede Zeile "Menge Einheit Zutat" (z. B. "400 g Hähnchenbrust"). Zwischenüberschriften enden mit ":" (z. B. "Für die Marinade:").
Schritte: 5–9 nummerierungsfreie Sätze pro Schritt-Element, präzise mit Zeiten und Temperaturen. Letzter Schritt = "Tipp vom Profi: ..." (1–2 Sätze Küchentechnik, Vorbereitung, Meal-Prep oder Variante).
Herkunftstext: 1–3 Sätze: woher das Gericht kommt / warum es ein Protein-Klassiker ist / Bezug zur Bordküche oder Alpenküche wo passend. Keine erfundenen Fakten über reale Personen.

## JSON-Format (eine Datei pro Kapitel, UTF-8)
rezepte/r<K>.json = Array von Objekten:
{ "n": 1, "k": "fruehstueck", "t": "Titel", "p": "4 Portionen", "zeit": "25 Min.", "ew": 28, "kcal": 410, "z": ["200 g ...", "Für die Sauce:", "1 EL ..."], "s": ["...", "...", "Tipp vom Profi: ..."] }
rezepte/h<K>.json = Objekt { "1": "Herkunftstext ...", "2": "..." }  (Schlüssel = Rezeptnummer als String)

## Kapitel und Nummern
K1  fruehstueck   Frühstück & Eier                 Rezepte 1–10
K2  snacks        Snacks, Dips & Aufstriche        Rezepte 11–20
K3  suppen        Suppen & Eintöpfe                Rezepte 21–30
K4  salate        Salate & Bowls                   Rezepte 31–40
K5  gefluegel     Geflügel                         Rezepte 41–50
K6  fleisch       Rind, Schwein & Lamm             Rezepte 51–60
K7  fisch         Fisch & Meeresfrüchte            Rezepte 61–70
K8  pflanzlich    Hülsenfrüchte, Tofu & Co.        Rezepte 71–80
K9  ofen          Aufläufe, Pfannen & Meal-Prep    Rezepte 81–90
K10 suess         Desserts & Süßes mit Protein     Rezepte 91–100

Keine Dopplungen innerhalb und zwischen Kapiteln (z. B. nur EIN Chili con Carne, nur EIN Shakshuka). Mischung aus Klassikern (Alpenküche, Mittelmeer, Bordküche-Favoriten) und modernen Gerichten (Bowls, Meal-Prep). Mindestens 2 vegetarische Rezepte pro Fleisch-freiem Kapitel sind ohnehin gegeben; in K1–K4, K9, K10 je mind. 3 vegetarische Rezepte.
