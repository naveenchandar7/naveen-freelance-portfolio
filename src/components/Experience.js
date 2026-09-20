import { h, has } from '../utils/dom.js';
import { section, sectionHeader } from './SectionHeader.js';

/** Renders only when real experience entries exist in portfolio.json. */
export function renderExperience(data) {
  const cfg = data.experience;
  const items = (cfg && cfg.items) || [];
  if (!items.length) return null;

  const list = h(
    'ol',
    { class: 'timeline' },
    items.map((item, i) =>
      h(
        'li',
        { class: 'timeline__item', 'data-reveal': '', style: `--i:${i}` },
        has(item.period) ? h('p', { class: 'timeline__period' }, item.period) : null,
        h('h3', { class: 'timeline__title' }, item.role),
        has(item.organization) ? h('p', { class: 'timeline__org' }, item.organization) : null,
        has(item.description) ? h('p', {}, item.description) : null,
        has(item.highlights) ? h('ul', { class: 'ticks' }, item.highlights.map((text) => h('li', {}, h('span', {}, text)))) : null
      )
    )
  );

  return section('experience', sectionHeader('experience', cfg), list);
}
