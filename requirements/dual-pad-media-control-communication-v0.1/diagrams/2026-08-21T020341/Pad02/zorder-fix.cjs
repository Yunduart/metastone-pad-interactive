const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.resolve(__dirname, 'diagram.openapi.json');
const targetPath = path.resolve(__dirname, 'diagram.openapi.zorder.json');
const document = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

if (!Array.isArray(document.nodes) || document.nodes.length === 0) {
  throw new Error('diagram.openapi.json does not contain a non-empty nodes array');
}

// Feishu assigns the first submitted raw node the highest z-index. The DSL
// converter emits parents before their children, so submitting that array as-is
// puts page/section/card backgrounds above their text and media. Reverse only
// the transport order; IDs, connector endpoints and geometry remain unchanged.
document.nodes.reverse();

fs.writeFileSync(targetPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
process.stdout.write(`${targetPath}\n`);
