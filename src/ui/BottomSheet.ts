/**
 * V2 共用 Bottom Sheet primitive。
 * 使用 native <dialog> 提供 modal、Esc 與 focus trap；本檔補上 backdrop、
 * swipe down、body scroll lock、單一 sheet 與 focus return。
 */

import { el } from './dom';

const SVG_NS = 'http://www.w3.org/2000/svg';

function closeIcon(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  for (const [name, value] of Object.entries({
    viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    'aria-hidden': 'true', focusable: 'false',
  })) svg.setAttribute(name, value);
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M6 6l12 12M18 6L6 18');
  svg.append(path);
  return svg;
}

export interface BottomSheetOptions {
  title: string;
  content: HTMLElement | HTMLElement[];
  trigger: HTMLElement;
  className?: string;
  returnFocusSelector?: string;
}

export interface BottomSheetHandle {
  dialog: HTMLDialogElement;
  close: () => void;
}

let activeSheet: HTMLDialogElement | null = null;
let sheetId = 0;

export function closeActiveSheet(): void {
  if (activeSheet?.open) activeSheet.close();
}

export function openBottomSheet(options: BottomSheetOptions): BottomSheetHandle {
  closeActiveSheet();

  const id = `sheet-title-${++sheetId}`;
  const body = el('div', { class: 'sheet__body' },
    ...(Array.isArray(options.content) ? options.content : [options.content]));
  const autofocus = body.querySelector<HTMLElement>('[data-autofocus="true"]');
  const closeButton = el('button', {
    class: 'sheet__close', type: 'button', 'aria-label': '關閉',
  }, closeIcon());
  const surface = el('div', {
    class: 'sheet__surface', tabindex: '-1', autofocus: autofocus ? undefined : true,
  },
    el('div', { class: 'sheet__grabber', 'aria-hidden': 'true' }),
    el('header', { class: 'sheet__head' },
      el('h2', { class: 'sheet__title', id }, options.title),
      closeButton,
    ),
    body,
  );
  const dialog = el('dialog', {
    class: `sheet-dialog${options.className ? ` ${options.className}` : ''}`,
    'aria-labelledby': id,
  }, surface);

  const close = () => {
    if (dialog.open) dialog.close();
  };
  closeButton.addEventListener('click', close);
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    close();
  }, { capture: true });

  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside || event.clientX === 0 && event.clientY === 0) close();
  });

  let touchX = 0;
  let touchY = 0;
  let canSwipeClose = false;
  surface.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchX = touch.clientX;
    touchY = touch.clientY;
    canSwipeClose = body.scrollTop <= 0;
  }, { passive: true });
  surface.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    if (!touch || !canSwipeClose) return;
    const dx = touch.clientX - touchX;
    const dy = touch.clientY - touchY;
    if (dy > 80 && Math.abs(dx) < 80) close();
  }, { passive: true });

  dialog.addEventListener('close', () => {
    if (activeSheet === dialog) activeSheet = null;
    dialog.remove();
    if (activeSheet) return;
    document.body.classList.remove('has-open-sheet');
    const replacement = options.returnFocusSelector
      ? document.querySelector<HTMLElement>(options.returnFocusSelector)
      : null;
    const focusTarget = options.trigger.isConnected ? options.trigger : replacement;
    focusTarget?.focus({ preventScroll: true });
  }, { once: true });

  document.body.append(dialog);
  activeSheet = dialog;
  document.body.classList.add('has-open-sheet');
  dialog.showModal();
  queueMicrotask(() => {
    (autofocus ?? surface).focus({ preventScroll: true });
  });

  return { dialog, close };
}
