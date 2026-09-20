import { h, has } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { splitChars } from '../utils/fx.js';
import { renderHeroSorter } from './HeroSorter.js';
import { renderTicker } from './Ticker.js';

function ctaButton(cta, variant = '') {
  if (!cta || !has(cta.label)) return null;
  return h(
    'a',
    { class: `btn ${variant}`.trim(), href: cta.target, 'data-magnetic': '' },
    h('span', {}, cta.label),
    variant === '' ? icon('arrow-right') : null
  );
}

export function renderHero(data) {
  const hero = data.hero;
  const showVisual = hero.visual && hero.visual.enabled;
  const nameParts = String(hero.headline || 'Naveen').trim().split(/s+/);
  const firstName = nameParts.shift() || 'Naveen';
  const restName = nameParts.join(' ');

  return h(
    'section',
    { class: 'hero', id: 'top', 'aria-labelledby': 'hero-title', 'data-spot': '' },
    h('div', { class: 'hero__bg', 'aria-hidden': 'true' }, h('span', { class: 'hero__grid' }), h('span', { class: 'hero__spot' })),
    h(
      'div',
      { class: 'container hero__inner' },
      h(
        'div',
        { class: 'hero__copy' },
        h(
          'h1',
          { class: 'hero__title', id: 'hero-title' },
          h('span', { class: 'hero__name' },
            h('span', { class: 'hero__name-first' }, splitChars(firstName)),
            restName ? h('span', { class: 'hero__name-accent' }, splitChars(restName)) : null
          ),
          h('span', { class: 'hero__role', 'data-enter': '', style: '--e:9' }, hero.title)
        ),
        has(hero.text) ? h('p', { class: 'hero__text', 'data-enter': '', style: '--e:11' }, hero.text) : null,
        h('div', { class: 'hero__actions', 'data-enter': '', style: '--e:13' }, ctaButton(hero.primaryCta), ctaButton(hero.secondaryCta, 'btn--ghost'))
      ),
      showVisual ? h('div', { class: 'hero__visual', 'data-enter': '', style: '--e:8' }, renderHeroSorter(hero.visual)) : null
    ),
    renderTicker(hero.ticker)
  );
}
