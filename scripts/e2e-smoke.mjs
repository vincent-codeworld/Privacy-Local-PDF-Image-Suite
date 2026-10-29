import puppeteer from 'puppeteer-core'
import { PDFDocument } from 'pdf-lib'
import { existsSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import assert from 'node:assert/strict'

const downloadDir = '/tmp/localpdf-dl3'
mkdirSync(downloadDir, { recursive: true })
mkdirSync('/tmp/localpdf-test', { recursive: true })

async function makePdf(pages, label, outPath) {
  const doc = await PDFDocument.create()
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([400, 600])
    page.drawText(`${label} p${i + 1}`, { x: 40, y: 540, size: 18 })
  }
  writeFileSync(outPath, await doc.save())
}
await makePdf(2, 'A', '/tmp/localpdf-test/a.pdf')
await makePdf(1, 'B', '/tmp/localpdf-test/b.pdf')

// 1x1 baseline JPEG so jpg-to-pdf does not depend on a fixture outside the script.
writeFileSync(
  '/tmp/localpdf-test/sample.jpg',
  Buffer.from(
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==',
    'base64',
  ),
)

const chromeCandidates = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/local/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)
const executablePath = chromeCandidates.find((path) => existsSync(path))
if (!executablePath) {
  console.error('Chrome not found. Set CHROME_PATH. Preview must already be on http://127.0.0.1:4173')
  process.exit(1)
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage()
const client = await page.createCDPSession()
await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadDir })

const requests = []
page.on('request', (req) => requests.push({ url: req.url(), method: req.method() }))

async function runTool(url, files, expectText) {
  await page.goto(url, { waitUntil: 'networkidle0' })
  const input = await page.$('input.file-input')
  await input.uploadFile(...files)
  await page.waitForFunction(
    (n) => document.querySelectorAll('#file-list .file-item').length >= n,
    { timeout: 10000 },
    files.length,
  )
  await page.click('#run')
  await page.waitForFunction(
    (t) => {
      const s = document.querySelector('#status')?.textContent || ''
      return s.includes(t) || s.toLowerCase().includes('fail') || s.toLowerCase().includes('error')
    },
    { timeout: 30000 },
    expectText,
  )
  const status = await page.$eval('#status', (el) => el.textContent)
  console.log(url, '=>', status)
  assert.ok(status.includes(expectText), status)
}

await runTool('http://127.0.0.1:4173/merge-pdf/', ['/tmp/localpdf-test/a.pdf', '/tmp/localpdf-test/b.pdf'], 'Done')
await runTool('http://127.0.0.1:4173/jpg-to-pdf/', ['/tmp/localpdf-test/sample.jpg'], 'Done')
await runTool('http://127.0.0.1:4173/split-pdf/', ['/tmp/localpdf-test/a.pdf'], 'Done')
await runTool('http://127.0.0.1:4173/compress-pdf/', ['/tmp/localpdf-test/a.pdf'], 'Done')
await runTool('http://127.0.0.1:4173/pdf-to-jpg/', ['/tmp/localpdf-test/a.pdf'], 'Done')

await new Promise((r) => setTimeout(r, 500))
const posts = requests.filter((r) => r.method === 'POST' || r.method === 'PUT')
assert.equal(posts.length, 0, JSON.stringify(posts))
const offsite = requests.filter((r) => !r.url.startsWith('http://127.0.0.1:4173/') && !r.url.startsWith('blob:') && !r.url.startsWith('data:'))
assert.equal(offsite.length, 0, JSON.stringify(offsite.slice(0, 5)))
console.log('OK e2e tools + zero-upload; downloads=', readdirSync(downloadDir).join(','))
await browser.close()
