import { h, has } from '../utils/dom.js';
import { onScrollProgress } from '../utils/fx.js';
import { section, sectionHeader } from './SectionHeader.js';

/** Steps sit on a line that fills as you scroll past. Each step lights up when the line reaches it. */
export function renderProcess(data) {
  const cfg = data.process;
  const steps = cfg.steps || [];
  if (!steps.length) return null;

  const items = steps.map((step, i) =>
    h(
      'li',
      { class: 'step', 'data-reveal': '', style: `--i:${i}` },
      h('span', { class: 'step__dot', 'aria-hidden': 'true' }),
      h('span', { class: 'step__number', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')),
      h('h3', { class: 'step__title' }, step.title),
      has(step.description) ? h('p', { class: 'step__text' }, step.description) : null
    )
  );
  const list = h('ol', { class: 'steps', style: `--p:0;--n:${items.length}` }, items);

  onScrollProgress(
    list,
    (p) => {
      list.style.setProperty('--p', p.toFixed(3));
      items.forEach((item, i) => item.classList.toggle('is-on', p >= (i + 0.35) / items.length));
    },
    { start: 0.85, end: 0.45 }
  );

  return section('process', sectionHeader('process', cfg), list);
}
