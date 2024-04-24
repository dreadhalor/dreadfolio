import { PackedItem } from '@dredge/types';

export const binPackingAsync = (
  items: PackedItem[],
  grid: number[][],
  signal: AbortSignal,
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

    signal.addEventListener('abort', () => {
      worker.terminate();
      reject(new DOMException('Calculation aborted', 'AbortError'));
    });

    worker.postMessage({ items, grid });
  });
};
