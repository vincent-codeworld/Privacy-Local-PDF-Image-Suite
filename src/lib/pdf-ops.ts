import { PDFDocument, degrees } from 'pdf-lib'

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const out = await PDFDocument.create()
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const src = await PDFDocument.load(bytes, { ignoreEncryption: false })
    const pages = await out.copyPages(src, src.getPageIndices())
    pages.forEach((p) => out.addPage(p))
  }
  return out.save({ useObjectStreams: true })
}

export async function splitPdf(
  file: File,
  ranges: Array<{ start: number; end: number }>,
): Promise<Uint8Array[]> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const src = await PDFDocument.load(bytes)
  const total = src.getPageCount()
  const results: Uint8Array[] = []
  for (const range of ranges) {
    const start = Math.max(1, range.start)
    const end = Math.min(total, range.end)
    if (start > end) continue
    const doc = await PDFDocument.create()
    const indices = []
    for (let i = start - 1; i < end; i += 1) indices.push(i)
    const pages = await doc.copyPages(src, indices)
    pages.forEach((p) => doc.addPage(p))
    results.push(await doc.save({ useObjectStreams: true }))
  }
  return results
}

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const out = await PDFDocument.create()
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const type = file.type.toLowerCase()
    let image
    if (type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
      image = await out.embedPng(bytes)
    } else {
      image = await out.embedJpg(bytes)
    }
    const page = out.addPage([image.width, image.height])
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    })
  }
  return out.save({ useObjectStreams: true })
}

async function loadPdfJs() {
  const pdfjs = await import('pdfjs-dist')
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default
  return pdfjs
}

export async function compressPdf(
  file: File,
  quality: number,
  scale = 1.5,
): Promise<{ bytes: Uint8Array; pageCount: number }> {
  const pdfjs = await loadPdfJs()
  const data = new Uint8Array(await file.arrayBuffer())
  const loadingTask = pdfjs.getDocument({ data: data.slice() })
  const pdf = await loadingTask.promise
  const out = await PDFDocument.create()

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.floor(viewport.width))
    canvas.height = Math.max(1, Math.floor(viewport.height))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable')
    await page.render({ canvasContext: ctx, viewport, canvas }).promise
    const jpeg = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('JPEG encode failed'))),
        'image/jpeg',
        quality,
      )
    })
    const jpgBytes = new Uint8Array(await jpeg.arrayBuffer())
    const image = await out.embedJpg(jpgBytes)
    const pdfPage = out.addPage([image.width, image.height])
    pdfPage.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    })
    canvas.width = 0
    canvas.height = 0
  }

  return {
    bytes: await out.save({ useObjectStreams: true }),
    pageCount: pdf.numPages,
  }
}

export async function pdfToImages(
  file: File,
  quality = 0.92,
  scale = 2,
): Promise<Blob[]> {
  const pdfjs = await loadPdfJs()
  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjs.getDocument({ data: data.slice() }).promise
  const blobs: Blob[] = []
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.floor(viewport.width))
    canvas.height = Math.max(1, Math.floor(viewport.height))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable')
    await page.render({ canvasContext: ctx, viewport, canvas }).promise
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('JPEG encode failed'))),
        'image/jpeg',
        quality,
      )
    })
    blobs.push(blob)
    canvas.width = 0
    canvas.height = 0
  }
  return blobs
}

export async function getPdfPageCount(file: File): Promise<number> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const src = await PDFDocument.load(bytes)
  return src.getPageCount()
}

export { degrees }
