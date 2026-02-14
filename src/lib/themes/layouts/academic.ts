import type { LayoutConfig } from '../types';

const academic: LayoutConfig = {
  id: 'academic',
  name: 'Academic',
  description: 'Serif fonts, tighter spacing, denser content',
  preview: { icon: 'A' },
  css: `
  body { font-family: 'Georgia', 'Times New Roman', 'Palatino', serif; }
  .slide { padding: 36px 50px; }
  h1 { font-size: 2.4em; font-family: 'Georgia', 'Times New Roman', serif; }
  h2 { font-size: 1.7em; font-family: 'Georgia', 'Times New Roman', serif; }
  h3 { font-size: 1.25em; font-family: 'Georgia', 'Times New Roman', serif; }
  p, li { font-size: 1.05em; line-height: 1.55; margin-bottom: 6px; }
  .subtitle { font-size: 1.15em; }
  .two-col { gap: 30px; }
  .key-idea, .warning, .analogy { padding: 16px 20px; margin: 12px 0; }
  .diagram { padding: 18px; margin: 12px 0; font-size: 0.95em; }
  ul li { margin-bottom: 4px; }
  table { font-size: 0.95em; }
  th, td { padding: 8px 12px; }
  `,
  promptHint: 'Formal academic tone, more detail per slide, use precise terminology.',
};

export default academic;
