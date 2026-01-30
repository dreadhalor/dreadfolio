import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { feedQuery, searchQuery } from '@shareme/utils/data';

import { client } from '@shareme/utils/client';
import { Spinner, MasonryLayout } from '@shareme/components';

const Feed = () => {
  const [loading, setLoading] = useState(false);
  const { categoryId } = useParams();
  const [pins, setPins] = useState(null);

  useEffect(() => {
    setLoading(true);
    if (categoryId) {
      const query = searchQuery(categoryId);
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
  }, [categoryId]);

  if (loading)
    return <Spinner message='We are adding new ideas to your feed!' />;
  return <div>{pins && <MasonryLayout pins={pins} />}</div>;
};

export { Feed };
