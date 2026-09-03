const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const outDir = process.argv[2];
const expectedRevision = Number(process.argv[3]);
if (!outDir || !Number.isInteger(expectedRevision)) {
  throw new Error('usage: node capture-doc-snapshot.cjs <output-dir> <expected-revision>');
}

const cli = 'C:\\Users\\visua\\.local\\bin\\lark-cli.cmd';
const common = [
  'docs', '+fetch', '--doc', 'BACzdwYjJoiOpwxkeBPcRfvrnWg',
  '--api-version', 'v2', '--as', 'user', '--format', 'json',
];

function fetchJson(extra = []) {
  const stdout = execFileSync(cli, [...common, ...extra], {
    encoding: 'utf8',
    windowsHide: true,
    shell: true,
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(stdout.slice(stdout.indexOf('{')));
}

fs.mkdirSync(outDir, { recursive: true });
const full = fetchJson();
const outline = fetchJson(['--detail', 'with-ids', '--scope', 'outline', '--max-depth', '3']);
const markdown = fetchJson(['--doc-format', 'markdown']);
const doc = full.data.document;
if (doc.revision_id !== expectedRevision) {
  throw new Error(`revision changed: expected ${expectedRevision}, got ${doc.revision_id}`);
}

const metadata = {
  exported_at: new Date().toISOString(),
  document_id: doc.document_id,
  revision_id: doc.revision_id,
  url: 'https://thevision.feishu.cn/docx/BACzdwYjJoiOpwxkeBPcRfvrnWg',
  title: '是石科技｜双 Pad 内容物料、播放顺序与状态确认图',
  status: '客户确认输入 / 非定版开发指令 / 程序 NO-GO',
};

fs.writeFileSync(path.join(outDir, 'document-full.json'), JSON.stringify(full, null, 2));
fs.writeFileSync(path.join(outDir, 'document-content.xml'), doc.content);
fs.writeFileSync(path.join(outDir, 'document-outline.json'), JSON.stringify(outline, null, 2));
fs.writeFileSync(path.join(outDir, 'document-fetch-markdown.json'), JSON.stringify(markdown, null, 2));
fs.writeFileSync(path.join(outDir, 'version-metadata.json'), JSON.stringify(metadata, null, 2));
process.stdout.write(JSON.stringify(metadata));
