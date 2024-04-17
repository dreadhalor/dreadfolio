import React, { createContext, useContext, useState } from 'react';

type HomepageContextValue = {
  activeSection: string;
  setActiveSection: React.Dispatch<React.SetStateAction<string>>;
  offset: number;
  setOffset: React.Dispatch<React.SetStateAction<number>>;
  parallaxBaseHeight: number;
  setParallaxBaseHeight: React.Dispatch<React.SetStateAction<number>>;
};

const HomepageContext = createContext<HomepageContextValue>(
  {} as HomepageContextValue,
);

// eslint-disable-next-line react-refresh/only-export-components
export const useHomepage = () => {
  const context = useContext(HomepageContext);
  if (!context) {
    throw new Error('useHomepage must be used within a HomepageProvider');
  }
  return context;
};

type HomepageProviderProps = {
  children: React.ReactNode;
};

export const HomepageProvider = ({ children }: HomepageProviderProps) => {
  const [activeSection, setActiveSection] = useState('about');
  const [offset, setOffset] = useState(0);
  const [parallaxBaseHeight, setParallaxBaseHeight] = useState(0);

  return (
    <HomepageContext.Provider
      value={{
        activeSection,
        setActiveSection,
        offset,
        setOffset,
        parallaxBaseHeight,
        setParallaxBaseHeight,
      }}
    >
      {children}
    </HomepageContext.Provider>
  );
};
