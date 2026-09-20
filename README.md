# Naveen: Freelance Portfolio

A static, content-driven portfolio. Plain HTML, CSS and JavaScript. No build step, no framework, no database. Designed to stay maintainable for years: page content is data-driven and the visual system is centralized in CSS tokens.

**The one rule:** all content lives in `data/portfolio.json`. The UI reads it and draws itself. To add a project, edit that file and add images. You never touch the components.

```
index.html               page shell (SEO defaults, fonts, CSS links)
data/portfolio.json      ALL content: hero, services, projects, skills, links, labels
data/examples/           templates to copy from (not loaded by the site)
assets/projects/<id>/    images for each project
src/main.js              loads the data, builds the page, handles case-study routing
src/components/          Navbar, Hero, Services, Projects, ProjectCard, ProjectCaseStudy,
                         BeforeAfter, HowIWork, Skills, About, Contact, Footer, ...
src/styles/              tokens.css (colors, fonts, radii), base, components, sections, case-study
src/utils/fx.js          small effects: cursor glow, magnetic buttons, scroll progress, letter split
tools/check.mjs          content checker (run before every push)
robots.txt, sitemap.xml  SEO files (placeholder domain inside)
vercel.json              small security headers
```

---

## 1. Run locally

The site loads `data/portfolio.json` with `fetch`, so it must be served over HTTP. Opening `index.html` by double-click will show an error message.

Pick one:

```bash
python3 -m http.server 5173     # then open http://localhost:5173
# or
npx serve .                     # then open the address it prints
```

Edit a file, refresh the browser. That is the whole workflow. You can keep the same UI for years and keep adding projects without rewriting the page.

Before you push, run the checker:

```bash
node tools/check.mjs
```

It finds broken JSON, missing image files, duplicate ids, missing alt text, and leftover placeholders.

---

## 2. Add a new project

1. Create a folder: `assets/projects/<project-id>/` and put the images in it.
2. Copy the project object from `data/examples/backend-project.example.json` (or duplicate the existing one) into `projects.items` in `data/portfolio.json`. Add a comma between projects.
3. Fill in the fields. Run `node tools/check.mjs`.
4. Push to GitHub. Vercel deploys. The card, the filter button and the case-study page appear on their own.

Project fields:

| Field | Notes |
|---|---|
| `id` | Lowercase, hyphens only. Becomes the URL: `/#/project/<id>` |
| `title`, `category`, `shortDescription` | Required. `category` creates the filter buttons automatically |
| `projectType` | Be honest: `Self-initiated demo project`, `Client project`, `Personal project` |
| `disclosure` | Optional note shown on the case study, for example that it is a demo on sample data |
| `status` | `completed`, `in-progress` (shows a badge), `draft` or `hidden` (not shown anywhere) |
| `featured` | Only matters if `projects.showOnlyFeatured` is `true` |
| `description`, `problem`, `objective` | Case-study text |
| `workPerformed` | List of short items, shown as a checklist |
| `process` | List of `{ "title", "description" }`, shown as numbered steps |
| `tools`, `tags` | Lists of text |
| `results` | List of real outcomes only |
| `metrics` | List of `{ "label", "value" }`. **Only add numbers you can back up.** Cards show the first 3 |
| `images.thumbnail / before / after / summary` | `{ "src", "alt", "width", "height" }`. Each is optional |
| `gallery` | Optional list of extra images `{ "src", "alt", "caption" }` |
| `demoVideoUrl`, `githubUrl`, `liveDemoUrl` | Optional. Leave `""` and the button is not shown |

Anything empty is hidden. There are no empty placeholders on the page. Projects appear in the same order as in the file.

**Work in progress?** Set `"status": "draft"`. It stays hidden until you change it.

---

## 3. Add project images

- Put them in `assets/projects/<project-id>/` and point `src` at them (path from the site root, no leading slash).
- Use WebP or optimized PNG/JPG. Around 1600 px wide is enough for screenshots. Keep each file under about 300 KB.
- Give every image an `alt` that describes what it shows.
- Add `width` and `height` (the real pixel size). This stops the page from jumping while images load.
- **Before/after:** set `images.before` (raw data) and `images.after` (cleaned data). Use the same crop and size for both, so the slider lines up. Images load lazily.
- The starter project uses `*-placeholder.svg` files. Replace them with your real screenshots, then delete the placeholders. `check.mjs` warns until you do.
- Open Graph image: replace `assets/og-image.png` (1200 x 630).
- **Protect personal data.** Raw screenshots often contain real names, phone numbers or emails. Two safe options: (1) use fully made-up data in the screenshot, or (2) keep `"blur": true` on `images.before`. The raw image is then blurred on the site and labeled "Personal values masked". Set `"blur": false` only when the raw data is safe to show. Never show a real client's data.

---

## 4. Update services

Edit `services.items`. Each service is:

```json
{
  "id": "excel-csv-cleaning",
  "title": "Excel / CSV Data Cleaning",
  "description": "One sentence.",
  "icon": "table",
  "features": ["Remove duplicates", "Standardize fields"]
}
```

Available icons: `table`, `sheet`, `chart`, `convert`, `code`, `api`, `server`, `automation`, `ai`, `database`, `layers`. To add more, add a path in `src/utils/icons.js`.

The same pattern works for `skills.items`, `process.steps`, `about.paragraphs`, `hero`, and the navigation. A skill can have `"status": "learning"` to show a small "learning" note. Skills are grouped by their `group` field. There are no percentage bars on purpose.

Also in the same file:

- `sectionOrder`: reorder or remove sections (remove a name to hide the section).
- `testimonials.items` and `experience.items`: empty now, so those sections are hidden. Fill them with real entries later and they appear. Testimonial shape: `{ "quote", "name", "role", "company" }`. Experience shape: `{ "role", "organization", "period", "description", "highlights": [] }`.
- `labels`: every small piece of interface text.
- `site`: title, description, URL and social image for SEO.

### Hero animation, ticker and look

- `hero.visual` controls the "messy data becomes a clean table" animation. It draws shapes only, never real data. You can change `columns`, `rows`, `seed` (changes the pattern), `stageDuration`, and the `stages` labels and captions. Set `"enabled": false` to hide it.
- `hero.ticker` is the moving keyword strip under the hero. Add or remove words. An empty list hides it.
- Colors, fonts and corner radii: `src/styles/tokens.css`. The site uses a deep teal background, one amber accent, and mint only for the "clean / done" state.

Changing your positioning later (for example to "Data Operations & Backend Solutions") is a text edit in `hero.title` and `site.title`.

---

## 5. Update social links and contact details

- Email and the email button: `contact.email`.
- Upwork, Fiverr, LinkedIn, GitHub: the `social` list. Each entry has `url`, `label`, `handle`, and `showInContact` / `showInFooter`.

These are used by both the Contact section and the footer. Leave a `url` empty and that link disappears everywhere.

**Replace the placeholders before going live.** The starter file contains `YOUR-USERNAME` links and `your-email@example.com`. The browser console and `check.mjs` both warn while they remain.

---

## 6. Deploy to Vercel

1. Create a GitHub repository and push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. On vercel.com choose **Add New, Project**, import the repository.
3. Framework preset: **Other**. Leave Build Command and Output Directory empty. Deploy.
4. Every later `git push` to `main` deploys automatically.

After the first deploy, put your real address in these three places:

- `site.url` in `data/portfolio.json`
- `robots.txt` (Sitemap line)
- `sitemap.xml`

Case studies open on the same page (`/#/project/<id>`), so the sitemap only needs the home URL.

**SEO note:** the page content is drawn by JavaScript from the JSON file. Search engines that run JavaScript (Google, Bing) read it fine. The title, description and social preview tags are also present in `index.html`, so link previews work.

---

## 7. Add future backend projects

The Business Management System (Java, Spring Boot, SQL, REST API, authentication, dashboard) needs no layout work. It uses the same case-study page.

1. Copy `data/examples/backend-project.example.json` into `projects.items`. Keep `"status": "draft"` while you build it.
2. Fill in the `TODO` fields with what you really built. Use `category` such as `Backend Development`. A new filter button appears by itself.
3. Add screenshots (`thumbnail`, `summary`, or `gallery` for many). Leave `before` / `after` out and the before/after block is skipped.
4. Add `githubUrl` (and `liveDemoUrl` if hosted).
5. Add the matching skills to `skills.items`, for example `Java`, `Spring Boot`, `SQL`, `REST APIs`, with `"group": "Backend"`. Use `"status": "learning"` while it is true.
6. Add a matching service to `services.items` only when you actually offer it.
7. Set `"status": "completed"`, run `node tools/check.mjs`, push.

The same steps work for Project 3, Project 10, and any other type of work.

---

## Trust rules built into this site

- Project 1 is labeled **Self-initiated demo project** on the card and on the case study, with a disclosure note. It is never called client work.
- No clients, testimonials, revenue claims or years of experience are invented. Sections with no data (testimonials, experience) are hidden.
- The only metric shown is the one you supplied (about 5,250 records).
- The hero animation is an illustration made of shapes, with no names, numbers or personal details.
- Raw screenshots can be blurred and labeled as masked (see section 3).
- The text for Problem, Objective and Process on Project 1 was drafted from your description. Read it and change anything that does not match what you actually did.

## Accessibility and performance

Semantic HTML, one `h1` per view, skip link, visible focus states, keyboard-operable filters, menu, stage buttons and slider, alt text, and `prefers-reduced-motion` support (animations are switched off, the hero animation shows its finished state, and the About text is fully visible). No JavaScript libraries; images are lazy-loaded; only Google Fonts (Syne, Manrope, JetBrains Mono) are loaded from outside.

## Troubleshooting

- **"The portfolio could not load its content":** run a local server (section 1), or check `data/portfolio.json` for a comma or quote mistake. `node tools/check.mjs` tells you where.
- **A project does not show:** check its `status` is not `draft` or `hidden`, and that the JSON has commas between items.
- **An image is missing:** the `src` path is wrong. It starts at the project root, for example `assets/projects/my-project/raw.webp`. The checker lists missing files.


## 8.5. What is safe to change without touching the UI

For normal portfolio updates, do **not** edit the JavaScript components. Use `data/portfolio.json` for headings, services, skills, process, social links and projects. The project grid, category filters and case-study route are generated from the data file.

For a new Java/Spring Boot project, copy `data/examples/backend-project.example.json` into `projects.items`, add the images under `assets/projects/<id>/`, then fill the data fields. The same card, filter, case-study page and navigation are reused automatically.

For future style updates, use `src/styles/tokens.css` first. Accent color, background tones, text colors, borders, typography and radii are centralized there.

## 8.6. Interaction behavior

- Scroll-reveal animations replay when a section leaves and re-enters the viewport.
- The hero entrance replays when the hero comes back into view.
- Service cards have working links to the Contact section.
- Navigation CTA and all in-page anchors use real `href` targets.
- Project cards open reusable case-study routes such as `#/project/customer-data-cleaning`.
- The hero data animation is illustrative only and contains no personal data.
