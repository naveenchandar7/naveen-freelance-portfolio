import { h, has } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { label } from '../store.js';

export function renderNavbar(data) {
  const { brand, items = [], cta } = data.navigation;

  const links = items.map((item) =>
    h('li', {}, h('a', { class: 'nav__link', href: item.target, 'data-target': item.target }, item.label))
  );

  const panel = h(
    'div',
    { class: 'nav__panel', id: 'nav-panel' },
    h('ul', { class: 'nav__list' }, links),
    cta && has(cta.label) ? h('a', { class: 'btn btn--small', href: cta.target, 'data-magnetic': '' }, cta.label) : null
  );

  const toggle = h(
    'button',
    {
      class: 'nav__toggle',
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': 'nav-panel',
      'aria-label': label('nav.openMenu')
    },
    icon('menu')
  );

  const header = h(
    'header',
    { class: 'nav' },
    h(
      'div',
      { class: 'container' },
      h(
        'nav',
        { class: 'nav__inner', 'aria-label': label('nav.label') },
        h('a', { class: 'nav__brand', href: brand.target || '#top' }, h('span', { class: 'nav__logo', 'aria-hidden': 'true' }), brand.label),
        toggle,
        panel
      )
    )
  );

  function setOpen(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', label(open ? 'nav.closeMenu' : 'nav.openMenu'));
    toggle.replaceChildren(icon(open ? 'close' : 'menu'));
  }

  toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
  panel.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 860px)').addEventListener?.('change', (event) => {
    if (event.matches) setOpen(false);
  });

  // Border appears once the page is scrolled.
  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
        ticking = false;
      });
    },
    { passive: true }
  );

  /** Marks the nav link of the section currently in view. */
  function setActive(sectionId) {
    header.querySelectorAll('.nav__link').forEach((link) => {
      const active = link.dataset.target === `#${sectionId}`;
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  return { el: header, setActive, close: () => setOpen(false) };
}
