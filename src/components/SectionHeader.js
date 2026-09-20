import { h, has } from '../utils/dom.js';

/** Shared heading block used by every home page section. */
export function sectionHeader(id, { heading, intro }) {
  return h(
    'div',
    { class: 'section__head', 'data-reveal': 'head' },
    h('h2', { class: 'section__title', id: `${id}-title` }, h('span', { class: 'mask' }, h('span', { class: 'mask__in' }, heading))),
    has(intro) ? h('p', { class: 'section__intro' }, intro) : null
  );
}

/** Wraps section content in the standard <section> + container. */
export function section(id, head, ...content) {
  return h(
    'section',
    { class: 'section', id, 'aria-labelledby': `${id}-title` },
    h('div', { class: 'container' }, head, ...content)
  );
}
