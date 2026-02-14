export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  preview: { bg: string; text: string; accent: string };
  css: string;
  svgColors: {
    stroke: string;
    shapeFill: string;
    textFill: string;
    accents: string[];
  };
  promptHint: string;
}

export interface LayoutConfig {
  id: string;
  name: string;
  description: string;
  preview: { icon: string };
  css: string;
  promptHint: string;
}
