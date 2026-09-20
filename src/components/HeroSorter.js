import { h } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { prefersReducedMotion } from '../utils/motion.js';

const LETTERS = 'ABCDEFGH';
const COLUMN_WIDTHS = [0.7, 0.92, 0.8, 0.56, 0.84, 0.64, 0.76, 0.6];

// Small seeded random generator so the "mess" looks the same on every visit.
function seeded(seed) {
  let s = (seed >>> 0) || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/**
 * Abstract "messy data becomes a clean table" animation.
 * It draws shapes only. No names, numbers or personal details appear anywhere.
 * Everything (size, stages, captions, timing) comes from hero.visual in portfolio.json.
 */
export function renderHeroSorter(cfg) {
  const cols = clamp(cfg.columns || 5, 3, 8);
  const rows = clamp(cfg.rows || 8, 4, 12);
  const stages = cfg.stages && cfg.stages.length ? cfg.stages : [{ label: '', caption: '' }];
  const last = stages.length - 1;
  const duration = cfg.stageDuration || 1600;
  const random = seeded(cfg.seed || 7);
  const reduce = prefersReducedMotion();
  const timers = [];

  // ---- cells -----------------------------------------------------------------
  const pills = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isHead = r === 0;
      const roll = random();
      const flag = isHead ? '' : roll < 0.15 ? 'dup' : roll < 0.29 ? 'bad' : '';
      const dx = ((random() - 0.5) * 110).toFixed(0);
      const dy = ((random() - 0.5) * 80).toFixed(0);
      const rot = ((random() - 0.5) * 80).toFixed(0);
      const w0 = (0.28 + random() * 0.62).toFixed(2);
      const w1 = COLUMN_WIDTHS[c % COLUMN_WIDTHS.length];
      const index = r * cols + c;
      pills.push(
        h(
          'div',
          { class: 'sorter__cell' },
          h('span', {
            class: `pill${isHead ? ' pill--head' : ''}`,
            'data-flag': flag || null,
            style: `--dx:${dx}px;--dy:${dy}px;--rot:${rot}deg;--w0:${w0};--w1:${w1};--row:${r};--i:${index}`
          })
        )
      );
    }
  }

  const grid = h('div', { class: 'sorter__grid', style: `--cols:${cols};--rows:${rows}` }, pills);
  const letters = h(
    'div',
    { class: 'sorter__letters', 'aria-hidden': 'true', style: `--cols:${cols}` },
    Array.from({ length: cols }, (_, i) => h('span', {}, LETTERS[i]))
  );
  const scan = h('span', { class: 'sorter__scan', 'aria-hidden': 'true' });
  const badge = h('span', { class: 'sorter__done', 'aria-hidden': 'true' }, icon('check'), h('span', {}, stages[last].label));

  const frame = h('div', { class: 'sorter__frame', role: 'img', 'aria-label': cfg.title || '' }, letters, grid, scan, badge);

  // ---- stage controls -----------------------------------------------------------
  const caption = h('p', { class: 'sorter__caption', 'aria-live': 'polite' });
  const buttons = stages.map((stage, i) =>
    h(
      'button',
      { class: 'stage', type: 'button', 'aria-pressed': 'false', style: `--dur:${duration}ms`, onclick: () => show(i, true) },
      h('span', { class: 'stage__label' }, stage.label),
      h('span', { class: 'stage__bar', 'aria-hidden': 'true' })
    )
  );
  const replayButton = h('button', { class: 'sorter__replay', type: 'button', onclick: play }, icon('replay'), h('span', {}, cfg.replayLabel || 'Replay'));

  const root = h(
    'figure',
    { class: 'sorter', 'data-stage': '0' },
    frame,
    h('div', { class: 'sorter__controls' }, h('div', { class: 'stages', role: 'group', 'aria-label': cfg.stageGroupLabel || '' }, buttons), replayButton),
    caption,
    cfg.caption ? h('figcaption', { class: 'sorter__note' }, cfg.caption) : null
  );

  // ---- behaviour --------------------------------------------------------------
  function show(index, manual = false) {
    if (manual) clearTimers();
    root.dataset.stage = String(index);
    root.classList.toggle('is-manual', manual || root.classList.contains('is-manual'));
    caption.textContent = stages[index].caption || '';
    buttons.forEach((button, i) => {
      button.setAttribute('aria-pressed', String(i === index));
      button.classList.toggle('is-done', i < index);
      button.classList.toggle('is-current', i === index);
      button.classList.toggle('is-last', i === last);
    });
  }

  function clearTimers() {
    while (timers.length) clearTimeout(timers.pop());
  }

  function play() {
    clearTimers();
    root.classList.remove('is-manual');
    show(0);
    for (let i = 1; i <= last; i++) timers.push(setTimeout(() => show(i), i * duration));
    timers.push(setTimeout(play, (last + 1) * duration));
  }

  if (reduce) {
    show(last, true);
  } else {
    show(0);
    timers.push(setTimeout(play, 1100));
  }

  return root;
}
