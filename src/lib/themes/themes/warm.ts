import type { ThemeConfig } from '../types';

const warm: ThemeConfig = {
  id: 'warm',
  name: 'Warm',
  description: 'Cozy dark theme with amber and orange accents',
  preview: { bg: 'bg-[#1a1410]', text: 'text-amber-100', accent: 'bg-amber-500' },
  css: `
  body { background: #1a1410; color: #fef3c7; }
  h1 { background: linear-gradient(135deg, #f59e0b, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  h2 { color: #fbbf24; }
  h3 { color: #f59e0b; }
  p, li { color: #fde68a; }
  .subtitle { color: #b89a5e; }
  .slide-number { color: #6b5a3a; }
  .nav button { background: #3d2e1e; border-color: #5c4530; color: #fef3c7; }
  .nav button:hover { background: #5c4530; }
  .progress { background: linear-gradient(90deg, #f59e0b, #ef4444); }
  .diagram { background: #2a1f14; border-color: #3d2e1e; color: #fbbf24; }
  .key-idea { background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.12)); border-left-color: #f59e0b; }
  .key-idea h3 { color: #fbbf24; }
  .warning { background: rgba(239,68,68,0.12); border-left-color: #ef4444; }
  .warning h3 { color: #f87171; }
  .analogy { background: rgba(234,179,8,0.12); border-left-color: #eab308; }
  .analogy h3 { color: #facc15; }
  th { background: #3d2e1e; color: #fbbf24; }
  td { background: #2a1f14; color: #fde68a; border-color: #3d2e1e; }
  th { border-color: #5c4530; }
  tr.highlight td { background: rgba(245,158,11,0.15); }
  .step.revealed { background: rgba(245,158,11,0.08); }
  `,
  svgColors: {
    stroke: '#fbbf24',
    shapeFill: '#2a1f14',
    textFill: '#fef3c7',
    accents: ['#f59e0b', '#ef4444', '#eab308', '#fb923c'],
  },
  promptHint: 'Warm, inviting tone. Amber and orange color palette.',
};

export default warm;
