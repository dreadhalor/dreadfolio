import React from 'react';
import './window.scss';
import './header.scss';
import { AppType, useApp } from '@ms/providers/app-provider';

interface HeaderProps {
  app: AppType;
  bind: () => React.DOMAttributes<Element>;
}

const Header: React.FC<HeaderProps> = ({ app: { id, icon, title }, bind }) => {
  const { closeApp, minimizeApp, focusedApp } = useApp();
  const isFocused = focusedApp === id;

  const getBackground = () => {
    if (isFocused) return 'header-gradient-focused';
    return 'header-gradient-unfocused';
  };

  return (
    <div
      {...bind()}
      className='relative h-[28px] w-full flex-row overflow-hidden rounded-t-[8px]'
      style={{ touchAction: 'none' }}
    >
      <div
        className={`${getBackground()} absolute bottom-0 left-0 right-0 top-0`}
      ></div>
      <div
        className='header-gradient-left absolute bottom-0 left-0 top-0 w-[15px]'
        style={{ opacity: isFocused ? 1 : 0.4 }}
      ></div>
      <div
        className='header-gradient-right absolute bottom-0 right-0 top-0 w-[15px]'
        style={{ opacity: isFocused ? 1 : 0.4 }}
      ></div>

      <div className='header-buttons-container absolute bottom-0 left-0 right-0 flex h-[25px] flex-row items-center px-[3px] pb-[1px]'>
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
          className='flex-1 truncate pr-[5px] text-[12px] font-[700] leading-[25px] tracking-[0.5px] text-white'
          style={{
            textShadow: 'rgb(0 0 0) 1px 1px',
            fontFamily: '"Noto Sans", sans-serif',
          }}
        >
          {title}
        </div>
        <div className='flex flex-row' style={{ opacity: isFocused ? 1 : 0.6 }}>
          <div
            className='header_button header__button--minimize'
            onClick={(e) => {
              e.preventDefault();
              minimizeApp(id);
            }}
          ></div>
          <div className='header_button header__button--maximize header__button--disable'></div>
          <div
            className='header_button header__button--close'
            onClick={(e) => {
              e.preventDefault();
              closeApp(id);
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Header;
