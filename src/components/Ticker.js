import { h, has } from '../utils/dom.js';

/** Slow-moving strip of keywords. The second copy is hidden from screen readers. */
export function renderTicker(items) {
  if (!has(items)) return null;

  const list = (hidden) =>
    h(
      'ul',
      { class: 'ticker__list', role: hidden ? null : 'list', 'aria-hidden': hidden ? 'true' : null },
      items.map((text) => h('li', { class: 'ticker__item' }, h('span', { class: 'ticker__dot', 'aria-hidden': 'true' }), text))
    );

  return h('div', { class: 'ticker' }, h('div', { class: 'ticker__track' }, list(false), list(true)));
}
