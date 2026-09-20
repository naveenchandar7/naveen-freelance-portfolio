import { h, has, externalAttrs } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { section } from './SectionHeader.js';

export function mailtoUrl(contact) {
  const subject = has(contact.emailSubject) ? `?subject=${encodeURIComponent(contact.emailSubject)}` : '';
  return `mailto:${contact.email}${subject}`;
}

export function renderContact(data) {
  const cfg = data.contact;
  const hasEmail = has(cfg.email);
  const upwork = (data.social || []).find((item) => item.id === 'upwork' && has(item.url));
  const github = (data.social || []).find((item) => item.id === 'github' && has(item.url));
  const fiverr = (data.social || []).find((item) => item.id === 'fiverr' && has(item.url));

  if (!hasEmail && !upwork && !github && !fiverr) return null;

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
          upwork
            ? h(
                'a',
                { class: 'contact__closing-btn contact__closing-btn--ghost', href: upwork.url, ...externalAttrs(upwork.url) },
                h('span', {}, 'Upwork'),
                icon('external')
              )
            : null,
          github
            ? h(
                'a',
                { class: 'contact__closing-btn contact__closing-btn--ghost', href: github.url, ...externalAttrs(github.url) },
                h('span', {}, 'GitHub'),
                icon('external')
              )
            : null,
          fiverr
            ? h(
                'a',
                { class: 'contact__closing-btn contact__closing-btn--ghost', href: fiverr.url, ...externalAttrs(fiverr.url) },
                h('span', {}, 'Fiverr'),
                icon('external')
              )
            : null
        )
      ),
      h(
        'div',
        { class: 'contact__closing-bar' },
        h('span', {}, `© ${new Date().getFullYear()} Naveen`),
        h('span', { class: 'contact__closing-spacer', 'aria-hidden': 'true' }),
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
