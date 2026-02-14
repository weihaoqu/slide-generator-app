import type { ThemeConfig } from '../types';

const dark: ThemeConfig = {
  id: 'dark',
  name: 'Dark',
  description: 'Default dark theme with blue/purple accents',
  preview: { bg: 'bg-slate-900', text: 'text-slate-200', accent: 'bg-blue-500' },
  css: '', // SLIDE_CSS IS the dark theme
  svgColors: {
    stroke: '#94a3b8',
    shapeFill: '#1e293b',
    textFill: '#e2e8f0',
    accents: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
  },
  promptHint: '',
};

export default dark;
