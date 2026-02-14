import type { DisciplineConfig } from './types';

const history: DisciplineConfig = {
  id: 'history',
  name: 'History',
  icon: '📜',
  tagline: 'Events, causation, and historical analysis',

  suggestionTypes: [
    { type: 'visual',         label: 'Visual',         bg: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
    { type: 'analogy',        label: 'Analogy',        bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
    { type: 'depth',          label: 'Depth',          bg: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
    { type: 'warning',        label: 'Warning',        bg: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
    { type: 'example',        label: 'Example',        bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
    { type: 'primary-source', label: 'Source',          bg: 'bg-orange-500/15 text-orange-300 border-orange-500/25' },
    { type: 'timeline',       label: 'Timeline',       bg: 'bg-teal-500/15 text-teal-300 border-teal-500/25' },
    { type: 'context',        label: 'Context',        bg: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
  ],

  extraCSS: `
  /* History: specialized blocks */
  .timeline { background: #1e293b; border-left: 3px solid #f59e0b; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
  .timeline h3 { color: #fbbf24; }
  .blockquote-source { background: rgba(251,191,36,0.06); border-left: 4px solid #92400e; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; font-style: italic; color: #fcd34d; }
  .blockquote-source .attribution { font-style: normal; font-size: 0.9em; color: #a16207; margin-top: 8px; }`,

  systemPromptRules: `7. Use <div class="timeline"> for chronological sequences of events with dates
8. Use <div class="blockquote-source"> for primary source quotes, with a <div class="attribution"> for the source
9. Use <div class="diagram"> or <div class="svg-diagram"> for cause-and-effect diagrams, maps, and power structure visualizations when appropriate
10. Include at least 2 key-idea boxes for major historical interpretations and 1 warning for common historiographical errors
11. Use comparison tables for contrasting political systems, economic models, or cultural movements
12. Present multiple perspectives on contested events — avoid single-narrative bias
13. Use step-by-step reveal (class="step") for sequences of causes and consequences
14. Connect historical events to broader themes and patterns`,

  qualityChecklist: `- At least 2 timeline blocks
- At least 1 primary source blockquote
- Multiple perspectives presented for contested events
- Last slide is a summary/cheat sheet`,

  outlinePromptFragment: `Suggestion types for slides: visual, analogy, depth, warning, example, primary-source, timeline, context.
Focus on chronological flow, primary source analysis, causal reasoning, and multiple historical perspectives.`,

  visualDescription: 'inline SVG timeline diagrams, cause-and-effect charts, and historical map schematics',

  pedagogicalFlow: 'context → events → causes → consequences → perspectives → legacy → summary',

  exampleTopics: [
    'The French Revolution',
    'Cold War Origins',
    'Industrial Revolution',
    'Ancient Rome: Republic to Empire',
    'Civil Rights Movement',
  ],

  featureHighlights: [
    'Timeline blocks',
    'Primary source quotes',
    'Cause-effect diagrams',
  ],
};

export default history;
