const fs = require('node:fs');
const path = require('node:path');

const current = JSON.parse(fs.readFileSync(path.join(__dirname, 'diagram.openapi.json'), 'utf8'));
const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'visible-baseline.raw.json'), 'utf8'));
const round = value => Number(value || 0).toFixed(2);
const key = node => [node.type, round(node.x), round(node.y), round(node.width), round(node.height)].join('|');

const buckets = new Map();
for (const node of baseline.nodes) {
  const k = key(node);
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(node);
}

const mapped = current.nodes.map((node, index) => {
  const candidates = buckets.get(key(node)) || [];
  if (!candidates.length) throw new Error(`No visible-baseline match for ${node.id} ${key(node)}`);
  let matchIndex = 0;
  if (candidates.length > 1 && node.text && typeof node.text.text === 'string') {
    const exact = candidates.findIndex(candidate => candidate.text && candidate.text.text === node.text.text);
    if (exact >= 0) matchIndex = exact;
  }
  const [match] = candidates.splice(matchIndex, 1);
  return {node, desiredZ: match.z_index, index};
});

const remaining = [...buckets.values()].reduce((sum, values) => sum + values.length, 0);
if (remaining !== 0) throw new Error(`Unconsumed visible-baseline nodes: ${remaining}`);
mapped.sort((a, b) => b.desiredZ - a.desiredZ || a.index - b.index);
current.nodes = mapped.map(item => item.node);
const output = path.join(__dirname, 'diagram.openapi.visible-order.json');
fs.writeFileSync(output, `${JSON.stringify(current, null, 2)}\n`, 'utf8');
process.stdout.write(JSON.stringify({nodes: current.nodes.length, minDesiredZ: Math.min(...mapped.map(x => x.desiredZ)), maxDesiredZ: Math.max(...mapped.map(x => x.desiredZ)), output}));
