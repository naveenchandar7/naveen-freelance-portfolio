// Holds the loaded content so every component reads from one place.

let data = null;

export function setData(next) {
  data = next;
}

export function getData() {
  return data;
}

/** UI text lives in portfolio.json under "labels". Missing keys show the key itself so gaps are easy to spot. */
export function label(key, values = {}) {
  const raw = data && data.labels && data.labels[key];
  const text = typeof raw === 'string' ? raw : key;
  return text.replace(/\{(\w+)\}/g, (_, name) => (name in values ? values[name] : `{${name}}`));
}

const UNPUBLISHED = ['draft', 'hidden'];

/** All published projects, in the order they appear in portfolio.json. */
export function getProjects() {
  const items = (data && data.projects && data.projects.items) || [];
  return items.filter((p) => p && p.id && !UNPUBLISHED.includes(p.status));
}

/** Projects shown in the home page grid. */
export function getHomeProjects() {
  const projects = getProjects();
  return data.projects.showOnlyFeatured ? projects.filter((p) => p.featured) : projects;
}

export function getProject(id) {
  return getProjects().find((p) => p.id === id) || null;
}
