/* Nib pressure: letters of the name thicken under the cursor like pen pressure,
   then dry back to rest. Rest state = wght 400, opsz 96 (the static look). */
(() => {
  const name = document.querySelector('.hero-name');
  if (!name || !(window.CSS && CSS.supports('font-variation-settings', '"wght" 400'))) return;
  const forced = /[?&]motion=1(&|$)/.test(location.search);
  if (!forced && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const L = [...name.querySelectorAll('i')], n = L.length;
  if (!n) return;
  const area = name.closest('section') || name.parentElement;
  const fine = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 861px)');

  const W0 = 400, W1 = 860;          // weight at rest / full pressure
  const O1 = 22;                      // opsz at full pressure
  const ATTACK = .08, DECAY = .3;     // smoothing time constants, s (~1s to dry)
  const COMP = .65;                  // share of width growth cancelled by scaleX
  const DROP = .018;                  // max downward press, em (~2.5% of cap height)

  const p = new Float32Array(n);      // current pressure 0..1
  const tgt = new Float32Array(n);
  const grow = new Float32Array(n).fill(1); // width ratio at full pressure
  let O0 = 96, px = 0, py = 0, inside = false, raf = 0, last = 0;
  let ready = false, onScreen = true, wave = -1;

  const set = (el, k, v) => el.style.setProperty(k, v);

  function paint(i) {
    const q = p[i], el = L[i];
    set(el, '--w', (W0 + (W1 - W0) * q).toFixed(1));
    set(el, '--o', (O0 + (O1 - O0) * q).toFixed(2));
    set(el, '--s', Math.pow(1 / (1 + (grow[i] - 1) * q), COMP).toFixed(4));
    set(el, '--y', (DROP * q).toFixed(4) + 'em');
  }

  // Lock every letter box at its rest width (in em, so it scales with cqi type)
  function measure() {
    const cs = getComputedStyle(name), fs = parseFloat(cs.fontSize);
    O0 = Math.min(96, Math.max(6, fs));
    const zoom = name.getBoundingClientRect().width / name.offsetWidth || 1; // scroll recede scale
    name.classList.add('is-measuring');
    L.forEach((el) => { set(el, '--w', W0); set(el, '--o', O0); });
    const rest = L.map((el) => el.getBoundingClientRect().width / zoom);
    L.forEach((el) => { set(el, '--w', W1); set(el, '--o', O1); });
    L.forEach((el, i) => { grow[i] = el.getBoundingClientRect().width / zoom / rest[i]; });
    name.classList.remove('is-measuring');
    L.forEach((el, i) => { el.style.width = (rest[i] / fs).toFixed(5) + 'em'; paint(i); });
  }

  function frame(t) {
    raf = 0;
    const dt = Math.min(.05, Math.max(.001, (t - last) / 1000)); last = t;
    tgt.fill(0);
    if (wave >= 0) {                  // one slow sweep, left to right
      wave += dt / 2.6;
      const at = -1.5 + wave * (n + 2.5);
      for (let i = 0; i < n; i++) tgt[i] = .72 * Math.exp(-((i - at) ** 2) / 1.3);
      if (wave >= 1) wave = -1;
    } else if (inside) {              // read rects before any writes this frame
      for (let i = 0; i < n; i++) {
        const r = L[i].getBoundingClientRect(), R = .9 * r.height;
        const dx = px - (r.left + r.width / 2), dy = (py - (r.top + r.height / 2)) * .7;
        const d = Math.hypot(dx, dy) / R;
        if (d < 1) tgt[i] = (1 - d * d) ** 2;
      }
    }
    let busy = wave >= 0 || inside;
    for (let i = 0; i < n; i++) {
      const was = p[i], g = tgt[i];
      if (!was && !g) continue;
      let q = was + (g - was) * (1 - Math.exp(-dt / (g > was ? ATTACK : DECAY)));
      if (!g && q < .003) q = 0;
      p[i] = q;
      paint(i);
      if (q) busy = true;
    }
    if (busy) kick();
  }

  function kick() {
    if (raf || !ready || !onScreen || document.hidden) return;
    if (!last || performance.now() - last > 100) last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  area.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' || !fine.matches) return;
    px = e.clientX; py = e.clientY; inside = true; kick();
  }, { passive: true });
  area.addEventListener('pointerleave', () => { inside = false; kick(); });

  new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    if (onScreen) kick(); else { cancelAnimationFrame(raf); raf = 0; }
  }).observe(name);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else kick();
  });

  // Wait for the variable font and for the entrance animation (~1.67s) to finish
  const fonts = document.fonts ? Promise.all([
    document.fonts.load('400 1em "Bodoni Moda"'),
    document.fonts.load('900 1em "Bodoni Moda"'),
  ]).catch(() => {}) : Promise.resolve();
  const entrance = new Promise((r) => setTimeout(r, Math.max(0, 1700 - performance.now())));

  Promise.all([fonts, entrance]).then(() => {
    name.classList.add('is-nib');
    measure();
    new ResizeObserver(() => measure()).observe(name.parentElement);
    ready = true;
    if (!fine.matches) wave = 0;
    kick();
  });
})();
