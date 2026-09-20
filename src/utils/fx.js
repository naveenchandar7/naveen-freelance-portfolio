// Small interaction effects. No libraries. All of them stand down for reduced motion or touch devices.
import { h } from './dom.js';
import { prefersReducedMotion } from './motion.js';

const canHover = () => typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Cursor light: elements with .glow or [data-spot] get --mx / --my (pointer position inside them). */
export function initPointerGlow() {
  if (!canHover()) return;
  document.addEventListener(
    'pointermove',
    (event) => {
      for (let node = event.target; node && node !== document.body; node = node.parentElement) {
        if (node.classList && (node.classList.contains('glow') || node.hasAttribute('data-spot'))) {
          const rect = node.getBoundingClientRect();
          node.style.setProperty('--mx', `${event.clientX - rect.left}px`);
          node.style.setProperty('--my', `${event.clientY - rect.top}px`);
        }
      }
    },
    { passive: true }
  );
}

/** Buttons marked [data-magnetic] lean slightly toward the cursor. */
export function initMagnetic() {
  if (!canHover() || prefersReducedMotion()) return;
  document.addEventListener(
    'pointermove',
    (event) => {
      const el = event.target.closest && event.target.closest('[data-magnetic]');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
      const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
      el.style.translate = `${(x * 12).toFixed(1)}px ${(y * 9).toFixed(1)}px`;
    },
    { passive: true }
  );
  document.addEventListener('pointerout', (event) => {
    const el = event.target.closest && event.target.closest('[data-magnetic]');
    if (el && !el.contains(event.relatedTarget)) el.style.translate = '';
  });
}

/** Thin bar at the top of the page showing how far the page is scrolled. */
export function initScrollBar(bar) {
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  update();
}

// ---- scroll-linked progress -------------------------------------------------
const effects = new Set();
let scrollBound = false;

function runEffects() {
  effects.forEach((effect) => {
    const el = effect.el;
    if (!el.isConnected || el.getClientRects().length === 0) return; // hidden view
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const startY = vh * effect.start;
    const endY = vh * effect.end;
    const travel = startY - endY + rect.height;
    const p = Math.min(1, Math.max(0, (startY - rect.top) / travel));
    if (p !== effect.last) {
      effect.last = p;
      effect.callback(p);
    }
  });
}

/**
 * Calls callback(p) with p from 0 to 1 while the element scrolls through the viewport.
 * With reduced motion the callback gets 1 once (everything shown, nothing animated).
 */
export function onScrollProgress(el, callback, { start = 0.85, end = 0.35 } = {}) {
  if (prefersReducedMotion()) {
    callback(1);
    return;
  }
  effects.add({ el, callback, start, end, last: -1 });
  if (!scrollBound) {
    scrollBound = true;
    let ticking = false;
    const schedule = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        runEffects();
        ticking = false;
      });
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  }
  requestAnimationFrame(runEffects);
}

export function refreshEffects() {
  requestAnimationFrame(runEffects);
}

/** Splits text into per-letter spans for the headline entrance. Screen readers get the plain text. */
export function splitChars(text) {
  const wrap = h('span', { class: 'chars' }, h('span', { class: 'sr-only' }, text));
  [...text].forEach((char, i) => {
    wrap.append(
      h('span', { class: 'char', 'aria-hidden': 'true', style: `--ci:${i}` }, h('span', { class: 'char__in' }, char === ' ' ? '\u00a0' : char))
    );
  });
  return wrap;
}
