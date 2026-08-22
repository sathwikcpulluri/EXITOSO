/**
 * In-browser text extractor for PDF documents
 * Extracts readable text streams from PDF ArrayBuffer without external binary dependencies.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  const decoder = new TextDecoder('utf-8', { fatal: false })
  const content = decoder.decode(bytes)

  const extractedChunks: string[] = []

  // 1. Extract standard PDF Text Objects: BT ... ET
  const textObjectRegex = /BT[\s\S]*?ET/g
  const matches = content.match(textObjectRegex) || []

  for (const block of matches) {
    // Matches text inside parentheses: (Some text) Tj or [(Some) (text)] TJ
    const stringMatches = block.match(/\(([^()]*)\)/g) || []
    for (const str of stringMatches) {
      const clean = str.slice(1, -1).trim()
      if (clean.length > 0) {
        extractedChunks.push(clean)
      }
    }
  }

  // 2. Extract plain alphanumeric word blocks if PDF was compressed/scanned
  if (extractedChunks.length < 5) {
    const rawTokens = content.match(/[A-Za-z0-9+#./-]{2,}/g) || []
    const filtered = rawTokens.filter((token) => {
      // Filter out PDF internal syntax keywords
      const lower = token.toLowerCase()
      return (
        !lower.startsWith('obj') &&
        !lower.startsWith('endobj') &&
        !lower.startsWith('xref') &&
        !lower.startsWith('stream') &&
        !lower.startsWith('endstream') &&
        token.length < 40
      )
    })
    extractedChunks.push(...filtered.slice(0, 500))
  }

  const combined = extractedChunks.join(' ')
  return combined.length > 20 ? combined : file.name.replace(/\.pdf$/i, '')
}
