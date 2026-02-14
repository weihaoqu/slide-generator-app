import type { DisciplineConfig } from './types';

const physics: DisciplineConfig = {
  id: 'physics',
  name: 'Physics',
  icon: '⚛️',
  tagline: 'Mechanics, electromagnetism, and quantum phenomena',

  suggestionTypes: [
    { type: 'visual',      label: 'Visual',      bg: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
    { type: 'analogy',     label: 'Analogy',      bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
    { type: 'depth',       label: 'Depth',        bg: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
    { type: 'warning',     label: 'Warning',      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
    { type: 'example',     label: 'Example',      bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
    { type: 'equation',    label: 'Equation',     bg: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
    { type: 'derivation',  label: 'Derivation',   bg: 'bg-teal-500/15 text-teal-300 border-teal-500/25' },
    { type: 'experiment',  label: 'Experiment',   bg: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
  ],

  extraCSS: `
  /* Physics: equation and diagram blocks */
  .equation { background: #1e1b2e; border: 1px solid #4c1d95; border-radius: 12px; padding: 20px 24px; font-family: 'Georgia', 'Times New Roman', serif; font-size: 1.15em; text-align: center; margin: 16px 0; color: #c4b5fd; line-height: 1.8; }
  .free-body-diagram { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 1em; line-height: 1.6; white-space: pre; overflow-x: auto; margin: 16px 0; color: #93c5fd; }
  .experiment { background: rgba(244,63,94,0.08); border-left: 4px solid #f43f5e; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
  .experiment h3 { color: #fb7185; }`,

  systemPromptRules: `7. Use Unicode symbols for physics notation (→ for vectors, ∑ for sums, ∫ for integrals, ∂ for partials, ∇ for gradient, × for cross product, · for dot product, ℏ for h-bar, Ω for ohm, μ for micro, etc.)
8. Use <div class="equation"> for key physics equations and laws
9. Use <div class="free-body-diagram">, <div class="diagram">, or <div class="svg-diagram"> for force diagrams, circuit diagrams, and system schematics when appropriate
10. Use <div class="experiment"> for experimental setups and observations
11. Include at least 2 key-idea boxes for physical insights and 1 warning for common misconceptions
12. Use step-by-step reveal (class="step") for derivations and problem-solving walkthroughs
13. Connect abstract equations to physical intuition — always explain what the math means physically
14. Include unit analysis and dimensional reasoning where relevant`,

  qualityChecklist: `- At least 3 equation blocks with physics laws/formulas
- At least 1 experiment or real-world application block
- Units and dimensions consistently included
- Last slide is a summary/cheat sheet`,

  outlinePromptFragment: `Suggestion types for slides: visual, analogy, depth, warning, example, equation, derivation, experiment.
Focus on physical intuition, mathematical derivations, and connecting theory to observable phenomena.`,

  visualDescription: 'equations with physics notation, inline SVG free-body diagrams, circuit schematics, and system diagrams',

  pedagogicalFlow: 'phenomenon → model → equations → derivation → examples → applications → summary',

  exampleTopics: [
    'Newtonian Mechanics',
    'Electromagnetic Waves',
    'Quantum Mechanics Basics',
    'Thermodynamics Laws',
    'Special Relativity',
  ],

  featureHighlights: [
    'Equation blocks',
    'Free-body diagrams',
    'Experiment boxes',
  ],
};

export default physics;
