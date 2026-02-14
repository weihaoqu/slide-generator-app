import type { DisciplineConfig } from './types';

const nursing: DisciplineConfig = {
  id: 'nursing',
  name: 'Nursing',
  icon: '🩺',
  tagline: 'Patient care, clinical reasoning, and health sciences',

  suggestionTypes: [
    { type: 'visual',        label: 'Visual',        bg: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
    { type: 'analogy',       label: 'Analogy',       bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
    { type: 'depth',         label: 'Depth',         bg: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
    { type: 'warning',       label: 'Warning',       bg: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
    { type: 'example',       label: 'Example',       bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
    { type: 'clinical',      label: 'Clinical',      bg: 'bg-red-500/15 text-red-300 border-red-500/25' },
    { type: 'assessment',    label: 'Assessment',    bg: 'bg-teal-500/15 text-teal-300 border-teal-500/25' },
    { type: 'intervention',  label: 'Intervention',  bg: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
    { type: 'pharmacology',  label: 'Pharm',         bg: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
  ],

  extraCSS: `
  /* Nursing: specialized blocks */
  .clinical-scenario { background: rgba(239,68,68,0.08); border-left: 4px solid #ef4444; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
  .clinical-scenario h3 { color: #fca5a5; }
  .nursing-process { background: #1e293b; border: 1px solid #065f46; border-radius: 12px; padding: 24px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 1em; line-height: 1.6; white-space: pre; overflow-x: auto; margin: 16px 0; color: #6ee7b7; }
  .med-info { background: rgba(168,85,247,0.08); border-left: 4px solid #a855f7; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
  .med-info h3 { color: #c084fc; }
  .safety-alert { background: rgba(239,68,68,0.12); border: 2px solid #dc2626; border-radius: 12px; padding: 20px 24px; margin: 16px 0; }
  .safety-alert h3 { color: #f87171; }`,

  systemPromptRules: `7. Use <div class="clinical-scenario"> for patient case studies and clinical scenarios with relevant vitals and history
8. Use <div class="nursing-process">, <div class="diagram">, or <div class="svg-diagram"> for flowcharts of the nursing process (Assessment → Diagnosis → Planning → Implementation → Evaluation) when appropriate
9. Use <div class="med-info"> for pharmacology details including drug class, mechanism, dosing considerations, side effects, and nursing implications
10. Use <div class="safety-alert"> for critical safety information, contraindications, and "never events"
11. Include at least 2 key-idea boxes for core nursing concepts and 1 warning for common clinical errors
12. Use comparison tables for differentiating similar conditions, medications, or assessment findings
13. Use step-by-step reveal (class="step") for multi-step clinical procedures, assessment sequences, and prioritization exercises
14. Include evidence-based practice references and NCLEX-style critical thinking prompts where appropriate
15. Use mnemonics and memory aids for complex clinical content (e.g., ABCDE assessment, SBAR communication)`,

  qualityChecklist: `- At least 2 clinical scenario blocks
- At least 1 pharmacology/med-info block
- At least 1 safety alert for critical nursing considerations
- Proper medical terminology with layperson explanations
- Last slide is a summary/cheat sheet`,

  outlinePromptFragment: `Suggestion types for slides: visual, analogy, depth, warning, example, clinical, assessment, intervention, pharmacology.
Focus on clinical reasoning, patient assessment frameworks, nursing interventions, pharmacology, and NCLEX-style critical thinking.`,

  visualDescription: 'inline SVG nursing process flowcharts, anatomy diagrams, assessment algorithms, and clinical decision trees',

  pedagogicalFlow: 'pathophysiology → assessment → diagnosis → planning → interventions → evaluation → summary',

  exampleTopics: [
    'Heart Failure Nursing Care',
    'Diabetes Management',
    'Pediatric Assessment',
    'Pharmacology: Anticoagulants',
    'Wound Care & Healing',
  ],

  featureHighlights: [
    'Clinical scenarios',
    'Nursing process flows',
    'Safety alerts',
  ],
};

export default nursing;
