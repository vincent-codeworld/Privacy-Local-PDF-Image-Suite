import { mergePdfs } from '../lib/pdf-ops'
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

function refresh() {
  renderFileList($('#file-list'), slots, remove, {
    onUp: (id) => move(id, -1),
    onDown: (id) => move(id, 1),
  })
  ;($('#run') as HTMLButtonElement).disabled = slots.length < 2
}

function remove(id: string) {
  slots = slots.filter((s) => s.id !== id)
  refresh()
}

function move(id: string, dir: number) {
  const i = slots.findIndex((s) => s.id === id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= slots.length) return
  ;[slots[i], slots[j]] = [slots[j], slots[i]]
  refresh()
}

createFilePicker({
  accept: 'application/pdf,.pdf',
  multiple: true,
  onChange: (files) => {
    const pdfs = files.filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
    )
    slots = [...slots, ...pdfs.map((file) => ({ id: uid(), file }))]
    refresh()
    setStatus(`${slots.length} file(s) ready.`)
  },
})

$('#clear').addEventListener('click', () => {
  slots = []
  refresh()
  setStatus('')
})

$('#run').addEventListener('click', async () => {
  const btn = $('#run') as HTMLButtonElement
  btn.disabled = true
  setStatus('Merging locally…')
  try {
    const bytes = await mergePdfs(slots.map((s) => s.file))
    downloadBlob(
      toPdfBlob(bytes),
      stampName('merged', 'pdf'),
    )
    setStatus(`Done. ${bytes.byteLength.toLocaleString()} bytes saved.`, 'ok')
  } catch (err) {
    console.error(err)
    setStatus(err instanceof Error ? err.message : 'Merge failed', 'error')
  } finally {
    btn.disabled = slots.length < 2
  }
})
