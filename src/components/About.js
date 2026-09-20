import { h } from '../utils/dom.js';
import { section, sectionHeader } from './SectionHeader.js';

export function renderAbout(data) {
  const cfg = data.about;
  const facts = cfg.facts || [];
  const lead = (cfg.paragraphs || [])[0] || '';
  if (!lead && !facts.length) return null;

  const content = h(
    'div',
    { class: 'about about--compact', 'data-reveal': '' },
    lead
      ? h(
          'div',
          { class: 'about__statement' },
          h('span', { class: 'about__accent', 'aria-hidden': 'true' }),
          h('p', { class: 'about__lead' }, lead)
        )
      : null,
    facts.length
      ? h(
          'div',
          { class: 'about__facts-grid' },
          facts.map((fact) =>
            h(
              'article',
              { class: 'about__fact-card' },
              h('span', { class: 'about__fact-label' }, fact.label),
              h('strong', { class: 'about__fact-value' }, fact.value)
            )
          )
        )
      : null
  );

  return section('about', sectionHeader('about', cfg), content);
}
