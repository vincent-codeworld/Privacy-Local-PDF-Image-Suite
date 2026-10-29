import { pdfToImages } from '../lib/pdf-ops'
import { downloadBlob, stampName } from '../lib/format'
import {
  $,
  type FileSlot,
  createFilePicker,
  renderFileList,
  setStatus,
  uid,
} from '../lib/ui'

let slots: FileSlot[] = []

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
    setStatus('Ready to export pages as JPG.')
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
  setStatus('Rendering pages locally…')
  try {
    const blobs = await pdfToImages(slots[0].file)
    blobs.forEach((blob, i) => {
      downloadBlob(blob, stampName(`page-${i + 1}`, 'jpg'))
    })
    setStatus(`Done. Downloaded ${blobs.length} JPG(s).`, 'ok')
  } catch (err) {
    console.error(err)
    setStatus(err instanceof Error ? err.message : 'Convert failed', 'error')
  } finally {
    btn.disabled = slots.length !== 1
  }
})
