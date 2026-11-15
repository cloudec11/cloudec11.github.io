/* Plan to shipped: the software lifecycle, driven by scroll. It plays as the graphic
   scrolls up into view; progress p (0 to 1) picks the scene and how far it has drawn:
   plan, design, build, test, deploy, then a laptop whose screen grows into a finished app.
   Each animated element carries data-k (how it animates) and data-a (when, as a 0-1 range
   within its scene). Under reduced motion it shows the finished app and does not move. */
(() => {
  const sec = document.querySelector('.sdlc');
  if (!sec) return;
  const root = document.documentElement;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches && !root.classList.contains('force-motion');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (u) => 1 - Math.pow(1 - u, 3);
  const FADE = 0.025;               // scenes cross-fade over this much of the scroll
  const STOP = [0, 1, 2, 3, 4, 5, 5]; // scene -> timeline stop (the laptop and the app share "Ship")

  const scenes = [...sec.querySelectorAll('.layer')].map((g) => {
    const [a, b] = g.dataset.r.split(' ').map(Number);
    const els = [...g.querySelectorAll('[data-k]')].map((el) => {
      const [s, e] = el.dataset.a.split(' ').map(Number);
      return { el, k: el.dataset.k, s, e, dx: +el.dataset.dx || 0, from: +el.dataset.from || 1 };
    });
    return { g, a, b, final: 'final' in g.dataset, els };
  });
  const stops = [...sec.querySelectorAll('.tl-stop')];
  const line = sec.querySelector('.tl-fill');

  const apply = ({ el, k, dx, from }, u) => {
    switch (k) {
      case 'draw': el.style.strokeDashoffset = (1 - u).toFixed(4); break;
      case 'fade': el.style.opacity = u.toFixed(3); break;
      case 'grow': el.style.transform = `scaleX(${u.toFixed(4)})`; break;
      case 'pop': el.style.opacity = u.toFixed(3); el.style.transform = `translateY(${((1 - u) * 10).toFixed(2)}px)`; break;
      case 'move': el.style.transform = `translateX(${(u * dx).toFixed(2)}px)`; break;
      case 'zoom': el.style.transform = `scale(${(from + (1 - from) * u).toFixed(4)})`; break;
    }
  };

  let last = -1;
  const render = (p) => {
    if (Math.abs(p - last) < 0.0005) return;
    last = p;
    let current = 0;
    scenes.forEach((sc, i) => {
      if (p >= sc.a) current = i;
      const t = clamp((p - sc.a) / (sc.b - sc.a), 0, 1);
      let o = i === 0 ? 1 : clamp((p - sc.a) / FADE, 0, 1);
      if (!sc.final) o = Math.min(o, clamp((sc.b + FADE - p) / FADE, 0, 1));
      sc.g.style.opacity = o.toFixed(3);
      sc.g.style.visibility = o > 0 ? 'visible' : 'hidden';
      if (o > 0) sc.els.forEach((e) => apply(e, ease(clamp((t - e.s) / (e.e - e.s), 0, 1))));
    });
    // Timeline: the gold line reaches each stop as its scene finishes
    const stop = STOP[current];
    const sc = scenes[current];
    const local = stop < 5 ? clamp((p - sc.a) / (sc.b - sc.a), 0, 1) : 1;
    line.style.strokeDashoffset = (1 - Math.min(1, (stop + local) / 5)).toFixed(4);
    const done = p >= 0.98;
    stops.forEach((el, i) => {
      el.classList.toggle('on', i === stop && !done);
      el.classList.toggle('past', i < stop || done);
    });
  };

  // Nothing pins: progress runs from the graphic's top entering the screen (0) to the
  // graphic sitting centred in it (1), so it has finished while still in full view.
  const svg = sec.querySelector('.sdlc-svg');
  const progress = () => {
    const r = svg.getBoundingClientRect(), vh = innerHeight;
    const start = vh * 0.92, end = Math.max(64, (vh - r.height) / 2);
    return start > end ? clamp((start - r.top) / (start - end), 0, 1) : 1;
  };

  if (still) { render(1); return; }
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; render(progress()); });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  render(progress());
})();
