import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';
import { buildTemplate, buildQualityChecklist, AVAILABLE_CSS_CLASSES, buildSvgGuidance, SVG_GUIDANCE } from './template';
import { getDiscipline } from './disciplines';
import { getTheme, getLayout } from './themes';
import type { ThemeConfig } from './themes/types';
import type { LayoutConfig } from './themes/types';
import type { DisciplineConfig } from './disciplines/types';
import type { SlideOutline, ApprovedOutline, OutlineSlide, TeachingSuggestion, ContentSuggestion } from './types';

const client = new AnthropicBedrock({
  awsRegion: process.env.AWS_REGION || 'us-east-1',
});

// Haiku for fast structured tasks (outline JSON, summarization)
// Sonnet for quality-critical generation (full HTML slide decks)
const FAST_MODEL = 'us.anthropic.claude-3-5-haiku-20241022-v1:0';
const QUALITY_MODEL = 'us.anthropic.claude-sonnet-4-20250514-v1:0';

function buildSystemPrompt(discipline: DisciplineConfig, theme?: ThemeConfig, layout?: LayoutConfig): string {
  const template = buildTemplate(discipline, theme, layout);
  const checklist = buildQualityChecklist(discipline);
  const svgGuidance = buildSvgGuidance(theme);
  const svgColors = theme?.svgColors || { stroke: '#94a3b8', shapeFill: '#1e293b', textFill: '#e2e8f0' };

  const promptHints: string[] = [];
  if (theme?.promptHint) promptHints.push(theme.promptHint);
  if (layout?.promptHint) promptHints.push(layout.promptHint);
  const hintBlock = promptHints.length > 0 ? `\nSTYLE GUIDANCE:\n${promptHints.map(h => `- ${h}`).join('\n')}\n` : '';

  return `You are an expert educational slide deck generator. You create interactive HTML teaching slide decks that are visually polished, pedagogically effective, and self-contained.

You MUST output a COMPLETE, valid HTML file. Do not output anything before <!DOCTYPE html> or after </html>. No markdown, no explanation — just the raw HTML.

Use this exact HTML/CSS/JS template structure:

${template}

RULES:
1. Replace TOPIC_TITLE with the actual topic title
2. Replace TOTAL_SLIDES with the actual number of slides
3. Replace the placeholder slides with real content
4. First slide must have class="slide active", all others just class="slide"
5. Each slide must have id="sN" where N is the sequential slide number
6. Each slide must have a <div class="slide-number">N</div>

INLINE SVG DIAGRAMS:
- Generate <svg> elements directly for rich visual diagrams — flowcharts, graphs, trees, geometric figures, molecular structures, circuit schematics, timelines, Venn diagrams
- Wrap each SVG in <div class="svg-diagram"> for centering and responsiveness
- Use theme colors in SVGs: stroke="${svgColors.stroke}" for lines, fill="${svgColors.shapeFill}" for shapes, fill="${svgColors.textFill}" for text
- Always set viewBox on <svg>, never fixed width/height
- Add <figcaption> after the SVG inside the wrapper for labels when helpful
- Keep using <div class="diagram"> for ASCII art when monospace text is clearer (code output, algorithm traces, simple box-and-arrow layouts)
- No external SVG references — all paths and shapes must be inline
${hintBlock}
${discipline.systemPromptRules}

${checklist}`;
}

// --- Outline generation ---

function buildOutlineSystemPrompt(discipline: DisciplineConfig): string {
  const typeList = discipline.suggestionTypes.map(s => s.type).join(' | ');

  return `You are an expert educational curriculum designer. Given a topic (or extracted presentation content), produce a structured JSON outline for a teaching slide deck.

Return ONLY valid JSON matching this exact schema — no markdown, no explanation, no code fences:

{
  "topic": "string — the main topic title",
  "courseLevel": "string — Introductory | Intermediate | Advanced | Graduate",
  "estimatedSlideCount": number,
  "summary": "string — 1-2 sentence overview of the deck's approach",
  "slides": [
    {
      "slideNumber": number,
      "title": "string — slide title",
      "bullets": ["string — key point 1", "string — key point 2"],
      "suggestions": [
        {
          "type": "${typeList}",
          "text": "string — what to add and why"
        }
      ]
    }
  ],
  "contentSuggestions": [
    {
      "action": "add | skip | expand",
      "description": "string — what to add/skip/expand and why"
    }
  ]
}

Guidelines:
- Produce 15-30 slides depending on topic depth
- Each slide should have 2-5 bullet points
- Include 1-3 teaching suggestions per slide
- contentSuggestions are deck-level recommendations (e.g. "add a comparison table slide", "skip low-level implementation details")
- For uploaded content, preserve the original structure but suggest enhancements
- Aim for a pedagogically sound flow: ${discipline.pedagogicalFlow}
${discipline.outlinePromptFragment}`;
}

// --- Per-slide generation (incremental) ---

function buildSlideSystemPrompt(discipline: DisciplineConfig, includeSvg: boolean, theme?: ThemeConfig, layout?: LayoutConfig): string {
  const svgBlock = includeSvg ? buildSvgGuidance(theme) : 'Do NOT use inline SVG. Use <div class="diagram"> for ASCII art only.';

  const promptHints: string[] = [];
  if (theme?.promptHint) promptHints.push(theme.promptHint);
  if (layout?.promptHint) promptHints.push(layout.promptHint);
  const hintBlock = promptHints.length > 0 ? `\nSTYLE GUIDANCE:\n${promptHints.map(h => `- ${h}`).join('\n')}\n` : '';

  return `You generate single HTML slide fragments for a teaching presentation.
Output ONLY the <div id="sN" class="slide">...</div> block. No <!DOCTYPE>, no <html>, no <style>, no <script>.

${AVAILABLE_CSS_CLASSES}

${svgBlock}
${hintBlock}
${discipline.systemPromptRules}

Rules:
- Include a <div class="slide-number">N / TOTAL</div> at the bottom
- Use class="slide active" for slide 1, class="slide" for all others
- All < and > in diagram blocks must use &lt; and &gt;
- No external dependencies`;
}

async function generateSlideContent(
  slideIndex: number,
  totalSlides: number,
  slide: OutlineSlide,
  discipline: DisciplineConfig,
  includeSvg: boolean,
  model: string,
  prevSlideTitle?: string,
  theme?: ThemeConfig,
  layout?: LayoutConfig,
): Promise<string> {
  const slideNum = slideIndex + 1;
  const isFirst = slideIndex === 0;
  const systemPrompt = buildSlideSystemPrompt(discipline, includeSvg, theme, layout);

  const acceptedSuggestions = slide.suggestions.filter(s => s.accepted);

  let userPrompt = `Generate slide ${slideNum} of ${totalSlides}.

Title: "${slide.title}"
${isFirst ? 'This is the FIRST slide — use class="slide active".' : 'Use class="slide".'}
Slide ID: id="s${slideNum}"
Slide number div: <div class="slide-number">${slideNum} / ${totalSlides}</div>
${prevSlideTitle ? `Previous slide was: "${prevSlideTitle}"` : ''}

Key points:
${slide.bullets.map(b => `  - ${b}`).join('\n')}`;

  if (acceptedSuggestions.length > 0) {
    userPrompt += `\n\nTeaching enhancements to include:`;
    acceptedSuggestions.forEach(s => {
      userPrompt += `\n  [${s.type}] ${s.text}`;
    });
  }

  if (slide.userNotes.trim()) {
    userPrompt += `\n\nInstructor notes: ${slide.userNotes}`;
  }

  userPrompt += `\n\nOutput ONLY the <div id="s${slideNum}" class="slide${isFirst ? ' active' : ''}">...</div> block.`;

  const response = await callWithTimeout(
    (signal) =>
      client.messages.create(
        {
          model,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        },
        { signal },
      ),
    30_000,
    `Slide ${slideNum} generation`,
  );

  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error(`No text in response for slide ${slideNum}`);
  }

  return textBlock.text.trim();
}

async function generateSlideNotes(
  slideNum: number,
  slideHtml: string,
  slide: OutlineSlide,
  discipline: DisciplineConfig,
): Promise<string> {
  const truncatedHtml = slideHtml.length > 2000 ? slideHtml.slice(0, 2000) + '...' : slideHtml;

  const response = await callWithTimeout(
    (signal) =>
      client.messages.create(
        {
          model: FAST_MODEL,
          max_tokens: 300,
          system: `You write concise lecture notes for teachers. For each slide, provide:
- 3-5 talking points (what to say, not what's on the slide)
- Approximate timing
- One engagement tip (question to ask, demo to show, or activity)
Keep it brief and actionable. Output plain text, no markdown headers.`,
          messages: [{
            role: 'user',
            content: `Slide ${slideNum}: "${slide.title}"
Bullets: ${slide.bullets.join('; ')}
Discipline: ${discipline.id}

HTML fragment (for context):
${truncatedHtml}`,
          }],
        },
        { signal },
      ),
    15_000,
    `Notes for slide ${slideNum}`,
  );

  const textBlock = response.content.find(b => b.type === 'text');
  return textBlock && textBlock.type === 'text' ? textBlock.text.trim() : '';
}

function assembleSlideHtml(
  fragments: string[],
  topic: string,
  discipline: DisciplineConfig,
  theme?: ThemeConfig,
  layout?: LayoutConfig,
): string {
  const template = buildTemplate(discipline, theme, layout);
  return template
    .replace('TOPIC_TITLE', topic)
    .replace('TOTAL_SLIDES', String(fragments.length))
    .replace('<!-- SLIDES GO HERE -->', fragments.join('\n\n'));
}

// --- Legacy monolithic generation (fallback for non-outline mode) ---

function buildOutlineConstrainedPrompt(approved: ApprovedOutline): string {
  const enabledSlides = approved.slides.filter(s => s.enabled);
  const acceptedSuggestions = approved.contentSuggestions.filter(s => s.accepted);

  let prompt = `Generate an interactive HTML teaching slide deck following this EXACT outline. Do not deviate from this structure.

Topic: ${approved.topic || 'See outline'}
Course level: ${approved.courseLevel || 'Introductory'}
Total slides: ${enabledSlides.length}

SLIDE-BY-SLIDE OUTLINE:
`;

  enabledSlides.forEach((slide, i) => {
    const num = i + 1;
    prompt += `\n--- Slide ${num}: "${slide.title}" ---\n`;
    prompt += `Key points:\n`;
    slide.bullets.forEach(b => { prompt += `  - ${b}\n`; });

    const acceptedSlideSuggestions = slide.suggestions.filter(s => s.accepted);
    if (acceptedSlideSuggestions.length > 0) {
      prompt += `Teaching enhancements to include:\n`;
      acceptedSlideSuggestions.forEach(s => {
        prompt += `  [${s.type}] ${s.text}\n`;
      });
    }

    if (slide.userNotes.trim()) {
      prompt += `Instructor notes: ${slide.userNotes}\n`;
    }
  });

  if (acceptedSuggestions.length > 0) {
    prompt += `\nDECK-LEVEL INSTRUCTIONS:\n`;
    acceptedSuggestions.forEach(s => {
      prompt += `  [${s.action}] ${s.description}\n`;
    });
  }

  if (approved.extractedText) {
    const MAX_REF_CHARS = 4000;
    const ref = approved.extractedText.length > MAX_REF_CHARS
      ? approved.extractedText.slice(0, MAX_REF_CHARS) + '\n[...truncated]'
      : approved.extractedText;
    prompt += `\nSOURCE CONTENT (brief reference for accuracy):\n${ref}\n`;
  }

  prompt += `\nOutput ONLY the complete HTML file.`;
  return prompt;
}

function buildUserPrompt(params: {
  mode: 'upload' | 'topic';
  extractedText?: string;
  sourceFilename?: string;
  topic?: string;
  courseLevel?: string;
  slideCount?: number;
  notes?: string;
  approvedOutline?: ApprovedOutline;
  disciplineId?: string;
}): string {
  if (params.approvedOutline) {
    return buildOutlineConstrainedPrompt(params.approvedOutline);
  }

  const discipline = getDiscipline(params.disciplineId);

  if (params.mode === 'upload' && params.extractedText) {
    return `Convert the following presentation content into an interactive HTML slide deck. Preserve the key information and structure, but enhance it with ${discipline.visualDescription}, callout boxes, and student-friendly explanations.

Source file: ${params.sourceFilename || 'uploaded file'}

Extracted content:
${params.extractedText}

Generate approximately ${params.slideCount || 20} slides. Output ONLY the complete HTML file.`;
  }

  return `Create an interactive HTML teaching slide deck about: ${params.topic}

Course level: ${params.courseLevel || 'Introductory'}
Number of slides: ${params.slideCount || 20}
${params.notes ? `Additional notes/focus areas: ${params.notes}` : ''}

The slide deck should thoroughly cover this topic with clear explanations, ${discipline.visualDescription}, comparison tables, real-world analogies, and common pitfalls.

Output ONLY the complete HTML file.`;
}

export interface StreamCallbacks {
  onProgress: (currentSlide: number, totalSlides: number) => void;
  onSlideComplete: (slideIndex: number, fragment: string) => void;
  onNoteComplete: (slideIndex: number, note: string) => void;
  onComplete: (html: string, fragments: string[], notes: string[]) => void;
  onError: (error: string) => void;
}

export async function generateSlides(
  params: {
    mode: 'upload' | 'topic';
    extractedText?: string;
    sourceFilename?: string;
    topic?: string;
    courseLevel?: string;
    slideCount?: number;
    notes?: string;
    approvedOutline?: ApprovedOutline;
    disciplineId?: string;
  },
  callbacks: StreamCallbacks
): Promise<void> {
  const discipline = getDiscipline(params.disciplineId);

  // --- Per-slide incremental path (when we have an approved outline) ---
  if (params.approvedOutline) {
    const approved = params.approvedOutline;
    const enabledSlides = approved.slides.filter(s => s.enabled);
    const includeSvg = approved.includeSvg ?? true;
    const quality = approved.quality ?? 'standard';
    const model = quality === 'quality' ? QUALITY_MODEL : FAST_MODEL;
    const totalSlides = enabledSlides.length;
    const fragments: string[] = [];
    const theme = getTheme(approved.themeId);
    const layout = getLayout(approved.layoutId);

    console.log('[slides] starting per-slide generation', {
      totalSlides,
      model: quality,
      includeSvg,
      themeId: theme.id,
      layoutId: layout.id,
    });
    console.time('[slides] per-slide total');

    const notePromises: Promise<void>[] = [];
    const notes: string[] = new Array(totalSlides).fill('');

    try {
      for (let i = 0; i < totalSlides; i++) {
        console.time(`[slides] slide ${i + 1}`);
        const fragment = await generateSlideContent(
          i, totalSlides, enabledSlides[i],
          discipline, includeSvg, model,
          i > 0 ? enabledSlides[i - 1].title : undefined,
          theme, layout,
        );
        console.timeEnd(`[slides] slide ${i + 1}`);
        fragments.push(fragment);
        callbacks.onSlideComplete(i, fragment);
        callbacks.onProgress(i + 1, totalSlides);

        // Fire notes generation in parallel (non-blocking)
        notePromises.push(
          generateSlideNotes(i + 1, fragment, enabledSlides[i], discipline)
            .then(note => { notes[i] = note; callbacks.onNoteComplete(i, note); })
            .catch(() => {}) // non-fatal
        );
      }

      await Promise.allSettled(notePromises);
      console.timeEnd('[slides] per-slide total');
      const html = assembleSlideHtml(fragments, approved.topic || 'Untitled', discipline, theme, layout);
      callbacks.onComplete(html, fragments, notes);
    } catch (error) {
      console.timeEnd('[slides] per-slide total');
      console.error('[slides] per-slide error:', error);
      callbacks.onError(error instanceof Error ? error.message : 'Unknown error');
    }
    return;
  }

  // --- Legacy streaming path (non-outline fallback) ---
  const systemPrompt = buildSystemPrompt(discipline);
  const userPrompt = buildUserPrompt(params);
  let fullResponse = '';
  let slideCount = 0;
  const estimatedTotal = params.slideCount || 20;

  console.log('[slides] starting legacy stream', {
    systemPromptLength: systemPrompt.length,
    userPromptLength: userPrompt.length,
    estimatedTotal,
  });
  console.time('[slides] stream');

  let firstChunkLogged = false;

  try {
    const stream = client.messages.stream({
      model: QUALITY_MODEL,
      max_tokens: 40000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    stream.on('text', (text) => {
      fullResponse += text;

      if (!firstChunkLogged) {
        firstChunkLogged = true;
        console.log('[slides] first chunk received, length so far:', fullResponse.length);
      }

      const slideMatches = fullResponse.match(/id="s\d+"/g);
      const newSlideCount = slideMatches ? slideMatches.length : 0;
      if (newSlideCount > slideCount) {
        slideCount = newSlideCount;
        console.log(`[slides] progress: ${slideCount}/${estimatedTotal}`);
        callbacks.onProgress(slideCount, estimatedTotal);
      }
    });

    const finalMessage = await stream.finalMessage();
    console.timeEnd('[slides] stream');
    console.log('[slides] done', {
      stopReason: finalMessage.stop_reason,
      outputTokens: finalMessage.usage?.output_tokens,
      responseLength: fullResponse.length,
    });

    if (finalMessage.stop_reason === 'end_turn') {
      callbacks.onComplete(fullResponse, [], []);
    } else if (finalMessage.stop_reason === 'max_tokens' && slideCount > 0) {
      console.warn(`[slides] hit max_tokens after ${slideCount}/${estimatedTotal} slides, saving partial`);
      const patched = fullResponse + '\n</div>\n</body>\n</html>';
      callbacks.onComplete(patched, [], []);
    } else {
      callbacks.onError(`Generation stopped unexpectedly: ${finalMessage.stop_reason}`);
    }
  } catch (error) {
    console.timeEnd('[slides] stream');
    console.error('[slides] error:', error);
    callbacks.onError(error instanceof Error ? error.message : 'Unknown error');
  }
}

// --- Outline generation (non-streaming) ---

function stripCodeFences(text: string): string {
  return text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
}

let idCounter = 0;
function nextId(prefix: string): string {
  return `${prefix}-${++idCounter}-${Date.now().toString(36)}`;
}

function hydrateOutline(raw: Record<string, unknown>, extractedText?: string): SlideOutline {
  const rawSlides = (raw.slides || []) as Array<Record<string, unknown>>;
  const rawSuggestions = (raw.contentSuggestions || []) as Array<Record<string, unknown>>;

  const slides: OutlineSlide[] = rawSlides.map((s, i) => {
    const rawSlideSuggestions = (s.suggestions || []) as Array<Record<string, unknown>>;
    return {
      id: nextId('slide'),
      slideNumber: i + 1,
      title: (s.title as string) || `Slide ${i + 1}`,
      bullets: (s.bullets as string[]) || [],
      suggestions: rawSlideSuggestions.map(sg => ({
        id: nextId('sug'),
        type: (sg.type as TeachingSuggestion['type']) || 'example',
        text: (sg.text as string) || '',
        accepted: true,
      })),
      enabled: true,
      userNotes: '',
    };
  });

  const contentSuggestions: ContentSuggestion[] = rawSuggestions.map(cs => ({
    id: nextId('cs'),
    action: (cs.action as ContentSuggestion['action']) || 'add',
    description: (cs.description as string) || '',
    accepted: true,
  }));

  return {
    topic: (raw.topic as string) || '',
    courseLevel: (raw.courseLevel as string) || 'Introductory',
    estimatedSlideCount: (raw.estimatedSlideCount as number) || slides.length,
    summary: (raw.summary as string) || '',
    slides,
    contentSuggestions,
    extractedText,
  };
}

// Cap extracted text to avoid enormous prompts that stall the API
const MAX_EXTRACTED_CHARS = 30000;

function truncateExtractedText(text: string): string {
  if (text.length <= MAX_EXTRACTED_CHARS) return text;
  const truncated = text.slice(0, MAX_EXTRACTED_CHARS);
  // Cut at the last newline to avoid mid-sentence breaks
  const lastNewline = truncated.lastIndexOf('\n');
  return (lastNewline > MAX_EXTRACTED_CHARS * 0.8 ? truncated.slice(0, lastNewline) : truncated)
    + '\n\n[Content truncated — original was ' + Math.round(text.length / 1000) + 'k characters]';
}

// Run an async function with an AbortController that fires after `ms`.
// Unlike Promise.race, this actually cancels the underlying HTTP request.
async function callWithTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    const result = await fn(controller.signal);
    clearTimeout(timeout);
    return result;
  } catch (error) {
    clearTimeout(timeout);
    if (controller.signal.aborted) {
      throw new Error(`${label} timed out after ${ms / 1000}s`);
    }
    throw error;
  }
}

const SUMMARIZE_THRESHOLD = 10_000; // chars — above this we summarize first

async function summarizeContent(text: string, signal: AbortSignal): Promise<string> {
  const response = await client.messages.create(
    {
      model: FAST_MODEL,
      max_tokens: 2048,
      system: `You are a content summarizer. Given presentation or document text, produce a structured summary preserving every section and its key points. Use this format:

## Section Title
- Key point 1
- Key point 2

Keep 2-4 bullets per section. Preserve technical terms, names, and data accurately. Do NOT add commentary — just distill.`,
      messages: [{ role: 'user', content: text }],
    },
    { signal },
  );

  const block = response.content.find(b => b.type === 'text');
  return block && block.type === 'text' ? block.text : '';
}

export async function generateOutline(
  params: {
    mode: 'upload' | 'topic';
    extractedText?: string;
    sourceFilename?: string;
    topic?: string;
    courseLevel?: string;
    slideCount?: number;
    notes?: string;
    disciplineId?: string;
  },
  onProgress: (message: string) => void,
  onComplete: (outline: SlideOutline) => void,
  onError: (error: string) => void
): Promise<void> {
  const discipline = getDiscipline(params.disciplineId);
  let contentForOutline: string | undefined = params.extractedText;

  console.log('[outline] generateOutline called', {
    mode: params.mode,
    disciplineId: discipline.id,
    extractedTextLength: params.extractedText?.length ?? 0,
    topic: params.topic,
  });

  // --- Summarize large uploads ---
  if (params.mode === 'upload' && params.extractedText && params.extractedText.length > SUMMARIZE_THRESHOLD) {
    onProgress('Summarizing uploaded content...');
    console.time('[outline] summarize');
    try {
      const summary = await callWithTimeout(
        (signal) => summarizeContent(params.extractedText!, signal),
        60_000,
        'Content summarization',
      );
      console.timeEnd('[outline] summarize');
      if (summary) {
        contentForOutline = summary;
      }
      // If summary came back empty, fall back to truncation below
    } catch (err) {
      console.timeEnd('[outline] summarize');
      console.warn('[outline] summarization failed, falling back to truncation:', err);
      // Fall through — contentForOutline stays as the raw extractedText
    }
  }

  // --- Build user prompt ---
  let userPrompt: string;

  if (params.mode === 'upload' && contentForOutline) {
    // Truncate as safety net (summarized text is usually well under the limit)
    const content = truncateExtractedText(contentForOutline);
    userPrompt = `Create a structured outline for an interactive teaching slide deck based on this uploaded presentation.

Source file: ${params.sourceFilename || 'uploaded file'}
Target slide count: approximately ${params.slideCount || 20}

Extracted content:
${content}`;
  } else {
    userPrompt = `Create a structured outline for an interactive teaching slide deck about: ${params.topic}

Course level: ${params.courseLevel || 'Introductory'}
Target slide count: approximately ${params.slideCount || 20}
${params.notes ? `Focus areas: ${params.notes}` : ''}`;
  }

  // --- Call Claude for outline ---
  onProgress('Building outline...');
  console.log('[outline] calling Bedrock for outline...', {
    systemPromptLength: buildOutlineSystemPrompt(discipline).length,
    userPromptLength: userPrompt.length,
  });
  console.time('[outline] generate');
  try {
    const response = await callWithTimeout(
      (signal) =>
        client.messages.create(
          {
            model: FAST_MODEL,
            max_tokens: 8192,
            system: buildOutlineSystemPrompt(discipline),
            messages: [{ role: 'user', content: userPrompt }],
          },
          { signal },
        ),
      120_000, // 120 second timeout (outlines can take 60s+)
      'Outline generation',
    );
    console.timeEnd('[outline] generate');
    console.log('[outline] Bedrock response received', {
      stopReason: response.stop_reason,
      contentBlocks: response.content.length,
      usage: response.usage,
    });

    if (response.stop_reason === 'max_tokens') {
      console.warn('[outline] response truncated — max_tokens hit');
      onError('Outline was too large and got truncated. Try reducing the slide count or simplifying the topic.');
      return;
    }

    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      onError('No text in outline response');
      return;
    }

    const cleaned = stripCodeFences(textBlock.text);
    console.log('[outline] parsing JSON, length:', cleaned.length);
    const parsed = JSON.parse(cleaned);
    // Store the summarized/original content so downstream deck generation uses it
    const outline = hydrateOutline(parsed, contentForOutline);
    console.log('[outline] outline ready:', outline.slides.length, 'slides');
    onComplete(outline);
  } catch (error) {
    console.timeEnd('[outline] generate');
    console.error('[outline] error:', error);
    if (error instanceof SyntaxError) {
      onError('Failed to parse outline JSON from Claude. Please try again.');
    } else {
      onError(error instanceof Error ? error.message : 'Unknown error generating outline');
    }
  }
}

// --- Regenerate rejected slides ---

export async function regenerateSlides(
  existingFragments: string[],
  improvements: Array<{ slideIndex: number; feedback: string }>,
  discipline: DisciplineConfig,
  callbacks: StreamCallbacks,
  theme?: ThemeConfig,
  layout?: LayoutConfig,
): Promise<void> {
  const fragments = [...existingFragments];
  const notes: string[] = new Array(fragments.length).fill('');
  const totalSlides = fragments.length;

  console.log('[improve] regenerating', improvements.length, 'slides');
  console.time('[improve] total');

  try {
    for (let j = 0; j < improvements.length; j++) {
      const { slideIndex, feedback } = improvements[j];
      const slideNum = slideIndex + 1;
      const existingHtml = fragments[slideIndex] || '';
      const truncatedHtml = existingHtml.length > 3000 ? existingHtml.slice(0, 3000) + '...' : existingHtml;

      console.time(`[improve] slide ${slideNum}`);

      const systemPrompt = buildSlideSystemPrompt(discipline, true, theme, layout);

      const response = await callWithTimeout(
        (signal) =>
          client.messages.create(
            {
              model: FAST_MODEL,
              max_tokens: 2048,
              system: systemPrompt,
              messages: [{
                role: 'user',
                content: `Regenerate slide ${slideNum} of ${totalSlides}. Address this feedback: "${feedback}"

Current slide HTML:
${truncatedHtml}

Output ONLY the improved <div id="s${slideNum}" class="slide${slideNum === 1 ? ' active' : ''}">...</div> block.
Include <div class="slide-number">${slideNum} / ${totalSlides}</div>.`,
              }],
            },
            { signal },
          ),
        30_000,
        `Improve slide ${slideNum}`,
      );

      console.timeEnd(`[improve] slide ${slideNum}`);

      const textBlock = response.content.find(b => b.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        fragments[slideIndex] = textBlock.text.trim();
        callbacks.onSlideComplete(slideIndex, fragments[slideIndex]);
      }

      callbacks.onProgress(j + 1, improvements.length);
    }

    console.timeEnd('[improve] total');

    // Re-assemble full HTML
    // Extract topic from existing fragments (look for h1 content in first slide)
    const titleMatch = fragments[0]?.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    const topic = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'Untitled';

    const html = assembleSlideHtml(fragments, topic, discipline, theme, layout);
    callbacks.onComplete(html, fragments, notes);
  } catch (error) {
    console.timeEnd('[improve] total');
    console.error('[improve] error:', error);
    callbacks.onError(error instanceof Error ? error.message : 'Unknown error');
  }
}
