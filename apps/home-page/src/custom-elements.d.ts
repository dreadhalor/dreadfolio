// so that TypeScript doesn't complain about the <spline-viewer> tag
declare namespace JSX {
  interface IntrinsicElements {
    'spline-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      class?: string;
      url?: string;
      'events-target'?: string;
      'loading-anim-type'?: string;
    };
  }
}
