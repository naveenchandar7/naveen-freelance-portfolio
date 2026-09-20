import { h, has } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { label } from '../store.js';

function image(img, extra = {}) {
  const masked = img.blur ? ' is-masked' : '';
  const { class: extraClass = '', ...rest } = extra;
  return h('img', { src: img.src, alt: img.alt || '', width: img.width, height: img.height, loading: 'lazy', decoding: 'async', class: `${extraClass}${masked}`.trim(), ...rest });
}

function figure(img, caption, modifier) {
  return h(
    'figure',
    { class: `ba__figure ${modifier}` },
    h('figcaption', { class: 'ba__caption' }, caption, img.blur ? h('span', { class: 'ba__masked' }, label('case.masked')) : null),
    h(
      'a',
      { class: 'ba__frame', href: img.src, target: '_blank', rel: 'noopener' },
      image(img),
      h('span', { class: 'sr-only' }, `${label('case.openFull')}: ${caption}`)
    )
  );
}

/**
 * Raw -> Cleaning -> Final, shown side by side with an optional slider view.
 * Needs both "before" and "after" images. With only one image it shows a single figure.
 */
export function renderBeforeAfter(images) {
  const before = has(images.before) ? images.before : null;
  const after = has(images.after) ? images.after : null;
  if (!before && !after) return null;

  if (!before || !after) {
    const only = before || after;
    return h('div', { class: 'ba ba--single' }, figure(only, before ? label('case.raw') : label('case.cleaned'), 'ba__figure--single'));
  }

  // ---- side by side ----
  const side = h(
    'div',
    { class: 'ba__side' },
    figure(before, label('case.raw'), 'ba__figure--before'),
    h('div', { class: 'ba__step', 'aria-hidden': 'true' }, h('span', { class: 'ba__step-label' }, label('case.cleaning')), icon('arrow-right')),
    figure(after, label('case.cleaned'), 'ba__figure--after')
  );

  // ---- slider ----
  const ratio = after.width && after.height ? `${after.width} / ${after.height}` : '16 / 9';
  const range = h('input', { class: 'ba__range', type: 'range', min: '0', max: '100', value: '50', 'aria-label': label('case.sliderLabel') });
  const frame = h(
    'div',
    { class: 'ba__compare', style: `--pos:50%; aspect-ratio:${ratio}` },
    image(after, { class: 'ba__under' }),
    image(before, { class: 'ba__over', alt: '' }),
    h('span', { class: 'ba__tag ba__tag--left' }, label('case.raw')),
    h('span', { class: 'ba__tag ba__tag--right' }, label('case.cleaned')),
    h('span', { class: 'ba__handle', 'aria-hidden': 'true' }),
    range
  );
  range.addEventListener('input', () => frame.style.setProperty('--pos', `${range.value}%`));
  const slider = h('div', { class: 'ba__slider', hidden: true }, frame);

  // ---- view switch ----
  const sideBtn = h('button', { class: 'seg__btn', type: 'button', 'aria-pressed': 'true' }, label('case.viewSideBySide'));
  const sliderBtn = h('button', { class: 'seg__btn', type: 'button', 'aria-pressed': 'false' }, label('case.viewSlider'));
  function setView(view) {
    const isSide = view === 'side';
    side.hidden = !isSide;
    slider.hidden = isSide;
    sideBtn.setAttribute('aria-pressed', String(isSide));
    sliderBtn.setAttribute('aria-pressed', String(!isSide));
  }
  sideBtn.addEventListener('click', () => setView('side'));
  sliderBtn.addEventListener('click', () => setView('slider'));

  return h(
    'div',
    { class: 'ba' },
    h('div', { class: 'seg ba__switch', role: 'group', 'aria-label': label('case.viewLabel') }, sideBtn, sliderBtn),
    side,
    slider
  );
}
