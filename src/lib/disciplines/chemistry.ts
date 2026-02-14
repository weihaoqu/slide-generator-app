import type { DisciplineConfig } from './types';

const chemistry: DisciplineConfig = {
  id: 'chemistry',
  name: 'Chemistry',
  icon: '🧪',
  tagline: 'Reactions, bonding, and molecular structure',

  suggestionTypes: [
    { type: 'visual',     label: 'Visual',     bg: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
    { type: 'analogy',    label: 'Analogy',    bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
    { type: 'depth',      label: 'Depth',      bg: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
    { type: 'warning',    label: 'Warning',    bg: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
    { type: 'example',    label: 'Example',    bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
    { type: 'equation',   label: 'Equation',   bg: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
    { type: 'mechanism',  label: 'Mechanism',  bg: 'bg-teal-500/15 text-teal-300 border-teal-500/25' },
    { type: 'structure',  label: 'Structure',  bg: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
  ],

  extraCSS: `
  /* Chemistry: specialized blocks */
  .equation { background: #1e1b2e; border: 1px solid #4c1d95; border-radius: 12px; padding: 20px 24px; font-family: 'Georgia', 'Times New Roman', serif; font-size: 1.15em; text-align: center; margin: 16px 0; color: #c4b5fd; line-height: 1.8; }
  .molecule { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 1em; line-height: 1.6; white-space: pre; overflow-x: auto; margin: 16px 0; color: #67e8f9; }
  .reaction { background: rgba(168,85,247,0.08); border-left: 4px solid #a855f7; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
  .reaction h3 { color: #c084fc; }`,

  systemPromptRules: `7. Use chemical notation with subscripts rendered in HTML (<sub>2</sub> for H₂O, etc.) and Unicode arrows (→, ⇌ for equilibrium)
8. Use <div class="equation"> for balanced chemical equations and thermodynamic formulas
9. Use <div class="molecule"> for ASCII molecular structures and Lewis dot structures
10. Use <div class="reaction"> for reaction mechanism steps
11. Include at least 2 key-idea boxes for fundamental chemistry principles and 1 warning for safety or common errors
12. Use step-by-step reveal (class="step") for reaction mechanisms and multi-step synthesis
13. Use comparison tables for properties of elements, compounds, or reaction types
14. Include real-world applications and laboratory relevance where appropriate`,

  qualityChecklist: `- At least 3 equation or molecule blocks
- At least 1 reaction mechanism block
- Chemical equations properly balanced
- Subscripts/superscripts in chemical formulas use HTML tags
- Last slide is a summary/cheat sheet`,

  outlinePromptFragment: `Suggestion types for slides: visual, analogy, depth, warning, example, equation, mechanism, structure.
Focus on chemical equations, molecular visualization, and reaction mechanism step-throughs.`,

  visualDescription: 'chemical equations, inline SVG molecular structures, Lewis dot diagrams, and reaction mechanisms',

  pedagogicalFlow: 'observation → atomic structure → bonding → reactions → equilibrium → applications → summary',

  exampleTopics: [
    'Chemical Bonding',
    'Organic Reaction Mechanisms',
    'Thermodynamics & Enthalpy',
    'Acid-Base Chemistry',
    'Electrochemistry',
  ],

  featureHighlights: [
    'Chemical equations',
    'Molecular structures',
    'Reaction mechanisms',
  ],
};

export default chemistry;
