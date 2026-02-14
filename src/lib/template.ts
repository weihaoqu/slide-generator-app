import { SLIDE_CSS } from './slide-css';

export const SLIDE_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TOPIC_TITLE - A Student-Friendly Guide</title>
<style>
${SLIDE_CSS}
</style>
</head>
<body>

<div class="progress" id="progress"></div>

<!-- SLIDES GO HERE -->

<!-- Navigation -->
<div class="nav">
  <button id="prevBtn" onclick="changeSlide(-1)">&larr; Prev</button>
  <button id="nextBtn" onclick="changeSlide(1)">Next &rarr;</button>
</div>

<script>
const totalSlides = TOTAL_SLIDES;
let current = 1;

function showSlide(n) {
  document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
  const slide = document.getElementById('s' + n);
  if (slide) {
    slide.classList.add('active');
    slide.classList.add('fade-in');
  }
  document.getElementById('prevBtn').disabled = (n === 1);
  document.getElementById('nextBtn').disabled = (n === totalSlides);
  document.getElementById('progress').style.width = ((n / totalSlides) * 100) + '%';
}

function changeSlide(delta) {
  const next = current + delta;
  if (next >= 1 && next <= totalSlides) {
    current = next;
    showSlide(current);
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
    e.preventDefault();
    changeSlide(1);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    changeSlide(-1);
  } else if (e.key === 's' || e.key === 'S') {
    const slide = document.getElementById('s' + current);
    const steps = slide.querySelectorAll('.step:not(.revealed)');
    if (steps.length > 0) steps[0].classList.add('revealed');
  }
});

showSlide(1);
</script>
</body>
</html>`;

export const QUALITY_CHECKLIST = `
Quality Checklist for generated slide decks:
- totalSlides constant matches actual slide count
- All slide IDs are sequential: s1, s2, ..., sN
- All slide-number divs have correct numbers
- First slide has class="slide active", all others have class="slide"
- All < and > in diagram blocks use &lt; and &gt;
- At least 2 key-idea boxes, 1 warning box, 1 analogy box
- At least 2 two-column layouts
- At least 1 comparison table
- Last slide is a summary/cheat sheet
- No external dependencies (fonts, CSS, JS — all inline)
`;

import type { DisciplineConfig } from './disciplines/types';

/** CSS class reference for per-slide prompts */
export const AVAILABLE_CSS_CLASSES = `Available CSS classes:
- .two-col: 2-column grid layout
- .diagram: monospace code/ASCII art block (use .diagram.small for compact)
- .svg-diagram: centered SVG container with figcaption
- .key-idea: blue-bordered highlight box (h3 + content)
- .warning: amber-bordered caution box
- .analogy: green-bordered analogy box
- .step: step-by-step reveal element (hidden until 's' key pressed)
- .center: centered text
- .mt / .mb: margin-top / margin-bottom
- table with th/td: data tables (tr.highlight for emphasis)
- .emoji: larger emoji prefix`;

/** SVG guidance block (only included when includeSvg=true) */
export const SVG_GUIDANCE = `SVG DIAGRAMS:
- Wrap in <div class="svg-diagram">
- Use viewBox, never fixed width/height
- Dark-theme: stroke="#94a3b8", fill="#1e293b" (shapes), fill="#e2e8f0" (text)
- Accents: #3b82f6 (blue), #8b5cf6 (purple), #10b981 (green), #f59e0b (amber)
- Add <figcaption> for labels`;

/** Inject discipline-specific CSS into the shared template. */
export function buildTemplate(discipline: DisciplineConfig): string {
  if (!discipline.extraCSS) return SLIDE_TEMPLATE;
  return SLIDE_TEMPLATE.replace('</style>', `${discipline.extraCSS}\n</style>`);
}

const SHARED_QUALITY_CHECKS = `
Quality Checklist for generated slide decks:
- totalSlides constant matches actual slide count
- All slide IDs are sequential: s1, s2, ..., sN
- All slide-number divs have correct numbers
- First slide has class="slide active", all others have class="slide"
- All < and > in diagram blocks use &lt; and &gt;
- No external dependencies (fonts, CSS, JS — all inline)
- All inline SVGs use viewBox and have no fixed width/height
- SVGs use dark-theme colors (light strokes/text on dark backgrounds)`;

/** Combine shared structural checks with discipline-specific content checks. */
export function buildQualityChecklist(discipline: DisciplineConfig): string {
  return `${SHARED_QUALITY_CHECKS}\n${discipline.qualityChecklist}`;
}
