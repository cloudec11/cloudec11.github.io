/* The name is built from code, then responds to the cursor.
   1. Built from code: each letter starts as a cycling code character in the mono face and
      resolves into its Audiowide letter, left to right, behind a blinking caret. Audiowide
      is not monospaced, so every letter is locked to its final width while it cycles and
      nothing shifts.
   2. Signal lift: letters rise and take on the accent colour under the cursor, then settle
      back. Touch screens get one slow sweep instead.
   Under reduced motion the name is simply there. */
(() => {
  const name = document.querySelector('.hero-name');
  if (!name) return;
  const forced = /[?&]motion=1(&|$)/.test(location.search);
  if (!forced && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const L = [...name.querySelectorAll('i')], n = L.length;
  if (!n) return;

  // 1. Built from code
  const finals = L.map((el) => el.textContent);
  const CODE = '{}[]<>()/=;:+*#01$_&|!?%'.split('');
  const pick = () => CODE[(Math.random() * CODE.length) | 0];
  name.classList.add('is-coding', 'is-wait');   // hidden until the face is in and measured
  const font = document.fonts ? document.fonts.load('1em Audiowide').catch(() => {}) : Promise.resolve();
  const built = Promise.race([font, new Promise((r) => setTimeout(r, 1600))]).then(() => new Promise((done) => {
    const fs = parseFloat(getComputedStyle(name).fontSize) || 1;
    L.forEach((el) => { el.style.width = (el.getBoundingClientRect().width / fs).toFixed(4) + 'em'; });
    L.forEach((el) => { el.classList.add('code'); el.textContent = pick(); });
    name.classList.remove('is-wait');
    const START = 300, STEP = 110, at = L.map((_, k) => START + k * STEP);
    let t0 = 0, swapped = 0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const e = t - t0, swap = t - swapped > 55;
      if (swap) swapped = t;
      let front = -1;
      L.forEach((el, k) => {
        if (e >= at[k]) {
          if (el.classList.contains('code')) { el.classList.remove('code'); el.textContent = finals[k]; }
        } else {
          if (front < 0) front = k;
          if (swap) el.textContent = pick();
        }
      });
      L.forEach((el, k) => el.classList.toggle('cur', k === front));
      if (front >= 0) requestAnimationFrame(tick);
      else {
        L.forEach((el) => { el.style.width = ''; });
        name.classList.remove('is-coding');
        done();
      }
    };
    requestAnimationFrame(tick);
  }));

  // 2. Signal lift
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

  // The lift starts once the name has finished building
  built.then(() => {
    name.classList.add('is-lift');
    ready = true;
    if (!fine.matches) wave = 0;
    kick();
  });
})();
