import type { DisciplineConfig } from './types';

const economics: DisciplineConfig = {
  id: 'economics',
  name: 'Economics',
  icon: '📊',
  tagline: 'Markets, models, and economic reasoning',

  suggestionTypes: [
    { type: 'visual',      label: 'Visual',      bg: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
    { type: 'analogy',     label: 'Analogy',      bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
    { type: 'depth',       label: 'Depth',        bg: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
    { type: 'warning',     label: 'Warning',      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
    { type: 'example',     label: 'Example',      bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
    { type: 'equation',    label: 'Equation',     bg: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
    { type: 'graph',       label: 'Graph',        bg: 'bg-teal-500/15 text-teal-300 border-teal-500/25' },
    { type: 'model',       label: 'Model',        bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25' },
    { type: 'case-study',  label: 'Case Study',   bg: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
  ],

  extraCSS: `
  /* Economics: specialized blocks */
  .equation { background: #1e1b2e; border: 1px solid #4c1d95; border-radius: 12px; padding: 20px 24px; font-family: 'Georgia', 'Times New Roman', serif; font-size: 1.15em; text-align: center; margin: 16px 0; color: #c4b5fd; line-height: 1.8; }
  .graph-ascii { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 0.95em; line-height: 1.5; white-space: pre; overflow-x: auto; margin: 16px 0; color: #93c5fd; }
  .model { background: rgba(99,102,241,0.08); border-left: 4px solid #6366f1; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
  .model h3 { color: #a5b4fc; }`,

  systemPromptRules: `7. Use <div class="equation"> for economic formulas (GDP = C + I + G + NX, elasticity formulas, etc.)
8. Use <div class="graph-ascii">, <div class="diagram">, or <div class="svg-diagram"> for supply-demand curves, IS-LM diagrams, production possibility frontiers, and market graphs when appropriate
9. Use <div class="model"> for economic model descriptions and assumptions
10. Include at least 2 key-idea boxes for core economic principles and 1 warning for common fallacies (broken window, composition, etc.)
11. Use comparison tables for contrasting economic systems, policy approaches, or market structures
12. Use step-by-step reveal (class="step") for multi-step economic reasoning and model derivations
13. Include real-world case studies and data examples where applicable
14. Label axes clearly in ASCII graphs (Price/Quantity, Interest Rate/Output, etc.)`,

  qualityChecklist: `- At least 2 equation blocks with economic formulas
- At least 1 model description block
- Axes labeled on all ASCII graphs
- Last slide is a summary/cheat sheet`,

  outlinePromptFragment: `Suggestion types for slides: visual, analogy, depth, warning, example, equation, graph, model, case-study.
Focus on economic models, graphical analysis with labeled axes, and connecting theory to real-world policy and data.`,

  visualDescription: 'inline SVG supply-demand graphs, economic model diagrams with labeled axes, and formula blocks',

  pedagogicalFlow: 'question → model → graphs → math → policy → case study → summary',

  exampleTopics: [
    'Supply and Demand',
    'Game Theory',
    'Monetary Policy & the Fed',
    'International Trade',
    'Market Failures & Externalities',
  ],

  featureHighlights: [
    'Economic graphs',
    'Model descriptions',
    'Case study blocks',
  ],
};

export default economics;
