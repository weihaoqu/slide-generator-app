import type { LayoutConfig } from '../types';

const bold: LayoutConfig = {
  id: 'bold',
  name: 'Bold',
  description: 'Huge headings with compact body text',
  preview: { icon: 'B' },
  css: `
  h1 { font-size: 3.4em; margin-bottom: 24px; font-weight: 800; }
  h2 { font-size: 2.4em; margin-bottom: 20px; font-weight: 700; }
  h3 { font-size: 1.6em; margin-bottom: 14px; font-weight: 700; }
  p, li { font-size: 1.05em; line-height: 1.6; }
  .subtitle { font-size: 1.4em; font-weight: 500; }
  .key-idea h3, .warning h3, .analogy h3 { font-size: 1.3em; }
  `,
  promptHint: 'Impactful headlines, punchy short content. Lead with a strong statement per slide.',
};

export default bold;
