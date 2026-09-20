import { h, has } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { label } from '../store.js';

export const MAX_CARD_METRICS = 3;
export const MAX_CARD_TOOLS = 4;

export function projectUrl(project) {
  return `#/project/${encodeURIComponent(project.id)}`;
}

/** One card in the project grid. Optional fields are skipped when empty. */
export function renderProjectCard(project, index) {
  const thumb = (project.images && (project.images.thumbnail || project.images.after || project.images.before)) || null;
  const metrics = (project.metrics || []).slice(0, MAX_CARD_METRICS);
  const tools = (project.tools || []).slice(0, MAX_CARD_TOOLS);
  const inProgress = project.status === 'in-progress';

  const card = h(
    'article',
    { class: 'project-card glow' },
    has(thumb)
      ? h(
          'div',
          { class: 'project-card__media' },
          h('img', {
            src: thumb.src,
            alt: thumb.alt || '',
            width: thumb.width,
            height: thumb.height,
            loading: 'lazy',
            decoding: 'async'
          })
        )
      : null,
    h(
      'div',
      { class: 'project-card__body' },
      h(
        'div',
        { class: 'project-card__meta' },
        has(project.category) ? h('span', { class: 'project-card__category' }, project.category) : null,
        has(project.projectType) ? h('span', { class: 'badge', title: label('projects.type') }, project.projectType) : null,
        inProgress ? h('span', { class: 'badge badge--status' }, label('status.in-progress')) : null
      ),
      h('h3', { class: 'project-card__title' }, project.title),
      has(project.shortDescription) ? h('p', { class: 'project-card__text' }, project.shortDescription) : null,
      metrics.length
        ? h(
            'dl',
            { class: 'metrics' },
            metrics.map((m) => h('div', { class: 'metrics__item' }, h('dt', {}, m.label), h('dd', {}, m.value)))
          )
        : null,
      tools.length ? h('ul', { class: 'tags tags--small', role: 'list' }, tools.map((tool) => h('li', { class: 'tag' }, tool))) : null,
      h(
        'a',
        { class: 'project-card__link', href: projectUrl(project) },
        h('span', {}, label('projects.viewCaseStudy')),
        h('span', { class: 'sr-only' }, `: ${project.title}`),
        icon('arrow-right')
      )
    )
  );

  return h('li', { class: 'project-grid__item', 'data-reveal': '', 'data-category': project.category || '', style: `--i:${index}` }, card);
}
