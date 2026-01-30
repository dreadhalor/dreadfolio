import { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { GifsResult } from '@giphy/js-fetch-api';
import { IGif } from '@giphy/js-types';
import { GifPreview } from './gif-preview';
import { useAchievements } from 'dread-ui';

type Props = {
  term?: string;
  apiKey: string;
};

// Define breakpoint columns for Masonry layout
const breakpointColumnsObj = {
  default: 4,
  1300: 3,
  900: 2,
  500: 1,
};

const GifGrid = ({ term, apiKey }: Props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const urlBase = 'https://api.giphy.com/v1/gifs';
  const searchUrl = `${urlBase}/search?api_key=${apiKey}&q=${term}`;
  const trendingUrl = `${urlBase}/trending?api_key=${apiKey}`;

  const [data, setData] = useState<GifsResult>({} as GifsResult);
  const [gifData, setGifData] = useState<IGif[]>([]);

  const { unlockAchievementById } = useAchievements();

  useEffect(() => {
    setLoading(() => true);
    setError(null);
    const url = term ? searchUrl : trendingUrl;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (json.meta.status !== 200) {
          setError(json.meta.msg);
          setData({ data: [] as IGif[] } as GifsResult);
        } else {
          setData(json as GifsResult);
        }
      })
      .catch((err) => {
        setError(`Failed to fetch GIFs: ${err.message || 'Network error'}`);
        setData({ data: [] as IGif[] } as GifsResult);
      })
      .finally(() => setLoading(false));
  }, [term, searchUrl, trendingUrl])

  useEffect(() => {
    if (data.data) {
      setGifData(data.data);
    }
  }, [data]);

  useEffect(() => {
    if (term && !gifData.length && !loading)
      unlockAchievementById('no_results', 'gifster');
  }, [term, gifData, loading, unlockAchievementById]);

  return (
    <>
      {loading && <div className='text-center p-8'>Loading...</div>}
      {error && (
        <div className='text-center p-8 text-destructive'>
          <p className='font-semibold'>Error</p>
          <p className='text-sm'>{error}</p>
        </div>
      )}
      {!loading && !error &&
        (gifData.length > 0 ? (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className='flex'
            columnClassName='mx-0.5'
          >
            {gifData.map((gif) => (
              <GifPreview key={gif.id} gif={gif} />
            ))}
          </Masonry>
        ) : (
          <div className='text-center p-8'>No results found!</div>
        ))}
    </>
  );
};

export { GifGrid };
