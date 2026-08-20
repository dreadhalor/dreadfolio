import './style.css';
import { AsciiVideoApp } from './renderer';

const root = document.querySelector<HTMLDivElement>('#app')!;
root.style.width = '100%';
root.style.height = '100%';

const app = new AsciiVideoApp(root);

// Dev-only handle so the pipeline can be inspected and toggled from the console.
if (import.meta.env.DEV) {
  (window as unknown as { asciiVideo: AsciiVideoApp }).asciiVideo = app;
}

app.start().catch((err) => {
  console.error('[ascii-video] failed to start:', err);
  root.innerHTML =
    '<p style="color:#0f0;font:14px ui-monospace,monospace;padding:24px">' +
    'Camera unavailable. ASCII Video needs webcam access over HTTPS.</p>';
});
