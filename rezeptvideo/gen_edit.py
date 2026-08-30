"""Erzeugt edit.jsx für higgsedit aus Bild-/Tonspur-Assets.

Die Beat-Länge ist die Länge der Sprecherspur plus 0,7 s Puffer; die Tonspur
selbst wird mit ihrer echten Länge geschnitten (adur), sonst überläuft der
Schnitt die Quelle.
"""
import json, subprocess

SHOTS = [
 (0,"SCHOKO-BANANEN-CREPES","4 Portionen · 25 Min · Einfach"),
 (1,"1 · Trockene Zutaten mischen","250 g Mehl · 2 EL Zucker · 1 Prise Salz"),
 (2,"2 · Eier & Milch einrühren","3 Eier · 500 ml Milch · glatt rühren"),
 (3,"3 · Butter dazu, 30 Min ruhen","50 g geschmolzene Butter"),
 (4,"4 · Schokosauce schmelzen","200 g Zartbitter · 100 ml Sahne"),
 (5,"5 · Bananen schneiden","4 reife Bananen, dünne Scheiben"),
 (6,"6 · Teig dünn ausbacken","Eine dünne Kelle in die heiße Pfanne"),
 (7,"7 · Wenden, goldbraun backen","ca. 2 Minuten pro Seite"),
 (8,"8 · Füllen & belegen","Schokosauce + Bananenscheiben"),
 (9,"9 · Falten & servieren","Mit Puderzucker bestäuben"),
]

beats = []
for i, ov, sub in SHOTS:
    d = float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "csv=p=0", f"assets/vo_{i}.mp3"]).decode().strip())
    beats.append({"i": i, "img": f"assets/shot_{i}.png", "vo": f"assets/vo_{i}.mp3",
                  "dur": round(d + 0.7, 2), "adur": round(d - 0.03, 2),
                  "overlay": ov, "sub": sub})
print("TOTAL_DURATION", round(sum(b["dur"] for b in beats), 2))

tpl = '''export default async ({ project }) => {
  const p = await project({ dir: "proj", size: "1080x1920", fps: 30, background: "#0b0b0d" });
  const BEATS = %s;
  const W = 1080, H = 1920, M = 72;
  let at = 0;
  for (const b of BEATS) {
    const img = await p.add(b.img);
    const vo = await p.add(b.vo);
    const d = b.dur;
    p.cut(vo, { at, from: 0, dur: b.adur });
    const zin = b.i %% 2 === 0;
    const kb = { property: "scale", from: zin ? 1.02 : 1.12, to: zin ? 1.12 : 1.02, duration: d * 0.98, easing: "linear" };
    const last = d - 0.02;
    const hold = Math.min(Math.max(0.6, d - 0.5), last - 0.15);
    p.compose(
      <group name={"beat-" + b.i}>
        <group width={W} height={H} x={0} y={0} origin="center" animate={[kb]}>
          <media file={img} x={0} y={0} width={W} height={H} fit="cover" />
        </group>
        <rect x={0} y={1120} width={W} height={800} fill="#000000"
              animate={[{ property: "opacity", keyframes: [
                { at: 0, value: 0 }, { at: 0.35, value: 0.62 },
                { at: hold, value: 0.62 }, { at: last, value: 0.5 } ] }]} />
        <column x={M} y={1330} width={W - 2 * M} gap={20}
                animate={[{ property: "opacity", keyframes: [
                  { at: 0, value: 0 }, { at: 0.45, value: 1 },
                  { at: hold, value: 1 }, { at: last, value: 1 } ] }]}>
          <text fontFamily="Anton" fontSize={b.i === 0 ? 82 : 70} color="#ffffff">{b.overlay}</text>
          <text fontFamily="Inter" fontSize={34} fontWeight={400} color="#f3d9a4">{b.sub}</text>
        </column>
      </group>,
      { at, dur: d, name: "beat-" + b.i },
    );
    at += d;
  }
  await p.frame(1.2, "renders/proof-00.png");
  await p.frame(BEATS[0].dur + 1.2, "renders/proof-01.png");
  await p.frame(BEATS[0].dur + BEATS[1].dur + BEATS[2].dur + 1.2, "renders/proof-03.png");
};
''' % json.dumps(beats, ensure_ascii=False)
open("edit.jsx", "w").write(tpl)
print("WROTE edit.jsx")
