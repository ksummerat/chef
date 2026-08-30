export default async ({ project }) => {
  const p = await project({ dir: "proj", size: "1080x1920", fps: 30, background: "#0b0b0d" });
  const BEATS = [{"i": 0, "img": "assets/shot_0.png", "vo": "assets/vo_0.mp3", "dur": 17.81, "adur": 17.08, "overlay": "SCHOKO-BANANEN-CREPES", "sub": "4 Portionen · 25 Min · Einfach"}, {"i": 1, "img": "assets/shot_1.png", "vo": "assets/vo_1.mp3", "dur": 5.32, "adur": 4.59, "overlay": "1 · Trockene Zutaten mischen", "sub": "250 g Mehl · 2 EL Zucker · 1 Prise Salz"}, {"i": 2, "img": "assets/shot_2.png", "vo": "assets/vo_2.mp3", "dur": 7.02, "adur": 6.29, "overlay": "2 · Eier & Milch einrühren", "sub": "3 Eier · 500 ml Milch · glatt rühren"}, {"i": 3, "img": "assets/shot_3.png", "vo": "assets/vo_3.mp3", "dur": 5.98, "adur": 5.25, "overlay": "3 · Butter dazu, 30 Min ruhen", "sub": "50 g geschmolzene Butter"}, {"i": 4, "img": "assets/shot_4.png", "vo": "assets/vo_4.mp3", "dur": 6.58, "adur": 5.85, "overlay": "4 · Schokosauce schmelzen", "sub": "200 g Zartbitter · 100 ml Sahne"}, {"i": 5, "img": "assets/shot_5.png", "vo": "assets/vo_5.mp3", "dur": 4.51, "adur": 3.78, "overlay": "5 · Bananen schneiden", "sub": "4 reife Bananen, dünne Scheiben"}, {"i": 6, "img": "assets/shot_6.png", "vo": "assets/vo_6.mp3", "dur": 7.65, "adur": 6.92, "overlay": "6 · Teig dünn ausbacken", "sub": "Eine dünne Kelle in die heiße Pfanne"}, {"i": 7, "img": "assets/shot_7.png", "vo": "assets/vo_7.mp3", "dur": 8.01, "adur": 7.28, "overlay": "7 · Wenden, goldbraun backen", "sub": "ca. 2 Minuten pro Seite"}, {"i": 8, "img": "assets/shot_8.png", "vo": "assets/vo_8.mp3", "dur": 6.42, "adur": 5.69, "overlay": "8 · Füllen & belegen", "sub": "Schokosauce + Bananenscheiben"}, {"i": 9, "img": "assets/shot_9.png", "vo": "assets/vo_9.mp3", "dur": 6.94, "adur": 6.21, "overlay": "9 · Falten & servieren", "sub": "Mit Puderzucker bestäuben"}];
  const W = 1080, H = 1920, M = 72;
  let at = 0;
  for (const b of BEATS) {
    const img = await p.add(b.img);
    const vo = await p.add(b.vo);
    const d = b.dur;
    p.cut(vo, { at, from: 0, dur: b.adur });
    const zin = b.i % 2 === 0;
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
