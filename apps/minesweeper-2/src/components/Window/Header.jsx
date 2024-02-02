import './Window.scss';
import './Header.scss';

const Header = ({ bind, icon, title, focused, closeApp, minimizeApp }) => {
  const getBackground = () => {
    if (focused) return 'header-gradient-focused';
    return 'header-gradient-unfocused';
  };

  return (
    <div
      {...bind()}
      className='relative h-[28px] w-full flex-row overflow-hidden rounded-t-[8px]'
      style={{ touchAction: 'none' }}
    >
      <div
        className={`${getBackground()} absolute left-0 top-0 right-0 bottom-0`}
      ></div>
      <div
        className='header-gradient-left absolute left-0 top-0 bottom-0 w-[15px]'
        style={{ opacity: focused ? 1 : 0.4 }}
      ></div>
      <div
        className='header-gradient-right absolute right-0 top-0 bottom-0 w-[15px]'
        style={{ opacity: focused ? 1 : 0.4 }}
      ></div>

      <div className='header-buttons-container absolute left-0 right-0 bottom-0 flex h-[25px] flex-row items-center px-[3px] pb-[1px]'>
        <img
          src={icon}
          alt={title}
          className='app__header__icon'
          style={{
            pointerEvents: 'none',
            width: '15px',
            height: '15px',
            marginLeft: '1px',
            marginRight: '3px',
          }}
        />
        <div
          className='flex-1 text-[13px] leading-[20px] tracking-[0.5px] text-white'
          style={{
            textShadow: 'rgb(0 0 0) 1px 1px',
            fontFamily: 'Tahoma, "Noto Sans", sans-serif',
            fontWeight: 500,
          }}
        >
          {title}
        </div>
        <div className='flex flex-row' style={{ opacity: focused ? 1 : 0.6 }}>
          <div
            className='header_button header__button--minimize'
            onClick={(e) => {
              e.preventDefault();
              minimizeApp();
            }}
          ></div>
          <div className='header_button header__button--maximize header__button--disable'></div>
          <div
            className='header_button header__button--close'
            onClick={(e) => {
              e.preventDefault();
              closeApp();
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Header;
