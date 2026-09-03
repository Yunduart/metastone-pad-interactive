const fs=require('node:fs');
const path=require('node:path');
const sourcePath=path.resolve(__dirname,'diagram.openapi.json');
const targetPath=path.resolve(__dirname,'diagram.openapi.zorder.json');
const document=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
if(!Array.isArray(document.nodes)||document.nodes.length===0)throw new Error('OpenAPI nodes missing');
document.nodes.reverse();
fs.writeFileSync(targetPath,`${JSON.stringify(document,null,2)}\n`,'utf8');
process.stdout.write(`${targetPath}\n`);
