/* Nearest neighbours: a semantic map of software development, laid out in topic
   clusters like an embedding space. The cursor is the query: its nearest terms light up,
   ranked [1] to [4] like citations. Without a cursor a ghost query drifts between clusters.
   One still frame under reduced motion. */
(() => {
  const box = document.querySelector('.hero-field');
  const cv = box && box.querySelector('canvas');
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d');
  const root = document.documentElement;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches && !root.classList.contains('force-motion');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  // Software development vocabulary, by topic: AI tooling, the web stack, engineering
  // practice, and languages and infrastructure. [cluster x-centre, terms]
  const CLUSTERS = [
    [0.12, ['LLM agents', 'RAG', 'embeddings', 'vector search', 'BM25', 'tool calling', 'MCP', 'OpenAI API', 'prompting', 'evals', 'citations']],
    [0.38, ['React', 'Next.js', 'Node.js', 'FastAPI', 'Flask', 'REST APIs', 'JSON', 'WebSockets', 'MongoDB', 'auth', 'HTML/CSS']],
    [0.63, ['data structures', 'algorithms', 'OOP', 'client-server', 'system design', 'debugging', 'refactoring', 'unit tests', 'code review', 'QA']],
    [0.88, ['Python', 'JavaScript', 'Java', 'C++', 'Git', 'pull requests', 'Docker', 'AWS Lambda', 'Linux', 'CI/CD']],
  ];
  const K = 4;
  const INK = '21, 19, 17', GOLD = '122, 95, 48';
  const FONT = '400 12px "Geist Mono", ui-monospace, monospace';

  let w = 0, h = 0, dpr = 1, nodes = [], raf = 0, onScreen = true;
  let qx = 0, qy = 0, tx = 0, ty = 0, mouse = false, t0 = performance.now();

  // Small seeded random so the map is the same on every visit
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  // Place each term at a random free spot inside its cluster's band; a term that
  // cannot find a clean spot is left out, so labels never overlap at any width.
  const layout = () => {
    seed = 7;
    ctx.font = FONT;
    nodes = [];
    const band = Math.max(0.17, 160 / Math.max(w, 1));
    const fits = (x, y, tw) => nodes.every((n) => x > n.x + n.tw + 46 || x + tw + 46 < n.x || Math.abs(y - n.y) > 19);
    for (const [cx, terms] of CLUSTERS) {
      for (const word of terms) {
        const tw = ctx.measureText(word).width;
        for (let tries = 0; tries < 40; tries++) {
          const x = Math.min(w - tw - 44, Math.max(6, (cx + (rnd() - 0.5) * band) * w - tw / 2));
          const y = 12 + rnd() * (h - 24);
          if (fits(x, y, tw)) {
            nodes.push({ word, tw, x, y, ph: rnd() * Math.PI * 2, sp: 0.25 + rnd() * 0.35, hl: 0, rank: 0 });
            break;
          }
        }
      }
    }
  };

  const size = () => {
    const r = box.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    w = r.width; h = r.height;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
    if (!qx) { qx = tx = w * 0.3; qy = ty = h * 0.5; }
  };

  const draw = (now) => {
    const t = (now - t0) / 1000;
    if (!mouse) {                     // ghost query: a slow figure-eight across the clusters
      tx = w * (0.5 + 0.42 * Math.sin(t * 0.13));
      ty = h * (0.5 + 0.32 * Math.sin(t * 0.29 + 1));
    }
    qx += (tx - qx) * 0.09; qy += (ty - qy) * 0.09;

    const pos = nodes.map((n) => ({ n, x: n.x + Math.sin(t * n.sp + n.ph) * 3, y: n.y + Math.cos(t * n.sp * 0.8 + n.ph) * 2 }));
    const ranked = pos.map((p) => ({ p, d: Math.hypot(p.x - qx, (p.y - qy) * 1.6) })).sort((a, b) => a.d - b.d);
    pos.forEach((p) => { p.n.rank = 0; });
    ranked.slice(0, K).forEach((r, i) => { r.p.n.rank = i + 1; });

    ctx.clearRect(0, 0, w, h);
    ctx.font = FONT;
    ctx.textBaseline = 'middle';
    for (const p of pos) {
      const n = p.n;
      n.hl += ((n.rank ? 1 : 0) - n.hl) * (n.rank ? 0.16 : 0.06);
      if (n.hl > 0.02) {               // the line from the query to a neighbour
        ctx.strokeStyle = `rgba(${GOLD}, ${(0.55 * n.hl).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
    }
    for (const p of pos) {
      const n = p.n;
      ctx.fillStyle = n.hl > 0.02 ? `rgba(${GOLD}, ${(0.35 + 0.65 * n.hl).toFixed(3)})` : `rgba(${INK}, .22)`;
      ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
      ctx.fillStyle = `rgba(${INK}, ${(0.26 + 0.74 * n.hl).toFixed(3)})`;
      ctx.fillText(n.word, p.x + 8, p.y);
      if (n.rank && n.hl > 0.3) {
        ctx.fillStyle = `rgba(${GOLD}, ${n.hl.toFixed(3)})`;
        ctx.fillText(`[${n.rank}]`, p.x + 14 + n.tw, p.y);
      }
    }
    // The query itself
    ctx.strokeStyle = `rgba(${GOLD}, .9)`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(qx, qy, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = `rgba(${GOLD}, 1)`;
    ctx.fillRect(qx - 1, qy - 1, 2, 2);
  };

  const loop = (now) => { raf = 0; draw(now); kick(); };
  const kick = () => { if (!still && !raf && onScreen && !document.hidden) raf = requestAnimationFrame(loop); };

  const ready = document.fonts ? document.fonts.load(FONT).catch(() => {}) : Promise.resolve();
  ready.then(() => {
    size();
    if (still) { tx = qx = w * 0.42; ty = qy = h * 0.45; for (let i = 0; i < 40; i++) draw(t0); } else draw(performance.now());
    new ResizeObserver(() => { size(); draw(performance.now()); }).observe(box);
    new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) kick(); else { cancelAnimationFrame(raf); raf = 0; }
    }).observe(box);
    document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else kick(); });

    const hero = box.closest('section') || box;
    // Follow the cursor anywhere in the hero while the page sits at the top; once it has
    // scrolled, only while the cursor is over the graphic itself. Scrolling moves the
    // graphic under a still cursor, so the check runs on scroll too.
    let px = -1, py = -1, inHero = false;
    const follow = () => {
      if (px < 0) return;
      const r = box.getBoundingClientRect();
      const over = px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
      mouse = over || (inHero && scrollY < 8);
      if (mouse) {
        tx = Math.min(w, Math.max(0, px - r.left));
        ty = Math.min(h, Math.max(0, py - r.top));
        kick();
      }
    };
    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || !fine.matches) return;
      px = e.clientX; py = e.clientY; inHero = true;
      follow();
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { inHero = false; mouse = false; });
    addEventListener('scroll', follow, { passive: true });
    kick();
  });
})();
