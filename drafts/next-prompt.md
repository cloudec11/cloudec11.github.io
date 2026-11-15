# Prompt: make eric-chen.ca more impressive

You are continuing work on my personal portfolio in this repo (`D:\coding\cloudec11.github.io`,
a static GitHub Pages site for eric-chen.ca). The site works and I like its direction. Your goal
is to make it noticeably more impressive to a recruiter or engineer who lands on it, without
making it busier. "Impressive" here means craft and motion, not more decoration.

## Where things stand

Read these before changing anything:

- `index.html`, `assets/site.css`, `assets/site.js`: the current site. One page: hero, projects,
  experience, education and skills, contact footer.
- `drafts/atelier-brief.md`: the original build brief. Its **fact sheet (section 5) is the only
  allowed source of content**. Its aesthetic and page-plan sections are out of date; this prompt
  replaces them.
- `assets/img/shot-*.jpg`: real screenshots of Signal, FindMySeat and IWitness from my Devpost.

What the site is today: cream paper (`#efe8dc`), near-black ink, one muted gold. All text is
Jost. Bodoni Moda is used only for my name (top of the hero, and in gold at the bottom of the
footer). Projects, experience and skills are plain rows separated by hairlines. Motion already
built: the name rises in letter by letter on load; rows reveal on scroll (hairline draws, content
rises); the hero name recedes as you scroll; a gold reading-progress line under the nav; project
screenshots follow the cursor on hover while other rows dim; buttons fill from below and lean
toward the cursor.

## What I want

A minimal base with standout motion and interaction. The page should feel like a designer's
portfolio that happens to belong to a software developer: calm when still, surprising when you
move. Someone should want to scroll it twice.

Decisions I have already made. Do not reopen them:

- Keep the cream, ink and gold palette and the overall minimal, text-led layout.
- One text typeface. The serif stays reserved for my name. Do not add fonts.
- No AI-generated-looking photographs. The earlier Higgsfield photos were removed for that
  reason (they are archived in `drafts/higgsfield-images/`; leave them there).
- I do want scroll-triggered reveals and hover effects, even where a design skill's rules say
  to avoid them. My preference wins.

## Where to push

These are directions, not a checklist. Pick the few that produce the biggest lift and do them
well; three excellent moments beat ten average ones. Propose your shortlist to me before building.

1. **A signature hero moment.** The hero is clean but static after load. Give it one memorable
   interactive idea tied to my name or to what I build (for example the letterforms responding to
   the cursor, or a WebGL/canvas treatment of the wordmark). It must look deliberate, not like a
   stock shader.
2. **Project presentation.** Projects are the reason people visit. Make each one feel like a
   small reveal: richer hover or expand behaviour, a pinned or scroll-driven sequence for Signal
   (the Hack the North winner), smooth transitions between screenshots. Two projects (Grip
   Guardian, GuideBot) have no screenshot; design for that honestly instead of inventing imagery.
3. **Scroll choreography.** Move from "each row fades up" to a page with rhythm: varied reveals,
   a pinned moment or two, section transitions, the numbers in Experience (300+, 20+, 50 percent)
   counting or being emphasised as they arrive.
4. **Video and motion graphics.** I would like real moving footage on the page. Prefer real
   material: screen recordings of the live FindMySeat demo
   (https://findmyseathackwestern.vercel.app) or animated walkthroughs built from the real
   screenshots. If you believe a generated clip is right, tell me why and what it costs first; I
   have 3 Higgsfield credits and do not want anything that reads as AI stock.
5. **Finishing details.** Page-load sequence, cursor behaviour, link and button micro-interactions,
   the footer as a proper ending, a link-preview (Open Graph) image built from type rather than a
   photo, a favicon that matches.

## Hard constraints

- Static files only: no framework, no build step. A small dependency loaded from a pinned CDN
  version (for example GSAP or Lenis) is acceptable if it clearly earns its weight; say what you
  added and why. Otherwise write it by hand.
- Content comes only from the fact sheet. Invent no numbers, quotes, testimonials or claims.
  Keep my wording where I have edited it ("Winner of RBC prize, Hack the North 2026",
  "Projects", "Hackathon builds").
- No purple or violet, no gradient text, no glassmorphism, no glow shadows, no emoji icons, no
  captions under images.
- Accessibility is not optional: WCAG AA contrast, visible focus, keyboard reachable, one `h1`,
  44px touch targets, and a complete `prefers-reduced-motion` path where everything is simply
  present. The page must also read correctly with JavaScript off.
- Performance: 60fps scrolling on a mid-range laptop, no layout shift, lazy-load anything heavy,
  pause off-screen animation. Phones get a lighter version where needed, never a broken one.
- Works at 1440, 1024, 768 and 390 wide with no sideways scroll.
- Do not touch `CNAME`, `README.md`, `.gitignore`, `.claude/` or `.agents/`. Do not commit, push
  or deploy. I will do that myself once I have seen it.

## How to work

1. Read the files above, then open the site and look at it. A preview server is defined in
   `.claude/launch.json` (name `site`, port 5180).
2. Send me a short plan: the three to five moves you chose, what each one looks like in a
   sentence, any dependency, and anything you need from me (footage, credits, a decision). Wait
   for my go-ahead.
3. Build. Use the `impeccable:impeccable` skill for design guidance. You may read
   `.agents/skills/design-taste-frontend/SKILL.md` for its rules, but do not run its scripts.
4. Delegate with subagents where the work is separable, and keep the design decisions yourself.
   Good candidates: one agent per self-contained interactive piece (for example the hero effect
   as a standalone module with its own test page under `drafts/`), one agent to produce real
   footage or an Open Graph image, and an independent review agent at the end. Give every
   subagent this prompt's constraints, exact file ownership so two agents never edit the same
   file, and a clear definition of done. Integrate their work yourself.
5. Verify before you report. The in-app browser forces reduced motion, so check animation by
   temporarily overriding that in the page, and say exactly what you saw moving and what you
   could not see. Check all four widths, keyboard navigation, the reduced-motion path and the
   no-JavaScript path. Run the Impeccable detector on the rendered page:
   `"C:/Users/34083/.claude/plugins/cache/impeccable/impeccable/4.9.1/skills/impeccable/scripts/impeccable" detect http://localhost:5180/index.html --no-advisory`
   (the `cream-palette` finding is expected and stays).
6. Report: what you built, what each effect does, what you verified and how, what is untested,
   any dependency or asset added, and what you would do next.

## What success looks like

- A first-time visitor remembers one specific thing about the site.
- With motion switched off it is still a clean, complete, fast page.
- Nothing on it looks templated or AI-generated, and every fact on it is true.
