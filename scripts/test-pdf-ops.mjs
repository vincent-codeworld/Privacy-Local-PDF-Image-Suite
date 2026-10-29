import { PDFDocument } from 'pdf-lib'
import assert from 'node:assert/strict'
import { writeFileSync, mkdirSync } from 'node:fs'

mkdirSync('/tmp/localpdf-test', { recursive: true })

async function makePdf(pages, label) {
  const doc = await PDFDocument.create()
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([400, 600])
    page.drawText(`${label} p${i + 1}`, { x: 40, y: 540, size: 18 })
  }
  return await doc.save()
}

const a = await makePdf(2, 'A')
const b = await makePdf(1, 'B')
const merged = await PDFDocument.create()
for (const bytes of [a, b]) {
  const src = await PDFDocument.load(bytes)
  const pages = await merged.copyPages(src, src.getPageIndices())
  pages.forEach((p) => merged.addPage(p))
}
const mergedBytes = await merged.save()
assert.equal((await PDFDocument.load(mergedBytes)).getPageCount(), 3)

const srcBytes = await makePdf(3, 'S')
const src = await PDFDocument.load(srcBytes)
const part = await PDFDocument.create()
const copied = await part.copyPages(src, [1, 2])
copied.forEach((p) => part.addPage(p))
const partBytes = await part.save()
assert.equal((await PDFDocument.load(partBytes)).getPageCount(), 2)

writeFileSync('/tmp/localpdf-test/merged.pdf', mergedBytes)
writeFileSync('/tmp/localpdf-test/split.pdf', partBytes)
writeFileSync('/tmp/localpdf-test/a.pdf', a)
writeFileSync('/tmp/localpdf-test/b.pdf', b)
console.log('OK merge+split unit tests')
