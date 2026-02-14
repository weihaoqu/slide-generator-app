/**
 * Extracted slide CSS — importable from both server and client components.
 * This is the CSS from SLIDE_TEMPLATE without any server-only dependencies.
 */
export const SLIDE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; }

  /* Slide system */
  .slide { display: none; min-height: 100vh; padding: 40px 60px; position: relative; }
  .slide.active { display: flex; flex-direction: column; justify-content: center; }
  .slide-number { position: absolute; bottom: 20px; right: 40px; color: #64748b; font-size: 14px; }

  /* Navigation */
  .nav { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; z-index: 100; }
  .nav button { background: #334155; border: 1px solid #475569; color: #e2e8f0; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
  .nav button:hover { background: #475569; }
  .nav button:disabled { opacity: 0.3; cursor: not-allowed; }
  .progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, #3b82f6, #8b5cf6); transition: width 0.3s; z-index: 100; }

  /* Typography */
  h1 { font-size: 2.8em; margin-bottom: 20px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.2; }
  h2 { font-size: 2em; margin-bottom: 16px; color: #93c5fd; }
  h3 { font-size: 1.4em; margin-bottom: 12px; color: #a5b4fc; }
  p, li { font-size: 1.15em; line-height: 1.7; color: #cbd5e1; margin-bottom: 10px; }
  .subtitle { font-size: 1.3em; color: #94a3b8; margin-bottom: 30px; }

  /* Layout helpers */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
  .center { text-align: center; }
  .mt { margin-top: 20px; }
  .mb { margin-bottom: 20px; }

  /* Code / diagram blocks */
  .diagram { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 1em; line-height: 1.6; white-space: pre; overflow-x: auto; margin: 16px 0; color: #a5f3fc; }
  .diagram.small { font-size: 0.85em; }

  /* Inline SVG diagrams */
  .svg-diagram { margin: 16px 0; text-align: center; overflow-x: auto; }
  .svg-diagram svg { max-width: 100%; height: auto; }
  .svg-diagram figcaption { font-size: 0.9em; color: #94a3b8; margin-top: 8px; }

  /* Highlight boxes */
  .key-idea { background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15)); border-left: 4px solid #3b82f6; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
  .key-idea h3 { margin-bottom: 8px; }
  .warning { background: rgba(245,158,11,0.12); border-left: 4px solid #f59e0b; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
  .warning h3 { color: #fbbf24; }
  .analogy { background: rgba(16,185,129,0.12); border-left: 4px solid #10b981; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
  .analogy h3 { color: #34d399; }

  /* Table */
  table { border-collapse: collapse; margin: 16px 0; width: auto; }
  th, td { border: 1px solid #475569; padding: 10px 16px; text-align: center; }
  th { background: #334155; color: #93c5fd; font-weight: 600; }
  td { background: #1e293b; color: #e2e8f0; }
  tr.highlight td { background: rgba(59,130,246,0.2); }

  /* Animations */
  .fade-in { animation: fadeIn 0.5s ease-in; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  /* Step-by-step reveal */
  .step { opacity: 0.25; transition: opacity 0.4s; margin: 8px 0; padding: 8px 12px; border-radius: 8px; }
  .step.revealed { opacity: 1; background: rgba(59,130,246,0.08); }

  .emoji { font-size: 1.5em; margin-right: 8px; }

  ul { padding-left: 24px; }
  ul li { margin-bottom: 8px; }
`;
