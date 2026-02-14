import type { DisciplineConfig } from './types';

const literature: DisciplineConfig = {
  id: 'literature',
  name: 'Literature',
  icon: '📖',
  tagline: 'Close reading, literary analysis, and criticism',

  suggestionTypes: [
    { type: 'visual',        label: 'Visual',        bg: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
    { type: 'analogy',       label: 'Analogy',       bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
    { type: 'depth',         label: 'Depth',         bg: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
    { type: 'warning',       label: 'Warning',       bg: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
    { type: 'example',       label: 'Example',       bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
    { type: 'close-reading', label: 'Close Read',    bg: 'bg-pink-500/15 text-pink-300 border-pink-500/25' },
    { type: 'context',       label: 'Context',       bg: 'bg-teal-500/15 text-teal-300 border-teal-500/25' },
    { type: 'comparison',    label: 'Comparison',    bg: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
  ],

  extraCSS: `
  /* Literature: specialized blocks */
  .blockquote-source { background: rgba(236,72,153,0.06); border-left: 4px solid #ec4899; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; font-style: italic; color: #f9a8d4; }
  .blockquote-source .attribution { font-style: normal; font-size: 0.9em; color: #9d174d; margin-top: 8px; }
  .annotation { background: rgba(168,85,247,0.08); border: 1px dashed #7c3aed; border-radius: 12px; padding: 20px 24px; margin: 16px 0; }
  .annotation h3 { color: #c084fc; }`,

  systemPromptRules: `7. Use <div class="blockquote-source"> for literary quotes and passages, with <div class="attribution"> for the source
8. Use <div class="annotation"> for close-reading annotations and textual analysis
9. Use <div class="diagram"> or <div class="svg-diagram"> for plot structure diagrams, character relationship maps, and thematic webs when appropriate
10. Include at least 2 key-idea boxes for major themes and literary techniques and 1 warning for common misreadings
11. Use comparison tables for contrasting characters, themes, or literary movements
12. Use step-by-step reveal (class="step") for building interpretations layer by layer
13. Include historical and biographical context where it illuminates the text
14. Present multiple critical perspectives (formalist, historical, feminist, postcolonial, etc.)`,

  qualityChecklist: `- At least 2 literary quotes with attribution
- At least 1 close-reading annotation block
- Multiple critical perspectives presented
- Last slide is a summary/cheat sheet`,

  outlinePromptFragment: `Suggestion types for slides: visual, analogy, depth, warning, example, close-reading, context, comparison.
Focus on close reading, textual evidence, thematic analysis, and multiple critical lenses.`,

  visualDescription: 'inline SVG plot arc diagrams, character relationship maps, and thematic structure charts',

  pedagogicalFlow: 'context → text → close reading → themes → criticism → connections → summary',

  exampleTopics: [
    'Shakespeare: Hamlet',
    'Toni Morrison: Beloved',
    'Modernist Poetry (Eliot, Pound)',
    'Gothic Literature',
    'Postcolonial Novel',
  ],

  featureHighlights: [
    'Literary quotes',
    'Close-reading blocks',
    'Character maps',
  ],
};

export default literature;
