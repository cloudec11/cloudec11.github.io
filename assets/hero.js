/* Signal lift: letters of the name rise and take on the accent colour under the cursor,
   then settle back. Audiowide has a single weight, so the effect is position and colour
   rather than stroke. Touch screens get one slow sweep after the entrance instead. */
(() => {
  const name = document.querySelector('.hero-name');
  if (!name) return;
  const forced = /[?&]motion=1(&|$)/.test(location.search);
  if (!forced && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const L = [...name.querySelectorAll('i')], n = L.length;
  if (!n) return;
  const area = name.closest('section') || name.parentElement;
  const fine = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 861px)');

  const ATTACK = .08, DECAY = .35;    // smoothing time constants, s

  const p = new Float32Array(n);      // current lift 0..1
  const tgt = new Float32Array(n);
  let px = 0, py = 0, inside = false, raf = 0, last = 0;
  let ready = false, onScreen = true, wave = -1;

  const paint = (i) => L[i].style.setProperty('--q', p[i].toFixed(3));

  function frame(t) {
    raf = 0;
    const dt = Math.min(.05, Math.max(.001, (t - last) / 1000)); last = t;
    tgt.fill(0);
    if (wave >= 0) {                  // one slow sweep, left to right
      wave += dt / 2.6;
      const at = -1.5 + wave * (n + 2.5);
      for (let i = 0; i < n; i++) tgt[i] = .8 * Math.exp(-((i - at) ** 2) / 1.3);
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

  // Start once the entrance animation (~1.67s) has finished
  setTimeout(() => {
    name.classList.add('is-lift');
    ready = true;
    if (!fine.matches) wave = 0;
    kick();
  }, Math.max(0, 1700 - performance.now()));
})();
