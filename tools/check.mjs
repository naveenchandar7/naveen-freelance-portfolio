#!/usr/bin/env node
// Content checker. Run it before you push:  node tools/check.mjs
// No dependencies. It reads data/portfolio.json and reports problems.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const error = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);
const filled = (v) => (Array.isArray(v) ? v.length > 0 : typeof v === 'string' ? v.trim() !== '' : v != null);

let data;
try {
  data = JSON.parse(readFileSync(join(root, 'data/portfolio.json'), 'utf8'));
} catch (e) {
  console.error(`✖ data/portfolio.json is not valid JSON: ${e.message}`);
  console.error('  Common causes: a missing comma, an extra trailing comma, or a missing quote.');
  process.exit(1);
}

// ---- site ----
for (const key of ['name', 'title', 'description', 'url']) if (!filled(data.site?.[key])) error(`site.${key} is empty`);
if (/your-domain/i.test(data.site?.url || '')) warn('site.url is still the placeholder (your-domain.vercel.app). Update it, robots.txt and sitemap.xml after deploying.');
if (data.site?.ogImage && !existsSync(join(root, data.site.ogImage))) error(`site.ogImage file not found: ${data.site.ogImage}`);
if ((data.site?.description || '').length > 170) warn('site.description is longer than about 160 characters; search results may cut it.');

// ---- section order ----
const known = ['hero', 'services', 'projects', 'process', 'skills', 'testimonials', 'experience', 'about', 'contact'];
for (const name of data.sectionOrder || []) if (!known.includes(name)) error(`sectionOrder contains unknown section "${name}"`);

// ---- navigation targets ----
for (const item of [...(data.navigation?.items || []), data.navigation?.cta].filter(Boolean)) {
  if (!/^#[\w-]+$/.test(item.target || '')) warn(`navigation target "${item.target}" should look like "#services"`);
}

// ---- services ----
const ids = new Set();
for (const s of data.services?.items || []) {
  if (!filled(s.id) || !filled(s.title)) error('A service is missing id or title');
  if (ids.has(s.id)) error(`Duplicate service id "${s.id}"`);
  ids.add(s.id);
}

// ---- projects ----
const projectIds = new Set();
const imageFields = ['thumbnail', 'before', 'after', 'summary'];
const checkImage = (img, where) => {
  if (!img || !filled(img.src)) return;
  if (!existsSync(join(root, img.src))) error(`${where}: image file not found: ${img.src}`);
  if (!filled(img.alt)) warn(`${where}: image has no alt text`);
  if (/placeholder/i.test(img.src)) warn(`${where}: still using a placeholder image (${img.src})`);
};
for (const p of data.projects?.items || []) {
  const where = `project "${p.id || p.title || '?'}"`;
  for (const key of ['id', 'title', 'category', 'shortDescription']) if (!filled(p[key])) error(`${where}: "${key}" is empty`);
  if (!filled(p.projectType)) warn(`${where}: projectType is empty. Visitors will not see whether it is a demo or a client project.`);
  if (p.id && !/^[a-z0-9-]+$/.test(p.id)) error(`${where}: id should only use lowercase letters, numbers and hyphens`);
  if (projectIds.has(p.id)) error(`Duplicate project id "${p.id}"`);
  projectIds.add(p.id);
  if (!['completed', 'in-progress', 'draft', 'hidden', undefined].includes(p.status)) warn(`${where}: unknown status "${p.status}"`);
  for (const key of imageFields) checkImage(p.images?.[key], `${where} images.${key}`);
  (p.gallery || []).forEach((img, i) => checkImage(img, `${where} gallery[${i}]`));
  for (const key of ['demoVideoUrl', 'githubUrl', 'liveDemoUrl']) {
    if (filled(p[key]) && !/^https?:\/\//.test(p[key])) error(`${where}: ${key} must start with http:// or https://`);
  }
  if ((p.metrics || []).length > 3) warn(`${where}: only the first 3 metrics show on the card (all show on the case study)`);
}

// ---- contact and social ----
const email = data.contact?.email;
if (!filled(email)) warn('contact.email is empty; the email button and row are hidden');
else if (/your-email|example\.com/i.test(email)) warn(`contact.email is still a placeholder (${email})`);
for (const s of data.social || []) {
  if (!filled(s.url)) continue;
  if (/YOUR-/i.test(s.url)) warn(`social "${s.id}": placeholder URL (${s.url})`);
  if (!/^https?:\/\//.test(s.url)) error(`social "${s.id}": url must start with http:// or https://`);
}

// ---- labels used in code exist in portfolio.json ----
const labels = data.labels || {};
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
for (const file of walk(join(root, 'src')).filter((f) => f.endsWith('.js'))) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/label\('([^']+)'/g)) {
    if (!(m[1] in labels)) error(`labels."${m[1]}" is used in ${file.replace(root + '/', '')} but missing from portfolio.json`);
  }
}

// ---- report ----
for (const w of warnings) console.log(`⚠  ${w}`);
for (const e of errors) console.log(`✖  ${e}`);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
if (!errors.length && !warnings.length) console.log('✔ Content looks good.');
process.exit(errors.length ? 1 : 0);
