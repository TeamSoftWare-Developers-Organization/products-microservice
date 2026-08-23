'use client';

import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './store';
import { useEffect } from 'react';

function ThemeAndLanguageApplier({ children }: { children: React.ReactNode }) {
  const theme = useSelector((state: RootState) => state.ui.theme);
  const language = useSelector((state: RootState) => state.ui.language);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-mode', theme);
      root.dir = language === 'ar' ? 'rtl' : 'ltr';
      root.lang = language;
      
      // Update body bg color class
      if (theme === 'light') {
        root.classList.remove('dark');
        root.classList.add('light');
      } else {
        root.classList.remove('light');
        root.classList.add('dark');
      }
    }
  }, [theme, language]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <ThemeAndLanguageApplier>
                {children}
            </ThemeAndLanguageApplier>
        </Provider>
    );
}
