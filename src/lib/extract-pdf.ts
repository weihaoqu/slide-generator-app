// Stub browser globals that pdfjs-dist expects but Node.js lacks.
// We only extract text, so these never get called — but the module
// fails to load without them in environments missing @napi-rs/canvas.
if (typeof globalThis.DOMMatrix === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  g.DOMMatrix = class DOMMatrix { constructor() {} };
  g.ImageData = class ImageData { constructor() {} };
  g.Path2D = class Path2D { constructor() {} };
}

import { PDFParse } from 'pdf-parse';

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}
