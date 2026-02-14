import type { DisciplineConfig } from './types';

const math: DisciplineConfig = {
  id: 'math',
  name: 'Mathematics',
  icon: '📐',
  tagline: 'Proofs, equations, and mathematical reasoning',

  suggestionTypes: [
    { type: 'visual',    label: 'Visual',    bg: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
    { type: 'analogy',   label: 'Analogy',   bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
    { type: 'depth',     label: 'Depth',     bg: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
    { type: 'warning',   label: 'Warning',   bg: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
    { type: 'example',   label: 'Example',   bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
    { type: 'equation',  label: 'Equation',  bg: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
    { type: 'proof',     label: 'Proof',     bg: 'bg-teal-500/15 text-teal-300 border-teal-500/25' },
    { type: 'intuition', label: 'Intuition', bg: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
  ],

  extraCSS: `
  /* Math: equation blocks */
  .equation { background: #1e1b2e; border: 1px solid #4c1d95; border-radius: 12px; padding: 20px 24px; font-family: 'Georgia', 'Times New Roman', serif; font-size: 1.15em; text-align: center; margin: 16px 0; color: #c4b5fd; line-height: 1.8; }
  .proof { background: rgba(20,184,166,0.08); border-left: 4px solid #14b8a6; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
  .proof h3 { color: #5eead4; }
  .theorem { background: rgba(99,102,241,0.1); border-left: 4px solid #6366f1; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
  .theorem h3 { color: #a5b4fc; }
  .definition { background: rgba(168,85,247,0.08); border-left: 4px solid #a855f7; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
  .definition h3 { color: #c084fc; }`,

  systemPromptRules: `7. Use Unicode math symbols extensively (summation: ∑, integral: ∫, partial: ∂, element of: ∈, for all: ∀, there exists: ∃, infinity: ∞, arrow: →, implies: ⟹, iff: ⟺, not equal: ≠, approx: ≈, leq: ≤, geq: ≥, subset: ⊂, union: ∪, intersection: ∩, empty set: ∅, nabla: ∇, etc.)
8. Use <div class="equation"> for important formulas and equations (centered, serif font)
9. Use <div class="proof"> for proof blocks, ending with the QED symbol □
10. Use <div class="theorem"> for theorem statements
11. Use <div class="definition"> for formal definitions
12. Include at least 2 key-idea boxes for key insights and 1 warning for common mistakes
13. Use step-by-step reveal (class="step") for proof steps and derivations
14. Build intuition before formalism — motivate each concept with examples
15. Use <div class="diagram"> for ASCII art or <div class="svg-diagram"> for geometric intuitions and function plots when appropriate`,

  qualityChecklist: `- At least 3 equation blocks present
- At least 1 proof block with □
- At least 1 theorem or definition block
- Unicode math symbols used throughout (not plain text approximations)
- Last slide is a summary/cheat sheet`,

  outlinePromptFragment: `Suggestion types for slides: visual, analogy, depth, warning, example, equation, proof, intuition.
Focus on building mathematical intuition before formal statements. Use equations, proofs, and geometric reasoning.`,

  visualDescription: 'equations with Unicode math symbols, proof blocks, inline SVG geometric figures, and ASCII diagrams',

  pedagogicalFlow: 'motivation → definitions → theorems → proofs → examples → applications → summary',

  exampleTopics: [
    'Taylor Series',
    'Linear Algebra Eigenvalues',
    'Group Theory Basics',
    'Real Analysis Limits',
    'Probability Distributions',
  ],

  featureHighlights: [
    'Equation blocks',
    'Proof formatting',
    'Theorem boxes',
  ],
};

export default math;
