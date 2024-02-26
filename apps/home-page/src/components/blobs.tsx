import { ReactP5Wrapper } from '@p5-wrapper/react';
import { FlowField } from '../../../sketches/src/sketches/flow-field/flow-field';

export function Blobs() {
  return (
    <div className='absolute inset-0'>
      <ReactP5Wrapper sketch={FlowField} />;
    </div>
  );
}
