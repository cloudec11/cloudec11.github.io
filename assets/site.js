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
  const counted = new WeakSet();
  const count = (row) => {
    row.querySelectorAll('.num').forEach((el) => {
      if (counted.has(el)) return;
      counted.add(el);
      const end = +el.dataset.n, b = el.parentElement;
      if (still) { b.classList.add('lit'); return; }
      el.style.minWidth = `${String(end).length}ch`;
      const t0 = performance.now(), dur = 1300 + Math.min(end, 300) * 2;
      const step = (t) => {
        const k = clamp((t - t0) / dur, 0, 1);
        el.textContent = Math.round(end * (1 - Math.pow(2, -10 * k)) / (1 - Math.pow(2, -10)));
        if (k < 1) requestAnimationFrame(step);
        else { el.textContent = end; b.classList.add('lit'); }
      };
      el.textContent = '0';
      requestAnimationFrame(step);
    });
  };
  const show = (el) => {
    el.classList.add('in');
    count(el);
    setTimeout(() => el.classList.add('done'), 1400);
  };
  const items = document.querySelectorAll('[data-reveal], .foot-name');
  if (still || !('IntersectionObserver' in window)) {
    items.forEach((el) => { el.classList.add('in', 'done'); count(el); });
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        show(e.target);
        io.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    items.forEach((el) => io.observe(el));
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

  // 5. Project previews follow the cursor. Rows with several screens cycle through them.
  const peek = document.querySelector('.peek');
  const rows = document.querySelectorAll('.proj[data-shots], .proj[data-card]');
  if (peek && rows.length) {
    root.classList.add('peek-on');
    const sets = new Map();
    let z = 1;
    rows.forEach((row) => {
      const els = [];
      if (row.dataset.card) {
        const [big, small] = row.dataset.card.split('|');
        const c = document.createElement('div');
        c.className = 'card';
        c.innerHTML = '<span></span><b></b>';
        c.firstChild.textContent = small;
        c.lastChild.textContent = big;
        els.push(c);
      } else {
        row.dataset.shots.split(' ').forEach((src) => {
          const img = new Image();
          img.decoding = 'async';
          img.alt = '';
          img.dataset.src = src;
          els.push(img);
        });
      }
      els.forEach((el) => peek.append(el));
      sets.set(row, els);
    });
    const load = () => sets.forEach((els) => els.forEach((el) => { if (el.dataset.src && !el.src) el.src = el.dataset.src; }));
    const projects = document.querySelector('.projects');
    projects?.addEventListener('pointerenter', load, { once: true });

    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, active = null, cycle = 0, idx = 0;
    const tick = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      const tilt = clamp((tx - x) * 0.05, -6, 6);
      peek.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt}deg)`;
      raf = active || Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    const place = (e) => {
      const w = peek.offsetWidth, h = peek.offsetHeight;
      tx = Math.min(e.clientX + 28, innerWidth - w - 16);
      ty = clamp(e.clientY - h / 2, 16, innerHeight - h - 16);
    };
    const reveal = (el) => {
      peek.querySelectorAll('.on').forEach((o) => { if (o !== el) o.classList.remove('on'); });
      el.style.zIndex = ++z;
      el.classList.add('on');
    };
    const stop = () => { clearInterval(cycle); cycle = 0; };
    const leave = () => { active = null; stop(); peek.classList.remove('on'); };
    rows.forEach((row) => {
      row.addEventListener('pointerenter', (e) => {
        if (!pointer.matches || e.pointerType === 'touch') return;
        load();
        place(e);
        if (!active) { x = tx; y = ty; }
        active = row;
        const els = sets.get(row);
        idx = 0;
        reveal(els[0]);
        stop();
        if (els.length > 1) cycle = setInterval(() => { idx = (idx + 1) % els.length; reveal(els[idx]); }, 1700);
        peek.classList.add('on');
        if (!raf) raf = requestAnimationFrame(tick);
      });
      row.addEventListener('pointermove', (e) => { if (active === row) place(e); });
      row.addEventListener('pointerleave', () => { if (active === row) leave(); });
    });
    addEventListener('scroll', () => { if (active) leave(); }, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden && active) leave(); });
  }

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
