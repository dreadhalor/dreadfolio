import imageUrlBuilder from '@sanity/image-url/';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@sanity/client';

// eslint-disable-next-line react-refresh/only-export-components
export const client = createClient({
  projectId: import.meta.env.VITE_REACT_APP_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2021-11-16',
  // set useCdn to `false` to prevent stale images when content is updated
  useCdn: false,
  // for a real app never EVER put a sensitive access token in client-side code!
  token: import.meta.env.VITE_REACT_APP_SANITY_TOKEN,
  // we need to turn the warning off because this isn't a real app so we're exposing the token
  ignoreBrowserTokenWarning: true,
});

const builder = imageUrlBuilder(client);

// eslint-disable-next-line react-refresh/only-export-components
export const urlFor = (source: SanityImageSource) => builder.image(source);

export const SanityWrapper = () => {};

export interface SavePinFields {
  id: string;
  uid: string | null;
  signedIn: boolean;
  alreadySaved: boolean;
  save_index: number;
}

// eslint-disable-next-line react-refresh/only-export-components
export const toggleSavePin = ({
  id,
  uid,
  signedIn,
  alreadySaved,
  save_index,
}: SavePinFields) => {
  if (!signedIn) {
    alert('Log in to save pins!');
    return Promise.resolve(false);
  }
  if (alreadySaved) {
    return deleteSave({ id, save_index });
  } else {
    return addSave({ id, user_id: uid });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deleteSave = async ({ id, save_index }: any) => {
  return client
    .patch(id)
    .setIfMissing({ save: [] })
    .splice('save', save_index, 1, [])
    .commit()
    .then(() => {
      window.location.reload();
    });
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addSave = async ({ id, user_id }: any) => {
  return client
    .patch(id)
    .setIfMissing({ save: [] })
    .insert('after', 'save[-1]', [
      {
        _key: uuidv4(),
        userId: user_id,
        postedBy: {
          _type: 'postedBy',
          _ref: user_id,
        },
      },
    ])
    .commit()
    .then(() => {
      window.location.reload();
    });
};

// eslint-disable-next-line react-refresh/only-export-components
export const deletePin = async (id: string) => {
  return client.delete(id).then(() => {
    window.location.reload();
  });
};
