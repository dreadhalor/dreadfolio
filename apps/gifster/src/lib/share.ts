import { IGif } from '@giphy/js-types';
import { toast } from 'sonner';
import { gifFileUrl } from './giphy';

/* Every share/export action funnels through here so copy targets and toast
 * behavior stay consistent between the grid cards and the detail modal. */

export const copyText = (text: string, label: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label} copied to clipboard`))
    .catch(() => toast.error("Couldn't access the clipboard"));
};

export const copyGifLink = (gif: IGif) =>
  copyText(gifFileUrl(gif) || gif.url, 'GIF link');

export const copyEmbedCode = (gif: IGif) => {
  const width = Number(gif.images.original?.width) || 480;
  const height = Number(gif.images.original?.height) || 270;
  copyText(
    `<iframe src="${gif.embed_url}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`,
    'Embed code',
  );
};

export const downloadGif = async (gif: IGif) => {
  const url = gifFileUrl(gif);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(String(response.status));
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `${gif.slug || gif.id}.gif`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    toast.success('Downloading GIF');
  } catch {
    window.open(url, '_blank');
  }
};
