import { compressPdf } from '../lib/pdf-ops'
import { downloadBlob, formatBytes, stampName, toPdfBlob } from '../lib/format'
import {
  $,
  type FileSlot,
  createFilePicker,
  renderFileList,
  setStatus,
  uid,
} from '../lib/ui'

let slots: FileSlot[] = []
const qualityEl = $('#quality') as HTMLInputElement
const qualityLabel = $('#quality-label')

qualityEl.addEventListener('input', () => {
  qualityLabel.textContent = qualityEl.value
})

function refresh() {
  renderFileList($('#file-list'), slots, (id) => {
    slots = slots.filter((s) => s.id !== id)
    refresh()
  })
  ;($('#run') as HTMLButtonElement).disabled = slots.length !== 1
}

createFilePicker({
  accept: 'application/pdf,.pdf',
  multiple: false,
  onChange: (files) => {
    const file = files[0]
    if (!file) return
    slots = [{ id: uid(), file }]
    refresh()
    setStatus(`Original size ${formatBytes(file.size)}.`)
  },
})

$('#clear').addEventListener('click', () => {
  slots = []
  refresh()
  setStatus('')
})

$('#run').addEventListener('click', async () => {
  if (slots.length !== 1) return
  const btn = $('#run') as HTMLButtonElement
  btn.disabled = true
  const quality = Number(qualityEl.value)
  setStatus('Compressing locally (may take a moment on large PDFs)…')
  try {
    const before = slots[0].file.size
    const { bytes, pageCount } = await compressPdf(slots[0].file, quality)
    downloadBlob(
      toPdfBlob(bytes),
      stampName('compressed', 'pdf'),
    )
    const ratio = before > 0 ? Math.round((1 - bytes.byteLength / before) * 100) : 0
    const change =
      ratio >= 0 ? `${ratio}% smaller` : `${Math.abs(ratio)}% larger`
    setStatus(
      `Done. ${pageCount} page(s): ${formatBytes(before)} → ${formatBytes(bytes.byteLength)} (${change}).`,
      'ok',
    )
  } catch (err) {
    console.error(err)
    setStatus(err instanceof Error ? err.message : 'Compress failed', 'error')
  } finally {
    btn.disabled = slots.length !== 1
  }
})
