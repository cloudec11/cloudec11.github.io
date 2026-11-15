// eric-chen.ca: reveals, the Signal case study, the project preview, counters, demo video,
// and the magnetic buttons. The page reads fine without any of it.
// ?motion=1 bypasses prefers-reduced-motion so motion can be checked in browsers that force it.
(() => {
  window.siteReady = true;
  const root = document.documentElement;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches && !root.classList.contains('force-motion');
  const pointer = matchMedia('(hover: hover) and (min-width: 861px)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // 1. Reveals. Rows rise, headings wipe, numbers count, the footer name builds.
  //    Anything that leaves through the bottom of the screen (you scrolled back up past it)
  //    resets, so it plays again on the way back down.
  const runs = new WeakMap(); // counter element -> current run id
  const count = (row) => {
    row.querySelectorAll('.num').forEach((el) => {
      const end = +el.dataset.n, b = el.parentElement;
      if (still) { b.classList.add('lit'); return; }
      const id = (runs.get(el) || 0) + 1;
      runs.set(el, id);
      el.style.minWidth = `${String(end).length}ch`;
      const t0 = performance.now(), dur = 1300 + Math.min(end, 300) * 2;
      const step = (t) => {
        if (runs.get(el) !== id) return;
        const k = clamp((t - t0) / dur, 0, 1);
        el.textContent = Math.round(end * (1 - Math.pow(2, -10 * k)) / (1 - Math.pow(2, -10)));
        if (k < 1) requestAnimationFrame(step);
        else { el.textContent = end; b.classList.add('lit'); }
      };
      el.textContent = '0';
      requestAnimationFrame(step);
    });
  };
  const timers = new WeakMap();
  const show = (el) => {
    el.classList.add('in');
    count(el);
    timers.set(el, setTimeout(() => el.classList.add('done'), 1400));
  };
  const hide = (el) => {
    clearTimeout(timers.get(el));
    el.classList.remove('in', 'done');
    el.querySelectorAll('.num').forEach((n) => {
      runs.set(n, (runs.get(n) || 0) + 1); // cancels a count in flight
      n.textContent = '0';
      n.parentElement.classList.remove('lit');
    });
  };
  const items = document.querySelectorAll('[data-reveal], .foot-name');
  if (still || !('IntersectionObserver' in window)) {
    items.forEach((el) => { el.classList.add('in', 'done'); count(el); });
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const el = e.target;
        if (e.isIntersecting && !el.classList.contains('in')) show(el);
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    // Reset only once fully off screen below, so nothing visibly blinks out.
    const out = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting && e.target.classList.contains('in') && e.boundingClientRect.top >= e.rootBounds.bottom) hide(e.target);
      }
    }, { threshold: 0 });
    items.forEach((el) => { io.observe(el); out.observe(el); });
  }

  // Copy email: the buttons copy the address and say so; mailto stays the no-JS fallback.
  const status = document.getElementById('copy-status');
  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch {}
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch {}
    ta.remove();
    return ok;
  };
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const mail = btn.getAttribute('href').replace(/^mailto:/, '');
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', `Copy email address ${mail}`);
    btn.innerHTML = '<span class="btn-roll"><span>Copy email</span><span aria-hidden="true">Email copied</span></span>';
    let t = 0;
    btn.addEventListener('click', async (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      if (!(await copyText(mail))) { location.href = btn.href; return; }
      btn.classList.add('is-copied');
      if (status) status.textContent = `${mail} copied to clipboard`;
      clearTimeout(t);
      t = setTimeout(() => { btn.classList.remove('is-copied'); if (status) status.textContent = ''; }, 2400);
    });
  });

  // Reading progress fallback for browsers without scroll timelines.
  if (!CSS.supports?.('animation-timeline: scroll()')) {
    const nav = document.querySelector('.nav');
    let tick = false;
    const read = () => {
      tick = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      nav?.style.setProperty('--read', max > 0 ? (scrollY / max).toFixed(4) : 0);
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(read); } }, { passive: true });
    read();
  }

  // Projects expand into the same kind of display as Signal: steps beside a big screen
  // that wipes between real screenshots. One open at a time. Works under reduced motion,
  // which only drops the auto-advance.
  const openers = new Map();
  let anchorT = 0;
  document.querySelectorAll('.proj').forEach((row) => {
    const btn = row.querySelector('.proj-toggle'), panel = row.querySelector('.proj-case');
    if (!btn || !panel) return;
    const items = [...panel.querySelectorAll('.steps li')];
    const frames = [...panel.querySelectorAll('.frame')];
    let cur = 0, timer = 0;
    const set = (i) => {
      cur = i;
      items.forEach((li, k) => { li.classList.toggle('on', k === i); li.classList.toggle('past', k < i); });
      frames.forEach((f, k) => f.classList.toggle('on', k <= i));
    };
    // While playing, the active step's line fills over STEP_MS (CSS reads --step), then
    // the next step takes over. Choosing a step stops the clock and shows its line full.
    const STEP_MS = 4200;
    panel.style.setProperty('--step', `${STEP_MS}ms`);
    const stop = () => { clearTimeout(timer); timer = 0; panel.classList.remove('is-playing'); };
    const tick = () => { timer = setTimeout(() => { set((cur + 1) % items.length); tick(); }, STEP_MS); };
    const play = () => { stop(); if (!still && items.length > 1) { panel.classList.add('is-playing'); tick(); } };
    const warm = () => frames.forEach((f) => { if (f.tagName === 'IMG') f.loading = 'eager'; });
    items.forEach((li, k) => li.querySelector('.pc-step')?.addEventListener('click', () => { set(k); stop(); }));
    const open = (on) => {
      row.classList.toggle('is-open', on);
      btn.setAttribute('aria-expanded', String(on));
      panel.inert = !on;
      if (on) { warm(); set(0); play(); } else stop();
    };
    panel.inert = true;
    openers.set(row, open);
    row.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !row.classList.contains('is-open')) return;
      open(false);
      btn.focus();
    });
    // A click anywhere on the row toggles it, except on its links and controls, inside
    // the open panel, or when the click finished a text selection.
    row.addEventListener('click', (e) => {
      if (e.target.closest('a, button, .proj-case')) return;
      if (String(getSelection?.() || '')) return;
      btn.click();
    });
    row.addEventListener('pointerenter', warm, { once: true });
    // Fetch the row's hidden frames (aperture shots and panel screens) before they are needed
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e], o) => {
        if (!e.isIntersecting) return;
        warm();
        row.querySelectorAll('.thumb-in > img').forEach((img) => { img.loading = 'eager'; });
        o.disconnect();
      }, { rootMargin: '300px 0px' }).observe(row);
    }
    btn.addEventListener('click', () => {
      const on = !row.classList.contains('is-open');
      // Keep the page still while rows change size: no scroll anchoring for the toggle,
      // and a row closing above this one collapses at once with the scroll compensated,
      // so the row that was tapped stays exactly where it was.
      root.style.overflowAnchor = 'none';
      clearTimeout(anchorT);
      anchorT = setTimeout(() => { root.style.overflowAnchor = ''; }, 1200);
      const before = row.getBoundingClientRect().top;
      openers.forEach((fn, r) => {
        if (r === row || !r.classList.contains('is-open')) return;
        r.classList.add('no-anim');
        fn(false);
        void r.offsetHeight;
        r.classList.remove('no-anim');
      });
      const shift = row.getBoundingClientRect().top - before;
      if (shift) scrollBy({ top: shift, behavior: 'instant' });
      open(on);
      if (!on) return;
      // Bring the row up only when its top is not already near the top of the screen
      const top = row.getBoundingClientRect().top, navH = 64;
      if (top < navH || top > innerHeight * 0.35) scrollBy({ top: top - navH - 8, behavior: still ? 'instant' : 'smooth' });
    });
  });

  // Very faint code drifts behind the whole Projects section, slower than the page.
  // Starts somewhere new each load; holds still under reduced motion.
  const codeLog = document.querySelector('.code-bg .case-log');
  if (codeLog) {
      const src = [
        'from fastapi import FastAPI, Request', 'from elasticsearch import AsyncElasticsearch', '',
        'app = FastAPI()', 'es = AsyncElasticsearch(ES_URL)', '',
        'async def retrieve(query: str, k: int = 8):', '    body = {',
        '        "query": {"match": {"text": query}},', '        "knn": {"field": "vec", "query_vector": embed(query), "k": k},',
        '    }', '    hits = await es.search(index="filings", body=body)',
        '    return [Line(h["_source"]) for h in hits["hits"]["hits"]]', '',
        'async def verify(claims: list[Claim]) -> list[Flag]:', '    flags = []',
        '    for a, b in pairs(claims):', '        if a.metric == b.metric and a.value != b.value:',
        '            flags.append(Flag("conflict", a.cite, b.cite))', '    for gap in missing(claims):',
        '        flags.append(Flag("missing", gap))', '    return flags', '',
        '@app.post("/ask")', 'async def ask(req: Request):', '    q = (await req.json())["question"]',
        '    plan = await planner.run(q)', '    lines = await retrieve(plan.query)',
        '    draft = await writer.run(q, lines)', '    flags = await verify(draft.claims)',
        '    return stream(trace(plan, lines, draft, flags))', '',
        'def cite(line: Line) -> str:', '    return f"[{line.doc}:L{line.n}]"', '',
        'async def load_dataset(url: str):', '    async with mcp.client(url) as c:',
        '        rows = await c.call("fetch", {"url": url})', '    await index(rows)', '',
        'def read_seat(sensor) -> bool:', '    cm = sensor.distance * 100', '    return cm < SEAT_THRESHOLD_CM', '',
        'while True:', '    states = {s.id: read_seat(s) for s in sensors}', '    requests.post(API + "/seats", json=states)', '    time.sleep(1)', '',
        'export async function GET() {', '  const seats = await db.collection("seats").find().toArray();', '  return Response.json(seats);', '}', '',
        'void loop() {', '  if (SerialBT.available()) drive(SerialBT.read());', '  delay(20);', '}', '',
        'for frame in camera.stream():', '    poses = model.predict(frame)', '    if fall_detected(poses) or hands_up(poses):', '        alert(responders, frame)', '',
      ];
    const startAt = Math.floor(Math.random() * src.length);
    const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    let html = '';
    for (let i = 0; i < 200; i++) html += `<span data-n="${i + 1}">${esc(src[(startAt + i) % src.length])}</span>`;
    codeLog.innerHTML = html;
    if (!still) {
      const sec = codeLog.closest('section');
      let ticking = false;
      const drift = () => {
        ticking = false;
        const r = sec.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const y = clamp(-r.top, 0, r.height);
        codeLog.style.transform = `translate3d(0, ${(-y * 0.32).toFixed(1)}px, 0)`;
      };
      addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(drift); } }, { passive: true });
      drift();
    }
  }

  // 2. Demo videos: inline in Signal's screen, in a dialog for other projects.
  const embed = (id, title) => {
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    f.title = title;
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    return f;
  };
  const film = document.querySelector('.film');
  const screen = document.querySelector('.case .screen');
  document.querySelectorAll('[data-video]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      const id = a.dataset.video, title = a.dataset.title || 'Demo video';
      if (screen && a.closest('.case')) {
        screen.querySelectorAll('iframe, .screen-close').forEach((n) => n.remove());
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'screen-close k';
        close.textContent = 'Close video';
        close.addEventListener('click', () => { screen.querySelector('iframe')?.remove(); close.remove(); a.focus(); });
        screen.prepend(embed(id, title));
        screen.append(close);
        screen.scrollLeft = 0;
        close.focus({ preventScroll: true });
        return;
      }
      if (!film || !film.showModal) { location.href = a.href; return; }
      film.querySelector('.film-title').textContent = title;
      film.querySelector('.film-frame').replaceChildren(embed(id, title));
      film.showModal();
      film.querySelector('.film-close').focus();
    });
  });
  if (film) {
    film.querySelector('.film-close').addEventListener('click', () => film.close());
    film.addEventListener('click', (e) => { if (e.target === film) film.close(); });
    film.addEventListener('close', () => film.querySelector('.film-frame').replaceChildren());
  }

  if (still) return;

  // 4. Signal: the stage pins while four steps play (wide pointer screens only).
  const kase = document.querySelector('[data-case]');
  if (kase) {
    const steps = [...kase.querySelectorAll('.steps li')];
    const frames = [...kase.querySelectorAll('.frame')];
    const frameFor = [0, 1, 1, 2];
    const stage = kase.querySelector('.case-stage');
    const wantPin = matchMedia('(hover: hover) and (min-width: 1000px) and (min-height: 640px)');
    let cur = -1, ticking = false, on = false;
    const set = (i) => {
      if (i === cur) return;
      cur = i;
      kase.dataset.step = i;
      steps.forEach((li, k) => { li.classList.toggle('on', k === i); li.classList.toggle('past', k < i); });
      frames.forEach((f, k) => f.classList.toggle('on', k <= frameFor[i]));
    };
    const update = () => {
      ticking = false;
      const r = kase.getBoundingClientRect();
      const run = kase.offsetHeight - stage.offsetHeight;
      const top = parseFloat(getComputedStyle(stage).top) || 0;
      const p = clamp((top - r.top) / run, 0, 0.999);
      kase.style.setProperty('--p', p.toFixed(4));
      set(Math.floor(p * steps.length));
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    const text = kase.querySelector('.case-text');
    const fits = () => {
      kase.classList.add('pin');
      const cs = getComputedStyle(stage);
      const ok = text.offsetHeight <= stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      kase.classList.toggle('pin', on);
      return ok;
    };
    const mode = () => {
      const want = wantPin.matches && fits();
      if (want === on) return;
      on = want;
      kase.classList.toggle('pin', on);
      if (on) { frames.forEach((f) => { f.loading = 'eager'; }); cur = -1; update(); addEventListener('scroll', onScroll, { passive: true }); }
      else { removeEventListener('scroll', onScroll); delete kase.dataset.step; }
      // The pin changes the page height; keep a deep link on its target.
      const target = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
      if (target && kase.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING) target.scrollIntoView();
    };
    mode();
    document.fonts?.ready.then(mode);
    wantPin.addEventListener('change', mode);
    let rz = 0;
    addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(mode, 150); }, { passive: true });
  }

  // 5. Project apertures cycle their screenshots while the row is hovered or focused.
  document.querySelectorAll('.proj').forEach((row) => {
    const shots = [...row.querySelectorAll('.thumb-in > img')];
    if (shots.length < 2) return;
    let i = 0, t = 0, z = 1;
    const show = (k) => {
      i = k;
      shots.forEach((el, n) => el.classList.toggle('on', n === k && k > 0));
      if (k > 0) shots[k].style.zIndex = ++z;
    };
    const start = () => { if (!pointer.matches || t) return; t = setInterval(() => show((i + 1) % shots.length), 1500); };
    const stop = () => { clearInterval(t); t = 0; show(0); };
    row.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') start(); });
    row.addEventListener('pointerleave', stop);
    row.addEventListener('focusin', start);
    row.addEventListener('focusout', (e) => { if (!row.contains(e.relatedTarget)) stop(); });
  });

  // 6. Buttons lean a few pixels toward the cursor.
  document.querySelectorAll('[data-magnet]').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      if (!pointer.matches || e.pointerType === 'touch') return;
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      btn.style.transform = `translate(${dx * 10}px, ${dy * 8}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
})();
