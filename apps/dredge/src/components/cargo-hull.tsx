import { CargoBackgroundImage } from '@dredge/assets/ui';

export const CargoHull = () => {
  return (
    <div>
      <img
        className='w-full brightness-150'
        style={{
          aspectRatio: 555 / 655,
        }}
        src={CargoBackgroundImage}
      />
    </div>
  );
};
