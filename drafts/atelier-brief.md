# Build brief: eric-chen.ca, "Atelier" direction

You are building the production version of Eric Chen's personal portfolio. A draft of the chosen
direction already exists at `drafts/v4-atelier/index.html`. Read it first: it sets the look. Your
job is to turn it into the finished site with fuller content, generated imagery and a higher level
of finish. Do not start from a blank page and do not drift to a different style.

## 1. Aesthetic

Editorial "atelier" portfolio: warm cream paper and near-black ink, one muted gold accent, a
high-contrast display serif (Bodoni Moda) for the name, headings and numerals, and a light
geometric sans (Jost) for body and small tracked uppercase labels. Thin hairline rules, generous
margins, alternating cream and ink bands. Quiet and confident, like a fashion or architecture
studio's site, applied to a software developer.

Keep from the draft: the name set huge across the top of the hero, the arched photograph, the
rotating circular badge, the dark "Selected works" band with framed portrait cards, the numbered
list, the dark footer with a large gold line.

## 2. References (match the feel, never copy content or layout one to one)

- Primary: a cream and black designer portfolio with a giant serif wordmark, gold labels, a
  "Selected works" band of four framed cards, a numbered process list and a dark contact footer.
  The draft is already our translation of it.
- Secondary, for the hero photograph and section pacing only: a dark mountain hiking guide with a
  lone figure on a ridge and numbered 01/02/03 chapters.

## 3. Intent

- What: a personal portfolio at eric-chen.ca, hosted on GitHub Pages (static files only).
- Who reads it: recruiters and engineers screening for a Fall 2027 software co-op. They spend
  under a minute, so the first screen must say who Eric is, what he builds and one hard fact.
- The one action: get in touch. Primary button everywhere is "Email Eric"
  (`mailto:cloudec.11@gmail.com`). Secondary links: LinkedIn, GitHub, Devpost.

## 4. Guardrails

Always:
- Plain, specific copy. Headings name things. Buttons are a verb plus an object.
- Equal left and right content edges; one container width for the whole page.
- Hero animates in once on load. Links, buttons, cards and photos respond to hover and press
  (card lifts 2px, photo zooms about 1.03 inside its frame, underlines draw).
- Respect `prefers-reduced-motion`. Anything that loops longer than 5 seconds gets a pause control
  or stops by itself.
- WCAG AA contrast, visible focus rings, skip link, alt text, one `h1`, headings in order,
  44px tap targets on phones.
- Works at 1440, 1024, 768 and 390 wide with no sideways scroll.
- Small text never under 11px. Gold on cream must be the dark gold (`#7a5f30`) for text.

Never:
- Purple or violet, blue-purple gradients, glowing shadows, glassmorphism, 3D blobs.
- Inter, Roboto, Fraunces, Space Grotesk, Geist, Plus Jakarta Sans.
- Emoji as icons. Generic SaaS card grids. Fade-in on every section as you scroll.
- Captions under images. Invented facts, numbers, quotes or testimonials. Everything on the page
  must come from the fact sheet below.
- Frameworks or a build step. No external JS libraries. Google Fonts is the only external request;
  all images are local files.

## 5. Fact sheet (the only source of content)

**Eric Chen.** Toronto, ON. Honours Specialization in Computer Science (BSc) at Western
University, London, ON, Sep 2024 to present. Dean's List 2024 and 2025. Builds full-stack apps and
AI tools, most recently LLM agents and retrieval systems. Looking for Fall 2027 co-op roles.

Links: email `cloudec.11@gmail.com` · https://www.linkedin.com/in/eric-chen11 ·
https://github.com/cloudec11 · https://devpost.com/cloudec-11

### Experience

1. **Korah Limited**, Software Developer Intern, May to Aug 2026, Toronto, ON
   - Worked with two other interns and a mentor on an LLM-powered automated receptionist system.
   - Built a voice integration connecting Amazon's Alexa API to the company's LLM through a Node
     server and a REST API, so visitors talk to the system in natural conversation.
   - Developed the core Python systems running the kiosk: appointment check-ins, staff
     text-message alerts, badge printing and the live visitor display, plus an AWS Lambda function.
   - Set up Flask servers and ngrok tunnels so IoT devices on different machines could talk.
2. **Autumn Co**, Software Engineer Intern, May to Aug 2026, New York (remote)
   - Rewrote a Python scraper's parsing logic to handle more edge cases, doubling its
     effectiveness.
   - QA across the web app: resolved 20+ defects and cut front-end bugs by 50 percent.
   - Used Cursor's agentic workflows and structured prompting to refactor and QA the front end in
     3 weeks, halving time spent on manual QA.
3. **Computer Science Club**, Executive Member, Jun 2023 to Jun 2024, Markham, ON
   - Designed and delivered weekly workshops on data structures, algorithms and software design
     for 300+ students.
   - Mentored 100+ students; contest participation and performance rose 20 percent.
4. **BizZone**, Software Development Co-op, Sep 2022 to Jan 2023, Markham, ON (remote)
   - Built and tested production web features for client websites; API integrations that present
     database-driven data in client-facing views.
   - Documented issues and fixes, reducing repeat defects by 15 percent. Shared Git codebase with
     4 developers.

### Projects

1. **Signal**. Winner, RBC "Signal in the Noise" prize, Hack the North 2026. Multi-agent financial
   research assistant that answers with line-level citations and flags conflicting or missing data
   instead of guessing. Hybrid BM25 + vector search in Elasticsearch, FastAPI backend streaming the
   live agent trace, MCP client that loads new datasets from a URL. Python, FastAPI, Elasticsearch,
   OpenAI, MCP, MongoDB. Link: https://devpost.com/software/temp-project-0sp3zv · code:
   https://github.com/liamma06/searchGM
2. **FindMySeat**. Hack Western 12, Nov 2025. Real-time seat occupancy: ultrasonic sensors on
   Raspberry Pis stream to a FastAPI backend and a live Next.js dashboard, with a Gemini chat
   assistant for seat recommendations. Validated across 20+ usage scenarios. Link:
   https://devpost.com/software/findmyseat · demo: https://findmyseathackwestern.vercel.app
3. **Grip Guardian**. Best Development Tool, JAMHacks 8, Jun 2024, among 200+ hackers. A computer
   mouse fitted with pressure and position sensors, and a React dashboard that shows grip habits
   linked to repetitive strain injury live, so users correct their grip in the moment. Built in 36
   hours. Link: https://dorahacks.io/buidl/13396
4. **GuideBot**. MLH Best Accessibility Hack, Hack the 6ix 2023. Navigation robot for visually
   impaired users: an ESP32 robot driven over Bluetooth, with TensorFlow object recognition
   describing nearby objects. Link: https://devpost.com/software/guidebot
5. **IWitness**. 2nd Place and Smart Cities Theme Award, YRHacks, Mar 2023, among 50+ teams. Web
   app that watches live camera feeds and uses TensorFlow to flag crimes and medical emergencies
   for first responders. Link: https://devpost.com/software/temp-rft3ge
6. **Computer Science Undergrad Society website**. Dec 2024 to present. Responsive club site in
   React that centralises events, announcements and resources for 100+ active members. No link.

### Skills

- Languages and frameworks: JavaScript, React, Next.js, Node.js, Python, FastAPI, Flask, Java,
  C++, HTML, CSS
- Software engineering: REST APIs, real-time systems, third-party integrations, client-server
  architecture, object-oriented design, data structures and algorithms
- Tools: Git, AWS Lambda, Docker, Elasticsearch, MongoDB, OpenAI API, MCP, OpenCV, Twilio (SMS),
  Amazon Alexa, Google Workspace APIs, TensorFlow, Raspberry Pi

## 6. Page plan

One page, `index.html`, in this order. Each section is one or two screens tall at 1440x900.

1. **Hero** (cream). Giant "ERIC CHEN". Left: label, an `h1` that says what he does, one sentence,
   the co-op line. Centre: arched photograph `hero.jpg`. Right: rotating badge, one hard fact
   (1st, RBC prize, Hack the North 2026), "Email Eric" button.
2. **Selected works** (ink band). Five framed portrait cards for projects 1 to 5, each linking
   out, with name, award line and one sentence. Five cards must still look deliberate: for example
   a lead card for Signal beside a 2x2 grid, or a 5-up row that becomes 2 columns on tablets.
   Project 6 (CSUS website) appears as a hairline text row under the cards, with no image.
3. **Experience** (cream). The four roles as a numbered 01 to 04 list with dates, place, and two
   or three of the strongest bullets each. The numbers people will remember (300+ students,
   20+ defects, 50 percent) should be easy to spot without turning into a stats-card grid.
4. **Education and skills** (cream or a slightly deeper cream). Western, degree, Dean's List, and
   the three skill groups. Uses `summit.jpg` as the one photograph of the section.
5. **Contact** (ink footer). Large gold line, "Email Eric" button, LinkedIn, GitHub, Devpost, the
   one credit line "Imagery generated with Higgsfield".

Sticky or simple top nav: mark on the left, Works / Experience / Contact on the right; on phones
only the mark and Contact.

## 7. Images

All local, in `assets/img/`. They are being generated in parallel and will exist by the time you
finish; build against these exact filenames and set `width`/`height` attributes from the ratios.
Every image is illustrative, not a photo of the real project, so never caption it as such.

| File | Ratio | Subject (for alt text) |
|---|---|---|
| `hero.jpg` | 4:5 | A lone hiker seen from behind on a rocky summit at golden hour |
| `signal.jpg` | 3:4 | Printed financial reports with highlighted lines under a desk lamp |
| `findmyseat.jpg` | 3:4 | A quiet library reading room with rows of wooden desks and chairs |
| `gripguardian.jpg` | 3:4 | A hand resting on a computer mouse fitted with thin sensor wires |
| `guidebot.jpg` | 3:4 | A small two-wheeled robot on a wooden workbench |
| `iwitness.jpg` | 3:4 | A city intersection at night seen from above |
| `summit.jpg` | 3:4 | A stone cairn on a mountain ridge at dusk |

## 8. Deliverables

- `index.html` at the repo root (replaces the "coming soon" placeholder), `assets/site.css`,
  `assets/site.js` only if needed (keep it tiny).
- Head: title, description, Open Graph tags, `theme-color`, an inline SVG favicon with "E".
- Do not touch `CNAME`, `README.md`, `.gitignore`, `drafts/`, `.claude/`, `.agents/`.
- Do not commit, push or deploy anything.

## 9. Process

1. Invoke the `impeccable:impeccable` skill (Skill tool) and follow its guidance for the build.
2. Read `.agents/skills/design-taste-frontend/SKILL.md` for its house rules (no captions, equal
   edges, one section per screen, hover layer, hero entrance). Follow the rules; do not run its
   scripts.
3. Build. Then run the Impeccable detector and fix real findings:
   `"C:/Users/34083/.claude/plugins/cache/impeccable/impeccable/4.9.1/skills/impeccable/scripts/impeccable" detect index.html assets --no-advisory`
   Known acceptable findings in this direction: `cream-palette` (the chosen reference is cream)
   and `cramped-padding` on full-width bands whose content sits in the page container.
4. Report: files written, what changed from the draft, detector output, anything you could not do.
