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
  let config: ModelConfig = {
    architecture: settings.architecture,
    outputStride: settings.outputStride,
    multiplier: settings.multiplier,
    quantBytes: settings.quantBytes,
  };
  return load(config);
}

export function maskPerson(bp: BodyPix, input: BodyPixInput) {
  let segment_config: PersonInferenceConfig = {
    internalResolution: settings.internalResolution,
    segmentationThreshold: settings.segmentationThreshold,
  };
  // countTensors();
  return bp
    .segmentPerson(input, segment_config)
    .then((segmentation) => toMask(segmentation));
}
function countTensors() {
  console.log(memory().numTensors);
}

// export function maskVideo(bp: BodyPix, input: BodyPixInput) {
//   let segment_config: PersonInferenceConfig = {
//     // flipHorizontal: false,
//     internalResolution: 'low',
//     segmentationThreshold: 0.5,
//   };
//   return bp.segmentPerson(input, segment_config).then((segmentation) => toMask(segmentation));
// }
