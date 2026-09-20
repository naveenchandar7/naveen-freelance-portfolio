import { h, has } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { section, sectionHeader } from './SectionHeader.js';
import { label } from '../store.js';

export function renderServices(data) {
  const cfg = data.services;
  const items = cfg.items || [];
  if (!items.length) return null;

  const cards = items.map((service, i) =>
    h(
      'li',
      { class: 'service glow', 'data-reveal': '', style: `--i:${i}` },
      icon(service.icon || 'layers', 'service__icon'),
      h('h3', { class: 'service__title' }, service.title),
      has(service.description) ? h('p', { class: 'service__text' }, service.description) : null,
      has(service.features)
        ? h('ul', { class: 'ticks' }, service.features.map((feature) => h('li', {}, icon('check'), h('span', {}, feature))))
        : null,
      h(
        'a',
        { class: 'service__cta', href: service.ctaTarget || '#contact', 'data-magnetic': '' },
        h('span', {}, service.ctaLabel || label('services.cta')),
        icon('arrow-right')
      )
    )
  );

  return section('services', sectionHeader('services', cfg), h('ul', { class: 'services', role: 'list' }, cards));
}
