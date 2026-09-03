const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function parseArgs(argv) {
  const result = { boards: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--out') result.out = argv[++i];
    else if (arg === '--doc') result.doc = argv[++i];
    else if (arg === '--board') {
      const value = argv[++i];
      const split = value.indexOf('=');
      if (split < 1) throw new Error(`Invalid --board value: ${value}`);
      result.boards.push({ name: value.slice(0, split), token: value.slice(split + 1) });
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!result.out || !result.doc) throw new Error('Required: --out <dir> --doc <token>');
  return result;
}

function run(args, options = {}) {
  const cli = 'C:\\Users\\visua\\.local\\bin\\lark-cli.cmd';
  const res = spawnSync(cli, args, {
    encoding: 'utf8',
    windowsHide: true,
    shell: true,
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
  if (res.status !== 0) {
    throw new Error(`lark-cli ${args.join(' ')} failed (${res.status})\n${res.error?.message || res.stderr || res.stdout}`);
  }
  return res.stdout;
}

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Cannot parse ${label} JSON: ${error.message}\n${text.slice(0, 1000)}`);
  }
}

const args = parseArgs(process.argv.slice(2));
fs.mkdirSync(args.out, { recursive: true });

const fetchedText = run([
  'docs', '+fetch', '--api-version', 'v2', '--as', 'user', '--doc', args.doc,
]);
const fetched = parseJson(fetchedText, 'document fetch');
fs.writeFileSync(path.join(args.out, 'document.fetch.json'), `${JSON.stringify(fetched, null, 2)}\n`, 'utf8');

const document = fetched?.data?.document || {};
fs.writeFileSync(path.join(args.out, 'document.body.xml'), document.content || '', 'utf8');
const version = {
  document_token: args.doc,
  title: document.title || null,
  revision_id: document.revision_id ?? null,
  exported_at: new Date().toISOString(),
};
fs.writeFileSync(path.join(args.out, 'document.version.json'), `${JSON.stringify(version, null, 2)}\n`, 'utf8');

for (const extension of ['pdf', 'markdown']) {
  run([
    'drive', '+export', '--as', 'user', '--token', args.doc, '--doc-type', 'docx',
    '--file-extension', extension, '--file-name', `双Pad内容物料_飞书revision${version.revision_id}`,
    '--output-dir', '.', '--overwrite',
  ], { cwd: args.out });
}

const boardResults = [];
for (const board of args.boards) {
  const boardDir = path.join(args.out, 'boards', board.name);
  fs.mkdirSync(boardDir, { recursive: true });
  const outputs = {
    image: path.join(boardDir, `${board.name}.png`),
    code: path.join(boardDir, `${board.name}.svg`),
    raw: path.join(boardDir, `${board.name}.raw.json`),
  };
  for (const [outputAs, output] of Object.entries(outputs)) {
    run([
      'whiteboard', '+query', '--as', 'user', '--whiteboard-token', board.token,
      '--output_as', outputAs, '--output', path.basename(output), '--overwrite',
    ], { cwd: boardDir });
  }
  const raw = parseJson(fs.readFileSync(outputs.raw, 'utf8'), `${board.name} raw`);
  const nodes = Array.isArray(raw.nodes) ? raw.nodes : [];
  const byType = {};
  for (const node of nodes) byType[node.type] = (byType[node.type] || 0) + 1;
  const imageTokens = [...new Set(nodes.filter((node) => node.type === 'image').map((node) => node.image?.token).filter(Boolean))];
  boardResults.push({
    name: board.name,
    token: board.token,
    node_count: nodes.length,
    node_types: byType,
    image_token_count: imageTokens.length,
    files: outputs,
  });
}

fs.writeFileSync(
  path.join(args.out, 'snapshot-metadata.json'),
  `${JSON.stringify({ document: version, boards: boardResults }, null, 2)}\n`,
  'utf8',
);

process.stdout.write(`${JSON.stringify({ ok: true, out: args.out, document: version, boards: boardResults }, null, 2)}\n`);
