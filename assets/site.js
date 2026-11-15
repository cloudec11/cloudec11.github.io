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
    // Line numbers that scroll in the gutter behind the pinned stage. The cited lines are gold.
    const log = kase.querySelector('.case-log');
    if (log) {
      const cited = new Set([12, 18, 31, 47]);
      let html = '';
      for (let i = 1; i <= 80; i++) html += `<span${cited.has(i) ? ' class="cite"' : ''} data-n="${i * 4 + 364}"></span>`;
      log.innerHTML = html;
    }
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

  // 5. Project previews: a docked column beside the list shows the hovered (or focused) row.
  //    Rows with several screens cycle through them. Narrower or touch screens keep inline shots.
  const peek = document.querySelector('.peek');
  const rows = [...document.querySelectorAll('.proj[data-shots], .proj[data-card]')];
  const wide = matchMedia('(hover: hover) and (min-width: 1100px)');
  if (peek && rows.length) {
    const sets = new Map();
    let z = 1, active = null, cycle = 0, idx = 0;
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
          img.src = src;
          els.push(img);
        });
      }
      els.forEach((el) => peek.append(el));
      sets.set(row, els);
    });
    const reveal = (el) => {
      peek.querySelectorAll('.on').forEach((o) => { if (o !== el) o.classList.remove('on'); });
      el.style.zIndex = ++z;
      el.classList.add('on');
    };
    const stop = () => { clearInterval(cycle); cycle = 0; };
    const select = (row) => {
      if (row === active) return;
      active?.classList.remove('is-active');
      active = row;
      row.classList.add('is-active');
      const els = sets.get(row);
      idx = 0;
      reveal(els[0]);
      stop();
      if (els.length > 1) cycle = setInterval(() => { idx = (idx + 1) % els.length; reveal(els[idx]); }, 1700);
    };
    rows.forEach((row) => {
      row.addEventListener('pointerenter', (e) => { if (wide.matches && e.pointerType !== 'touch') select(row); });
      row.addEventListener('focusin', () => { if (wide.matches) select(row); });
    });
    // Leaving the list keeps the last preview on screen but stops it cycling.
    document.querySelector('.projects')?.addEventListener('pointerleave', stop);
    const mode = () => {
      root.classList.toggle('peek-on', wide.matches);
      if (wide.matches && !active) select(rows[0]);
      if (!wide.matches) stop();
    };
    mode();
    wide.addEventListener('change', mode);
    new IntersectionObserver(([e], o) => {
      if (e.isIntersecting) { peek.classList.add('in'); o.disconnect(); }
    }, { rootMargin: '0px 0px -12% 0px' }).observe(peek.parentElement);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
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
