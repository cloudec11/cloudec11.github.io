/* Colour schemes. The choice is kept in localStorage and applied before first paint by the
   inline script in <head>; with nothing saved, a dark system setting gets Night.
   This file builds the picker in the nav: a swatch button that opens a short list. */
(() => {
  const root = document.documentElement;
  const holder = document.querySelector('.theme');
  if (!holder) return;
  const THEMES = [
    ['paper', 'Paper', '#efe8dc', '#7a5f30'],
    ['night', 'Night', '#12110f', '#d2ae70'],
    ['slate', 'Slate', '#eceff2', '#2c56c9'],
    ['terminal', 'Terminal', '#0a0e0b', '#5fd38a'],
    ['blueprint', 'Blueprint', '#0f2240', '#f2b84b'],
  ];
  const current = () => root.dataset.theme || 'paper';
  const sw = (bg, ac) => `<span class="theme-sw" style="--a:${bg};--b:${ac}" aria-hidden="true"></span>`;

  holder.innerHTML =
    `<button class="theme-btn" type="button" aria-expanded="false" aria-controls="theme-menu">` +
    `<span class="sr-only">Colour scheme: </span><span class="theme-now"></span></button>` +
    `<ul class="theme-menu" id="theme-menu" hidden>` +
    THEMES.map(([id, label, bg, ac]) =>
      `<li><button type="button" data-pick="${id}" aria-pressed="false">${sw(bg, ac)}<span>${label}</span></button></li>`).join('') +
    `</ul>`;
  holder.hidden = false;
  const btn = holder.querySelector('.theme-btn');
  const menu = holder.querySelector('.theme-menu');
  const now = holder.querySelector('.theme-now');
  const meta = document.querySelector('meta[name="theme-color"]');

  const paint = () => {
    const id = current();
    const t = THEMES.find((x) => x[0] === id) || THEMES[0];
    now.innerHTML = sw(t[2], t[3]) + `<span class="theme-label">${t[1]}</span>`;
    menu.querySelectorAll('[data-pick]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pick === id)));
    if (meta) meta.content = t[2];
  };
  const apply = (id) => {
    root.dataset.theme = id;
    try { localStorage.setItem('theme', id); } catch {}
    paint();
    dispatchEvent(new CustomEvent('themechange', { detail: id }));
  };
  const toggle = (open) => {
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    if (open) (menu.querySelector('[aria-pressed="true"]') || menu.querySelector('button')).focus();
  };

  btn.addEventListener('click', () => toggle(menu.hidden));
  menu.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pick]');
    if (!b) return;
    apply(b.dataset.pick);
    toggle(false);
    btn.focus();
  });
  menu.addEventListener('keydown', (e) => {
    const items = [...menu.querySelectorAll('button')];
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
    }
  });
  holder.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { toggle(false); btn.focus(); }
  });
  document.addEventListener('click', (e) => { if (!menu.hidden && !holder.contains(e.target)) toggle(false); });
  holder.addEventListener('focusout', (e) => { if (!menu.hidden && !holder.contains(e.relatedTarget)) toggle(false); });
  paint();

  // First-visit hint: a hand-drawn arrow up to the swatch, "Try a colour scheme". It shows
  // once the name has built, only at the top of the page. Scrolling hides it for this visit;
  // opening the menu hides it for good (remembered in localStorage).
  let seen = false;
  try { seen = localStorage.getItem('theme-hint') === 'done'; } catch {}
  if (!seen) {
    const hint = document.createElement('span');
    hint.className = 'theme-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML = '<span class="theme-hint-t">Try a colour scheme</span>' +
      '<svg viewBox="0 0 30 34" fill="none"><path d="M3 31c10 1 18-6 20-25" pathLength="1"/><path d="M17 11l6-6 5 7" pathLength="1"/></svg>';
    holder.append(hint);
    // Aim the arrow's tip (6px in from the hint's right edge) at the centre of the swatch
    const aim = () => {
      const s = btn.querySelector('.theme-sw')?.getBoundingClientRect();
      if (!s) return;
      const h = holder.getBoundingClientRect();
      hint.style.right = `${Math.round(h.right - (s.left + s.width / 2) - 6)}px`;
    };
    aim();
    addEventListener('resize', aim, { passive: true });
    let gone = false;
    const hide = (forever) => {
      if (forever) { try { localStorage.setItem('theme-hint', 'done'); } catch {} }
      if (gone) return;
      gone = true;
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', aim);
      hint.classList.remove('is-on');
      setTimeout(() => hint.remove(), 500);
    };
    const onScroll = () => { if (scrollY > 40) hide(false); };
    addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => hide(true));
    setTimeout(() => { if (!gone && scrollY <= 40) hint.classList.add('is-on'); else hide(false); }, 2400);
  }
})();
