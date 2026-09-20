import { h, has, externalAttrs } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { label, getProjects } from '../store.js';
import { projectUrl } from './ProjectCard.js';
import { renderBeforeAfter } from './BeforeAfter.js';

function block(title, ...content) {
  return h('section', { class: 'cs-block' }, h('h2', { class: 'cs-block__title' }, title), ...content);
}

function figureOf(img, caption) {
  return h(
    'figure',
    { class: 'cs-figure' },
    h(
      'a',
      { href: img.src, target: '_blank', rel: 'noopener', class: 'cs-figure__link' },
      h('img', { src: img.src, alt: img.alt || '', width: img.width, height: img.height, loading: 'lazy', decoding: 'async' }),
      h('span', { class: 'sr-only' }, `${label('case.openFull')}${caption ? `: ${caption}` : ''}`)
    ),
    has(caption) ? h('figcaption', {}, caption) : null
  );
}

function actionButton(url, text, iconName, variant = '') {
  if (!has(url)) return null;
  return h('a', { class: `btn ${variant}`.trim(), href: url, ...externalAttrs(url) }, icon(iconName), h('span', {}, text));
}

function fact(term, ...value) {
  return h('div', { class: 'cs-facts__item' }, h('dt', {}, term), h('dd', {}, ...value));
}

/** One reusable layout for every project. Sections with no data are not rendered. */
export function renderCaseStudy(project) {
  const images = project.images || {};
  const published = getProjects();
  const index = published.findIndex((p) => p.id === project.id);
  const previous = index > 0 ? published[index - 1] : null;
  const next = index >= 0 && index < published.length - 1 ? published[index + 1] : null;

  const statusText = has(project.status) ? label(`status.${project.status}`) : '';

  const header = h(
    'header',
    { class: 'cs-header' },
    h('a', { class: 'cs-back', href: '#projects' }, icon('arrow-left'), h('span', {}, label('case.back'))),
    has(project.category) ? h('p', { class: 'cs-category' }, project.category) : null,
    h('h1', { class: 'cs-title', id: 'cs-title', tabindex: '-1' }, project.title),
    has(project.description) ? h('p', { class: 'cs-lead' }, project.description) : null,
    h(
      'div',
      { class: 'cs-actions' },
      actionButton(project.liveDemoUrl, label('case.liveDemo'), 'external'),
      actionButton(project.githubUrl, label('case.github'), 'code', 'btn--ghost'),
      actionButton(project.demoVideoUrl, label('case.video'), 'play', 'btn--ghost')
    )
  );

  const facts = h(
    'dl',
    { class: 'cs-facts' },
    has(project.projectType) ? fact(label('case.type'), h('span', { class: 'badge' }, project.projectType)) : null,
    has(project.category) ? fact(label('case.category'), project.category) : null,
    has(statusText) && project.status !== 'completed' ? fact(label('case.status'), statusText) : null,
    has(project.tools) ? fact(label('case.tools'), h('ul', { class: 'tags tags--small', role: 'list' }, project.tools.map((t) => h('li', { class: 'tag' }, t)))) : null
  );

  const disclosure = has(project.disclosure) ? h('p', { class: 'cs-note', role: 'note' }, project.disclosure) : null;

  const beforeAfter = renderBeforeAfter(images);

  const problemObjective =
    has(project.problem) || has(project.objective)
      ? h(
          'div',
          { class: 'cs-columns' },
          has(project.problem) ? block(label('case.problem'), h('p', {}, project.problem)) : null,
          has(project.objective) ? block(label('case.objective'), h('p', {}, project.objective)) : null
        )
      : null;

  const work = has(project.workPerformed)
    ? block(label('case.work'), h('ul', { class: 'ticks ticks--columns' }, project.workPerformed.map((item) => h('li', {}, icon('check'), h('span', {}, item)))))
    : null;

  const process = has(project.process)
    ? block(
        label('case.process'),
        h(
          'ol',
          { class: 'cs-steps' },
          project.process.map((step, i) =>
            h(
              'li',
              {},
              h('span', { class: 'cs-steps__number', 'aria-hidden': 'true' }, String(i + 1)),
              h('div', {}, h('h3', {}, step.title), has(step.description) ? h('p', {}, step.description) : null)
            )
          )
        )
      )
    : null;

  const results =
    has(project.results) || has(project.metrics)
      ? block(
          label('case.results'),
          has(project.metrics)
            ? h(
                'dl',
                { class: 'cs-metrics', 'aria-label': label('case.metrics') },
                project.metrics.map((m) => h('div', { class: 'cs-metrics__item' }, h('dt', {}, m.label), h('dd', {}, m.value)))
              )
            : null,
          has(project.results) ? h('ul', { class: 'ticks' }, project.results.map((item) => h('li', {}, icon('check'), h('span', {}, item)))) : null
        )
      : null;

  const summary = has(images.summary) ? block(label('case.summary'), figureOf(images.summary)) : null;

  const gallery = has(project.gallery)
    ? block(label('case.gallery'), h('div', { class: 'cs-gallery' }, project.gallery.map((img) => figureOf(img, img.caption))))
    : null;

  const tags = has(project.tags) ? h('ul', { class: 'tags tags--small cs-tags', role: 'list', 'aria-label': label('case.tags') }, project.tags.map((t) => h('li', { class: 'tag' }, t))) : null;

  const pager =
    previous || next
      ? h(
          'nav',
          { class: 'cs-pager', 'aria-label': label('case.pager') },
          previous
            ? h('a', { class: 'cs-pager__link', href: projectUrl(previous) }, h('span', { class: 'cs-pager__hint' }, label('case.previous')), h('span', { class: 'cs-pager__title' }, previous.title))
            : h('span', {}),
          next
            ? h('a', { class: 'cs-pager__link cs-pager__link--next', href: projectUrl(next) }, h('span', { class: 'cs-pager__hint' }, label('case.next')), h('span', { class: 'cs-pager__title' }, next.title))
            : null
        )
      : null;

  return h(
    'article',
    { class: 'container case-study', 'aria-labelledby': 'cs-title' },
    header,
    facts,
    disclosure,
    beforeAfter ? h('section', { class: 'cs-block cs-block--wide', 'aria-label': label('case.beforeAfter') }, h('h2', { class: 'cs-block__title' }, label('case.beforeAfter')), beforeAfter) : null,
    problemObjective,
    work,
    process,
    results,
    summary,
    gallery,
    tags,
    pager
  );
}

export function renderNotFound() {
  return h(
    'div',
    { class: 'container case-study case-study--empty' },
    h('h1', { class: 'cs-title', id: 'cs-title', tabindex: '-1' }, label('case.notFoundTitle')),
    h('p', { class: 'cs-lead' }, label('case.notFoundText')),
    h('a', { class: 'btn', href: '#projects' }, icon('arrow-left'), h('span', {}, label('case.back')))
  );
}
