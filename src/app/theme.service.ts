import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'boxing_ui_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<AppTheme>('light');

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(STORAGE_KEY) as AppTheme | null;
      const initial: AppTheme = stored === 'dark' || stored === 'light' ? stored : 'light';
      this.apply(initial);
    } else {
      this.apply('light');
    }
  }

  toggle(): void {
    const next: AppTheme = this.theme() === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  setTheme(next: AppTheme): void {
    this.apply(next);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }

  private apply(next: AppTheme): void {
    this.theme.set(next);
    const root = this.document.documentElement;
    root.classList.remove('light-theme', 'dark-theme');
    root.classList.add(next === 'dark' ? 'dark-theme' : 'light-theme');
  }
}
