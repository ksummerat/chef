# Erzeugt bilder/bild-prompts.docx und bilder/bild-prompts.md (Kapitelbilder + Cover)
import os, json
from docx import Document
from docx.shared import Pt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, 'texte.json'), encoding='utf-8'))

BASE = ("Photorealistic editorial food photography, vertical 2:3 portrait format, shot on a full-frame camera with an 85 mm lens, "
        "soft directional window light from the left, shallow depth of field, rich natural colors, slightly warm color grading, "
        "rustic yet clean styling, linen napkin, matte ceramic plates, dark wooden or stone surface. "
        "Keep the upper third of the image calm and uncluttered (soft blurred background) so a chapter title can be placed there later. "
        "No text, no letters, no logos, no watermark, no people, no hands. Ultra detailed, high resolution, 2250 x 3150 pixels.")

KAP = {
  1: ("Frühstück & Eier", "A hearty high-protein breakfast table: a cast-iron pan of shakshuka with poached eggs and crumbled feta, a bowl of thick Icelandic skyr topped with blueberries and toasted almonds, fluffy cottage-cheese pancakes with a drizzle of honey, a small plate of smoked salmon with scrambled eggs and chives, a cup of black coffee. Morning light, white and oatmeal tones, fresh herbs scattered."),
  2: ("Snacks, Dips & Aufstriche", "A generous mezze-style spread of protein-rich dips and spreads: creamy hummus swirled with olive oil and paprika, Austrian Liptauer cheese spread with paprika and chives, a tuna and white-bean spread, roasted crunchy chickpeas in a small bowl, steamed edamame with flaky salt, grilled chicken skewers, sliced cucumber, radishes and rye bread. Overhead angle, warm earthy palette."),
  3: ("Suppen & Eintöpfe", "A rustic bowl of thick red-lentil soup with a swirl of yogurt and fresh coriander next to a dark enamel pot of Hungarian goulash soup with chunks of beef and paprika, a ladle resting on the pot, crusty bread torn open, a linen cloth, steam rising. Deep reds, oranges and browns, cosy warm light."),
  4: ("Salate & Bowls", "A vibrant salmon poke bowl with sushi rice, avocado, edamame, cucumber and sesame, beside a Styrian bean salad with black scarlet-runner beans, red onion and halved soft-boiled eggs dressed with dark pumpkin-seed oil, and a chicken Caesar salad with parmesan shavings. Bright, fresh, overhead angle, greens and golden tones."),
  5: ("Geflügel", "A whole roasted chicken with crisp golden skin resting on a wooden board, carved breast slices showing juicy meat, a small pan of chicken curry with coconut sauce and fresh coriander, lemon halves, rosemary and thyme sprigs, coarse salt. Warm golden light, rustic farmhouse kitchen feel."),
  6: ("Rind, Schwein & Lamm", "A perfectly seared beef ribeye steak sliced to reveal a pink medium-rare center, resting on a dark board with flaky salt and cracked pepper, beside a cast-iron pan with pork tenderloin medallions in a mustard crust and two lamb chops with a rosemary-garlic glaze. Dramatic moody light, deep browns, charred edges, a glass of red wine blurred in the background."),
  7: ("Fisch & Meeresfrüchte", "A salmon fillet with crisp golden skin on a bed of lentils, a pan of garlic prawns sizzling in olive oil with parsley and lemon, a whole pan-fried alpine char (trout-like fish) with browned butter and almonds, lemon wedges and dill. Fresh coastal feel, blue-grey linen, white ceramic, cool daylight with warm accents."),
  8: ("Hülsenfrüchte, Tofu & Co.", "A plant-based protein feast: crispy golden pan-fried tofu cubes with sesame and spring onion, a bowl of chickpea curry with spinach, baked falafel with tahini sauce, a lentil bolognese over pasta, a plate of grilled tempeh slices, bowls of dried beans and red lentils as props. Earthy greens, ochres and terracotta, natural daylight."),
  9: ("Aufläufe, Pfannen & Meal-Prep", "A bubbling golden-brown lasagne in a ceramic baking dish fresh from the oven with one portion lifted out, next to a row of glass meal-prep containers neatly filled with grilled chicken, rice, broccoli and edamame, and a sheet-pan frittata cut into squares. Organised, clean kitchen counter, warm oven light, inviting and practical."),
  10: ("Desserts & Süßes mit Protein", "Elegant high-protein desserts: a glass of quark mousse with fresh raspberries, a slice of creamy skyr cheesecake, a bowl of chia pudding with skyr and mango, a frozen yogurt bark with berries and dark chocolate shards, a small lemon-ricotta cream with pistachios. Light pastel palette, white marble surface, soft bright daylight, fresh mint leaves."),
}

COVER = f"""Book cover design, vertical 2:3 portrait format, ultra high quality, upscale to at least 2100 x 3150 pixels.

Photorealistic editorial food photography as the background: a rustic wooden table seen from a slightly elevated angle, filled with high-protein dishes – a sliced juicy roast chicken breast with crisp skin, a seared steak cut open, a salmon fillet on green lentils, a bowl of creamy skyr with berries, a pan of shakshuka with eggs, a plate of crispy golden tofu, bowls of chickpeas and red lentils, fresh herbs, lemon halves and a linen napkin. Colorful, modern, fresh and appetizing; warm natural side light; deep green, golden and terracotta color palette. NO red background. The upper third of the image is calmer and slightly darker so the title is clearly readable.

Text printed in the image, exactly as written, in a bold modern serif typeface, white or soft cream with a thin dark outline for contrast:

Title at the top, large, two lines: "PROTEINREICH KOCHEN" and below it "WIE EIN PROFI" (the words "WIE EIN PROFI" may be in a warm gold tone).

Subtitle below the title, smaller, one or two lines: "Eiweißreiche Rezepte für Alltag, Sport & Familie – ganz ohne Proteinpulver"

At the bottom, centered, medium size, letter-spaced: "KURT SUMMER"

All text at least 5 % away from every edge of the image. No other text, no numbers, no recipe count, no logos, no watermark. Clean, professional, bestseller cookbook look."""

md = ["# Bild-Prompts – " + T['titel'], "", "## Kapitelbilder (Hochformat 2:3, mind. 2250 × 3150 px, 300 dpi, kein Text im Bild)", ""]
doc = Document()
st = doc.styles['Normal']; st.font.name = 'Calibri'; st.font.size = Pt(11)
doc.add_heading('Bild-Prompts – ' + T['titel'], 0)
doc.add_paragraph('Kapitelbilder: Hochformat 2:3, mindestens 2250 × 3150 Pixel (300 dpi), randlos mit Beschnitt. Kein Text im Bild. Dateien als bilder/k1.jpg … bilder/k10.jpg ablegen.')
for i in range(1, 11):
    name, scene = KAP[i]
    prompt = scene + " " + BASE
    doc.add_heading(f'Kapitel {i + 1:02d} – {name}  (Datei: bilder/k{i}.jpg)', level=1)
    doc.add_paragraph(prompt)
    md += [f"## Kapitel {i + 1:02d} – {name} (bilder/k{i}.jpg)", "", prompt, ""]
doc.add_heading('Cover (Datei: bilder/cover.jpg)', level=1)
for para in COVER.split("\n\n"):
    doc.add_paragraph(para)
md += ["## Cover (bilder/cover.jpg)", "", COVER, ""]
os.makedirs(os.path.join(ROOT, 'bilder'), exist_ok=True)
doc.save(os.path.join(ROOT, 'bilder', 'bild-prompts.docx'))
open(os.path.join(ROOT, 'bilder', 'bild-prompts.md'), 'w', encoding='utf-8').write("\n".join(md))
print('ok')
