export function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let observer = null;

/**
 * Adds .is-visible while elements are in view and removes it when they leave.
 * That makes the same entrance animation replay naturally whenever the user scrolls back.
 */
export function initReveal(root = document) {
  const items = root.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );
  }
  items.forEach((el) => observer.observe(el));
}

/** Plays the entrance again for a list of elements, staggered (used after filtering). */
export function replay(elements) {
  if (prefersReducedMotion()) return;
  elements.forEach((el, i) => {
    el.style.setProperty('--i', String(i));
    el.classList.remove('is-visible');
  });
  void document.body.offsetHeight;
  requestAnimationFrame(() => elements.forEach((el) => el.classList.add('is-visible')));
}
