import { imagesToPdf } from '../lib/pdf-ops'
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
  renderFileList($('#file-list'), slots, (id) => {
    slots = slots.filter((s) => s.id !== id)
    refresh()
  }, {
    onUp: (id) => move(id, -1),
    onDown: (id) => move(id, 1),
  })
  ;($('#run') as HTMLButtonElement).disabled = slots.length < 1
}

function move(id: string, dir: number) {
  const i = slots.findIndex((s) => s.id === id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= slots.length) return
  ;[slots[i], slots[j]] = [slots[j], slots[i]]
  refresh()
}

createFilePicker({
  accept: 'image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png',
  multiple: true,
  onChange: (files) => {
    const images = files.filter((f) =>
      /image\/(jpeg|jpg|png)/i.test(f.type) ||
      /\.(jpe?g|png)$/i.test(f.name),
    )
    slots = [...slots, ...images.map((file) => ({ id: uid(), file }))]
    refresh()
    setStatus(`${slots.length} image(s) ready.`)
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
  setStatus('Building PDF locally…')
  try {
    const bytes = await imagesToPdf(slots.map((s) => s.file))
    downloadBlob(
      toPdfBlob(bytes),
      stampName('images', 'pdf'),
    )
    setStatus(`Done. ${bytes.byteLength.toLocaleString()} bytes saved.`, 'ok')
  } catch (err) {
    console.error(err)
    setStatus(
      err instanceof Error
        ? `${err.message}. Tip: use JPG/PNG (HEIC comes in P1).`
        : 'Convert failed',
      'error',
    )
  } finally {
    btn.disabled = slots.length < 1
  }
})
