# Privacy-Local-PDF-Image-Suite

Privacy-first local-in-browser PDF and image tool suite. Files stay on the device: no upload, no signup.

隐私优先的浏览器本地 PDF / 图片工具箱。文件只在本机处理：不上传、不注册。

Working brand: **LocalPDF**. The MVP is a Vite multi-page app. Merge, split, compress, and JPG↔PDF all run in the browser with [pdf-lib](https://pdf-lib.js.org/) and [pdf.js](https://mozilla.github.io/pdf.js/). There is no account and no server endpoint that accepts documents.

## Product requirements / 产品需求

Canonical spec: [docs/PRODUCT-REQUIREMENTS.md](docs/PRODUCT-REQUIREMENTS.md)

## Local run / 本地运行

```bash
npm install && npm run build
```

Preview the production build:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

Development server:

```bash
npm run dev
```

Checks (unit tests need no browser; the smoke test needs the preview server above and Chrome):

```bash
npm test
npm run test:e2e
```

`npm test` covers merge/split with pdf-lib and a static scan that tool code does not call the network. `npm run test:e2e` drives merge, split, compress, JPG→PDF, and PDF→JPG in headless Chrome and asserts there is no POST/PUT and no off-origin request.

## Privacy / 隐私

Selected files are read with the browser File API and processed in memory on the device. Results download through a local blob URL. Tool pages do not POST or PUT document bytes. Visitors can confirm this in DevTools → Network while a conversion runs. The same promise is written at `/privacy/`.

`public/_headers` keeps scripts on the site origin (`script-src 'self'`), blocks form submission (`form-action 'none'`), and limits connections to that origin (`connect-src 'self'`). pdf.js is allowed `'wasm-unsafe-eval'` so its WebAssembly decoder can run; that is not a remote script. Styles allow `'unsafe-inline'` for a few layout attributes in the pages.

This repository does not deploy production. `public/sitemap.xml` and `public/robots.txt` use the placeholder host `https://localpdf.pages.dev` until a domain is chosen. Cloudflare Pages can serve `public/_headers` later; that static hosting is separate from receiving documents.

## Tools / 工具

| URL | Tool |
| --- | --- |
| `/` | Home |
| `/merge-pdf/` | Merge PDF |
| `/split-pdf/` | Split PDF |
| `/compress-pdf/` | Compress PDF |
| `/jpg-to-pdf/` | JPG to PDF |
| `/pdf-to-jpg/` | PDF to JPG |
| `/privacy/` | Privacy |

HomeFixMath DIY material calculators are out of scope for this product. See the requirements doc.
