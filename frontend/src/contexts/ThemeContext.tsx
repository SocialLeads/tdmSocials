import React, { createContext, useContext, ReactNode } from 'react';
import { AppConfig } from '../config/app.config';

interface ThemeContextType {
  config: AppConfig;
  updateTheme: (newTheme: Partial<AppConfig['theme']>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  config: AppConfig;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, config }) => {
  const [currentConfig, setCurrentConfig] = React.useState<AppConfig>(config);

  const updateTheme = (newTheme: Partial<AppConfig['theme']>) => {
    setCurrentConfig(prev => ({
      ...prev,
      theme: { ...prev.theme, ...newTheme }
    }));
  };

  // Apply CSS custom properties for dynamic theming
  React.useEffect(() => {
    const root = document.documentElement;
    const theme = currentConfig.theme;
    
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-surface', theme.surface);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-text-secondary', theme.textSecondary);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-success', theme.success);
    root.style.setProperty('--color-warning', theme.warning);
    root.style.setProperty('--color-error', theme.error);
  }, [currentConfig.theme]);

  return (
    <ThemeContext.Provider value={{ config: currentConfig, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useAppConfig = (): AppConfig => {
  const { config } = useTheme();
  return config;
};
