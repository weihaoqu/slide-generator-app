import type { ThemeConfig } from '../types';

const forest: ThemeConfig = {
  id: 'forest',
  name: 'Forest',
  description: 'Nature-inspired dark theme with emerald and lime accents',
  preview: { bg: 'bg-[#0f1a14]', text: 'text-emerald-100', accent: 'bg-emerald-500' },
  css: `
  body { background: #0f1a14; color: #d1fae5; }
  h1 { background: linear-gradient(135deg, #10b981, #84cc16); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  h2 { color: #6ee7b7; }
  h3 { color: #34d399; }
  p, li { color: #a7f3d0; }
  .subtitle { color: #6d9f84; }
  .slide-number { color: #3b6b50; }
  .nav button { background: #1a3a28; border-color: #265e3e; color: #d1fae5; }
  .nav button:hover { background: #265e3e; }
  .progress { background: linear-gradient(90deg, #10b981, #84cc16); }
  .diagram { background: #152a1e; border-color: #1a3a28; color: #6ee7b7; }
  .key-idea { background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(132,204,22,0.12)); border-left-color: #10b981; }
  .key-idea h3 { color: #34d399; }
  .warning { background: rgba(234,179,8,0.12); border-left-color: #eab308; }
  .warning h3 { color: #facc15; }
  .analogy { background: rgba(132,204,22,0.12); border-left-color: #84cc16; }
  .analogy h3 { color: #a3e635; }
  th { background: #1a3a28; color: #6ee7b7; }
  td { background: #152a1e; color: #a7f3d0; border-color: #1a3a28; }
  th { border-color: #265e3e; }
  tr.highlight td { background: rgba(16,185,129,0.15); }
  .step.revealed { background: rgba(16,185,129,0.08); }
  `,
  svgColors: {
    stroke: '#6ee7b7',
    shapeFill: '#152a1e',
    textFill: '#d1fae5',
    accents: ['#10b981', '#84cc16', '#34d399', '#eab308'],
  },
  promptHint: 'Nature metaphors where natural. Emerald and green color palette.',
};

export default forest;
