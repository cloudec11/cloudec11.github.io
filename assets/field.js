/* Signal in the noise: a dot-matrix scope under the name.
   A clean signal runs through flickering noise, gold packets ride it, and the cursor
   adds a burst of signal where it hovers. One still frame under reduced motion. */
(() => {
  const box = document.querySelector('.hero-field');
  const cv = box && box.querySelector('canvas');
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d');
  const root = document.documentElement;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches && !root.classList.contains('force-motion');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  const INK = '21, 19, 17', GOLD = '122, 95, 48';
  let w = 0, h = 0, dpr = 1, g = 12, cols = 0, rows = 0, ox = 0, oy = 0;
  let raf = 0, onScreen = true, t0 = performance.now();
  let px = -1, burst = 0, burstTo = 0;            // cursor column (0..1) and burst strength
  const curve = new Float32Array(400);

  const size = () => {
    const r = box.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    w = r.width; h = r.height;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    g = w < 600 ? 10 : 12;
    cols = Math.min(400, Math.floor(w / g)); rows = Math.floor(h / g);
    ox = (w - (cols - 1) * g) / 2; oy = (h - (rows - 1) * g) / 2;
  };

  // Cheap repeatable hash for the noise flicker
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  const draw = (now) => {
    const t = (now - t0) / 1000;
    burst += (burstTo - burst) * 0.08;
    const mid = (rows - 1) / 2, amp = (rows - 1) * 0.36;
    for (let c = 0; c < cols; c++) {
      const u = c / Math.max(1, cols - 1);
      const env = Math.sin(Math.PI * Math.min(1, Math.max(0, u * 1.02 - 0.01))) ** 0.6; // calm at both ends
      let v = 0.62 * Math.sin(u * 9.0 - t * 1.05)
            + 0.26 * Math.sin(u * 23.0 + t * 1.6)
            + 0.12 * Math.sin(u * 47.0 - t * 2.4);
      if (px >= 0 && burst > 0.01) {
        const d = u - px;
        v += burst * 1.1 * Math.exp(-(d * d) / 0.0035) * Math.sin(u * 140 - t * 9);
      }
      curve[c] = mid - Math.max(-1.25, Math.min(1.25, v * env)) * amp;
    }
    ctx.clearRect(0, 0, w, h);
    const tick = Math.floor(t * 7);
    const s0 = g < 12 ? 1.6 : 2;
    // Packets: positions along the width (0..1) that ride the signal
    const packets = [0, 1, 2].map((k) => ((t * (0.09 + k * 0.035) + k * 0.37) % 1.25) - 0.1);
    for (let c = 0; c < cols; c++) {
      const x = ox + c * g, y0 = curve[c];
      const u = c / Math.max(1, cols - 1);
      let gold = 0;
      for (const p of packets) { const d = (p - u) * cols; if (d >= 0 && d < 9) gold = Math.max(gold, 1 - d / 9); }
      for (let r = 0; r < rows; r++) {
        const d = Math.abs(r - y0);
        let k = d < 1.6 ? 1 - d / 1.6 : 0;                  // on the signal
        const n = hash(c, r + tick * 31.7);
        if (n > 0.985) k = Math.max(k, 0.3 + (n - 0.985) * 30); // noise flecks
        const a = 0.09 + 0.78 * k;
        const s = s0 + 1.6 * k;
        ctx.fillStyle = gold && k > 0.25 ? `rgba(${GOLD}, ${0.35 + 0.65 * gold})` : `rgba(${INK}, ${a.toFixed(3)})`;
        ctx.fillRect(x - s / 2, oy + r * g - s / 2, s, s);
      }
    }
  };

  const loop = (now) => { raf = 0; draw(now); kick(); };
  const kick = () => { if (!still && !raf && onScreen && !document.hidden) raf = requestAnimationFrame(loop); };

  size();
  draw(performance.now());
  new ResizeObserver(() => { size(); draw(performance.now()); }).observe(box);
  new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    if (onScreen) kick(); else { cancelAnimationFrame(raf); raf = 0; }
  }).observe(box);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else kick(); });

  const hero = box.closest('section') || box;
  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' || !fine.matches) return;
    const r = box.getBoundingClientRect();
    px = (e.clientX - r.left) / r.width;
    // Strongest over the field itself, softer elsewhere in the hero
    const dy = e.clientY < r.top ? r.top - e.clientY : e.clientY > r.bottom ? e.clientY - r.bottom : 0;
    burstTo = Math.max(0.25, 1 - dy / 260);
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { burstTo = 0; });
  kick();
})();
