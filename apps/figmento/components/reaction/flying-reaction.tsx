import { Reaction } from '@figmento/types/type';
import styles from './flying-reaction.module.css';

type Props = {
  reaction: Reaction;
};

export function FlyingReaction({ reaction }: Props) {
  const {
    origin: { x, y },
    timestamp,
    value,
  } = reaction;
  return (
    <div
      className={`pointer-events-none absolute select-none ${
        styles.disappear
      } text-${(timestamp % 3) + 2}xl ${styles['goUp' + (timestamp % 3)]}`}
      style={{ left: x, top: y }}
    >
      <div className={styles['leftRight' + (timestamp % 3)]}>
        <div className='-translate-x-1/2 -translate-y-1/2 transform'>
          {value}
        </div>
      </div>
    </div>
  );
}
