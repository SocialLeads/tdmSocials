// applyTheme.ts

import { AppConfig } from "../app.config";

export function applyTheme(theme: AppConfig['theme']) {
  const root = document.documentElement;

  root.style.setProperty('--c-primary', theme.primary);
  root.style.setProperty('--c-secondary', theme.secondary);
  root.style.setProperty('--c-accent', theme.accent);

  root.style.setProperty('--c-bg', theme.background);
  root.style.setProperty('--c-surface', theme.surface);
  root.style.setProperty('--c-surface2', theme.surface2);

  root.style.setProperty('--c-text', theme.text);
  root.style.setProperty('--c-text2', theme.textSecondary);
  root.style.setProperty('--c-border', theme.border);

  root.style.setProperty('--c-primarySoft', theme.primarySoft);

  root.style.setProperty('--c-success', theme.success);
  root.style.setProperty('--c-warning', theme.warning);
  root.style.setProperty('--c-error', theme.error);
}
