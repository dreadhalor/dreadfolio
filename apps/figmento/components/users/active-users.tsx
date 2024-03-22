import React from 'react';
import { Avatar } from './avatar';
import styles from './active-users.module.css';
import { useOthers, useSelf } from '@figmento/liveblocks.config';
import { generateRandomName } from '@figmento/lib/utils';

export const ActiveUsers = () => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;

  return (
    <main className='flex select-none place-content-center place-items-center'>
      <div className='flex pl-3'>
        {currentUser && (
          <Avatar name='You' className='border-primary-green border-[3px]' />
        )}

        {users.slice(0, 3).map(({ connectionId, info }) => {
          return (
            <Avatar
              key={connectionId}
              name={generateRandomName()}
              className='-ml-3 border-[3px] border-white'
            />
          );
        })}

        {hasMoreUsers && <div className={styles.more}>+{users.length - 3}</div>}
      </div>
    </main>
  );
};
