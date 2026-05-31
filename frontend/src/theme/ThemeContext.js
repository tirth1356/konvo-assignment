import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const lightTheme = {
  mode: 'light',
  background: '#fdf8ee',
  backgroundSecondary: '#fef3c7',
  card: '#fffdf5',
  cardHover: '#fef9e7',
  text: '#1c1917',
  textSecondary: '#78716c',
  primary: '#d97706',
  primaryHover: '#b45309',
  primaryLight: '#fef3c7',
  border: '#e8dfc5',
  borderStrong: '#d6c89a',
  success: '#059669',
  successLight: '#d1fae5',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  warning: '#d97706',
  shadow: 'rgba(120, 80, 10, 0.08)',
  inputBg: '#fffdf5',
  accent: '#b45309',
  tag: '#fef3c7',
  tagText: '#92400e',
};

export const darkTheme = {
  mode: 'dark',
  background: '#050505',
  backgroundSecondary: '#0d0d0d',
  card: '#111111',
  cardHover: '#181818',
  text: '#f0fdf4',
  textSecondary: '#6b7280',
  primary: '#10b981',
  primaryHover: '#059669',
  primaryLight: '#022c22',
  border: '#1f1f1f',
  borderStrong: '#2d2d2d',
  success: '#10b981',
  successLight: '#022c22',
  danger: '#ef4444',
  dangerLight: '#1f0a0a',
  warning: '#f59e0b',
  shadow: 'rgba(0, 0, 0, 0.6)',
  inputBg: '#0a0a0a',
  accent: '#34d399',
  tag: '#022c22',
  tagText: '#6ee7b7',
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('theme').then((val) => {
      if (val === 'light') setIsDark(false);
    });
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme: isDark ? darkTheme : lightTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
