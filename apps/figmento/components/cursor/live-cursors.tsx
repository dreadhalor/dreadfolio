import { useOthers } from '@figmento/liveblocks.config';
import React from 'react';
import { Cursor } from './cursor';
import { COLORS } from '@figmento/constants';

const LiveCursors = () => {
  const others = useOthers();

  return others.map(({ connectionId, presence }) => {
    return (
      <Cursor
        key={connectionId}
        color={COLORS[Number(connectionId) % COLORS.length]}
        presence={presence}
      />
    );
  });
};

export { LiveCursors };
