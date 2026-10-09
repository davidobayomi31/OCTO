import * as THREE from 'three';

/* ===== Settings: edit these ===== */
const LINKS = {
  apply: '', // Typeform application link, e.g. 'https://form.typeform.com/to/XXXX'
  vsl: ''    // Pitch video: a YouTube link or an .mp4 URL. Leave empty to hide.
};
const SPOTS_TAKEN = 0; // Founding clients signed so far (0–10)
/* ================================ */

// The eight legs = the client's journey through the program.
const chapters = [
  {title:'See the game',kicker:'THE GAME',summary:'Why school and a 9–5 never taught you how money works, and what changes once you can see it.',lessons:['How the system was built, and who it was built for','Why effort alone doesn’t create freedom','Deciding what you actually want'],outcome:'You stop reacting to life and start making deliberate moves.'},
  {title:'Rewire your mind',kicker:'MINDSET',summary:'Alchemy and psychology: discipline, confidence and thinking like the person you’re becoming.',lessons:['Alchemy: turning how you think into how you live','Discipline that doesn’t depend on motivation','Confidence you can carry into any conversation'],outcome:'You think and act like the person who already has what you want.'},
  {title:'Learn the skill that pays',kicker:'THE SKILL',summary:'High-ticket closing: what it is, why businesses pay well for it, and how a sales call works.',lessons:['What high-ticket closing is and where closers work','Why businesses pay commission for good closers','How a sales call runs, start to finish'],outcome:'You understand the skill and how it turns into income.'},
  {title:'Get the scripts',kicker:'SCRIPTS',summary:'The exact openers, questions and closing lines, ready to use.',lessons:['Openers that build trust in the first minute','Questions that uncover the real problem','Closing lines that ask for the decision naturally'],outcome:'You never walk into a call wondering what to say.'},
  {title:'Get your reps in',kicker:'PRACTICE',summary:'Live roleplays with other members until you sound natural, not scripted.',lessons:['Weekly roleplay rooms with other members','Practicing the hardest objections out loud','Staying calm under pressure'],outcome:'The words come naturally because you’ve said them a hundred times.'},
  {title:'Get coached on real calls',kicker:'COACHING',summary:'Our coaches review your actual calls and tell you what to fix.',lessons:['Submit recordings of your real calls','Line-by-line feedback on what to change','Track your progress call by call'],outcome:'Every call makes you better instead of just busier.'},
  {title:'Never do it alone',kicker:'COMMUNITY',summary:'The private Discord, daily accountability and weekly live calls.',lessons:['Private client Discord for questions and wins','Daily accountability so you actually do the reps','Weekly live coaching calls'],outcome:'You’re surrounded by people moving in the same direction.'},
  {title:'Own your path',kicker:'YOUR PATH',summary:'Your path past the program: the best members may be trained as closers for OCTO’s own offer.',lessons:['Turning the skill into consistent work','A path to close for OCTO’s own offer, for top members','Building a life you’re excited to wake up to'],outcome:'You leave with a skill, a plan and a path forward.'}
];

// What you get, shown on the moving wall next to the offer.
const offerTiles = [
  ['Mindset','Alchemy and psychology','Turn the way you think into the way you live.',1],
  ['The skill','High-ticket closing','The sales skill businesses pay commission for.',1],
  ['Live','Weekly coaching calls','Learn live and get your questions answered.'],
  ['Community','Private client Discord','Onboarding, homework and wins in one place.'],
  ['Scripts','Openers to closing lines','Know exactly what to say on every call.'],
  ['Practice','Live roleplay rooms','Rehearse the hard objections out loud.'],
  ['Coaching','Real call reviews','Line-by-line feedback on your actual calls.',1],
  ['Accountability','Daily check-ins','So you actually do the reps.'],
  ['What’s next','A path past the program','Top members may close for OCTO’s own offer.',1],
  ['Day one','Same-day onboarding','You start the day you join.'],
  ['Structure','Eight clear steps','Each one builds on the last.'],
  ['Payment','Flexible plans','Pay in full or use a payment plan.']
];

const $ = id => document.getElementById(id);
const pad2 = n => String(n).padStart(2, '0');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const isMobile = () => innerWidth < 760;
const clamp01 = v => Math.min(1, Math.max(0, v));

/* ---------- Apply links, spots, video ---------- */
document.querySelectorAll('[data-apply]').forEach(a => {
  if (LINKS.apply) { a.href = LINKS.apply; a.target = '_blank'; a.rel = 'noopener'; }
  else a.addEventListener('click', () => $('apply-notice').classList.add('on'));
});
const spotsLeft = Math.max(0, 10 - SPOTS_TAKEN);
$('seat-dots').innerHTML = Array.from({length:10}, (_, i) => `<i class="${i < SPOTS_TAKEN ? 'taken' : ''}"></i>`).join('');
$('seat-text').textContent = spotsLeft ? `${spotsLeft} of 10 spots left` : 'Founding 10 is full';
$('mbar-seats').textContent = spotsLeft ? `$1,000 · ${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left` : 'Founding 10 is full';
if (LINKS.vsl) {
  const yt = LINKS.vsl.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  $('vsl').innerHTML = yt ? `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="OCTO introduction" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>` : `<video src="${LINKS.vsl}" controls playsinline preload="metadata"></video>`;
  $('vsl').classList.add('on');
}

/* ---------- Marquee ---------- */
const mq = $('mq'), mqItems = mq.innerHTML;
function buildMarquee(){
  mq.innerHTML = `<div class="mq-group">${mqItems}</div>`;
  const g = mq.firstElementChild, one = g.scrollWidth, reps = Math.max(1, Math.ceil(innerWidth / one));
  g.innerHTML = mqItems.repeat(reps); mq.innerHTML += g.outerHTML;
  mq.style.setProperty('--mq-dur', (one * reps / 40) + 's');
}
buildMarquee();
let mqW = innerWidth; addEventListener('resize', () => { if (innerWidth > mqW) { mqW = innerWidth; buildMarquee(); } });

/* ---------- Offer wall: three drifting columns that follow the cursor (educate.io style) ---------- */
const wall = $('wall'), wallTrack = $('wall-track');
const tileHTML = ([tag, title, text, hl]) => `<div class="wtile${hl ? ' hl' : ''}"><span class="tag">${tag}</span><b>${title}</b><i>${text}</i></div>`;
wallTrack.innerHTML = [0, 1, 2].map(c => {
  const col = offerTiles.filter((_, i) => i % 3 === c);
  const html = col.map(tileHTML).join('');
  return `<div class="wall-col${c === 1 ? ' down' : ''}" style="--d:${34 + c * 6}s">${html}${html}</div>`;
}).join('');
let wallTX = 0, wallTY = 0, wallX = 0, wallY = 0;
wall.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  const r = wall.getBoundingClientRect();
  wallTX = -((e.clientX - r.left) / r.width - .5) * 50;
  wallTY = -((e.clientY - r.top) / r.height - .5) * 50;
});
wall.addEventListener('pointerleave', () => { wallTX = 0; wallTY = 0; });
(function wallLoop(){
  wallX += (wallTX - wallX) * .08; wallY += (wallTY - wallY) * .08;
  wallTrack.style.transform = `translate3d(${wallX.toFixed(2)}px, ${wallY.toFixed(2)}px, 0)`;
  requestAnimationFrame(wallLoop);
})();

/* ---------- Testimonials: placeholders until the Founding 10 have results ---------- */
$('testis').innerHTML = Array.from({length:4}, (_, i) => `<div class="testi rv"><div class="testi-top"><div class="testi-av">${pad2(i + 1)}</div><div><b>Founding client ${pad2(i + 1)}</b><small>Joining October 2026</small></div></div><p>Their story will be shared here once they’ve been through the program.</p></div>`).join('');

/* ---------- 3D web on the blackboard (adapted from the team's OCTO template) ---------- */
const canvas = $('web-canvas'), stage = canvas.parentElement, intro = $('intro-hud'), hero = $('hero');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile() ? 1.5 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x1b2520, .008);
const camera = new THREE.PerspectiveCamera(48, 1, .1, 120); camera.position.set(0, 0, 18);
scene.add(new THREE.AmbientLight(0xe8efe9, 1.25));
const keyLight = new THREE.PointLight(0xfffbea, 58, 55); keyLight.position.set(-4, 5, 12); scene.add(keyLight);
const fillLight = new THREE.PointLight(0x7fb8a0, 40, 48); fillLight.position.set(5, -3, -12); scene.add(fillLight);
const warmLight = new THREE.PointLight(0xfff3c4, 46, 38); warmLight.position.set(4, 3, 0); scene.add(warmLight);
const world = new THREE.Group(); scene.add(world);
const web = new THREE.Group(); world.add(web); // the 8-leg web: fades out as you scroll
const webLine = new THREE.LineBasicMaterial({color:0xc9d3cd, transparent:true, opacity:.26, depthWrite:false});
const glowLine = new THREE.LineBasicMaterial({color:0xf4f4ef, transparent:true, opacity:.5, depthWrite:false});
const yellowLine = new THREE.LineBasicMaterial({color:0xf2dc7d, transparent:true, opacity:.32, depthWrite:false});
const chalkLine = new THREE.LineBasicMaterial({color:0xf4f4ef, transparent:true, opacity:.85});
const legMaterial = new THREE.MeshPhysicalMaterial({color:0xf1f1ea, metalness:.02, roughness:.62, clearcoat:.75, clearcoatRoughness:.16});
const jointMaterial = new THREE.MeshPhysicalMaterial({color:0xf2dc7d, metalness:.02, roughness:.5, clearcoat:.9, clearcoatRoughness:.12});
const coreMaterial = new THREE.MeshPhysicalMaterial({color:0xf3f3ec, metalness:.02, roughness:.55, clearcoat:.9, clearcoatRoughness:.12, emissive:0x0f1512});
const hitMaterial = new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0, depthWrite:false});
const hitNodes = [], anchors = [], nodes = [];
const makeLine = (pts, mat, parent = web) => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat); parent.add(l); return l; };
const makeTube = (pts, r, mat, parent = web) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, r, 7, false), mat); parent.add(m); return m; };
const makeSphere = (r, mat, pos, scale = [1,1,1], parent = web) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), mat); m.position.copy(pos); m.scale.set(...scale); parent.add(m); return m; };
const pointOn = (r, a, z = 0) => new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z);
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);

const legAngles = Array.from({length:8}, (_, i) => i * Math.PI / 4 + Math.PI / 8);
for (let ring = 1; ring <= 6; ring++) {
  const radius = .72 + ring * .62, pts = [];
  for (let s = 0; s <= 192; s++) { const a = s / 192 * Math.PI * 2; pts.push(pointOn(radius + Math.sin(a * 8 + ring * .7) * .075, a, .015 * Math.sin(a * 5 + ring))); }
  makeLine(pts, ring === 6 ? glowLine : webLine);
}
const dotMat = new THREE.MeshBasicMaterial({color:0xe6ebe8, transparent:true});
for (let leg = 0; leg < 8; leg++) {
  const a = legAngles[leg], pts = [];
  for (let s = 0; s <= 24; s++) pts.push(pointOn(.2 + s / 24 * 4.2, a + Math.sin(s / 24 * Math.PI) * .035, 0));
  makeLine(pts, glowLine);
  for (let ring = 1; ring <= 6; ring++) makeSphere(.024, dotMat, pointOn(.72 + ring * .62, a, .025));
}
for (let t = 0; t < 24; t++) {
  const a = t * Math.PI / 12, pts = [];
  for (let s = 0; s <= 12; s++) { const u = s / 12; pts.push(pointOn(.8 + u * 3.72, a + u * Math.PI / 4, .02 + Math.sin(u * Math.PI) * .08)); }
  makeLine(pts, t % 4 === 0 ? yellowLine : webLine);
}
for (let i = 0; i < 8; i++) {
  const a = legAngles[i], tip = pointOn(3.38, a, .18);
  const mat = new THREE.MeshPhysicalMaterial({color:i === 0 ? 0xf4f4ef : 0xdfe5e1, emissive:0xf2dc7d, emissiveIntensity:0, metalness:.04, roughness:.48, clearcoat:1, clearcoatRoughness:.1, transparent:true});
  const node = makeSphere(.24, mat, tip); node.userData = {index:i}; hitNodes.push(node);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(.37, .014, 8, 48), new THREE.MeshBasicMaterial({color:0xf2dc7d, transparent:true, opacity:.8})); halo.position.copy(tip); web.add(halo);
  nodes.push({node, halo, mat});
  anchors.push(tip.clone().add(V(.25, .36, .12)));
  const hit = makeTube([pointOn(.2, a, .12), pointOn(1.4, a, .12), pointOn(2.5, a, .16), tip], .17, hitMaterial); hit.userData = {index:i}; hitNodes.push(hit);
}

// The big spider: its own group so it can crawl off the web to its house.
const spider = new THREE.Group(); world.add(spider);
// Every material in the web, with its starting opacity, so the whole web can fade together.
const webMats = new Map();
web.traverse(o => { if (o.material && o.material !== hitMaterial && !webMats.has(o.material)) { o.material.transparent = true; webMats.set(o.material, o.material.opacity); } });
const spiderZ = .14, legGroups = [];
makeSphere(.43, coreMaterial, V(0, -.22, spiderZ), [.88, 1.12, .72], spider);
makeSphere(.31, coreMaterial, V(0, .32, spiderZ + .12), [.92, .86, .72], spider);
const eyeMat = new THREE.MeshBasicMaterial({color:0x1a231f});
for (const [x, y] of [[-.18,.43],[-.06,.51],[.06,.51],[.18,.43]]) makeSphere(.036, eyeMat, V(x, y, spiderZ + .36), [1,1,1], spider);
for (let leg = 0; leg < 8; leg++) {
  const a = legAngles[leg], side = leg < 4 ? 1 : -1, g = new THREE.Group(); spider.add(g); legGroups.push(g);
  const pts = [V(Math.cos(a) * .23, Math.sin(a) * .23, spiderZ + .05), pointOn(.92, a + .14 * side, spiderZ + .23), pointOn(1.75, a, spiderZ + .02), pointOn(2.52, a - .08 * side, spiderZ - .18)];
  makeTube(pts, .058, legMaterial, g); makeSphere(.092, jointMaterial, pts[1], [1,1,1], g); makeSphere(.067, jointMaterial, pts[2], [1,1,1], g);
}
const shellMat = new THREE.MeshPhysicalMaterial({color:0xf6f6f0, metalness:.02, roughness:.45, clearcoat:1, clearcoatRoughness:.08, emissive:0x0f1512});
makeSphere(.47, shellMat, V(0, -.24, spiderZ + .17), [.74, 1.08, .33], spider);
const rim = new THREE.Mesh(new THREE.TorusGeometry(.36, .018, 8, 56), new THREE.MeshStandardMaterial({color:0xf2dc7d, metalness:.1, roughness:.4})); rim.position.set(0, -.24, spiderZ + .28); spider.add(rim);
const markMat = new THREE.MeshBasicMaterial({color:0x2a3530});
for (let m = 0; m < 5; m++) makeSphere(.025, markMat, V((m - 2) * .105, -.28, spiderZ + .49), [1,1,1], spider);

// The spider's lair: a silk funnel web. A sheet of threads around a mouth that curves
// away into the board, lit warm from deep inside. The spider walks here and goes in.
const lair = new THREE.Group(); world.add(lair);
const lairLine = new THREE.LineBasicMaterial({color:0xe9eee9, transparent:true, opacity:.5, depthWrite:false});
const lairFaint = new THREE.LineBasicMaterial({color:0xc9d3cd, transparent:true, opacity:.22, depthWrite:false});
const lairGold = new THREE.LineBasicMaterial({color:0xf2dc7d, transparent:true, opacity:.55, depthWrite:false});
// funnel profile: [radius, depth]; flares at the mouth, then a long tunnel into the board
const profile = [[3.1,.05],[2.3,0],[1.6,-.18],[1.08,-.5],[.78,-1],[.62,-1.7],[.55,-2.7],[.5,-4],[.47,-5.4]];
const funnelAt = (k, a) => { const [r, z] = profile[k]; return V(Math.cos(a) * r, Math.sin(a) * r, z); };
// threads running down into the tunnel
for (let t = 0; t < 22; t++) {
  const a = t / 22 * Math.PI * 2 + Math.sin(t * 3.1) * .04, pts = [];
  for (let k = 0; k < profile.length; k++) pts.push(funnelAt(k, a + k * .045));
  makeLine(new THREE.CatmullRomCurve3(pts).getPoints(48), t % 11 === 0 ? lairGold : lairLine, lair);
}
// rings around the funnel, denser near the mouth
for (let k = 0; k < 26; k++) {
  const u = Math.pow(k / 25, 1.7) * (profile.length - 1), i = Math.min(profile.length - 2, Math.floor(u)), f = u - i;
  const r = profile[i][0] + (profile[i + 1][0] - profile[i][0]) * f, z = profile[i][1] + (profile[i + 1][1] - profile[i][1]) * f, pts = [];
  for (let s2 = 0; s2 <= 96; s2++) { const a = s2 / 96 * Math.PI * 2; pts.push(V(Math.cos(a) * (r + Math.sin(a * 7 + k) * .03 * r), Math.sin(a) * (r + Math.sin(a * 7 + k) * .03 * r), z)); }
  makeLine(pts, k === 7 ? lairGold : (k > 2 && k < 10 ? lairLine : lairFaint), lair);
}
// the silk surface itself: a faint glossy shell
const silk = new THREE.Mesh(new THREE.LatheGeometry(profile.map(([r, z]) => new THREE.Vector2(r, z)), 72),
  new THREE.MeshPhysicalMaterial({color:0xf4f4ef, transparent:true, opacity:.13, roughness:.35, clearcoat:1, clearcoatRoughness:.15, side:THREE.DoubleSide, depthWrite:false}));
silk.rotation.x = Math.PI / 2; lair.add(silk);
// mooring threads that tie the sheet to the board
for (let t = 0; t < 9; t++) { const a = t / 9 * Math.PI * 2 + .3, r0 = 3.1, r1 = 5.2 + (t % 3) * .9; makeLine([V(Math.cos(a) * r0, Math.sin(a) * r0, .05), V(Math.cos(a + .05) * r1, Math.sin(a + .05) * r1, .1)], lairFaint, lair); }
// a gold rim at the mouth, matching the spider's shell
const lairRim = new THREE.Mesh(new THREE.TorusGeometry(1.08, .028, 10, 96), new THREE.MeshStandardMaterial({color:0xf2dc7d, metalness:.2, roughness:.35}));
lairRim.position.z = -.5; lair.add(lairRim);
// warm light from deep inside
const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 128;
{ const g = glowCanvas.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,240,190,1)'); gr.addColorStop(.25, 'rgba(242,220,125,.55)'); gr.addColorStop(1, 'rgba(242,220,125,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
const lairGlow = new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(glowCanvas), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:.55}));
lairGlow.position.z = -4.6; lairGlow.scale.setScalar(2.6); lair.add(lairGlow);
const lairLight = new THREE.PointLight(0xf2dc7d, 6, 9); lairLight.position.z = -1.2; lair.add(lairLight);
// tilt the funnel so you look into it at an angle and the tunnel reads as going deep into the board
lair.rotation.set(.32, -.62, 0);
const lairAxis = V(0, 0, -1).applyEuler(lair.rotation);
const dust = []; for (let i = 0; i < 300; i++) dust.push(Math.sin(i * 12.17) * 19 + 7, Math.cos(i * 4.19) * 7, Math.cos(i * 1.71) * 29 - 10);
const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dust, 3));
scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({color:0xf4f4ef, size:.025, transparent:true, opacity:.5, depthWrite:false})));

/* ---------- Step UI: rail, index, labels, legs grid ---------- */
const rail = $('chapter-rail'), index = $('chapter-index'), labelHost = $('web-labels'), legsGrid = $('legs-grid');
const labels = [], railDots = [];
let hovered = -1;
function setHover(i){
  hovered = i;
  labels.forEach((l, k) => l.classList.toggle('current', k === i));
  railDots.forEach((d, k) => d.classList.toggle('active', k === i));
}
chapters.forEach((c, i) => {
  const dot = document.createElement('button'); dot.type = 'button'; dot.className = 'rail-dot'; dot.textContent = pad2(i + 1);
  dot.setAttribute('aria-label', `Open step ${i + 1}: ${c.title}`); dot.addEventListener('click', () => openDetail(i));
  dot.addEventListener('mouseenter', () => setHover(i)); dot.addEventListener('mouseleave', () => setHover(-1));
  rail.append(dot); railDots.push(dot);
  const li = document.createElement('button'); li.type = 'button'; li.innerHTML = `<span>STEP ${pad2(i + 1)}</span>${c.title}`;
  li.addEventListener('click', () => { closeIndex(); openDetail(i); }); index.append(li);
  const lb = document.createElement('button'); lb.type = 'button'; lb.className = 'web-label'; lb.textContent = pad2(i + 1);
  lb.setAttribute('aria-label', `Open step ${i + 1}: ${c.title}`); lb.addEventListener('click', () => openDetail(i));
  lb.addEventListener('mouseenter', () => setHover(i)); lb.addEventListener('mouseleave', () => setHover(-1));
  labelHost.append(lb); labels.push(lb);
  const card = document.createElement('button'); card.type = 'button'; card.className = 'leg-card rv';
  card.innerHTML = `<span>LEG ${pad2(i + 1)} · ${c.kicker}</span><b>${c.title}</b><i>${c.summary}</i>`;
  card.addEventListener('click', () => openDetail(i)); legsGrid.append(card);
});

/* ---------- Panels ---------- */
const panel = $('detail-panel'), panelContent = $('detail-content'), indexPanel = $('index-panel');
let lastFocus = null;
const lockScroll = on => { document.documentElement.style.overflow = on ? 'hidden' : ''; };
function openDetail(i){
  const c = chapters[i]; if (!c) return;
  lastFocus = document.activeElement;
  $('detail-kicker').textContent = `STEP ${pad2(i + 1)} / 08`;
  const next = (i + 1) % chapters.length;
  panelContent.innerHTML = `<div class="detail-layout"><div class="panel-art" aria-hidden="true"><span></span></div>
    <div class="detail-copy"><div class="detail-overline">${c.kicker} / LEG ${pad2(i + 1)} OF 8</div><h2 id="detail-title">${c.title}</h2><p class="panel-lede">${c.summary}</p></div>
    <div class="panel-meta"><span><b>FORMAT</b>Live coaching</span><span><b>STEP</b>${pad2(i + 1)} of 08</span><span><b>INSIDE</b>3 topics</span></div>
    <div class="detail-columns"><section><h3>WHAT YOU GET</h3><ul>${c.lessons.map(t => `<li>${t}</li>`).join('')}</ul></section><div class="practice-box"><strong>WHERE THIS LEAVES YOU</strong>${c.outcome}</div></div>
    <div class="panel-actions"><button class="btn btn-line" data-next="${next}" type="button">Next: ${chapters[next].title} ↗</button><a class="btn btn-solid" data-panel-apply href="#founding">Apply for the Founding 10</a></div>
    <p class="panel-note">Lesson details are being finalized.</p></div>`;
  const ap = panelContent.querySelector('[data-panel-apply]');
  if (LINKS.apply) { ap.href = LINKS.apply; ap.target = '_blank'; ap.rel = 'noopener'; }
  else ap.addEventListener('click', () => { closeDetail(); $('apply-notice').classList.add('on'); });
  panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false'); lockScroll(true);
  panel.querySelector('.panel-body').scrollTop = 0; $('panel-close').focus();
}
function closeDetail(){ if (!panel.classList.contains('open')) return; panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); lockScroll(false); lastFocus?.focus?.(); }
function openIndex(){ lastFocus = document.activeElement; indexPanel.classList.add('open'); indexPanel.setAttribute('aria-hidden', 'false'); lockScroll(true); $('index-close').focus(); }
function closeIndex(){ if (!indexPanel.classList.contains('open')) return; indexPanel.classList.remove('open'); indexPanel.setAttribute('aria-hidden', 'true'); lockScroll(false); }
panelContent.addEventListener('click', e => { const n = e.target.closest('[data-next]'); if (n) openDetail(Number(n.dataset.next)); });
$('panel-close').addEventListener('click', closeDetail); $('panel-scrim').addEventListener('click', closeDetail);
$('index-open').addEventListener('click', openIndex); $('index-close').addEventListener('click', closeIndex); $('index-scrim').addEventListener('click', closeIndex);
addEventListener('keydown', e => { if (e.key === 'Escape') { closeDetail(); closeIndex(); } });

/* ---------- Pointer: hover and tap a leg to open it (the view itself is fixed) ---------- */
const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
let webFade = 1; // 1 = web fully shown; legs can only be picked while it is
let down = null, orbitX = 0, orbitY = 0, tOrbitX = 0, tOrbitY = 0;
function pick(e){
  const r = canvas.getBoundingClientRect();
  pointer.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1));
  if (webFade < .6) return -1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(hitNodes, false)[0];
  return hit ? hit.object.userData.index : -1;
}
canvas.addEventListener('pointerdown', e => { down = {x:e.clientX, y:e.clientY, ox:tOrbitX, oy:tOrbitY, type:e.pointerType, moved:false}; });
canvas.addEventListener('pointermove', e => {
  if (!down) {
    if (e.pointerType === 'mouse') { const i = pick(e); if (i !== hovered) setHover(i); canvas.classList.toggle('over-node', i >= 0); }
    return;
  }
  if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) down.moved = true; // a swipe, not a tap
});
canvas.addEventListener('pointerup', e => {
  if (down && !down.moved) { const i = pick(e); if (i >= 0) openDetail(i); }
  canvas.classList.remove('dragging'); down = null;
});
canvas.addEventListener('pointercancel', () => { down = null; canvas.classList.remove('dragging'); });
canvas.addEventListener('pointerleave', () => { if (!down) { setHover(-1); canvas.classList.remove('over-node'); } });

/* ---------- Render ---------- */
let W = 1, H = 1, baseZ = 10.4, walk = 0, homeX = 13;
const homeHud = $('home-hud');

/* ---------- Disposable-camera photos magneted to the board along the spider's walk ---------- */
// Placeholder stock photos (Unsplash) until the team has real ones. Swap the photo ids for real images.
// x, y: where on the board (world units), mx, my: the same on phones; at: how far through the walk the photo is pinned up.
const pinData = [
  {img:'photo-1456324504439-367cee3b3c32', cap:'day 1. wrote it down.', date:"'26 10 01", x:2.6, y:2.45, mx:1.8, my:5.6, at:.12, r:-5},
  {img:'photo-1621255457330-7ef4e88ec27f', cap:'first roleplay. nervous.', date:"'26 10 06", x:4.3, y:-2.8, mx:3.4, my:9.0, at:.22, r:4},
  {img:'photo-1455390582262-044cdead277a', cap:'script v4', date:"'26 10 13", x:5.9, y:2.6, mx:5.0, my:5.6, at:.32, r:-3},
  {img:'photo-1603464021578-f327592a89de', cap:'office today', date:"'26 10 21", x:7.5, y:-2.9, mx:6.6, my:9.0, at:.42, r:6},
  {img:'photo-1588873281272-14886ba1f737', cap:'thursday live call', date:"'26 10 29", x:8.5, y:2.55, mx:8.0, my:5.6, at:.5, r:-4}
];
const pinHost = $('pins');
const pins = pinData.map(d => {
  const f = document.createElement('figure'); f.className = 'pin';
  f.innerHTML = `<span class="magnet"></span><div class="ph"><img src="https://images.unsplash.com/${d.img}?w=420&h=420&fit=crop&q=70" alt="" loading="lazy" decoding="async"><span class="stamp">${d.date}</span></div><figcaption>${d.cap}</figcaption>`;
  pinHost.append(f); return {el:f, ...d};
});
function placePins(camX, camY, pxPerUnit){
  const mob = isMobile(), gone = THREE.MathUtils.smoothstep(walk, .8, .9);
  pins.forEach(p => {
    const k = THREE.MathUtils.smoothstep(walk, p.at, p.at + .07);
    const op = k * (1 - gone);
    p.el.style.opacity = op.toFixed(3);
    if (op < .005) return;
    const sx = W / 2 + ((mob ? p.mx : p.x) - camX) * pxPerUnit, sy = H / 2 - ((mob ? p.my : p.y) - camY) * pxPerUnit;
    p.el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${(p.r + (1 - k) * 9).toFixed(2)}deg) scale(${(1 + (1 - k) * .14).toFixed(3)})`;
  });
}
function resize(){
  W = stage.clientWidth; H = stage.clientHeight;
  camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H, false);
  const vHalf = THREE.MathUtils.degToRad(camera.fov / 2), hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
  baseZ = THREE.MathUtils.clamp(4.8 / Math.tan(Math.min(vHalf, hHalf)), 10.4, 19);
  // The lair sits off to the right of the board; the camera slides over to it.
  homeX = isMobile() ? 10 : 13;
  lair.position.set(homeX, 0, 0); lair.scale.setScalar(isMobile() ? 1.05 : 1.2);
  layoutCrawl();
}
addEventListener('resize', resize, {passive:true});
let heroVisible = true;
new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }, {threshold:0}).observe(stage);
function heroProgress(){ const r = hero.getBoundingClientRect(); return clamp01(-r.top / Math.max(1, r.height - innerHeight)); }
function render(time = 0){
  requestAnimationFrame(render);
  if (!heroVisible) return;
  orbitX += (tOrbitX - orbitX) * .08; orbitY += (tOrbitY - orbitY) * .08;
  world.rotation.z = orbitY * .12; world.rotation.x = .1 + orbitX * .12; world.rotation.y = orbitY * .12;

  // Scroll story (about 3-4 scrolls): the web fades, the board slides right with the spider,
  // and the spider walks into its lair.
  const target = reduced.matches ? 0 : heroProgress();
  walk += (target - walk) * .1;
  const ss = THREE.MathUtils.smoothstep;
  webFade = 1 - ss(walk, .02, .22);
  webMats.forEach((base, m) => { m.opacity = base * webFade; });
  web.visible = webFade > .01;
  web.position.z = -(1 - webFade) * 2.2; web.scale.setScalar(1 - (1 - webFade) * .08);
  intro.style.opacity = 1 - ss(walk, .03, .18);
  intro.style.visibility = walk > .2 ? 'hidden' : 'visible';
  intro.style.translate = `${-ss(walk, .03, .18) * 40}px 0`;
  hero.classList.toggle('left-web', walk > .06);

  const u = ss(walk, .1, .8);                      // walking to the lair
  const e = ss(walk, .8, .97);                     // going inside
  const bob = Math.sin(u * Math.PI);
  spider.position.set(homeX * u, bob * .9, 0).addScaledVector(lairAxis, e * 3.4);
  const dx = homeX, dy = .9 * Math.PI * Math.cos(u * Math.PI);
  const turn = ss(walk, .05, .14) * (1 - ss(walk, .78, .9) * .5);
  spider.rotation.z = (Math.atan2(dy, dx) - Math.PI / 2) * turn;
  spider.scale.setScalar(1 - e * .72);
  spider.visible = e < .985;
  const moving = Math.abs(target - walk) > .002 && walk > .08 && walk < .97;
  legGroups.forEach((g, i) => { g.rotation.z = moving ? Math.sin(time * .02 + (i % 2) * Math.PI) * .14 : g.rotation.z * .85; });
  if (moving && e === 0) spider.position.z += Math.abs(Math.sin(time * .02)) * .06;
  lairGlow.material.opacity = .45 + e * .55 + Math.sin(time * .002) * .05;
  lairLight.intensity = 5 + e * 14;
  homeHud.style.opacity = ss(walk, .84, .98);
  homeHud.style.visibility = walk > .82 ? 'visible' : 'hidden';
  homeHud.style.translate = `${(1 - ss(walk, .84, .98)) * 30}px 0`;
  world.updateMatrixWorld(true);

  const camU = ss(walk, .08, .82);
  const shiftX = isMobile() ? 0 : -baseZ * .2 * Math.min(1, camera.aspect / 1.6);
  const shiftY = isMobile() ? baseZ * .19 : 0;
  const camX = shiftX + homeX * camU;
  camera.position.set(camX, shiftY, baseZ); camera.lookAt(camX, shiftY, 0);
  // slide the chalk smudges with the board so it reads as one surface moving
  const pxPerUnit = H / (2 * baseZ * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  stage.style.setProperty('--pan', `${-homeX * camU * pxPerUnit}px`);
  placePins(camX, shiftY, pxPerUnit);
  nodes.forEach(({mat, halo}, i) => {
    const on = i === hovered ? 1 : 0;
    mat.emissiveIntensity += (on * .35 - mat.emissiveIntensity) * .15;
    halo.scale.setScalar(halo.scale.x + ((on ? 1.25 : 1) - halo.scale.x) * .15);
  });
  keyLight.position.x = -4 + Math.sin(time * .0003) * 1.5; fillLight.position.y = -3 + Math.cos(time * .00024) * 1.1;
  renderer.render(scene, camera);
  const introBox = intro.getBoundingClientRect(), stageBox = canvas.getBoundingClientRect();
  anchors.forEach((pos, i) => {
    const p = pos.clone().applyMatrix4(world.matrixWorld).project(camera);
    const x = (p.x * .5 + .5) * W, y = (-p.y * .5 + .5) * H;
    const ax = x + stageBox.left, ay = y + stageBox.top;
    const overIntro = ax > introBox.left - 24 && ax < introBox.right + 24 && ay > introBox.top - 20 && ay < introBox.bottom + 20;
    const show = webFade > .6 && !overIntro && p.z > -1 && p.z < 1 && x > 20 && x < W - 20 && y > 80 && y < H - 50;
    labels[i].style.left = x + 'px'; labels[i].style.top = y + 'px'; labels[i].style.display = show ? 'block' : 'none';
  });
}

/* ---------- The tiny chalk spider crawling across the board below the hero ---------- */
const crawl = $('crawl'), crawler = $('crawler'), trail = $('trail-path'), crawlSvg = $('crawl-trail');
let y0 = 0, yEnd = 0, docW = 0, amp = 0, wave = 380, walkTimer = 0;
const pathX = y => docW / 2 + amp * Math.sin((y - y0) / wave);
function layoutCrawl(){
  const footer = document.querySelector('footer');
  docW = document.documentElement.clientWidth;
  const docH = document.documentElement.scrollHeight;
  crawl.style.height = docH + 'px'; crawlSvg.setAttribute('viewBox', `0 0 ${docW} ${docH}`);
  y0 = hero.offsetTop + hero.offsetHeight + 40;
  yEnd = footer.offsetTop - 60;
  amp = Math.min(docW * .4, 560); wave = isMobile() ? 300 : 420;
  updateCrawl();
}
function updateCrawl(){
  const y = Math.min(yEnd, Math.max(y0, scrollY + innerHeight * .62));
  const x = pathX(y), slope = amp / wave * Math.cos((y - y0) / wave);
  const deg = Math.atan2(1, slope) * 180 / Math.PI + 90;
  crawler.style.transform = `translate(${x - 25}px, ${y - 25}px) rotate(${deg}deg)`;
  crawler.classList.toggle('on', scrollY + innerHeight * .62 > y0 - 20);
  let d = '';
  for (let t = y0; t <= y; t += 14) d += (d ? 'L' : 'M') + pathX(t).toFixed(1) + ' ' + t.toFixed(1);
  trail.setAttribute('d', d);
}
function onScroll(){
  updateCrawl();
  if (!reduced.matches) { crawler.classList.add('walking'); clearTimeout(walkTimer); walkTimer = setTimeout(() => crawler.classList.remove('walking'), 180); }
  const hb = hero.getBoundingClientRect().bottom, fr = $('founding').getBoundingClientRect();
  $('topbar').classList.toggle('solid', hb < 80);
  $('mbar').classList.toggle('show', hb < innerHeight * .5 && !(fr.top < innerHeight && fr.bottom > 0));
  $('scroll-cue').classList.toggle('hidden', scrollY > 40);
}
addEventListener('scroll', onScroll, {passive:true});
addEventListener('load', layoutCrawl);

resize(); onScroll(); requestAnimationFrame(render);

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.rv').forEach(n => io.observe(n));
