import { PackedItem } from '@dredge/types';

export const binPackingAsync = (
  items: PackedItem[],
  grid: number[][],
  timeout: number = 5000,
): Promise<PackedItem[] | null> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./bin-packing.worker', import.meta.url),
      {
        type: 'module',
      },
    );

    worker.onmessage = (event) => {
      const result = event.data;
      resolve(result);
      worker.terminate();
    };

    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };

    worker.postMessage({ items, grid, timeout });
  });
};
