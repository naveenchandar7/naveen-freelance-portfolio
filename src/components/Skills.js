import { h, has } from '../utils/dom.js';
import { section, sectionHeader } from './SectionHeader.js';

/** Groups skills by their "group" field, in the order groups first appear. Skills without a group go under one unnamed list. */
export function renderSkills(data) {
  const cfg = data.skills;
  const items = cfg.items || [];
  if (!items.length) return null;

  const groups = new Map();
  for (const skill of items) {
    const key = skill.group || '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(skill);
  }

  const blocks = [...groups.entries()].map(([name, skills], i) =>
    h(
      'div',
      { class: 'skill-group', 'data-reveal': '', style: `--i:${i}` },
      has(name) ? h('h3', { class: 'skill-group__title' }, name) : null,
      h(
        'ul',
        { class: 'tags', role: 'list' },
        skills.map((skill) =>
          h(
            'li',
            { class: 'tag' },
            skill.name,
            skill.status === 'learning' ? h('span', { class: 'tag__note' }, 'learning') : null
          )
        )
      )
    )
  );

  return section('skills', sectionHeader('skills', cfg), h('div', { class: 'skill-groups' }, blocks));
}
