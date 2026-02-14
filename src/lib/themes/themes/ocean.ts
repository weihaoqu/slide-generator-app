import type { ThemeConfig } from '../types';

const ocean: ThemeConfig = {
  id: 'ocean',
  name: 'Ocean',
  description: 'Deep sea theme with cyan and teal accents',
  preview: { bg: 'bg-[#0c1929]', text: 'text-cyan-100', accent: 'bg-cyan-500' },
  css: `
  body { background: #0c1929; color: #cffafe; }
  h1 { background: linear-gradient(135deg, #06b6d4, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  h2 { color: #67e8f9; }
  h3 { color: #22d3ee; }
  p, li { color: #a5f3fc; }
  .subtitle { color: #6bb7c8; }
  .slide-number { color: #3b6e7a; }
  .nav button { background: #164e63; border-color: #1e6a7d; color: #cffafe; }
  .nav button:hover { background: #1e6a7d; }
  .progress { background: linear-gradient(90deg, #06b6d4, #0ea5e9); }
  .diagram { background: #0e2a3d; border-color: #164e63; color: #67e8f9; }
  .key-idea { background: linear-gradient(135deg, rgba(6,182,212,0.15), rgba(14,165,233,0.15)); border-left-color: #06b6d4; }
  .key-idea h3 { color: #22d3ee; }
  .warning { background: rgba(234,179,8,0.12); border-left-color: #eab308; }
  .warning h3 { color: #facc15; }
  .analogy { background: rgba(20,184,166,0.12); border-left-color: #14b8a6; }
  .analogy h3 { color: #2dd4bf; }
  th { background: #164e63; color: #67e8f9; }
  td { background: #0e2a3d; color: #a5f3fc; border-color: #164e63; }
  th { border-color: #1e6a7d; }
  tr.highlight td { background: rgba(6,182,212,0.15); }
  .step.revealed { background: rgba(6,182,212,0.08); }
  `,
  svgColors: {
    stroke: '#67e8f9',
    shapeFill: '#0e2a3d',
    textFill: '#cffafe',
    accents: ['#06b6d4', '#0ea5e9', '#14b8a6', '#eab308'],
  },
  promptHint: 'Use ocean/water metaphors where natural. Cyan and teal color palette.',
};

export default ocean;
