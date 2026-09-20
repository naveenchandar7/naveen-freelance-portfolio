import { h, has, isExternal } from '../utils/dom.js';
import { section, sectionHeader } from './SectionHeader.js';

/** Renders only when real testimonials exist in portfolio.json. */
export function renderTestimonials(data) {
  const cfg = data.testimonials;
  const items = (cfg && cfg.items) || [];
  if (!items.length) return null;

  const quotes = items.map((item, i) =>
    h(
      'figure',
      { class: 'quote', 'data-reveal': '', style: `--i:${i}` },
      h('blockquote', {}, h('p', {}, item.quote)),
      h(
        'figcaption',
        {},
        h('strong', {}, item.name),
        has(item.role) || has(item.company) ? h('span', {}, [item.role, item.company].filter(has).join(', ')) : null,
        has(item.url) && isExternal(item.url) ? h('a', { href: item.url, target: '_blank', rel: 'noopener noreferrer' }, item.url.replace(/^https?:\/\//, '')) : null
      )
    )
  );

  return section('testimonials', sectionHeader('testimonials', cfg), h('div', { class: 'quotes' }, quotes));
}
