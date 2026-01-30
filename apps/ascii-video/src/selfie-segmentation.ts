// import { VERSION } from '@mediapipe/selfie_segmentation';
import {
  BodySegmenter,
  SupportedModels,
  createSegmenter,
  toBinaryMask,
} from '@tensorflow-models/body-segmentation';

const modelName = SupportedModels.MediaPipeSelfieSegmentation; // literally just a string

export const loadSSModel = () => {
  // return createSegmenter(modelName, {
  //   runtime: 'mediapipe',
  //   modelType: 'general',
  //   solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@${VERSION}`,
  // });
  // mediapipe is faster but we have to go with tfjs runtime because mediapipe doesn't work in prod
  // & it absolutely kills me that we have to use tfjs because it's slower & mediapipe DOES work in dev
  return createSegmenter(modelName, {
    runtime: 'tfjs',
    modelType: 'general',
  });
};

export async function maskPersonSS(
  model: BodySegmenter,
  imageData: HTMLCanvasElement | HTMLVideoElement
) {
  return model
    .segmentPeople(imageData, {
      flipHorizontal: false,
      internalResolution: 'low',
      segmentationThreshold: 0.5,
    })
    .then((segmentation) => toBinaryMask(segmentation));
}
