import { h, has } from '../utils/dom.js';
import { label, getHomeProjects } from '../store.js';
import { replay } from '../utils/motion.js';
import { section, sectionHeader } from './SectionHeader.js';
import { renderProjectCard } from './ProjectCard.js';

export function renderProjects(data) {
  const cfg = data.projects;
  const projects = getHomeProjects();

  if (!projects.length) {
    return section('projects', sectionHeader('projects', cfg), h('p', { class: 'empty' }, label('projects.empty')));
  }

  const items = projects.map((project, i) => renderProjectCard(project, i));
  const grid = h('ul', { class: `project-grid${items.length === 1 ? ' project-grid--single' : ''}`, role: 'list' }, items);

  // Filters are built from the categories that exist in the data. Nothing is hardcoded.
  const categories = [...new Set(projects.map((p) => p.category).filter(has))];
  const status = h('p', { class: 'sr-only', 'aria-live': 'polite' });
  let filterBar = null;

  if (categories.length > 1) {
    const buttons = ['', ...categories].map((category) =>
      h(
        'button',
        { class: 'filter', type: 'button', 'aria-pressed': String(category === ''), 'data-category': category },
        category === '' ? label('projects.all') : category
      )
    );

    filterBar = h('div', { class: 'filters', role: 'group', 'aria-label': label('projects.filterLabel') }, buttons);
    filterBar.addEventListener('click', (event) => {
      const button = event.target.closest('button.filter');
      if (!button) return;
      const selected = button.dataset.category;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));

      const visible = [];
      items.forEach((item) => {
        const show = selected === '' || item.dataset.category === selected;
        item.hidden = !show;
        if (show) visible.push(item);
      });
      replay(visible);
      status.textContent = label('projects.showing', { count: visible.length });
    });
  }

  return section('projects', sectionHeader('projects', cfg), filterBar, grid, status);
}
