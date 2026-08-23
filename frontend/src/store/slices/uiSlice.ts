import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  theme: 'dark' | 'light';
  language: 'ar' | 'en';
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  }
  return 'dark'; // Default to dark theme as originally configured
};

const getInitialLanguage = (): 'ar' | 'en' => {
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'ar' || savedLanguage === 'en') {
      return savedLanguage;
    }
  }
  return 'ar'; // Default to Arabic
};

const initialState: UIState = {
  theme: getInitialTheme(),
  language: getInitialLanguage(),
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', state.theme);
      }
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
      }
    },
    toggleLanguage: (state) => {
      state.language = state.language === 'ar' ? 'en' : 'ar';
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', state.language);
      }
    },
    setLanguage: (state, action: PayloadAction<'ar' | 'en'>) => {
      state.language = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', action.payload);
      }
    },
  },
});

export const { toggleTheme, setTheme, toggleLanguage, setLanguage } = uiSlice.actions;
export default uiSlice.reducer;
