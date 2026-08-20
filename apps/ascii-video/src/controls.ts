/**
 * Small on-screen control panel. Everything it touches lives in `settings`,
 * which the render loop reads fresh each frame, so changes apply immediately
 * with no restart. Collapsed by default and toggled with the button or `c`.
 */
import { settings, type BackgroundMode, type ColorMode, type GlyphMode } from './config';

export type ControlHandlers = {
  onColorMode: (mode: ColorMode) => void | Promise<void>;
  onCopyText: () => void;
  onCopyAnsi: () => void;
};

const PANEL_STYLE =
  'position:absolute;top:12px;right:12px;z-index:5;min-width:190px;' +
  'font:12px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;color:#9fe6b0;' +
  'background:rgba(0,0,0,.72);border:1px solid rgba(120,255,170,.35);' +
  'border-radius:6px;padding:10px 12px;backdrop-filter:blur(2px);';

export class Controls {
  private panel = document.createElement('div');
  private toggle = document.createElement('button');
  private status = document.createElement('div');
  private open = false;

  constructor(parent: HTMLElement, private handlers: ControlHandlers) {
    this.toggle.textContent = '⚙';
    this.toggle.title = 'Controls (c)';
    this.toggle.style.cssText =
      'position:absolute;top:12px;right:12px;z-index:6;width:30px;height:30px;' +
      'border:1px solid rgba(120,255,170,.35);border-radius:6px;cursor:pointer;' +
      'background:rgba(0,0,0,.6);color:#9fe6b0;font-size:15px;line-height:1;';
    this.toggle.addEventListener('click', () => this.setOpen(!this.open));

    this.panel.style.cssText = PANEL_STYLE;
    this.panel.append(
      this.select<GlyphMode>('glyphs', ['ramp', 'braille'], settings.glyphMode, (v) => {
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
      this.check('mask', settings.mask, (v) => {
        settings.mask = v;
      }),
      this.check('CRT', settings.crt, (v) => {
        settings.crt = v;
      }),
      this.check('stats', settings.showDiagnostics, (v) => {
        settings.showDiagnostics = v;
      }),
      this.button('copy text', () => this.handlers.onCopyText()),
      this.button('copy ANSI', () => this.handlers.onCopyAnsi()),
      this.status,
    );
    this.status.style.cssText = 'margin-top:6px;opacity:.75;min-height:1.6em;';

    parent.append(this.toggle, this.panel);
    this.setOpen(false);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        if (target && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return;
        this.setOpen(!this.open);
      }
    });
  }

  setOpen(open: boolean) {
    this.open = open;
    this.panel.style.display = open ? 'block' : 'none';
    this.toggle.style.display = open ? 'none' : 'block';
  }

  /** Transient feedback line, e.g. after a copy. */
  say(message: string) {
    this.status.textContent = message;
    window.setTimeout(() => {
      if (this.status.textContent === message) this.status.textContent = '';
    }, 2200);
  }

  private row(label: string, control: HTMLElement) {
    const wrap = document.createElement('label');
    wrap.style.cssText =
      'display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;';
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
      'background:#0b1a12;color:#9fe6b0;border:1px solid rgba(120,255,170,.3);' +
      'border-radius:4px;font:inherit;padding:1px 4px;';
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

  private check(label: string, initial: boolean, onChange: (value: boolean) => void) {
    const el = document.createElement('input');
    el.type = 'checkbox';
    el.checked = initial;
    el.style.accentColor = '#5fdc8f';
    el.addEventListener('change', () => onChange(el.checked));
    return this.row(label, el);
  }

  private button(label: string, onClick: () => void) {
    const el = document.createElement('button');
    el.textContent = label;
    el.style.cssText =
      'width:100%;margin-top:6px;background:#0b1a12;color:#9fe6b0;cursor:pointer;' +
      'border:1px solid rgba(120,255,170,.3);border-radius:4px;font:inherit;padding:3px 0;';
    el.addEventListener('click', onClick);
    return el;
  }
}
