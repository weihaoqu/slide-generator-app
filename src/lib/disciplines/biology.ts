import type { DisciplineConfig } from './types';

const biology: DisciplineConfig = {
  id: 'biology',
  name: 'Biology',
  icon: '🧬',
  tagline: 'Cells, genetics, and living systems',

  suggestionTypes: [
    { type: 'visual',      label: 'Visual',      bg: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
    { type: 'analogy',     label: 'Analogy',      bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
    { type: 'depth',       label: 'Depth',        bg: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
    { type: 'warning',     label: 'Warning',      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
    { type: 'example',     label: 'Example',      bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
    { type: 'process',     label: 'Process',      bg: 'bg-green-500/15 text-green-300 border-green-500/25' },
    { type: 'comparison',  label: 'Comparison',   bg: 'bg-teal-500/15 text-teal-300 border-teal-500/25' },
    { type: 'life-cycle',  label: 'Life Cycle',   bg: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
  ],

  extraCSS: `
  /* Biology: specialized blocks */
  .cell-diagram { background: #1e293b; border: 1px solid #065f46; border-radius: 12px; padding: 24px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 1em; line-height: 1.6; white-space: pre; overflow-x: auto; margin: 16px 0; color: #6ee7b7; }
  .pathway { background: rgba(16,185,129,0.08); border-left: 4px solid #10b981; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
  .pathway h3 { color: #34d399; }`,

  systemPromptRules: `7. Use <div class="diagram">, <div class="cell-diagram">, or <div class="svg-diagram"> for cell structures, organelles, and biological systems when appropriate
8. Use <div class="pathway"> for metabolic pathways, signaling cascades, and biological processes
9. Use arrows (→, ⟶, ⇌) to show biological processes, enzyme reactions, and feedback loops
10. Include at least 2 key-idea boxes for core biological principles and 1 warning for common misconceptions
11. Use comparison tables for contrasting structures, processes, or organisms
12. Use step-by-step reveal (class="step") for multi-step biological processes (mitosis, protein synthesis, etc.)
13. Include real-world applications and clinical relevance where appropriate
14. Use two-column layouts to compare related structures or processes side by side`,

  qualityChecklist: `- At least 1 pathway or process block
- At least 1 comparison table
- Biological terminology properly introduced before use
- Last slide is a summary/cheat sheet`,

  outlinePromptFragment: `Suggestion types for slides: visual, analogy, depth, warning, example, process, comparison, life-cycle.
Focus on visual representations of biological structures, process flows, and comparative analysis.`,

  visualDescription: 'inline SVG cell diagrams, metabolic pathway flowcharts, and biological system schematics',

  pedagogicalFlow: 'overview → structure → function → process → regulation → applications → summary',

  exampleTopics: [
    'Cell Division (Mitosis & Meiosis)',
    'DNA Replication & Transcription',
    'Photosynthesis',
    'Human Immune System',
    'Mendelian Genetics',
  ],

  featureHighlights: [
    'Cell diagrams',
    'Pathway flowcharts',
    'Process step reveals',
  ],
};

export default biology;
