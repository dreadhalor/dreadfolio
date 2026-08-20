/**
 * Webcam access. The video element is no longer a hidden scratch source: it is
 * the actual on-screen underlay, so the browser composites the live feed on the
 * GPU instead of us round-tripping every frame through a full-window canvas.
 */

export class VideoCamera {
  private stream: MediaStream | null = null;
  readonly video: HTMLVideoElement;

  /** Resolves once the element has real dimensions and is playing. */
  readonly ready: Promise<HTMLVideoElement>;
  private markReady!: (video: HTMLVideoElement) => void;
  private failReady!: (reason: unknown) => void;

  constructor() {
    this.video = document.createElement('video');
    this.video.playsInline = true;
    this.video.muted = true;
    this.video.autoplay = true;

    this.ready = new Promise((resolve, reject) => {
      this.markReady = resolve;
      this.failReady = reject;
    });

    this.start();
  }

  async start() {
    try {
      // A 16:9 hint keeps the sensor crop close to the display aspect, so the
      // cover-crop throws away as little of the frame as possible.
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      this.video.srcObject = this.stream;
      await this.video.play();
      if (this.video.videoWidth) this.markReady(this.video);
      else
        this.video.onloadedmetadata = () => this.markReady(this.video);
    } catch (err) {
      console.error('[camera] getUserMedia failed:', err);
      this.failReady(err);
    }
  }

  isStopped() {
    const tracks = this.stream?.getTracks();
    return !tracks?.length || tracks.every((t) => t.readyState === 'ended');
  }

  stop() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  getSettings() {
    return this.stream?.getVideoTracks()?.[0]?.getSettings();
  }
}
