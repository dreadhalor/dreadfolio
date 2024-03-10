import React, { createContext, useContext, useEffect, useState } from 'react';

type IframeContextValue = {
  message: string;
  parentMessage: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  setParentMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (msg: string) => void;
};

const IframeContext = createContext<IframeContextValue>(
  {} as IframeContextValue,
);

export const useIframe = () => {
  const context = useContext(IframeContext);
  if (!context) {
    throw new Error('useIframe must be used within a IframeProvider');
  }
  return context;
};

type IframeProviderProps = {
  children: React.ReactNode;
};

export const IframeProvider = ({ children }: IframeProviderProps) => {
  const [message, setMessage] = useState('');
  const [parentMessage, setParentMessage] = useState('');

  useEffect(() => {
    const handler = (ev: MessageEvent<{ type: string; message: string }>) => {
      if (typeof ev.data !== 'object') return;
      if (!ev.data.type) return;
      if (ev.data.type !== 'msg') return;
      if (!ev.data.message) return;

      setParentMessage(ev.data.message);
    };

    window.addEventListener('message', handler);

    // Don't forget to remove addEventListener
    return () => window.removeEventListener('message', handler);
  }, []);

  const sendMessage = (msg: string) => {
    window.parent.postMessage(
      {
        type: 'msg',
        message: msg,
      },
      '*',
    );
  };

  return (
    <IframeContext.Provider
      value={{
        message,
        parentMessage,
        setMessage,
        setParentMessage,
        sendMessage,
      }}
    >
      {children}
    </IframeContext.Provider>
  );
};
