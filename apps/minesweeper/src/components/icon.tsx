import React, { useEffect, useRef, useState } from 'react';
import { useAchievements } from 'dread-ui';

interface IconProps {
  src: string;
  name: string;
  coords: [number, number];
  selection: [[number, number] | null, [number, number] | null];
  onDoubleClick: () => void;
}

const Icon: React.FC<IconProps> = ({
  src,
  name,
  coords,
  selection,
  onDoubleClick,
}) => {
  const [selected, setSelected] = useState<boolean>(false);
  const icon_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener('pointerdown', mousedown);
    return () => {
      document.removeEventListener('pointerdown', mousedown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { unlockAchievementById } = useAchievements();

  useEffect(() => {
    if (selection[0] && selection[1] && icon_ref.current) {
      const [[x, y], [w, h]] = selection;
      const icon_rect = icon_ref.current.getBoundingClientRect();
      const selection_rect = {
        top: y,
        left: x,
        right: x + w,
        bottom: y + h,
      };
      if (
        selection_rect.top <= icon_rect.bottom &&
        selection_rect.bottom >= icon_rect.top &&
        selection_rect.left <= icon_rect.right &&
        selection_rect.right >= icon_rect.left
      ) {
        setSelected(true);
        unlockAchievementById('marquee_selection', 'minesweeper');
      } else setSelected(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  const mousedown = (e: PointerEvent) => {
    e.preventDefault();
    const isClickedInside = e.target === icon_ref.current;
    setSelected(isClickedInside);
  };

  return (
    <div
      className='absolute flex flex-col gap-[5px]'
      style={{ left: `${coords[0]}px`, top: `${coords[1]}px` }}
      ref={icon_ref}
      onClick={() => unlockAchievementById('click_icon', 'minesweeper')}
      onDoubleClick={onDoubleClick}
    >
      <div
        className='pointer-events-none m-auto h-[30px] w-[30px]'
        style={{ filter: selected ? 'drop-shadow(0 0 blue)' : '' }}
      >
        <img
          src={src}
          alt='minesweeper_icon'
          style={{ opacity: selected ? 0.5 : 1 }}
        />
      </div>
      <div
        className='pointer-events-none text-[10px] text-white'
        style={{
          fontFamily: 'Tahoma, "Noto Sans", sans-serif',
          textShadow: '0 1px 1px black',
          padding: '0 3px 2px',
          backgroundColor: selected ? '#0b61ff' : 'transparent',
        }}
      >
        {name}
      </div>
    </div>
  );
};

export default Icon;
