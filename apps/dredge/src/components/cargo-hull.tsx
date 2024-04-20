import CargoHullImage from '@dredge/assets/dredge-cargo-background.png';
export const CargoHull = () => {
  return (
    <div>
      <img
        className='w-full brightness-150'
        style={{
          aspectRatio: 555 / 655,
        }}
        src={CargoHullImage}
      />
    </div>
  );
};
