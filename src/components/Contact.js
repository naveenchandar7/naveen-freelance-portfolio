import { h, has, externalAttrs } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { label } from '../store.js';
import { section, sectionHeader } from './SectionHeader.js';

/** Social/contact links are read from data.social. Empty URLs are skipped. */
export function contactLinks(data, where) {
  const flag = where === 'footer' ? 'showInFooter' : 'showInContact';
  return (data.social || []).filter((item) => has(item.url) && item[flag] !== false);
}

export function mailtoUrl(contact) {
  const subject = has(contact.emailSubject) ? `?subject=${encodeURIComponent(contact.emailSubject)}` : '';
  return `mailto:${contact.email}${subject}`;
}

export function renderContact(data) {
  const cfg = data.contact;
  const hasEmail = has(cfg.email);
  const links = contactLinks(data, 'contact');
  if (!hasEmail && !links.length) return null;

  const rows = links.map((item) =>
    h(
      'li',
      {},
      h(
        'a',
        { class: 'contact-row glow', href: item.url, ...externalAttrs(item.url) },
        h('span', { class: 'contact-row__label' }, item.label),
        h('span', { class: 'contact-row__value' }, item.handle || item.url.replace(/^https?:\/\//, '')),
        icon('external')
      )
    )
  );

  return section(
    'contact',
    sectionHeader('contact', cfg),
    h(
      'div',
      { class: 'contact', 'data-reveal': '' },
      hasEmail
        ? h(
            'a',
            { class: 'contact__mail', href: mailtoUrl(cfg), 'aria-label': `${cfg.emailButtonLabel || label('contact.email')}: ${cfg.email}` },
            h('span', { class: 'contact__cta' }, cfg.emailButtonLabel || label('contact.email')),
            h(
              'span',
              { class: 'contact__email-card' },
              h('span', { class: 'contact__email-address' }, cfg.email),
              icon('arrow-right')
            )
          )
        : null,
      rows.length ? h('ul', { class: 'contact__list', role: 'list', 'aria-label': label('contact.other') }, rows) : null
    )
  );
}
