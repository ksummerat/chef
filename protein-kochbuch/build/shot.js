// Screenshots einzelner Seiten aus druck.html: node build/shot.js 2 3 5
const path=require('path');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:684,height:984}});
await p.goto('file://'+path.resolve(__dirname,'..','druck.html'));await p.evaluate(()=>document.fonts.ready);
for(const n of process.argv.slice(2)){const el=await p.$(`.page[data-pn="${n}"]`);if(!el){console.log('keine Seite',n);continue;}
const info=await el.evaluate(e=>{const bd=e.querySelector('.body');return bd?{sh:bd.scrollHeight,ch:bd.clientHeight}:null});
await el.screenshot({path:path.resolve(__dirname,`p${n}.png`)});console.log('Seite',n,JSON.stringify(info));}
await b.close();})();
