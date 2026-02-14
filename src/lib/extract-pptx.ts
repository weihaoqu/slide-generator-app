import JSZip from 'jszip';

export async function extractPptxText(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles: { name: string; index: number }[] = [];

  // Find all slide XML files
  zip.forEach((relativePath) => {
    const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/);
    if (match) {
      slideFiles.push({ name: relativePath, index: parseInt(match[1]) });
    }
  });

  // Sort by slide number
  slideFiles.sort((a, b) => a.index - b.index);

  const slides: string[] = [];

  for (const slideFile of slideFiles) {
    const file = zip.file(slideFile.name);
    if (!file) continue;

    const xml = await file.async('string');

    // Extract text from <a:t> tags
    const textParts: string[] = [];
    const regex = /<a:t>([\s\S]*?)<\/a:t>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      const text = match[1].trim();
      if (text) {
        textParts.push(text);
      }
    }

    if (textParts.length > 0) {
      slides.push(`--- Slide ${slideFile.index} ---\n${textParts.join('\n')}`);
    }
  }

  return slides.join('\n\n');
}
