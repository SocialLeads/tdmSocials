// app-config.ts

// App configuration for easy customization across different SaaS apps
export interface AppConfig {
  app: {
    name: string;
    description: string;
    logo?: string;
    favicon?: string;
  };
  theme: {
    primary: string;
    secondary: string;
    accent: string;

    background: string;
    surface: string;

    /**
     * Slightly elevated surface for nested panels / callouts inside a surface.
     * Example: confirmation boxes inside modals/cards.
     */
    surface2: string;

    text: string;
    textSecondary: string;
    border: string;

    /**
     * Soft brand tint (very low opacity) used sparingly.
     * Keeps things premium without turning boxes into “error-looking” panels.
     */
    primarySoft: string;

    success: string;
    warning: string;
    error: string;
  };
  features: {
    auth: {
      emailPassword: boolean;
      google: boolean;
      facebook: boolean;
      apple: boolean;
    };
    pages: {
      home: boolean;
      dashboard: boolean;
      features: boolean;
      pricing: boolean;
      profile: boolean;
      settings: boolean;
    };
  };
  api: {
    baseUrl: string;
  };
}

export type ThemeName = 'light' | 'darkNeon' | 'blackCyan' | 'charcoalRose';

/**
 * Themes
 */
export const themes: Record<ThemeName, AppConfig['theme']> = {
  light: {
    primary: '#4f46e5',     // indigo-600 (matches public site)
    secondary: '#7c3aed',   // violet-600
    accent: '#0ea5e9',      // sky-500

    background: '#f9fafb',  // gray-50
    surface: '#ffffff',     // white
    surface2: '#f3f4f6',   // gray-100

    text: '#111827',        // gray-900
    textSecondary: '#6b7280', // gray-500
    border: '#e5e7eb',      // gray-200

    primarySoft: 'rgba(79, 70, 229, 0.08)', // indigo @8%

    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
  },

  darkNeon: {
    primary: '#8B5CF6',
    secondary: '#22D3EE',
    accent: '#F472B6',

    background: '#0B0F1A',
    surface: '#111827',
    surface2: '#0F172A',

    text: '#E5E7EB',
    textSecondary: '#9CA3AF',
    border: '#1F2937',

    primarySoft: 'rgba(139, 92, 246, 0.10)',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },

  blackCyan: {
    primary: '#22D3EE',
    secondary: '#60A5FA',
    accent: '#A78BFA',

    background: '#05070B',
    surface: '#0B1220',
    surface2: '#0A0F1A',

    text: '#E2E8F0',
    textSecondary: '#94A3B8',
    border: '#1E293B',

    primarySoft: 'rgba(34, 211, 238, 0.10)',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },

  charcoalRose: {
    primary: '#F43F5E',
    secondary: '#A78BFA',
    accent: '#22C55E',

    background: '#0A0A0B',
    surface: '#141416',
    surface2: '#18181B',

    text: '#F4F4F5',
    textSecondary: '#A1A1AA',
    border: '#27272A',

    primarySoft: 'rgba(244, 63, 94, 0.10)',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
};

/**
 * Single “base config” for your app.
 * Override only what you need (theme, name, features, etc.).
 */
export const baseConfig: AppConfig = {
  app: {
    name: 'TDM Socials',
    description: 'AI-powered social media content, delivered daily.',
    logo: '',
    favicon: '/favicon.ico',
  },
  theme: themes.light,
  features: {
    auth: {
      emailPassword: true,
      google: false,
      facebook: false,
      apple: false,
    },
    pages: {
      home: true,
      dashboard: true,
      features: false,
      pricing: true,
      profile: true,
      settings: true,
    },
  },
  api: {
    // If CRA (React Scripts)
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  },
};

/**
 * App presets.
 * Same app config, different themes (and optionally a couple toggles).
 */
export const saasConfigs = {
  light: { ...baseConfig, theme: themes.light },
  darkNeon: { ...baseConfig, theme: themes.darkNeon },
  blackCyan: { ...baseConfig, theme: themes.blackCyan },
  charcoalRose: { ...baseConfig, theme: themes.charcoalRose },
} satisfies Record<string, AppConfig>;

export type ConfigName = keyof typeof saasConfigs;

/**
 * Get config by name (optional).
 * If invalid/empty, returns baseConfig.
 */
export const getAppConfig = (configName?: string): AppConfig => {
  const key = (configName?.trim() || '') as ConfigName;
  return key && saasConfigs[key] ? saasConfigs[key] : baseConfig;
};
