import type { DisciplineConfig } from './types';

const education: DisciplineConfig = {
  id: 'education',
  name: 'Education',
  icon: '🎓',
  tagline: 'Pedagogy, curriculum design, and learning theory',

  suggestionTypes: [
    { type: 'visual',       label: 'Visual',       bg: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
    { type: 'analogy',      label: 'Analogy',       bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
    { type: 'depth',        label: 'Depth',         bg: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
    { type: 'warning',      label: 'Warning',       bg: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
    { type: 'example',      label: 'Example',       bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
    { type: 'framework',    label: 'Framework',     bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25' },
    { type: 'strategy',     label: 'Strategy',      bg: 'bg-teal-500/15 text-teal-300 border-teal-500/25' },
    { type: 'reflection',   label: 'Reflection',    bg: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
  ],

  extraCSS: `
  /* Education: specialized blocks */
  .framework { background: rgba(99,102,241,0.1); border-left: 4px solid #6366f1; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
  .framework h3 { color: #a5b4fc; }
  .strategy { background: rgba(20,184,166,0.08); border-left: 4px solid #14b8a6; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
  .strategy h3 { color: #5eead4; }
  .reflection { background: rgba(244,63,94,0.08); border-left: 4px solid #f43f5e; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; font-style: italic; }
  .reflection h3 { color: #fb7185; font-style: normal; }
  .lesson-plan { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 1em; line-height: 1.6; white-space: pre; overflow-x: auto; margin: 16px 0; color: #93c5fd; }`,

  systemPromptRules: `7. Use <div class="framework"> for pedagogical frameworks and models (Bloom's Taxonomy, UDL, Constructivism, etc.)
8. Use <div class="strategy"> for teaching strategies, instructional techniques, and classroom management approaches
9. Use <div class="reflection"> for reflective prompts and critical thinking questions for educators
10. Use <div class="lesson-plan">, <div class="diagram">, or <div class="svg-diagram"> for lesson plan structures, curriculum maps, and instructional design flowcharts when appropriate
11. Include at least 2 key-idea boxes for foundational educational principles and 1 warning for common pedagogical pitfalls
12. Use comparison tables for contrasting teaching methods, assessment types, or learning theories
13. Use step-by-step reveal (class="step") for multi-phase instructional models and lesson planning sequences
14. Include real-world classroom scenarios and evidence-based practice examples
15. Reference research and landmark studies where relevant (e.g., Hattie's effect sizes, Vygotsky's ZPD)`,

  qualityChecklist: `- At least 2 framework blocks (pedagogical models or theories)
- At least 1 strategy block with actionable teaching techniques
- At least 1 comparison table (methods, assessments, or theories)
- Proper educational terminology introduced with clear definitions
- Last slide is a summary/cheat sheet`,

  outlinePromptFragment: `Suggestion types for slides: visual, analogy, depth, warning, example, framework, strategy, reflection.
Focus on pedagogical frameworks, evidence-based teaching strategies, assessment design, and connecting theory to classroom practice.`,

  visualDescription: 'inline SVG learning model diagrams, Bloom\'s taxonomy pyramids, curriculum flowcharts, and instructional design frameworks',

  pedagogicalFlow: 'theory → framework → strategies → assessment → classroom application → reflection → summary',

  exampleTopics: [
    'Bloom\'s Taxonomy & Learning Objectives',
    'Differentiated Instruction',
    'Formative vs Summative Assessment',
    'Universal Design for Learning (UDL)',
    'Constructivism in the Classroom',
  ],

  featureHighlights: [
    'Framework blocks',
    'Teaching strategies',
    'Reflective prompts',
  ],
};

export default education;
