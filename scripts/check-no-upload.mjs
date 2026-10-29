import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git') continue
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, acc)
    else acc.push(path)
  }
  return acc
}

const files = walk(root)
const rel = (path) => relative(root, path)

const codeExt = new Set(['.ts', '.js', '.mjs', '.html', '.css'])
const forbidden = [
  { re: /\bfetch\s*\(/, label: 'fetch(' },
  { re: /\bXMLHttpRequest\b/, label: 'XMLHttpRequest' },
  { re: /\bsendBeacon\s*\(/, label: 'sendBeacon' },
  { re: /\bnew\s+WebSocket\b/, label: 'WebSocket' },
  { re: /\bFormData\b/, label: 'FormData' },
  { re: /\baxios\b/, label: 'axios' },
  { re: /\bhttps?:\/\//, label: 'absolute http(s) URL' },
]

const offenders = []
for (const path of files) {
  if (path.endsWith('scripts/check-no-upload.mjs')) continue
  if (!codeExt.has(extname(path))) continue
  const text = readFileSync(path, 'utf8')
  for (const rule of forbidden) {
    if (!rule.re.test(text)) continue
    // Privacy copy and the smoke test may mention http://127.0.0.1 and "upload" in prose.
    if (rule.label === 'absolute http(s) URL' && path.endsWith('scripts/e2e-smoke.mjs')) continue
    offenders.push(`${rel(path)}: ${rule.label}`)
  }
  if (path.endsWith('.html') && /<form[\s>]/i.test(text)) {
    offenders.push(`${rel(path)}: <form>`)
  }
  if (path.endsWith('.html') && /<script[^>]+src=["']https?:/i.test(text)) {
    offenders.push(`${rel(path)}: external script`)
  }
}

const serverFiles = files
  .map(rel)
  .filter((path) =>
    /^(server\.(js|ts|mjs)|wrangler\.(toml|jsonc?)|functions\/|api\/|app\/api\/)/.test(path),
  )

assert.deepEqual(offenders, [], `network or upload surface:\n${offenders.join('\n')}`)
assert.deepEqual(serverFiles, [], `server entrypoints:\n${serverFiles.join('\n')}`)

const headers = readFileSync(join(root, 'public/_headers'), 'utf8')
const csp = headers.match(/Content-Security-Policy:\s*(.+)/)?.[1] ?? ''
assert.ok(csp, 'missing Content-Security-Policy in public/_headers')

function directive(name) {
  const match = csp.match(new RegExp(`${name}\\s+([^;]+)`))
  return match ? match[1].trim() : ''
}

const scriptSrc = directive('script-src')
const connectSrc = directive('connect-src')
assert.match(scriptSrc, /'self'/)
assert.doesNotMatch(scriptSrc, /https?:/)
assert.doesNotMatch(scriptSrc, /\*/)
assert.equal(connectSrc, "'self'")
assert.equal(directive('form-action'), "'none'")
assert.match(directive('worker-src'), /'self'/)

console.log('OK no-upload static check')
