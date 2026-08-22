import * as pdfjsLib from 'pdfjs-dist'

// Configure worker for Vite environment
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()
}

/**
 * Extracts complete plain text content from any PDF file using PDF.js engine.
 * Decodes all pages, text streams, and embedded font glyphs.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    })

    const pdfDoc = await loadingTask.promise
    const pageTexts: string[] = []

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      const pageStrings = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .filter(Boolean)
      
      pageTexts.push(pageStrings.join(' '))
    }

    const fullText = pageTexts.join('\n\n').trim()

    // Debug logging (safe, no secrets)
    console.log('[CareerAI PDF Extractor]', {
      filename: file.name,
      fileSizeBytes: file.size,
      totalPages: pdfDoc.numPages,
      extractedTextLength: fullText.length,
      samplePreview: fullText.slice(0, 150),
    })

    return fullText
  } catch (err) {
    console.error('[CareerAI PDF Extractor Error]', err)
    
    // Fallback stream text recovery
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const decoder = new TextDecoder('utf-8', { fatal: false })
    const rawContent = decoder.decode(bytes)
    
    const words = rawContent.match(/[A-Za-z0-9+#./@-]{2,}/g) || []
    const filtered = words.filter(
      (w) =>
        !w.startsWith('obj') &&
        !w.startsWith('endobj') &&
        !w.startsWith('xref') &&
        !w.startsWith('stream') &&
        w.length < 35
    )
    return filtered.join(' ')
  }
}
