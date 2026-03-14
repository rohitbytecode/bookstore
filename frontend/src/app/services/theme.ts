import { DOCUMENT } from '@angular/common';
import { Injectable, Renderer2, RendererFactory2, inject, signal } from '@angular/core';

type ThemePreference = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly renderer: Renderer2;
  private readonly rendererFactory = inject(RendererFactory2);
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'theme';
  private readonly mediaQuery = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  readonly currentTheme = signal<ThemePreference>('light');

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);

    this.applyInitialTheme();
    this.mediaQuery?.addEventListener('change', this.handleSystemThemeChange);
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: ThemePreference): void {
    this.currentTheme.set(theme);
    this.safeSetStorage(theme);
    this.applyThemeToDom(theme);
  }

  private applyInitialTheme(): void {
    const savedTheme = this.safeGetStorage();

    if (savedTheme) {
      this.setTheme(savedTheme);
      return;
    }

    const systemTheme: ThemePreference = this.mediaQuery?.matches ? 'dark' : 'light';
    this.currentTheme.set(systemTheme);
    this.applyThemeToDom(systemTheme);
  }

  private applyThemeToDom(theme: ThemePreference): void {
    this.renderer.setAttribute(this.document.body, 'data-theme', theme);
    this.renderer.setAttribute(this.document.documentElement, 'data-theme', theme);
  }

  private readonly handleSystemThemeChange = (event: MediaQueryListEvent): void => {
    const hasUserPreference = Boolean(this.safeGetStorage());

    if (hasUserPreference) {
      return;
    }

    this.currentTheme.set(event.matches ? 'dark' : 'light');
    this.applyThemeToDom(this.currentTheme());
  };

  private safeGetStorage(): ThemePreference | null {
    try {
      const savedTheme = localStorage.getItem(this.storageKey);

      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }

      return null;
    } catch {
      return null;
    }
  }

  private safeSetStorage(theme: ThemePreference): void {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch {
      // Ignore storage write failures (private mode / blocked storage)
    }
  }
}
