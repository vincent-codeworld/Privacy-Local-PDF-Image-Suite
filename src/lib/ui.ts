import { formatBytes } from './format'

export type FileSlot = { id: string; file: File }

export function $(sel: string, root: ParentNode = document): HTMLElement {
  const el = root.querySelector(sel)
  if (!el) throw new Error(`Missing ${sel}`)
  return el as HTMLElement
}

export function createFilePicker(opts: {
  accept: string
  multiple?: boolean
  onChange: (files: File[]) => void
}) {
  const zone = $('#dropzone')
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = opts.accept
  input.multiple = Boolean(opts.multiple)
  input.className = 'file-input'
  zone.appendChild(input)

  const pick = () => input.click()
  zone.addEventListener('click', pick)
  zone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      pick()
    }
  })
  zone.setAttribute('tabindex', '0')
  zone.setAttribute('role', 'button')

  ;['dragenter', 'dragover'].forEach((ev) => {
    zone.addEventListener(ev, (e) => {
      e.preventDefault()
      zone.classList.add('dragover')
    })
  })
  ;['dragleave', 'drop'].forEach((ev) => {
    zone.addEventListener(ev, (e) => {
      e.preventDefault()
      zone.classList.remove('dragover')
    })
  })
  zone.addEventListener('drop', (e) => {
    const dt = (e as DragEvent).dataTransfer
    if (!dt) return
    const files = [...dt.files]
    if (files.length) opts.onChange(files)
  })
  input.addEventListener('change', () => {
    const files = [...(input.files || [])]
    input.value = ''
    if (files.length) opts.onChange(files)
  })
}

export function renderFileList(
  listEl: HTMLElement,
  slots: FileSlot[],
  onRemove: (id: string) => void,
  reorder?: { onUp: (id: string) => void; onDown: (id: string) => void },
) {
  listEl.innerHTML = ''
  slots.forEach((slot, index) => {
    const li = document.createElement('li')
    li.className = 'file-item'
    const meta = document.createElement('div')
    meta.className = 'file-meta'
    meta.innerHTML = `<div class="name">${escapeHtml(slot.file.name)}</div><div class="size">${formatBytes(slot.file.size)}${slots.length > 1 ? ` · #${index + 1}` : ''}</div>`
    const controls = document.createElement('div')
    controls.style.display = 'flex'
    controls.style.gap = '0.25rem'
    if (reorder) {
      const up = document.createElement('button')
      up.type = 'button'
      up.className = 'secondary'
      up.textContent = '↑'
      up.style.width = 'auto'
      up.disabled = index === 0
      up.onclick = () => reorder.onUp(slot.id)
      const down = document.createElement('button')
      down.type = 'button'
      down.className = 'secondary'
      down.textContent = '↓'
      down.style.width = 'auto'
      down.disabled = index === slots.length - 1
      down.onclick = () => reorder.onDown(slot.id)
      controls.append(up, down)
    }
    const remove = document.createElement('button')
    remove.type = 'button'
    remove.className = 'ghost'
    remove.textContent = 'Remove'
    remove.onclick = () => onRemove(slot.id)
    controls.append(remove)
    li.append(meta, controls)
    listEl.append(li)
  })
}

export function setStatus(text: string, kind: '' | 'ok' | 'error' = '') {
  const el = $('#status')
  el.textContent = text
  el.className = `status${kind ? ` ${kind}` : ''}`
}

export function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function uid(): string {
  return crypto.randomUUID()
}
