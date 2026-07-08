import { describe, expect, it, beforeEach } from 'vitest';
import { resolveTheme, readStoredThemePreference, THEME_STORAGE_KEY } from './ThemeContext';

describe('resolveTheme', () => {
  it('returns light/dark as-is when preference is explicit, ignoring system', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('follows the system preference when set to "system"', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
});

describe('readStoredThemePreference', () => {
  it('defaults to "system" when nothing is stored', () => {
    const storage = { getItem: () => null };
    expect(readStoredThemePreference(storage)).toBe('system');
  });

  it('defaults to "system" for an unrecognized stored value (corrupted/old data)', () => {
    const storage = { getItem: () => 'sepia' };
    expect(readStoredThemePreference(storage)).toBe('system');
  });

  it('returns the stored preference when it is a valid value', () => {
    expect(readStoredThemePreference({ getItem: () => 'light' })).toBe('light');
    expect(readStoredThemePreference({ getItem: () => 'dark' })).toBe('dark');
    expect(readStoredThemePreference({ getItem: () => 'system' })).toBe('system');
  });

  it('reads from real localStorage by default', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(readStoredThemePreference()).toBe('dark');
    localStorage.removeItem(THEME_STORAGE_KEY);
  });
});

describe('THEME_STORAGE_KEY', () => {
  beforeEach(() => localStorage.clear());

  it('is the key ThemeProvider persists to, kept stable for existing users\' saved preference', () => {
    expect(THEME_STORAGE_KEY).toBe('sensory-profile-theme');
  });
});
