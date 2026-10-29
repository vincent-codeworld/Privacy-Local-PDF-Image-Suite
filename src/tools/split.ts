import { getPdfPageCount, splitPdf } from '../lib/pdf-ops'
import { downloadBlob, stampName, toPdfBlob } from '../lib/format'
import {
  $,
  type FileSlot,
  createFilePicker,
  renderFileList,
  setStatus,
  uid,
} from '../lib/ui'

let slots: FileSlot[] = []
let pageCount = 0

function parseRanges(input: string, total: number) {
  const parts = input.split(',').map((s) => s.trim()).filter(Boolean)
  const ranges: Array<{ start: number; end: number }> = []
  for (const part of parts) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map((x) => Number(x.trim()))
      if (!Number.isInteger(a) || !Number.isInteger(b)) throw new Error(`Bad range: ${part}`)
      ranges.push({ start: a, end: b })
    } else {
      const n = Number(part)
      if (!Number.isInteger(n)) throw new Error(`Bad page: ${part}`)
      ranges.push({ start: n, end: n })
    }
  }
  if (!ranges.length) throw new Error('Enter at least one page or range')
  for (const r of ranges) {
    if (r.start < 1 || r.end > total || r.start > r.end) {
      throw new Error(`Range ${r.start}-${r.end} is outside 1–${total}`)
    }
  }
  return ranges
}

function refresh() {
  renderFileList($('#file-list'), slots, (id) => {
    slots = slots.filter((s) => s.id !== id)
    pageCount = 0
    $('#page-hint').textContent = 'Choose a PDF to see page count.'
    refresh()
  })
  ;($('#run') as HTMLButtonElement).disabled = slots.length !== 1
}

createFilePicker({
  accept: 'application/pdf,.pdf',
  multiple: false,
  onChange: async (files) => {
    const file = files[0]
    if (!file) return
    slots = [{ id: uid(), file }]
    try {
      pageCount = await getPdfPageCount(file)
      $('#page-hint').textContent = `This PDF has ${pageCount} page(s).`
      ;($('#range') as HTMLInputElement).value =
        pageCount > 1 ? `1-${Math.min(pageCount, 3)}` : '1'
      setStatus('Ready to split.')
    } catch (err) {
      pageCount = 0
      setStatus(err instanceof Error ? err.message : 'Could not read PDF', 'error')
    }
    refresh()
  },
})

$('#clear').addEventListener('click', () => {
  slots = []
  pageCount = 0
  $('#page-hint').textContent = 'Choose a PDF to see page count.'
  refresh()
  setStatus('')
})

$('#run').addEventListener('click', async () => {
  if (slots.length !== 1 || !pageCount) return
  const btn = $('#run') as HTMLButtonElement
  btn.disabled = true
  setStatus('Splitting locally…')
  try {
    const ranges = parseRanges(($('#range') as HTMLInputElement).value, pageCount)
    const parts = await splitPdf(slots[0].file, ranges)
    parts.forEach((bytes, i) => {
      downloadBlob(
        toPdfBlob(bytes),
        stampName(`split-${i + 1}`, 'pdf'),
      )
    })
    setStatus(`Done. Saved ${parts.length} file(s).`, 'ok')
  } catch (err) {
    console.error(err)
    setStatus(err instanceof Error ? err.message : 'Split failed', 'error')
  } finally {
    btn.disabled = slots.length !== 1
  }
})
