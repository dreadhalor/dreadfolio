import { useEffect, useState } from 'react';
import { MasonryLayout, Spinner } from '@shareme/components';
import { client } from '@shareme/utils/client';
import { feedQuery, searchQuery } from '@shareme/utils/data';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Search = ({ searchTerm }: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pins, setPins] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchTerm) {
      setLoading(true);
      const query = searchQuery(searchTerm.toLowerCase());
      client.fetch(query).then((data) => {
        setPins(data);
        setLoading(false);
      });
    } else {
      client.fetch(feedQuery).then((data) => {
        setPins(data);
        setLoading(false);
      });
    }
  }, [searchTerm]);

  return (
    <div>
      {loading ? (
        <Spinner message='Searching for pins...' />
      ) : (
        <MasonryLayout pins={pins} />
      )}
    </div>
  );
};

export { Search };
