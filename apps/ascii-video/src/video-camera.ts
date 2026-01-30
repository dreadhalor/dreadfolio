export class VideoCamera {
  private constraints = { audio: false, video: { facingMode: 'user' } };

  private video: HTMLVideoElement;
  private stream: MediaStream;
  private video_container: HTMLDivElement;

  private container_style = {
    position: 'absolute',
    visibility: 'hidden',
    height: '0px',
    width: '0px',
    overflow: 'hidden',
  };

  constructor() {
    this.start(true);
  }

  constructDivs() {
    this.video = document.createElement('video');
    this.video.playsInline = true;
    this.video_container = document.createElement('div');
    Object.assign(this.video_container.style, this.container_style);
    this.video_container.append(this.video);
    document.body.append(this.video_container);
  }
  formatVideoFeed() {
    // let constraints = this.getMaxDimensionsConstraints();
    // let scaled = this.getScaledDimensions(0.5);
    // let scaled = { width: 640, height: 480 };
    // this.getVideoTrack().applyConstraints(constraints);
    return this.video.play();
  }
  isStopped() {
    return this.stream?.getTracks()?.every((track) => track.readyState === 'ended') ?? true;
  }
  start(initialize: boolean = false) {
    navigator.mediaDevices
      .getUserMedia(this.constraints)
      .then((stream: MediaStream) => {
        if (initialize) this.constructDivs();
        this.stream = stream;
        this.video.srcObject = stream;
        this.video.onloadedmetadata = () => this.formatVideoFeed()
      })
      .catch((err) => alert(err));
  }
  stop() {
    this.stream.getTracks().forEach((track) => track.stop());
  }
  play() {
    this.start();
  }


  getVideoTrack = () => this.stream?.getVideoTracks()?.[0];
  getCapabilities = () => this.getVideoTrack()?.getCapabilities();
  getSettings = () => this.getVideoTrack()?.getSettings();
  getScaledDimensions(ratio: number) {
    let { width, height } = this.getSettings();
    return { width: Math.floor(width * ratio), height: Math.floor(height * ratio) };
  }
  getMaxDimensionsConstraints = () => {
    let capabilities = this.getCapabilities();
    return { width: capabilities?.width.max, height: capabilities?.height.max };
  };

  getVideoElement() {
    return this.video;
  }
}
