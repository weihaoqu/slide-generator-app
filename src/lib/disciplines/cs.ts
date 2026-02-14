import type { DisciplineConfig } from './types';

const cs: DisciplineConfig = {
  id: 'cs',
  name: 'Computer Science',
  icon: '💻',
  tagline: 'Algorithms, data structures, and systems',

  suggestionTypes: [
    { type: 'visual',  label: 'Visual',  bg: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
    { type: 'analogy', label: 'Analogy', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
    { type: 'depth',   label: 'Depth',   bg: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
    { type: 'warning', label: 'Warning', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
    { type: 'example', label: 'Example', bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
    { type: 'diagram', label: 'Diagram', bg: 'bg-teal-500/15 text-teal-300 border-teal-500/25' },
  ],

  extraCSS: '',

  systemPromptRules: `7. Use <div class="diagram"> blocks for ASCII art and <div class="svg-diagram"> for inline SVGs when appropriate
8. Include at least 2 key-idea boxes, 1 warning box, 1 analogy box
9. Use two-column layouts for slides with diagrams + explanations
10. Last slide must be a Summary & Cheat Sheet
11. All < and > in diagram blocks must use &lt; and &gt;
12. No external dependencies — all CSS and JS must be inline
13. Use step-by-step reveal (class="step") for algorithm traces
14. Make content student-friendly with clear explanations and real-world analogies`,

  qualityChecklist: `- At least 2 key-idea boxes, 1 warning box, 1 analogy box
- At least 2 two-column layouts
- At least 1 comparison table
- Last slide is a summary/cheat sheet`,

  outlinePromptFragment: `Suggestion types for slides: visual, analogy, depth, warning, example, diagram.
Focus on clear algorithmic thinking, data structure visualization, and code-level understanding.`,

  visualDescription: 'inline SVG and ASCII diagrams showing data structures, algorithms, and system architectures',

  pedagogicalFlow: 'intro → fundamentals → depth → examples → summary',

  exampleTopics: [
    'Binary Search Trees',
    'TCP/IP Protocol',
    'OCaml Pattern Matching',
    'Dynamic Programming',
    'Graph Algorithms',
  ],

  featureHighlights: [
    'ASCII diagrams',
    'Step-by-step reveals',
    'Key idea boxes',
  ],
};

export default cs;
