import { h, has } from '../utils/dom.js';
import { onScrollProgress } from '../utils/fx.js';
import { section, sectionHeader } from './SectionHeader.js';

/** The about text lights up word by word as you scroll. With reduced motion it is simply all visible. */
export function renderAbout(data) {
  const cfg = data.about;
  const paragraphs = cfg.paragraphs || [];
  if (!paragraphs.length) return null;

  const hasImage = cfg.image && has(cfg.image.src);
  const hasFacts = has(cfg.facts);
  const words = [];

  const body = h(
    'div',
    { class: 'about__body' },
    paragraphs.map((text) => {
      const p = h('p', { class: 'about__text' });
      text.split(/\s+/).filter(Boolean).forEach((word, i, all) => {
        const span = h('span', { class: 'word' }, word);
        words.push(span);
        p.append(span, i < all.length - 1 ? ' ' : '');
      });
      return p;
    }),
    hasFacts ? h('dl', { class: 'facts' }, cfg.facts.map((fact) => h('div', {}, h('dt', {}, fact.label), h('dd', {}, fact.value)))) : null
  );

  const wrap = h(
    'div',
    { class: `about${hasImage ? ' about--with-image' : ''}` },
    hasImage ? h('img', { class: 'about__image', src: cfg.image.src, alt: cfg.image.alt || '', loading: 'lazy', decoding: 'async' }) : null,
    body
  );

  onScrollProgress(
    body,
    (p) => {
      const lit = Math.round(p * words.length);
      words.forEach((word, i) => word.classList.toggle('is-lit', i < lit));
    },
    { start: 0.88, end: 0.42 }
  );

  return section('about', sectionHeader('about', cfg), wrap);
}
