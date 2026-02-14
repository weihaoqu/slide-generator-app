import type { LayoutConfig } from '../types';

const playful: LayoutConfig = {
  id: 'playful',
  name: 'Playful',
  description: 'Rounded corners, bigger emojis, loose spacing',
  preview: { icon: '\u2728' },
  css: `
  .slide { padding: 44px 64px; }
  h1 { font-size: 2.6em; }
  p, li { font-size: 1.2em; line-height: 1.85; }
  .diagram { border-radius: 20px; padding: 28px; }
  .key-idea, .warning, .analogy { border-radius: 0 20px 20px 0; padding: 24px 28px; margin: 20px 0; }
  .emoji { font-size: 2em; margin-right: 10px; }
  .nav button { border-radius: 14px; }
  table { border-radius: 12px; overflow: hidden; }
  ul li { margin-bottom: 10px; }
  `,
  promptHint: 'Friendly approachable tone, use emojis and analogies generously. Make learning fun.',
};

export default playful;
