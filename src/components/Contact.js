import { h, has, externalAttrs } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { label } from '../store.js';
import { section } from './SectionHeader.js';

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
  const social = (data.social || []).filter((item) => has(item.url) && ['upwork', 'fiverr', 'github'].includes(item.id));
  if (!hasEmail && !social.length) return null;

  const mainLinks = social.filter((item) => item.id !== 'fiverr');
  const miniLinks = social.filter((item) => item.id === 'upwork' || item.id === 'fiverr');

  return section(
    'contact',
    null,
    h(
      'div',
      { class: 'contact contact--closing' },
      h(
        'div',
        { class: 'contact__closing-top' },
        h(
          'div',
          { class: 'contact__closing-copy' },
          h('span', { class: 'contact__kicker' }, '05 — CONTACT'),
          h(
            'h2',
            { class: 'contact__closing-title', id: 'contact-title' },
            h('span', {}, 'Have a messy dataset?'),
            h('span', { class: 'contact__closing-accent' }, 'Let’s clean it up.')
          ),
          h(
            'p',
            { class: 'contact__closing-text' },
            'Send me the task, expected output and any rules you need followed. I’ll review the requirement and work toward a clean, structured result.'
          )
        ),
        h(
          'div',
          { class: 'contact__closing-actions' },
          hasEmail
            ? h(
                'a',
                { class: 'contact__closing-btn contact__closing-btn--primary', href: mailtoUrl(cfg) },
                h('span', {}, 'Email me'),
                icon('arrow-up-right')
              )
            : null,
          mainLinks.map((item) =>
            h(
              'a',
              { class: 'contact__closing-btn contact__closing-btn--ghost', href: item.url, ...externalAttrs(item.url) },
              h('span', {}, item.label),
              icon('external')
            )
          )
        )
      ),
      h(
        'div',
        { class: 'contact__closing-bar' },
        h('span', {}, `© ${new Date().getFullYear()} Naveen`),
        h(
          'div',
          { class: 'contact__closing-links' },
          miniLinks.map((item) =>
            h(
              'a',
              { href: item.url, ...externalAttrs(item.url) },
              item.label
            )
          )
        ),
        h(
          'a',
          { href: '#top', class: 'contact__backtop' },
          h('span', {}, 'Back to top'),
          icon('arrow-up')
        )
      )
    )
  );
}
