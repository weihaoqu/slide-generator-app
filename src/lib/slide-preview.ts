import { SLIDE_CSS } from './slide-css';

/**
 * Build an iframe srcdoc that renders a slide fragment at a fixed 1280×720
 * "virtual viewport" and scales it to fit whatever iframe size it's placed in.
 * This ensures the full slide is always visible — no clipping.
 */
export function buildSlideSrcdoc(fragment: string, disciplineCSS: string = ''): string {
  return `<!DOCTYPE html>
<html><head><style>
${SLIDE_CSS}
${disciplineCSS}
body { margin: 0; overflow: hidden; background: #0f172a; }
.slide-scaler {
  width: 1280px;
  height: 720px;
  transform-origin: 0 0;
  overflow: hidden;
  position: relative;
}
.slide {
  display: flex !important;
  flex-direction: column;
  justify-content: center;
  min-height: 720px !important;
  max-height: 720px;
  padding: 40px 60px;
  overflow: hidden;
}
.slide-number { display: none; }
</style></head>
<body>
<div class="slide-scaler">${fragment}</div>
<script>
(function() {
  function rescale() {
    var el = document.querySelector('.slide-scaler');
    if (!el) return;
    var scaleX = window.innerWidth / 1280;
    var scaleY = window.innerHeight / 720;
    var scale = Math.min(scaleX, scaleY);
    el.style.transform = 'scale(' + scale + ')';
  }
  rescale();
  window.addEventListener('resize', rescale);
})();
</script>
</body></html>`;
}
