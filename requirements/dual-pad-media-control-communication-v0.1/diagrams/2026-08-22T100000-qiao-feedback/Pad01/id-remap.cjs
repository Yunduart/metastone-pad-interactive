const fs=require('node:fs');
const path=require('node:path');
const input=path.resolve(__dirname,'diagram.openapi.zorder.json');
const output=path.resolve(__dirname,'diagram.openapi.unique.json');
const doc=JSON.parse(fs.readFileSync(input,'utf8'));
const map=new Map(doc.nodes.map((node,index)=>[node.id,`q22p1_${String(index+1).padStart(4,'0')}`]));
function walk(value){
  if(Array.isArray(value))return value.map(walk);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,walk(v)]));
  if(typeof value==='string'&&map.has(value))return map.get(value);
  return value;
}
const remapped=walk(doc);
fs.writeFileSync(output,`${JSON.stringify(remapped,null,2)}\n`,'utf8');
process.stdout.write(`${output}\n`);
