# eric-chen.ca

My personal site: projects, experience and contact. Live at [eric-chen.ca](https://eric-chen.ca).

It's a single static page with plain HTML, CSS and JavaScript. There's no framework and no build step, and GitHub Pages serves it straight from `main`.

## Run it locally

Any static file server works. For example:

```bash
npx http-server . -p 5180 -c-1
```

Then open http://localhost:5180.

## Layout

```
index.html              the whole page
assets/site.css         styles and the five colour schemes (Jost for text, Audiowide for the name, Geist Mono for code)
assets/site.js          scroll reveals, Signal case study, project panels and apertures, counters, copy-email
assets/theme.js         colour scheme picker in the nav (Paper, Night, Slate, Terminal, Blueprint)
assets/hero.js          letters of the name lift toward the cursor
assets/sdlc.js          plan-to-shipped lifecycle animation that plays as it scrolls into view
assets/field.js         "nearest neighbours" skill map under the name (the cursor is the search query)
assets/img/             project screenshots
assets/og.png           social share image (1200x630)
assets/favicon.svg      site icon; apple-touch-icon.png is rendered from it
drafts/og/              HTML sources for og.png and apple-touch-icon.png
drafts/raw/             original screenshots the images in assets/img/ were made from
CNAME                   custom domain for GitHub Pages
```

## Notes

- **Motion.** Sections reveal as you scroll and replay when you scroll back past them. Everything settles to a still, fully visible page when the visitor has reduced motion turned on. Add `?motion=1` to the URL to force the motion back on for testing.
- **Signal case study.** On wide screens the Signal section pins in place while its steps play through, with faint code scrolling behind it.
- **Colour schemes.** Pick one from the swatch in the nav; the choice is saved in the browser. With nothing saved, a device in dark mode starts on Night. All colours are tokens at the top of `assets/site.css`, one block per scheme.
- **Project panels.** Each project row expands into a larger panel with steps and a screenshot viewer. To change a project, edit its row in `index.html`: the steps, stack line and frames live in its `.proj-case` block. On phones and tablets the expand control sits under the row's picture and the panel opens right there.
- **Without JavaScript.** The page still works without JavaScript: every panel shows open, and the email buttons fall back to `mailto:` links.

## Updating the share image

`assets/og.png` and `assets/apple-touch-icon.png` are screenshots of the pages in `drafts/og/`. After editing those pages, re-render them with headless Chrome or Edge:

```bash
msedge --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=8000 --screenshot=assets/og.png drafts/og/og.html
```

For the touch icon, use `--window-size=180,180` and `drafts/og/icon.html`.

## Deploying

Push to `main`. GitHub Pages publishes the repository root, and `CNAME` points it at eric-chen.ca.
