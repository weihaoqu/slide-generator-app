import type { LayoutConfig } from '../types';

const defaultLayout: LayoutConfig = {
  id: 'default',
  name: 'Default',
  description: 'Balanced layout with standard spacing',
  preview: { icon: '=' },
  css: '', // SLIDE_CSS IS the default layout
  promptHint: '',
};

export default defaultLayout;
