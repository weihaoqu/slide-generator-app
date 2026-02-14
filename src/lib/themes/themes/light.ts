import type { ThemeConfig } from '../types';

const light: ThemeConfig = {
  id: 'light',
  name: 'Light',
  description: 'Clean light theme with blue and purple accents',
  preview: { bg: 'bg-slate-100', text: 'text-slate-800', accent: 'bg-blue-500' },
  css: `
  body { background: #f8fafc; color: #1e293b; }
  h1 { background: linear-gradient(135deg, #2563eb, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  h2 { color: #1d4ed8; }
  h3 { color: #4338ca; }
  p, li { color: #334155; }
  .subtitle { color: #64748b; }
  .slide-number { color: #94a3b8; }
  .nav button { background: #e2e8f0; border-color: #cbd5e1; color: #334155; }
  .nav button:hover { background: #cbd5e1; }
  .progress { background: linear-gradient(90deg, #2563eb, #7c3aed); }
  .diagram { background: #f1f5f9; border-color: #e2e8f0; color: #0f766e; }
  .key-idea { background: linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08)); border-left-color: #2563eb; }
  .warning { background: rgba(217,119,6,0.08); border-left-color: #d97706; }
  .warning h3 { color: #b45309; }
  .analogy { background: rgba(5,150,105,0.08); border-left-color: #059669; }
  .analogy h3 { color: #047857; }
  th { background: #e2e8f0; color: #1d4ed8; }
  td { background: #f8fafc; color: #334155; border-color: #e2e8f0; }
  th { border-color: #cbd5e1; }
  tr.highlight td { background: rgba(37,99,235,0.08); }
  .step.revealed { background: rgba(37,99,235,0.06); }
  `,
  svgColors: {
    stroke: '#475569',
    shapeFill: '#f1f5f9',
    textFill: '#1e293b',
    accents: ['#2563eb', '#7c3aed', '#059669', '#d97706'],
  },
  promptHint: 'Use light-theme friendly language. Diagrams should use dark strokes on light backgrounds.',
};

export default light;
