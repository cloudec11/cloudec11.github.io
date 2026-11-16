/* Plan to shipped: how my projects go from a plan to something shipped, as a short film
   that plays by itself once the graphic is on screen (the page never waits on it):
   planning Signal, designing the FindMySeat seat map, building Signal's agents, testing,
   deploying for demo day, then a laptop whose screen grows into a dashboard of what shipped.
   Progress p (0 to 1) picks the scene and how far it has drawn. Each animated element carries
   data-k (how it animates) and data-a (when, as a 0-1 range within its scene).
   It pauses off screen, replays when you come back down to it, and has a Replay button.
   Under reduced motion it shows the finished dashboard and does not move. */
(() => {
  const sec = document.querySelector('.sdlc');
  if (!sec) return;
  const root = document.documentElement;
  const still = false; // always animate, regardless of the OS reduced-motion setting
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (u) => 1 - Math.pow(1 - u, 3);
  const DURATION = 13000;           // the whole film, ms
  const FADE = 0.02;                // scenes cross-fade over this much of it
  const STOP = [0, 1, 2, 3, 4, 5, 5]; // scene -> timeline stop (the laptop and the app share "Ship")

  const scenes = [...sec.querySelectorAll('.layer')].map((g) => {
    const [a, b] = g.dataset.r.split(' ').map(Number);
    const els = [...g.querySelectorAll('[data-k]')].map((el) => {
      const [s, e] = el.dataset.a.split(' ').map(Number);
      return { el, k: el.dataset.k, s, e, dx: +el.dataset.dx || 0, from: +el.dataset.from || 1, t: el.dataset.t || '', shown: -1 };
    });
    return { g, a, b, final: 'final' in g.dataset, els };
  });
  const stops = [...sec.querySelectorAll('.tl-stop')];
  const line = sec.querySelector('.tl-fill');
  const replay = sec.querySelector('.sdlc-replay');

  const apply = (it, u) => {
    const { el, k, dx, from } = it;
    switch (k) {
      case 'draw': el.style.strokeDashoffset = (1 - u).toFixed(4); break;
      case 'fade': el.style.opacity = u.toFixed(3); break;
      case 'grow': el.style.transform = `scaleX(${u.toFixed(4)})`; break;
      case 'pop': el.style.opacity = u.toFixed(3); el.style.transform = `translateY(${((1 - u) * 10).toFixed(2)}px)`; break;
      case 'move': el.style.transform = `translateX(${(u * dx).toFixed(2)}px)`; break;
      case 'zoom': el.style.transform = `scale(${(from + (1 - from) * u).toFixed(4)})`; break;
      case 'type': {                  // typed out a character at a time, linear like a keyboard
        const n = Math.round(it.t.length * u);
        if (n !== it.shown) { it.shown = n; el.textContent = it.t.slice(0, n); }
        break;
      }
    }
  };

  const render = (p) => {
    let current = 0;
    scenes.forEach((sc, i) => {
      if (p >= sc.a) current = i;
      const t = clamp((p - sc.a) / (sc.b - sc.a), 0, 1);
      let o = i === 0 ? 1 : clamp((p - sc.a) / FADE, 0, 1);
      if (!sc.final) o = Math.min(o, clamp((sc.b + FADE - p) / FADE, 0, 1));
      sc.g.style.opacity = o.toFixed(3);
      sc.g.style.visibility = o > 0 ? 'visible' : 'hidden';
      if (o > 0) sc.els.forEach((e) => {
        const u = clamp((t - e.s) / (e.e - e.s), 0, 1);
        apply(e, e.k === 'type' ? u : ease(u));
      });
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

  if (still) { render(1); return; }

  // The clock: p advances with time only while the graphic is on screen and the tab is visible
  let p = 0, raf = 0, last = 0, visible = false;
  const frame = (now) => {
    raf = 0;
    p = Math.min(1, p + (now - last) / DURATION);
    last = now;
    render(p);
    if (p < 1) { if (visible && !document.hidden) raf = requestAnimationFrame(frame); }
    else if (replay) replay.hidden = false;
  };
  const play = () => {
    if (raf || p >= 1 || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const pause = () => { cancelAnimationFrame(raf); raf = 0; };
  const rewind = () => { pause(); p = 0; if (replay) replay.hidden = true; render(0); };

  render(0);
  const svg = sec.querySelector('.sdlc-svg');
  // Start once most of it is in view; leaving pauses it; leaving downward (you scrolled
  // back up past it) rewinds it, so it plays again on the way down.
  new IntersectionObserver(([e]) => {
    visible = e.intersectionRatio >= 0.55;
    if (visible) play();
    else {
      pause();
      if (!e.isIntersecting && e.boundingClientRect.top > 0 && p > 0) rewind();
    }
  }, { threshold: [0, 0.55] }).observe(svg);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); else play(); });
  replay?.addEventListener('click', () => { rewind(); play(); });
})();
