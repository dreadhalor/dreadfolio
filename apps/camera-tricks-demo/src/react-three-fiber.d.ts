// Explicit React Three Fiber JSX namespace extension
// This ensures the IDE recognizes Three.js elements in JSX

import type { ThreeElements as R3FThreeElements } from '@react-three/fiber'

declare global {
  namespace JSX {
    interface IntrinsicElements extends R3FThreeElements {}
  }
}

// Extend react/jsx-runtime namespace
declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends R3FThreeElements {}
  }
}

// Extend react/jsx-dev-runtime namespace
declare module 'react/jsx-dev-runtime' {
  namespace JSX {
    interface IntrinsicElements extends R3FThreeElements {}
  }
}
