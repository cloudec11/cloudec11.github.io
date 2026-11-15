// eric-chen.ca: scroll reveals, the cursor-following project preview, and the magnetic button.
// The page reads fine without any of it.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = matchMedia('(hover: hover) and (min-width: 861px)');

  // 1. Reveal rows and headings as they enter the viewport.
  const items = document.querySelectorAll('[data-reveal]');
  if (still || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in', 'done'));
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        setTimeout(() => e.target.classList.add('done'), 1400);
        io.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    items.forEach((el) => io.observe(el));
  }

  if (still) return;

  // 2. Project screenshots follow the cursor while a row is hovered.
  const peek = document.querySelector('.peek');
  const rows = document.querySelectorAll('.proj[data-shot]');
  if (peek && rows.length) {
    const imgs = new Map();
    rows.forEach((row) => {
      const img = new Image();
      img.src = row.dataset.shot;
      img.alt = '';
      peek.append(img);
      imgs.set(row, img);
    });
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, active = null;
    const tick = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      const tilt = Math.max(-6, Math.min(6, (tx - x) * 0.05));
      peek.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt}deg)`;
      raf = active || Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    const place = (e) => {
      const w = peek.offsetWidth, h = peek.offsetHeight;
      tx = Math.min(e.clientX + 28, innerWidth - w - 16);
      ty = Math.max(16, Math.min(e.clientY - h / 2, innerHeight - h - 16));
    };
    rows.forEach((row) => {
      row.addEventListener('pointerenter', (e) => {
        if (!pointer.matches || e.pointerType === 'touch') return;
        place(e);
        if (!active) { x = tx; y = ty; }
        active = row;
        imgs.forEach((img, r) => img.classList.toggle('on', r === row));
        peek.classList.add('on');
        if (!raf) raf = requestAnimationFrame(tick);
      });
      row.addEventListener('pointermove', (e) => { if (active === row) place(e); });
      row.addEventListener('pointerleave', () => {
        if (active !== row) return;
        active = null;
        peek.classList.remove('on');
      });
    });
    addEventListener('scroll', () => { if (active) { active = null; peek.classList.remove('on'); } }, { passive: true });
  }

  // 3. Buttons lean a few pixels toward the cursor.
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
