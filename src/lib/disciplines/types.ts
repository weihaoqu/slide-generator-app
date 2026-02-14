export interface SuggestionTypeConfig {
  type: string;
  label: string;
  bg: string;
}

export interface DisciplineConfig {
  id: string;
  name: string;
  icon: string;
  tagline: string;

  suggestionTypes: SuggestionTypeConfig[];
  extraCSS: string;
  systemPromptRules: string;
  qualityChecklist: string;
  outlinePromptFragment: string;
  visualDescription: string;
  pedagogicalFlow: string;
  exampleTopics: string[];
  featureHighlights: string[];
}
