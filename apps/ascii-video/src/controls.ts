/**
 * On-screen control panel. Everything it touches lives in `settings`, which the
 * render loop reads fresh each frame, so changes apply immediately.
 *
 * Sizing targets touch: controls are at least 44px on their short axis, the
 * panel is anchored with viewport-relative limits so it cannot overflow a phone
 * screen, and it can be dismissed three ways (the X, tapping outside, Escape)
 * because a gear that hides itself when open leaves no way back.
 */
import {
  settings,
  type BackgroundMode,
  type ColorMode,
  type GlyphMode,
  type TimeMode,
} from './config';

const TAP = 44;

/**
 * Lucide paths, inlined rather than pulled in as a dependency for two glyphs.
 * They stroke in currentColor, so they pick up the panel's accent and can be
 * sized like anything else -- which an emoji cannot.
 */
const ICONS: Record<string, string> = {
  settings:
    '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/>' +
    '<circle cx="12" cy="12" r="3"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};

function icon(name: keyof typeof ICONS, size = 20) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = ICONS[name]!;
  return svg;
}

const ACCENT = '#9fe6b0';
const EDGE = 'rgba(120,255,170,.35)';

import { CAPTURE_KEY, captureAscii } from './capture';

export class Controls {
  private panel = document.createElement('div');
  private toggle = document.createElement('button');
  private status = document.createElement('div');
  private open = false;

  constructor(
    parent: HTMLElement,
    private handlers: { onColorMode: (mode: ColorMode) => void | Promise<void> },
  ) {
    this.toggle.replaceChildren(icon('settings'));
    this.toggle.setAttribute('aria-label', 'Open controls');
    this.toggle.style.cssText =
      `position:absolute;top:max(12px,env(safe-area-inset-top));` +
      `right:max(12px,env(safe-area-inset-right));z-index:6;` +
      `width:${TAP}px;height:${TAP}px;border:1px solid ${EDGE};border-radius:10px;` +
      `cursor:pointer;background:rgba(0,0,0,.6);color:${ACCENT};` +
      `display:grid;place-items:center;padding:0;box-sizing:border-box;` +
      `line-height:0;touch-action:manipulation;`;
    this.toggle.addEventListener('click', () => this.setOpen(true));

    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-label', 'ASCII Video controls');
    this.panel.style.cssText =
      `position:absolute;top:max(12px,env(safe-area-inset-top));` +
      `right:max(12px,env(safe-area-inset-right));z-index:6;` +
      `width:min(260px,calc(100vw - 24px));max-height:calc(100dvh - 24px);overflow:auto;` +
      `font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:${ACCENT};` +
      `background:rgba(0,0,0,.8);border:1px solid ${EDGE};border-radius:10px;` +
      `padding:8px 12px 12px;backdrop-filter:blur(3px);` +
      `-webkit-overflow-scrolling:touch;touch-action:manipulation;`;

    this.status.style.cssText = 'margin-top:8px;opacity:.75;min-height:1.5em;font-size:12px;';

    this.panel.append(
      this.header(),
      this.range('resolution', 40, 300, 10, settings.resolution, (v) => {
        settings.resolution = v;
      }),
      this.select<GlyphMode>('glyphs', ['ramp', 'edge', 'braille'], settings.glyphMode, (v) => {
        settings.glyphMode = v;
      }),
      this.select<BackgroundMode>(
        'background',
        ['video', 'rain', 'plain'],
        settings.backgroundMode,
        (v) => {
          settings.backgroundMode = v;
        },
      ),
      this.select<ColorMode>('colour', ['image', 'region'], settings.colorMode, (v) => {
        void this.handlers.onColorMode(v);
      }),
      this.select<TimeMode>('time', ['off', 'slitscan', 'trails'], settings.timeMode, (v) => {
        settings.timeMode = v;
      }),
      this.check('mask', settings.mask, (v) => {
        settings.mask = v;
      }),
      this.check('CRT', settings.crt, (v) => {
        settings.crt = v;
      }),
      this.check('stats', settings.showDiagnostics, (v) => {
        settings.showDiagnostics = v;
      }),
      // Only present with ?capture=<key>. Without it the panel is exactly as it was.
      ...(CAPTURE_KEY ? [this.button('capture 2.5s', () => void captureAscii((m) => this.say(m)))] : []),
      this.status,
    );

    parent.append(this.toggle, this.panel);
    this.setOpen(false);

    window.addEventListener('keydown', (e) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return;
      if (e.key === 'Escape') this.setOpen(false);
      else if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) this.setOpen(!this.open);
    });

    // Tapping the artwork dismisses the panel, which is the gesture people
    // reach for on a phone before they look for an X.
    parent.addEventListener('pointerdown', (e) => {
      if (!this.open) return;
      const target = e.target as Node;
      if (!this.panel.contains(target) && target !== this.toggle) this.setOpen(false);
    });
  }

  setOpen(open: boolean) {
    this.open = open;
    this.panel.style.display = open ? 'block' : 'none';
    this.toggle.style.display = open ? 'none' : 'block';
  }

  say(message: string) {
    this.status.textContent = message;
    window.setTimeout(() => {
      if (this.status.textContent === message) this.status.textContent = '';
    }, 2600);
  }

  private header() {
    const bar = document.createElement('div');
    bar.style.cssText =
      'display:flex;align-items:center;justify-content:space-between;' +
      `margin:-4px -4px 4px 0;border-bottom:1px solid ${EDGE};padding-bottom:4px;`;
    const title = document.createElement('span');
    title.textContent = 'controls';
    title.style.opacity = '.7';
    const close = document.createElement('button');
    close.replaceChildren(icon('x', 18));
    close.setAttribute('aria-label', 'Close controls');
    close.style.cssText =
      `width:${TAP}px;height:${TAP}px;background:none;border:0;color:${ACCENT};` +
      `display:grid;place-items:center;padding:0;box-sizing:border-box;` +
      `line-height:0;cursor:pointer;touch-action:manipulation;`;
    close.addEventListener('click', () => this.setOpen(false));
    bar.append(title, close);
    return bar;
  }

  private button(label: string, onClick: () => void) {
    const el = document.createElement('button');
    el.textContent = label;
    el.style.cssText =
      `width:100%;min-height:${TAP}px;margin-top:4px;background:#0b1a12;color:${ACCENT};` +
      `border:1px solid ${EDGE};border-radius:6px;font:inherit;cursor:pointer;` +
      `touch-action:manipulation;`;
    el.addEventListener('click', onClick);
    return el;
  }

  private row(label: string, control: HTMLElement) {
    const wrap = document.createElement('label');
    wrap.style.cssText =
      `display:flex;align-items:center;justify-content:space-between;gap:10px;` +
      `min-height:${TAP}px;cursor:pointer;`;
    const text = document.createElement('span');
    text.textContent = label;
    wrap.append(text, control);
    return wrap;
  }

  private select<T extends string>(
    label: string,
    options: T[],
    initial: T,
    onChange: (value: T) => void,
  ) {
    const el = document.createElement('select');
    el.style.cssText =
      `background:#0b1a12;color:${ACCENT};border:1px solid ${EDGE};border-radius:6px;` +
      `font:inherit;padding:6px 8px;min-height:${TAP - 10}px;touch-action:manipulation;`;
    for (const option of options) {
      const item = document.createElement('option');
      item.value = option;
      item.textContent = option;
      el.appendChild(item);
    }
    el.value = initial;
    el.addEventListener('change', () => onChange(el.value as T));
    return this.row(label, el);
  }

  private range(
    label: string,
    min: number,
    max: number,
    step: number,
    initial: number,
    onChange: (value: number) => void,
  ) {
    const el = document.createElement('input');
    el.type = 'range';
    el.min = String(min);
    el.max = String(max);
    el.step = String(step);
    el.value = String(initial);
    el.style.cssText = `width:110px;accent-color:#5fdc8f;touch-action:manipulation;`;
    const readout = document.createElement('span');
    readout.textContent = String(initial);
    readout.style.cssText = 'min-width:2.4em;text-align:right;opacity:.8;';
    const apply = () => {
      const value = Number(el.value);
      readout.textContent = String(value);
      onChange(value);
    };
    el.addEventListener('input', apply);
    const group = document.createElement('span');
    group.style.cssText = 'display:flex;align-items:center;gap:6px;';
    group.append(readout, el);
    return this.row(label, group);
  }

  private check(label: string, initial: boolean, onChange: (value: boolean) => void) {
    const el = document.createElement('input');
    el.type = 'checkbox';
    el.checked = initial;
    el.style.cssText = 'width:24px;height:24px;accent-color:#5fdc8f;touch-action:manipulation;';
    el.addEventListener('change', () => onChange(el.checked));
    return this.row(label, el);
  }
}
