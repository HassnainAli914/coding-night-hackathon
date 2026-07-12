import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext({
  currentTheme: 'light',
  changeCurrentTheme: () => {},
});

export default function ThemeProvider({children}) {  
  const persistedTheme = localStorage.getItem('theme');
  const [theme, setTheme] = useState(persistedTheme || 'light');
  const location = useLocation();

  const changeCurrentTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.classList.add('**:transition-none!');
    
    // Force light theme on the landing page (/) to avoid styling corruption
    const isLanding = location.pathname === '/';
    const activeTheme = isLanding ? 'light' : theme;

    if (activeTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    }

    const transitionTimeout = setTimeout(() => {
      document.documentElement.classList.remove('**:transition-none!');
    }, 1);
    
    return () => clearTimeout(transitionTimeout);
  }, [theme, location.pathname]);

  return <ThemeContext.Provider value={{ currentTheme: theme, changeCurrentTheme }}>{children}</ThemeContext.Provider>;
}

export const useThemeProvider = () => useContext(ThemeContext);