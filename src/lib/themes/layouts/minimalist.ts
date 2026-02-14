import type { LayoutConfig } from '../types';

const minimalist: LayoutConfig = {
  id: 'minimalist',
  name: 'Minimalist',
  description: 'Generous whitespace, fewer items per slide',
  preview: { icon: '\u00b7' },
  css: `
  .slide { padding: 60px 100px; }
  h1 { font-size: 2.6em; margin-bottom: 28px; }
  h2 { font-size: 1.8em; margin-bottom: 24px; }
  p, li { font-size: 1.25em; line-height: 2; }
  .two-col { gap: 60px; }
  .key-idea, .warning, .analogy { padding: 28px 32px; margin: 24px 0; }
  .diagram { padding: 32px; margin: 24px 0; }
  ul { padding-left: 20px; }
  ul li { margin-bottom: 14px; }
  `,
  promptHint: '3 bullets max per slide, prefer whitespace over density. Keep text concise.',
};

export default minimalist;
