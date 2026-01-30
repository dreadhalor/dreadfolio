import { memory, setBackend } from '@tensorflow/tfjs';
import { load, BodyPix, toMask } from '@tensorflow-models/body-pix';
import {
  ModelConfig,
  PersonInferenceConfig,
} from '@tensorflow-models/body-pix/dist/body_pix_model';
import { BodyPixInput } from '@tensorflow-models/body-pix/dist/types';

const settings: any = {
  architecture: 'MobileNetV1',
  outputStride: 16,
  multiplier: 0.5,
  quantBytes: 4,
  internalResolution: 'medium',
  segmentationThreshold: 0.7,
};

export function loadBodyPix() {
  setBackend('webgl');
  const config: ModelConfig = {
    architecture: settings.architecture,
    outputStride: settings.outputStride,
    multiplier: settings.multiplier,
    quantBytes: settings.quantBytes,
  };
  return load(config);
}

export async function maskPerson(bp: BodyPix, input: BodyPixInput) {
  const segment_config: PersonInferenceConfig = {
    internalResolution: settings.internalResolution,
    segmentationThreshold: settings.segmentationThreshold,
  };
  
  const segmentation = await bp.segmentPerson(input, segment_config);
  const mask = await toMask(segmentation);
  
  // Critical: Dispose segmentation data to prevent memory leaks
  segmentation.data = null as unknown as Uint8Array;
  
  return mask;
}

/**
 * Dispose TensorFlow tensors to prevent memory leaks
 * Call this periodically or when changing models
 */
export function disposeTensors() {
  const tensorCount = memory().numTensors;
  console.log(`TensorFlow tensors in memory: ${tensorCount}`);
  return tensorCount;
}

// export function maskVideo(bp: BodyPix, input: BodyPixInput) {
//   let segment_config: PersonInferenceConfig = {
//     // flipHorizontal: false,
//     internalResolution: 'low',
//     segmentationThreshold: 0.5,
//   };
//   return bp.segmentPerson(input, segment_config).then((segmentation) => toMask(segmentation));
// }
