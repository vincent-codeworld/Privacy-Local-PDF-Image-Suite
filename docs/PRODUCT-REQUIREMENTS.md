# 隐私本地 PDF/图片工具 · 产品需求文档

> 避开 HomeFixMath 家装线；基于社区吐槽与 SEO，锁定浏览器本地、免登录的 PDF/图片工具站定位、MVP、功能优先级与变现。  
> 交互版 Page：https://cursor.com/canvas/store-b7a39de2-fede-40f9-ade5-522fabf26b93/7da3cb12-a446-47f5-96c6-e35528839eda  
> 调研日期：2026-10-29（Asia/Shanghai）

## 拍板结论

新产线定为「隐私优先 · 浏览器本地 PDF/图片工具箱」，与 HomeFixMath（DIY 家装材料算量）**零重叠**。MVP 先做 merge / split / compress / jpg↔pdf，全部本地、免登录、手机优先；再扩 HEIC 与扫图拼 PDF。

## 产品定位

| 项 | 内容 |
|----|------|
| 产品名（工作名） | Privacy Local PDF/Image Suite |
| 一句话 | 浏览器本地处理敏感文件，免注册、零上传、无限次无水印 |
| 目标市场 | 美国 / 英语海外市场 |
| 目标用户 | 学生、自由职业者、办公室职员——合并简历、压邮件附件、JPG→PDF，讨厌登录墙与上传隐私合同 |
| 核心承诺 | 真本地 · 可 Network 自证零上传 |
| 与家装线关系 | 零重叠 |

定位差异化不靠硬刚 iLovePDF / Smallpdf 品牌词，而靠「可验证的本地处理 + 手机 Safari 一流体验 + 长尾落地页矩阵」。

## 与 HomeFixMath 边界

**硬边界：** 本产品不做任何家装材料计算器。concrete / paint / fence / deck / gravel / mulch / drywall / stair / roofing / flooring / tile 等 DIY 算量一律归 HomeFixMath，本站不出现、不交叉推广为同一产品。

HomeFixMath 已覆盖 fence / paint / deck，Concrete 为其下一品类。本产线只做文档与图片处理，技术栈与获客叙事可复用「免登录 / 本地 / 少广告」，但品类与关键词完全错开。

## SEO 需求信号（美区）

口径：seodata.dev Google Ads API 美区；Ads API 会对近义词归组，数字可能含 close variants。

| 关键词 | 美区月搜 | CPC≈ | MVP 相关 |
|--------|----------|------|----------|
| merge pdf | 135k | $1.68 | P0 核心 |
| compress pdf | 110k | $1.20 | P0 核心 |
| jpg to pdf | 201k | $1.73 | P0 核心 |
| pdf to word | 246k | $1.38 | P2 / Pro |
| pdf editor | 246k | $5.10 | 品类入口 |
| heic to jpg | 246k | $0.28 | P1 |
| image compressor | 60.5k | $1.84 | P1 |
| background remover | 823k | $4.09 | 二期可选 |

获客以长尾落地页（how to compress PDF for email 等）切入，避免只打品牌词。

## 竞品格局与缺口

| 竞品 | 模式 | 流量量级 | 可打缺口 |
|------|------|----------|----------|
| iLovePDF | 上传服务器 + 额度/账号 | ~325M | 隐私敏感用户流失 |
| Smallpdf | 上传 + 约 2 次/天限制 | ~57M | 额度墙催生 no-signup 搜索 |
| Sejda | 部分工具限额 | ~38M | 同上 |
| PDF24 | 广告多、桌面强 | — | 移动端 / 无广告体验 |
| DocMind / Merge2PDF 等 | 已打 local / no signup | 弱 SEO | 权威与工具广度仍弱于巨头 |

可占缺口：1）真本地（Network 面板 0 上传可自证）；2）手机 Safari 一流；3）压到指定 KB；4）合并时混排图片+PDF；5）英文长尾 SEO 页矩阵。

## 功能优先级

### P0 · 不做就留不住

- [ ] 免登录、无邮箱墙
- [ ] 真本地零上传（可 Network 自证）
- [ ] 无限次、无水印
- [ ] 手机好用（iPhone Safari 实测）
- [ ] merge / compress / jpg↔pdf

### P1 · 愿意回来用 / 可付费增强

- [ ] HEIC → JPG/PNG
- [ ] 扫图拼 PDF
- [ ] 批量处理 + ZIP 下载
- [ ] 离线可用（PWA / 弱网）
- [ ] 压到目标大小（如 500KB / 邮箱限额）

### P2 · 增长与变现

- [ ] 轻广告（不挡主流程）或开发者 API
- [ ] 多语言落地页
- [ ] OCR / PDF↔Word（可服务器，单独隐私声明）
- [ ] 与 Image Suite 同站交叉；合规不碰绕过加密灰产文案

## MVP 范围

1. **首发四工具（全部本地）** — merge、split、compress、jpg↔pdf；单工具独立 URL（`/merge-pdf`、`/compress-pdf`…）便于 SEO  
2. **信任与移动体验** — 隐私页写清「不上传」；可引导用户打开 Network 自证；首屏出结果；iPhone Safari 实测通过  
3. **二期扩图** — HEIC→JPG/PNG + 扫图拼 PDF；再评估批量与目标 KB 压缩  
4. **获客** — 长尾内容矩阵，不主攻品牌词硬刚  

## 变现路径

1. **Phase 1 · 轻广告** — 不挡主流程、不弹窗劫持；基础工具永久免费、无限次、无水印  
2. **Phase 2 · Pro** — 批量 / OCR / API / 去广告 / 团队席位；服务器类能力单独隐私声明  
3. **附录 · 非 MVP** — 「免注册发票 PDF」可作同品牌后续实验（CPC 极高），不进入本 MVP；催款勿硬刚 Wave/Stripe  

## 非目标

- 任何 HomeFixMath DIY / 家装材料算量工具  
- Pay stub 生成器（欺诈滥用与合规风险）  
- 强制上传才能用的主流程  
- 假收据 / 绕过他人文档加密等灰产营销  
- 只打竞品品牌词、不做长尾落地页  

## 证据与来源

1. https://x.com/CodaoneCard/status/2043358488454218167 — 为何还要为合并 PDF 付费 / 要账号  
2. https://x.com/mprabhanjan18/status/2111404352711835650 — 上传敏感 PDF 的吐槽  
3. https://www.seodata.dev/keyword/merge-pdf — merge pdf 美区 volume / CPC  
4. https://tgget.io/niches/pdf-editor — pdf editor 品类与痛点  
5. https://www.semrush.com/website/ilovepdf.com/overview/ — iLovePDF 流量  
6. https://www.semrush.com/website/smallpdf.com/overview/ — Smallpdf 流量  
7. https://trulyfreetools.com/blog/pdf-statistics-2026 — PDF 使用行为统计 2026  
8. https://comfortablepdf.com/blog/ilovepdf-alternative-free-pdf-tools-no-signup — no-signup 切入叙事  
