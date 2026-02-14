import type { ThemeConfig, LayoutConfig } from './types';
import dark from './themes/dark';
import light from './themes/light';
import ocean from './themes/ocean';
import warm from './themes/warm';
import forest from './themes/forest';
import defaultLayout from './layouts/default';
import minimalist from './layouts/minimalist';
import academic from './layouts/academic';
import bold from './layouts/bold';
import playful from './layouts/playful';

export type { ThemeConfig, LayoutConfig } from './types';

export const THEMES: Map<string, ThemeConfig> = new Map([
  ['dark', dark],
  ['light', light],
  ['ocean', ocean],
  ['warm', warm],
  ['forest', forest],
]);

export const LAYOUTS: Map<string, LayoutConfig> = new Map([
  ['default', defaultLayout],
  ['minimalist', minimalist],
  ['academic', academic],
  ['bold', bold],
  ['playful', playful],
]);

export const THEME_LIST: ThemeConfig[] = [...THEMES.values()];
export const LAYOUT_LIST: LayoutConfig[] = [...LAYOUTS.values()];

export function getTheme(id?: string): ThemeConfig {
  return THEMES.get(id || 'dark') || dark;
}

export function getLayout(id?: string): LayoutConfig {
  return LAYOUTS.get(id || 'default') || defaultLayout;
}
