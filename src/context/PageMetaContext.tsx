'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type PageMetaContextType = {
  title: string;
  description: string;
  setPageMeta: (title: string, description: string) => void;
};

const defaultContext: PageMetaContextType = {
  title: 'f0ck.org',
  description: 'Anonymous Imageboard',
  setPageMeta: () => {},
};

const PageMetaContext = createContext<PageMetaContextType>(defaultContext);

export const usePageMeta = () => useContext(PageMetaContext);

export function PageMetaProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState({
    title: defaultContext.title,
    description: defaultContext.description,
  });

  const setPageMeta = useCallback((title: string, description: string) => {
    setMeta(prevMeta => {
      if (prevMeta.title === title && prevMeta.description === description) {
        return prevMeta;
      }
      return { title, description };
    });
  }, []);

  return (
    <PageMetaContext.Provider value={{ ...meta, setPageMeta }}>
      {children}
    </PageMetaContext.Provider>
  );
} 