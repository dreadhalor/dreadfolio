import { binPacking } from './bin-packing';

self.onmessage = (event) => {
  const { items, grid } = event.data;
  const result = binPacking(items, grid);
  self.postMessage(result);
};
