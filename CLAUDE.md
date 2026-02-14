# Slide Generator App

## What This Is

A discipline-aware, outline-driven, streaming HTML slide deck generator. Users upload PPTX/PDF or enter a topic, review a structured outline, then generate a self-contained interactive HTML presentation — all powered by Claude via AWS Bedrock.

## Quick Reference

```
npm run dev          # Dev server (localhost:3000)
npx tsc --noEmit     # Type check
npx next build       # Production build
```

**Environment:** `.env.local` with `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
**Model:** `us.anthropic.claude-sonnet-4-20250514-v1:0` via `@anthropic-ai/bedrock-sdk`

---

## Architecture Overview

```
Browser
  │
  ├─ POST /api/outline ──→ Claude generates JSON outline
  │                         Store in outlineStore (in-memory, 5min TTL)
  │   GET /api/outline/status/[id] ──→ Poll until complete
  │
  ├─ OutlineReview UI ──→ User toggles slides, accepts/rejects suggestions, adds notes
  │
  ├─ POST /api/generate ──→ Claude streams HTML deck (fire-and-forget)
  │                          Progress tracked via regex slide counting
  │   GET /api/generate/status/[id] ──→ Poll every 1.5s
  │
  ├─ /preview/[id] ──→ iframe loads /api/slides/[id]
  └─ /gallery ──→ Lists all decks from data/generated/
```

## Key Design Patterns

### 1. Two-Phase Generation (Outline → Deck)

Don't generate directly from user input. Instead:
1. **Phase 1:** Claude generates a structured JSON outline with teaching suggestions
2. **User reviews:** Toggle slides on/off, accept/reject suggestions, add per-slide notes, reorder
3. **Phase 2:** Claude generates the HTML deck constrained to the approved outline

**Why:** Gives users transparency and control. They see what will be generated before committing compute. The constrained prompt (`buildOutlineConstrainedPrompt`) feeds back every approved slide title, bullet, suggestion, and user note — so Claude follows the structure exactly.

### 2. Discipline System (Extensible Config-Driven Customization)

Each academic discipline is a single config object (`DisciplineConfig` in `src/lib/disciplines/types.ts`) that customizes:

| Field | What It Does |
|---|---|
| `extraCSS` | Injected into the HTML template before `</style>` |
| `systemPromptRules` | Appended to Claude's system prompt (numbered rules) |
| `qualityChecklist` | Appended after rules for self-validation |
| `visualDescription` | Interpolated into user prompt to guide visual output |
| `suggestionTypes` | Available teaching suggestion types for outlines |
| `pedagogicalFlow` | Guides outline structure (e.g., `intro → fundamentals → depth → examples → summary`) |
| `outlinePromptFragment` | Extra instructions for outline generation |
| `exampleTopics` | UI placeholder examples |

**To add a new discipline:** Create `src/lib/disciplines/newdiscipline.ts`, export a `DisciplineConfig`, register it in `src/lib/disciplines/index.ts`. No core logic changes needed.

**Current disciplines (10):** CS, Math, Physics, Biology, Chemistry, History, Literature, Economics, Nursing, Education

### 3. Self-Contained HTML Output

Generated decks are single HTML files with zero external dependencies:
- All CSS inline in `<style>`
- All JS inline in `<script>`
- No CDN fonts, no framework bundles
- Dark theme (`#0f172a` background, Tailwind-style color palette)
- Keyboard navigation (arrows, spacebar, `s` for step reveal)
- Progress bar, slide numbers, prev/next buttons

**Template lives in:** `src/lib/template.ts` (`SLIDE_TEMPLATE`)
**CSS injection:** `buildTemplate(discipline)` splices `discipline.extraCSS` before `</style>`

### 4. Streaming + Polling (Simple Real-Time Progress)

Instead of SSE/WebSockets:
- `POST /api/generate` fires Claude streaming in the background, returns `{ slideId }` immediately
- Client polls `GET /api/generate/status/[id]` every 1.5s
- Server counts slides via regex (`/id="s\d+"/g`) on the accumulating response
- Progress store is an in-memory `Map` with 60s cleanup after completion

**Why polling over SSE:** Simpler, works with serverless, easier to debug. 1.5s latency is negligible vs. 30-60s total generation time.

### 5. Filesystem Storage (No Database)

- Decks saved to `data/generated/{id}.html` + `{id}.meta.json`
- `listSlides()` reads all `.meta.json` files, sorted by `createdAt` desc
- `cleanupOldSlides(maxAgeMs)` deletes decks older than 48h
- ID validation: `/^[a-f0-9-]+$/` (UUID format, prevents path traversal)

### 6. Dual Diagram System (SVG + ASCII)

Both inline SVG and ASCII art are supported. The system prompt guides Claude on when to use each:

**Use SVG (`<div class="svg-diagram">`)** for:
- Flowcharts, decision trees, timelines
- Graphs with curves (supply-demand, function plots)
- Molecular structures, anatomical diagrams, circuit schematics
- Character relationship maps, Venn diagrams

**Use ASCII (`<div class="diagram">`)** for:
- Code output, algorithm traces
- Simple box-and-arrow layouts, tree structures
- Text-heavy diagrams where monospace alignment matters

**SVG rules in the system prompt:**
- Always use `viewBox`, never fixed `width`/`height`
- Dark-theme colors: `stroke="#94a3b8"`, `fill="#1e293b"` (shapes), `fill="#e2e8f0"` (text)
- Accent colors: `#3b82f6` (blue), `#8b5cf6` (purple), `#10b981` (green), `#f59e0b` (amber)
- All paths/shapes inline — no external SVG references

---

## File Map

```
src/
├── app/
│   ├── api/
│   │   ├── outline/route.ts          # POST: start outline generation
│   │   ├── outline/status/[id]/route.ts  # GET: poll outline progress
│   │   ├── generate/route.ts         # POST: start deck generation
│   │   ├── generate/status/[id]/route.ts # GET: poll deck progress
│   │   ├── gallery/route.ts          # GET: list all decks
│   │   └── slides/[id]/route.ts      # GET: serve deck HTML, HEAD: metadata
│   ├── generate/page.tsx             # Generation UI (multi-phase)
│   ├── gallery/page.tsx              # Gallery grid (server-rendered)
│   ├── preview/[id]/page.tsx         # Preview page (iframe)
│   ├── page.tsx                      # Homepage
│   └── layout.tsx                    # Root layout
│
├── components/
│   ├── DisciplineSelector.tsx        # Grid of discipline buttons
│   ├── UploadForm.tsx                # Drag-drop file upload
│   ├── TopicForm.tsx                 # Topic + level + notes input
│   ├── OutlineReview.tsx             # Interactive outline editor
│   ├── GenerationProgress.tsx        # Progress bar + polling
│   ├── GalleryCard.tsx               # Deck thumbnail card
│   ├── SlidePreview.tsx              # iframe wrapper
│   └── Header.tsx                    # Navigation
│
├── lib/
│   ├── claude.ts                     # Claude API: buildSystemPrompt, generateSlides, generateOutline
│   ├── template.ts                   # HTML template, CSS injection, quality checklists
│   ├── storage.ts                    # Filesystem read/write for decks
│   ├── progress.ts                   # In-memory progress tracking (Map)
│   ├── extract-pptx.ts              # JSZip-based PPTX text extraction
│   ├── extract-pdf.ts               # pdf-parse PDF text extraction
│   ├── types.ts                      # SlideOutline, ApprovedOutline, etc.
│   └── disciplines/
│       ├── types.ts                  # DisciplineConfig interface
│       ├── index.ts                  # Registry: DISCIPLINES map + getDiscipline()
│       ├── cs.ts                     # Computer Science
│       ├── math.ts                   # Mathematics
│       ├── physics.ts                # Physics
│       ├── biology.ts                # Biology
│       ├── chemistry.ts              # Chemistry
│       ├── history.ts                # History
│       ├── literature.ts             # Literature
│       ├── economics.ts              # Economics
│       ├── nursing.ts                # Nursing
│       └── education.ts             # Education
```

---

## Prompt Engineering Patterns

### Layered System Prompt Composition

The system prompt is assembled from multiple sources:

```
buildSystemPrompt(discipline) =
  1. Role description ("expert educational slide deck generator")
  2. Full HTML template (with discipline CSS injected)
  3. Numbered rules 1-6 (shared structural rules)
  4. SVG diagram guidance block (shared)
  5. discipline.systemPromptRules (numbered rules 7+)
  6. buildQualityChecklist(discipline) = shared checks + discipline.qualityChecklist
```

### User Prompt Variants

Three paths depending on mode:
- **Upload mode:** "Convert the following presentation content into... enhanced with `${discipline.visualDescription}`..."
- **Topic mode:** "Create an interactive HTML teaching slide deck about... with `${discipline.visualDescription}`..."
- **Outline-constrained:** Slide-by-slide outline with accepted suggestions and user notes

### Quality Checklist as Self-Validation

The checklist at the end of the system prompt acts as Claude's self-check before finishing. Shared checks (slide IDs sequential, no external deps, SVG viewBox) + discipline checks (min diagram count, required block types).

---

## Conventions

- **Next.js 16 App Router** with React 19 and Tailwind CSS 4
- **`output: 'standalone'`** in next.config for Docker deployment
- **`serverExternalPackages: ['pdf-parse']`** — don't bundle native deps
- **Dark theme everywhere** — both the app UI and generated slides
- **No database** — filesystem storage + in-memory Maps for transient state
- **UUID IDs** validated with `/^[a-f0-9-]+$/` for path safety
- **Polling pattern** for async operations (1.5s interval)
- **Fire-and-forget** generation with progress callbacks

---

## Lessons Learned

1. **Config-driven customization scales.** The discipline system lets you add entirely new visual/prompt behaviors without touching core logic. A new discipline is ~60 lines of config.

2. **Two-phase generation is worth the complexity.** Users get a preview, can reshape the output, and the constrained prompt produces much more predictable results.

3. **Self-contained HTML is a superpower.** No deployment needed — the output file works anywhere. This also means Claude must generate everything inline (CSS, JS, SVGs).

4. **Give Claude a full template, not just instructions.** Embedding the actual HTML/CSS template in the system prompt produces far more consistent output than describing what you want.

5. **Inline SVGs complement ASCII art.** SVGs handle curves, colors, and complex layouts that ASCII can't. ASCII handles code-like content where monospace alignment matters. Both belong in the system prompt.

6. **Quality checklists in the prompt work.** Claude actually uses them for self-validation. Measurably reduces structural bugs (wrong slide count, missing elements).

7. **Regex-based progress tracking on streaming output** is a pragmatic hack. Counting `id="sN"` patterns as they appear gives real-time slide progress without parsing partial HTML.

8. **In-memory stores need TTL cleanup.** Both `outlineStore` (5min) and `progressStore` (60s post-completion) use `setTimeout` to prevent memory leaks.
