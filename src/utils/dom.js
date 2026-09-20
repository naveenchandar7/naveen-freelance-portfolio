// Tiny helpers for building DOM without innerHTML (content from JSON is always inserted as text).

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'html') el.innerHTML = value; // trusted icon markup only
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else el.setAttribute(key, value === true ? '' : String(value));
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

/** True when a value is worth rendering (non-empty string, non-empty array, real object). */
export function has(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim() !== '';
  if (value && typeof value === 'object') return typeof value.src === 'string' ? value.src.trim() !== '' : Object.keys(value).length > 0;
  return value !== null && value !== undefined;
}

export function isExternal(url) {
  return /^https?:\/\//i.test(url || '');
}

export function slugify(text) {
  return String(text).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Link that opens safely in a new tab when it points outside the site. */
export function externalAttrs(url) {
  return isExternal(url) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}
