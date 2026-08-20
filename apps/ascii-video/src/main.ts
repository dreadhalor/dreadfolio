import './style.css';
import { AsciiVideoApp } from './renderer';
import { settings } from './config';

const root = document.querySelector<HTMLDivElement>('#app')!;
root.style.width = '100%';
root.style.height = '100%';
document.body.style.backgroundColor = settings.black ? 'black' : 'white';

// The ASCII layer is aria-hidden -- a screen reader would otherwise read out
// thousands of junk characters -- so describe the app once, here.
const description = document.createElement('p');
description.className = 'sr-only';
description.textContent =
  'ASCII Video: a live webcam feed rendered as coloured ASCII art, with the ' +
  'background removed by on-device person segmentation. The art updates ' +
  'continuously and is not described in detail.';
root.appendChild(description);

const app = new AsciiVideoApp(root);

// Dev-only handle so the pipeline can be inspected and toggled from the console.
if (import.meta.env.DEV) {
  Object.assign(window, { asciiVideo: app, asciiSettings: settings });
}

app.start().catch((err) => {
  console.error('[ascii-video] failed to start:', err);
  root.innerHTML =
    '<p style="color:#0f0;font:14px ui-monospace,monospace;padding:24px">' +
    'Camera unavailable. ASCII Video needs webcam access over HTTPS.</p>';
});
