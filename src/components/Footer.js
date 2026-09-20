import { h, externalAttrs } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { label } from '../store.js';
import { contactLinks } from './Contact.js';

export function renderFooter(data) {
  const text = (data.footer.text || '').replace('{year}', String(new Date().getFullYear()));
  const links = contactLinks(data, 'footer');

  return h(
    'footer',
    { class: 'footer' },
    h(
      'div',
      { class: 'container footer__inner' },
      h('p', { class: 'footer__text' }, text),
      links.length
        ? h('ul', { class: 'footer__links', role: 'list' }, links.map((item) => h('li', {}, h('a', { href: item.url, ...externalAttrs(item.url) }, item.label))))
        : null,
      h('a', { class: 'footer__top', href: '#top' }, h('span', {}, label('footer.backToTop')), icon('arrow-up'))
    ),
    h('div', { class: 'footer__mark', 'aria-hidden': 'true' }, data.site.name)
  );
}
