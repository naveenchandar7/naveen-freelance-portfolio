import { setData, getProject, label } from './store.js';
import { h, has, isExternal } from './utils/dom.js';
import { initReveal, prefersReducedMotion } from './utils/motion.js';
import { initPointerGlow, initMagnetic, initScrollBar, refreshEffects } from './utils/fx.js';
import { renderNavbar } from './components/Navbar.js';
import { renderHero } from './components/Hero.js';
import { renderServices } from './components/Services.js';
import { renderProjects } from './components/Projects.js';
import { renderProcess } from './components/HowIWork.js';
import { renderSkills } from './components/Skills.js';
import { renderTestimonials } from './components/Testimonials.js';
import { renderExperience } from './components/Experience.js';
import { renderAbout } from './components/About.js';
import { renderContact } from './components/Contact.js';
import { renderFooter } from './components/Footer.js';
import { renderCaseStudy, renderNotFound } from './components/ProjectCaseStudy.js';

const DATA_URL = './data/portfolio.json';

// The order and visibility of home sections is controlled by "sectionOrder" in portfolio.json.
const SECTIONS = {
  hero: renderHero,
  services: renderServices,
  projects: renderProjects,
  process: renderProcess,
  skills: renderSkills,
  testimonials: renderTestimonials,
  experience: renderExperience,
  about: renderAbout,
  contact: renderContact
};

let data;
let nav;
let homeView;
let caseView;
let homeScrollY = 0;
let currentView = 'home';


function initHeroReplay(root) {
  const hero = root.querySelector('.hero');
  if (!hero) return;

  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    hero.classList.add('hero--active');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          hero.classList.remove('hero--active');
          void hero.offsetWidth;
          hero.classList.add('hero--active');
        } else {
          hero.classList.remove('hero--active');
        }
      }
    },
    { threshold: 0.22 }
  );
  observer.observe(hero);
}

// ---------------------------------------------------------------- start

init();

async function init() {
  const app = document.getElementById('app');
  try {
    const response = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`${DATA_URL} returned ${response.status}`);
    data = await response.json();
  } catch (error) {
    console.error(error);
    showFatal(app);
    return;
  }

  setData(data);
  applyMeta(data.site);
  warnAboutPlaceholders(data);

  nav = renderNavbar(data);
  homeView = h('div', { id: 'home' }, (data.sectionOrder || Object.keys(SECTIONS)).map((name) => (SECTIONS[name] ? SECTIONS[name](data) : null)));
  caseView = h('div', { id: 'case-study', hidden: true });

  const progress = h('div', { class: 'progress', 'aria-hidden': 'true' }, h('span', { class: 'progress__bar' }));

  app.replaceChildren(
    h('a', { class: 'skip-link', href: '#main' }, label('skipToContent')),
    progress,
    nav.el,
    h('main', { id: 'main', tabindex: '-1' }, homeView, caseView),
    renderFooter(data)
  );

  initReveal(homeView);
  initHeroReplay(homeView);
  initPointerGlow();
  initMagnetic();
  initScrollBar(progress.firstChild);
  watchSections();
  window.addEventListener('hashchange', route);
  route();

}

function showFatal(app) {
  app.replaceChildren(
    h(
      'div',
      { class: 'fatal' },
      h('h1', {}, 'The portfolio could not load its content.'),
      h('p', {}, 'If you opened index.html directly from a folder, start a local server instead. The README explains how.')
    )
  );
}

// ---------------------------------------------------------------- routing

function parseRoute() {
  const hash = window.location.hash;
  const match = hash.match(/^#\/project\/([^/?#]+)/);
  if (match) return { view: 'project', id: decodeURIComponent(match[1]) };
  return { view: 'home', section: hash.replace(/^#/, '') };
}

function route() {
  const target = parseRoute();
  nav.close();

  if (target.view === 'project') {
    if (currentView === 'home') homeScrollY = window.scrollY;
    showCaseStudy(target.id);
    return;
  }

  const cameFromCase = currentView === 'project';
  showHome();
  const sectionEl = target.section ? document.getElementById(target.section) : null;
  const behavior = cameFromCase ? 'instant' : prefersReducedMotion() ? 'instant' : 'smooth';

  if (sectionEl) {
    // Let the browser handle in-page jumps while the home view is already visible.
    if (cameFromCase) sectionEl.scrollIntoView({ behavior: 'instant', block: 'start' });
  } else if (cameFromCase) {
    window.scrollTo({ top: homeScrollY, behavior: 'instant' });
  } else if (!target.section || target.section === 'top') {
    window.scrollTo({ top: 0, behavior });
  }
}

function showHome() {
  currentView = 'home';
  caseView.hidden = true;
  caseView.replaceChildren();
  homeView.hidden = false;
  setTitle(data.site.title);
  initReveal(homeView);
  refreshEffects();
}

function showCaseStudy(id) {
  currentView = 'project';
  const project = getProject(id);
  homeView.hidden = true;
  caseView.replaceChildren(project ? renderCaseStudy(project) : renderNotFound());
  caseView.hidden = false;
  caseView.classList.remove('view-enter');
  void caseView.offsetWidth;
  caseView.classList.add('view-enter');

  setTitle(project ? `${project.title} — ${data.site.name}` : `${label('case.notFoundTitle')} — ${data.site.name}`);
  window.scrollTo({ top: 0, behavior: 'instant' });
  const heading = caseView.querySelector('#cs-title');
  if (heading) heading.focus({ preventScroll: true });
}

function setTitle(title) {
  document.title = title;
}

// Highlights the nav link of the section that is currently in view.
function watchSections() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) nav.setActive(entry.target.id);
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  homeView.querySelectorAll('section[id]').forEach((el) => observer.observe(el));
}

// ---------------------------------------------------------------- SEO / meta

function upsertMeta(selector, create, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.append(el);
  }
  if (el.tagName === 'LINK') el.setAttribute('href', value);
  else el.setAttribute('content', value);
}

const metaTag = (attr, key) => () => h('meta', { [attr]: key });

function absoluteUrl(base, path) {
  if (!has(path)) return '';
  if (isExternal(path)) return path;
  try {
    return new URL(path, base).href;
  } catch {
    return path;
  }
}

function applyMeta(site) {
  document.documentElement.lang = site.language || 'en';
  document.title = site.title;

  const image = absoluteUrl(site.url, site.ogImage);
  upsertMeta('meta[name="description"]', metaTag('name', 'description'), site.description);
  upsertMeta('meta[name="theme-color"]', metaTag('name', 'theme-color'), site.themeColor || '#1B4DDB');
  upsertMeta('meta[property="og:title"]', metaTag('property', 'og:title'), site.title);
  upsertMeta('meta[property="og:description"]', metaTag('property', 'og:description'), site.description);
  upsertMeta('meta[property="og:url"]', metaTag('property', 'og:url'), site.url);
  upsertMeta('meta[property="og:locale"]', metaTag('property', 'og:locale'), site.locale || 'en_US');
  upsertMeta('meta[name="twitter:title"]', metaTag('name', 'twitter:title'), site.title);
  upsertMeta('meta[name="twitter:description"]', metaTag('name', 'twitter:description'), site.description);
  if (image) {
    upsertMeta('meta[property="og:image"]', metaTag('property', 'og:image'), image);
    upsertMeta('meta[name="twitter:image"]', metaTag('name', 'twitter:image'), image);
  }
  if (has(site.ogImageAlt)) upsertMeta('meta[property="og:image:alt"]', metaTag('property', 'og:image:alt'), site.ogImageAlt);
  upsertMeta('link[rel="canonical"]', () => h('link', { rel: 'canonical' }), site.url);

  // Structured data for search engines, built from the same content.
  const sameAs = (data.social || []).map((s) => s.url).filter((u) => has(u) && isExternal(u) && !/YOUR-/i.test(u));
  const json = { '@context': 'https://schema.org', '@type': 'Person', name: site.name, url: site.url, description: site.description };
  if (sameAs.length) json.sameAs = sameAs;
  let script = document.getElementById('ld-json');
  if (!script) {
    script = h('script', { type: 'application/ld+json', id: 'ld-json' });
    document.head.append(script);
  }
  script.textContent = JSON.stringify(json);
}

// Friendly reminder in the browser console while placeholders are still in the content file.
function warnAboutPlaceholders(content) {
  const text = JSON.stringify([content.social, content.contact, content.site]);
  if (/YOUR-|your-email@|your-domain|example\.com/i.test(text)) {
    console.warn('[portfolio] Placeholder links, email or site URL found in data/portfolio.json. Replace them before deploying.');
  }
  const images = JSON.stringify(content.projects);
  if (/placeholder/i.test(images)) {
    console.warn('[portfolio] Placeholder project images are still in use. Replace them with your real screenshots.');
  }
}
