const fs = require('fs');
const path = require('path');

const outDir = __dirname;
const assetDir = path.join(outDir, 'assets');
const mediaMap = new Map(JSON.parse(fs.readFileSync(path.join(outDir, 'media-map.json'), 'utf8')).map(x => [x.file, x]));

const C = {
  bg: '#F2F7FC', navy: '#0B2D5B', ink: '#183153', muted: '#60758F',
  blue: '#1E5FBD', blue2: '#2F80ED', bluePale: '#EAF3FF',
  cyan: '#0AA9B8', cyanPale: '#DDF8FA', orange: '#F2994A',
  orangeDark: '#B85C00', orangePale: '#FFF3DE', red: '#D64545',
  redPale: '#FFF0F0', green: '#258B74', greenPale: '#E5F7F2',
  line: '#C7D6E8', white: '#FFFFFF'
};

const topics = [
  {
    id: 'topic-internet', provisional: '主题 01（暂定）', name: '互联网',
    note: 'CASE编号与首页顺序待客户确认；两页停留与切换方式待确认。',
    items: [
      {id:'internet-01', no:'01', type:'PPT转图', image:'internet-01.png', page:'0714总稿｜第01页', file:'waic成功案例0714｜第01页', status:'待客户确认', pending:'播放顺序/停留时长待确认'},
      {id:'internet-02', no:'02', type:'PPT转图', image:'internet-02.png', page:'0714总稿｜第02页', file:'waic成功案例0714｜第02页', status:'待客户确认', pending:'主题结束动作待确认'}
    ]
  },
  {
    id: 'topic-llm', provisional: '主题 02（暂定）', name: '大模型',
    note: 'CASE编号与首页顺序待客户确认；两页停留与切换方式待确认。',
    items: [
      {id:'llm-01', no:'01', type:'PPT转图', image:'llm-01.png', page:'0714总稿｜第03页', file:'waic成功案例0714｜第03页', status:'待客户确认', pending:'播放顺序/停留时长待确认'},
      {id:'llm-02', no:'02', type:'PPT转图', image:'llm-02.png', page:'0714总稿｜第04页', file:'waic成功案例0714｜第04页', status:'待客户确认', pending:'主题结束动作待确认'}
    ]
  },
  {
    id: 'topic-aerospace', provisional: '主题 03（暂定）', name: '航空航天',
    note: '0714第05页内嵌GIF，仅用代表帧；须转H.264，转码参数待确认。',
    items: [
      {id:'aerospace-01', no:'01', type:'动画→H.264', image:'aerospace-gif-frame.png', page:'0714总稿｜第05页内嵌GIF', file:'CASE03_航空航天_第05页动图', status:'待转码/待客户确认', pending:'H.264参数与触发方式待确认'}
    ]
  },
  {
    id: 'topic-manufacturing', provisional: '主题 04（暂定）', name: '高端制造',
    note: '补充稿第01页是否替换0714第06页、补充稿第02页是否保留均待确认；0714第07页仅为视频封面。',
    items: [
      {id:'manufacturing-01', no:'01', type:'动画→H.264', image:'high-gif-frame.png', page:'20260817补充稿｜第01页GIF', file:'20260817成功案例补充｜第01页', status:'替换关系待确认', pending:'是否替换0714第06页'},
      {id:'manufacturing-02', no:'02', type:'PPT转图', image:'manufacturing-02.png', page:'20260817补充稿｜第02页', file:'20260817成功案例补充｜第02页', status:'待客户确认', pending:'是否保留视频封面'},
      {id:'manufacturing-03', no:'03', type:'视频', image:'high-video-frame.png', page:'独立视频｜20秒代表帧', file:'云道智造-高端制造案例视频', status:'文件已校验/顺序待确认', pending:'播放方式与关联封面待确认'}
    ]
  },
  {
    id: 'topic-research', provisional: '主题 05（暂定）', name: '科研院所',
    note: '0714第08—11页是否最新版待确认；需徐霞/乔双丽确认版本与四页顺序。',
    items: [
      {id:'research-01', no:'01', type:'PPT转图', image:'research-01.png', page:'0714总稿｜第08页', file:'waic成功案例0714｜第08页', status:'最新版待确认', pending:'徐霞/乔双丽确认'},
      {id:'research-02', no:'02', type:'PPT转图', image:'research-02.png', page:'0714总稿｜第09页', file:'waic成功案例0714｜第09页', status:'待客户确认', pending:'最新版/顺序待确认'},
      {id:'research-03', no:'03', type:'PPT转图', image:'research-03.png', page:'0714总稿｜第10页', file:'waic成功案例0714｜第10页', status:'待客户确认', pending:'最新版/顺序待确认'},
      {id:'research-04', no:'04', type:'PPT转图', image:'research-04.png', page:'0714总稿｜第11页', file:'waic成功案例0714｜第11页', status:'待客户确认', pending:'最新版/主题结束动作待确认'}
    ]
  },
  {
    id: 'topic-marine', provisional: '主题 06（暂定）', name: '海洋模拟',
    note: '0714第12页仅为视频封面；补充稿把ROMS封面归海洋模拟，与8月17日会议口径冲突。',
    items: [
      {id:'marine-01', no:'01', type:'PPT转图', image:'marine-01.png', page:'20260817补充稿｜第03页', file:'20260817成功案例补充｜第03页', status:'待客户确认', pending:'封面/说明页角色待确认'},
      {id:'marine-02', no:'02', type:'视频', image:'marine-video-frame.png', page:'独立视频｜20秒代表帧', file:'港科大淘海数字孪生地球视频', status:'文件已校验/顺序待确认', pending:'播放方式与封面关联待确认'},
      {id:'marine-roms-cover', no:'冲突', type:'候选/归属待确认', image:'marine-03-roms-cover.png', page:'20260817补充稿｜第04页', file:'ROMS封面｜补充稿归海洋模拟', status:'归属冲突', pending:'海洋模拟/AI for Science待客户确认', conflict:true}
    ]
  },
  {
    id: 'topic-ai-science', provisional: '主题 07（暂定）', name: 'AI for Science',
    note: '8月17日会议把ROMS视频归AI for Science；ROMS归属、1080P/4K、顺序均待客户确认。',
    items: [
      {id:'ai-science-01', no:'01', type:'PPT转图', image:'ai-science-01.png', page:'0714总稿｜第13页', file:'waic成功案例0714｜第13页', status:'待客户确认', pending:'顺序与主题结束动作待确认'},
      {id:'ai-science-roms', no:'02', type:'视频/归属待确认', image:'roms-video-frame.png', page:'ROMS-1080P｜20秒代表帧', file:'ROMS-1080P.mp4 / ROMS-4K.mp4', status:'归属/清晰度待确认', pending:'会议归AI for Science；待客户确认', conflict:true}
    ]
  }
];

function tokenFor(file) {
  const row = mediaMap.get(file);
  if (!row) throw new Error(`Missing media token for ${file}`);
  return row.token;
}

function tag(id, text, fill, border, color, width) {
  return {type:'rect', id, text, width, height:'fit-content', fillColor:fill, borderColor:border, borderWidth:2, borderRadius:12, fontSize:11, textColor:color, textAlign:'center', verticalAlign:'middle'};
}

function itemCard(item) {
  const typeColor = item.type.includes('动画') ? [C.orangePale,C.orange,C.orangeDark] : item.type.includes('视频') || item.type.includes('候选') ? [C.cyanPale,C.cyan,'#087985'] : [C.bluePale,C.blue2,C.blue];
  const border = item.conflict ? C.red : C.line;
  return {
    type:'frame', id:`card-${item.id}`, layout:'vertical', gap:8, padding:[0,0,12,0],
    width:330, height:'fit-content', fillColor:C.white, borderColor:border, borderWidth:2,
    borderDash:item.conflict ? 'dashed' : 'solid', borderRadius:14,
    children:[
      {type:'image', id:`image-${item.id}`, width:330, height:186, image:{src:tokenFor(item.image)}},
      {type:'frame', id:`tags-${item.id}`, layout:'horizontal', gap:8, padding:[0,12,0,12], width:330, height:'fit-content', children:[
        tag(`number-${item.id}`,`条目 ${item.no}`,C.navy,C.navy,C.white,item.no === '冲突' ? 76 : 66),
        tag(`type-${item.id}`,item.type,typeColor[0],typeColor[1],typeColor[2],item.type.length > 8 ? 150 : item.type.length > 5 ? 116 : 82)
      ]},
      {type:'text', id:`page-${item.id}`, text:item.page, width:304, height:'fit-content', fontSize:13, textColor:C.ink, textAlign:'left'},
      {type:'text', id:`filename-${item.id}`, text:`短名｜${item.file}`, width:304, height:'fit-content', fontSize:11, textColor:C.muted, textAlign:'left'},
      tag(`status-${item.id}`,`状态｜${item.status}`, item.conflict ? C.redPale : C.orangePale, item.conflict ? C.red : C.orange, item.conflict ? C.red : C.orangeDark, 304),
      {type:'text', id:`pending-${item.id}`, text:`待确认｜${item.pending}`, width:304, height:'fit-content', fontSize:11, textColor:item.conflict ? C.red : C.orangeDark, textAlign:'left'}
    ]
  };
}

function topicRow(topic, index) {
  return {
    type:'frame', id:topic.id, layout:'horizontal', gap:42, padding:24,
    width:2440, height:'fit-content', alignItems:'start',
    fillColor:index % 2 ? '#F8FBFF' : C.white, borderColor:C.line, borderWidth:2, borderRadius:20,
    children:[
      {type:'frame', id:`label-${topic.id}`, layout:'vertical', gap:12, padding:18, width:250, height:'fit-content',
       fillColor:C.bluePale, borderColor:'#BBD4F4', borderWidth:2, borderRadius:16, children:[
        tag(`provisional-${topic.id}`,topic.provisional,C.white,C.blue2,C.blue,214),
        {type:'text', id:`name-${topic.id}`, text:topic.name, width:214, height:'fit-content', fontSize:25, textColor:C.navy, textAlign:'left'},
        {type:'text', id:`hier-${topic.id}`, text:'Pad01成果案例 → 主题 → 条目01/02/03…', width:214, height:'fit-content', fontSize:11, textColor:C.muted, textAlign:'left'},
        {type:'text', id:`freeze-${topic.id}`, text:'建议顺序 / 暂定编号\n非冻结', width:214, height:'fit-content', fontSize:12, textColor:C.orangeDark, textAlign:'left'}
      ]},
      {type:'frame', id:`items-${topic.id}`, layout:'horizontal', gap:56, padding:0, width:'fit-content', height:'fit-content', alignItems:'start',
       children:topic.items.map(itemCard)},
      {type:'frame', id:`note-${topic.id}`, layout:'vertical', gap:10, padding:16, width:360, height:'fit-content',
       fillColor:C.orangePale, borderColor:C.orange, borderWidth:2, borderRadius:16, children:[
        {type:'text', id:`note-title-${topic.id}`, text:'待确认事项', width:328, height:'fit-content', fontSize:17, textColor:C.orangeDark, textAlign:'left'},
        {type:'text', id:`note-body-${topic.id}`, text:topic.note, width:328, height:'fit-content', fontSize:12, textColor:C.ink, textAlign:'left'},
        tag(`note-state-${topic.id}`,'状态：未冻结',C.white,C.orange,C.orangeDark,150)
      ]}
    ]
  };
}

const title = {
  type:'frame', id:'header', layout:'vertical', gap:12, padding:28, width:2440, height:'fit-content',
  fillColor:C.navy, borderColor:C.navy, borderWidth:2, borderRadius:20,
  children:[
    {type:'text', id:'title', text:'Pad 01｜成果案例真实文件名与建议顺序｜媒体可视化清单', width:2384, height:'fit-content', fontSize:32, textColor:C.white, textAlign:'left'},
    {type:'frame', id:'header-tags', layout:'horizontal', gap:12, padding:0, width:'fit-content', height:'fit-content', children:[
      tag('status-customer','客户确认稿 / 非定版开发指令',C.bluePale,'#8CB9F0',C.blue,250),
      tag('status-order','CASE编号及首页顺序暂定',C.orangePale,C.orange,C.orangeDark,220),
      tag('status-nogo','程序未开发 · 生产 NO-GO',C.redPale,C.red,C.red,220)
    ]},
    {type:'text', id:'hierarchy-note', text:'客户确认内容树：Pad01成果案例 → 主题（01/02…仅沟通暂定）→ 每主题条目01/02/03…；主题整组向下排列，条目箭头仅表示建议播放顺序。', width:2384, height:'fit-content', fontSize:15, textColor:'#D7E8FA', textAlign:'left'},
    {type:'text', id:'coverage-note', text:'17个独立真实缩略图｜PPT页、GIF代表帧、视频20秒代表帧｜图片保持16:9比例', width:2384, height:'fit-content', fontSize:13, textColor:'#D7E8FA', textAlign:'left'}
  ]
};

const conflictCallout = {
  type:'frame', id:'roms-conflict-callout', layout:'vertical', gap:8, padding:18, width:2440, height:'fit-content',
  fillColor:C.redPale, borderColor:C.red, borderWidth:2, borderDash:'dashed', borderRadius:16,
  children:[
    {type:'text', id:'roms-conflict-title', text:'ROMS 归属冲突｜必须由客户确认', width:2404, height:'fit-content', fontSize:19, textColor:C.red, textAlign:'left'},
    {type:'text', id:'roms-conflict-body', text:'补充稿第04页把 ROMS 封面归海洋模拟；8月17日会议把 ROMS 视频归 AI for Science。ROMS 1080P / 4K 与主题归属均未冻结。', width:2404, height:'fit-content', fontSize:13, textColor:C.ink, textAlign:'left'}
  ]
};

const footer = {
  type:'frame', id:'footer', layout:'vertical', gap:14, padding:24, width:2440, height:'fit-content',
  fillColor:C.white, borderColor:C.line, borderWidth:2, borderRadius:20,
  children:[
    {type:'text', id:'footer-title', text:'真实完整文件名 / 路径、版本与冻结门', width:2392, height:'fit-content', fontSize:21, textColor:C.navy, textAlign:'left'},
    {type:'text', id:'full-files', text:'PPT｜waic成功案例交互展示0714_飞书下载.pptx\nPPT｜20260817waic成功案例交互展示_飞书消息下载.pptx\n视频｜4-是石科技x云道智造-并行优化-高端制造案例视频_飞书下载.mp4\n视频｜6-是石科技x港科大-淘海数字孪生地球系统-并行优化-案例视频_飞书下载.mp4\nROMS候选｜ROMS-1080P.mp4 / ROMS-4K.mp4', width:2392, height:'fit-content', fontSize:12, textColor:C.ink, textAlign:'left'},
    {type:'text', id:'mandatory-notes', text:'必须保留｜0714第07/12页仅为视频封面；科研院所最新版待确认；高端制造替换关系待确认；ROMS 1080P/4K待确认；CASE编号/首页顺序待客户确认。', width:2392, height:'fit-content', fontSize:13, textColor:C.orangeDark, textAlign:'left'},
    {type:'text', id:'manifest-path', text:'唯一映射基线｜C:\\Users\\visua\\Documents\\ChatGPT\\是石科技_空间体验升级项目\\交付\\是石科技_领域视频互动台_V1\\requirements\\dual-pad-media-control-communication-v0.1\\diagrams\\2026-08-21T013300\\PAD01_MEDIA_PREVIEW_MANIFEST.md', width:2392, height:'fit-content', fontSize:10, textColor:C.muted, textAlign:'left'},
    {type:'text', id:'v02-reference', text:'V0.2视觉沟通参考（替代V0.1）｜D:\\FOR_WORK\\260818_MetaStone\\10_成果案例与产品介绍_整合_20260821\\07_设计协同\\V0.2_平面视觉概念评审版。仍是非定版开发指令；01为评审总览页非Pad运行界面；双Pad不可跨频道；07按频道返回；Pad02 14候选未分配。', width:2392, height:'fit-content', fontSize:11, textColor:C.blue, textAlign:'left'},
    {type:'rect', id:'nogo-footer', text:'P0未关闭｜程序未开发｜生产 NO-GO｜不得解释为已定版、可开发、可生产或现场验收', width:2392, height:'fit-content', fillColor:C.redPale, borderColor:C.red, borderWidth:2, borderDash:'dashed', borderRadius:12, fontSize:14, textColor:C.red, textAlign:'left', verticalAlign:'middle'}
  ]
};

const root = {
  type:'frame', id:'root', x:40, y:40, layout:'vertical', gap:26, padding:30, width:2500, height:'fit-content',
  fillColor:C.bg, borderColor:'#AFC5DD', borderWidth:2, borderRadius:24,
  children:[title, ...topics.map(topicRow), conflictCallout, footer]
};

const connectors = [];
for (const topic of topics) {
  for (let i = 0; i < topic.items.length - 1; i++) {
    connectors.push({type:'connector', id:`flow-${topic.items[i].id}-${topic.items[i+1].id}`, connector:{
      from:`card-${topic.items[i].id}`, to:`card-${topic.items[i+1].id}`, fromAnchor:'right', toAnchor:'left',
      lineShape:'straight', lineColor:C.cyan, lineWidth:3, lineStyle:'solid', endArrow:'triangle', label:'建议/暂定'
    }});
  }
}
for (let i = 0; i < topics.length - 1; i++) {
  connectors.push({type:'connector', id:`topic-flow-${i+1}-${i+2}`, connector:{
    from:`label-${topics[i].id}`, to:`label-${topics[i+1].id}`, fromAnchor:'bottom', toAnchor:'top',
    lineShape:'rightAngle', lineColor:C.cyan, lineWidth:3, lineStyle:'dashed', endArrow:'arrow', label:'主题建议顺序 / 非冻结'
  }});
}
connectors.push({type:'connector', id:'roms-conflict-connector', connector:{
  from:'card-marine-roms-cover', to:'card-ai-science-roms', fromAnchor:'bottom', toAnchor:'top',
  lineShape:'curve', lineColor:C.red, lineWidth:4, lineStyle:'dashed', startArrow:'circle', endArrow:'triangle',
  label:'补充稿归海洋模拟 / 8月17日会议归AI for Science｜待客户确认'
}});

const doc = {version:2, nodes:[root, ...connectors]};
fs.writeFileSync(path.join(outDir, 'diagram.dsl.json'), JSON.stringify(doc, null, 2), 'utf8');

function esc(s) { return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }
function dataUri(file) { return `data:image/png;base64,${fs.readFileSync(path.join(assetDir,file)).toString('base64')}`; }
function svgText(x,y,text,size,color,weight=400) { return `<text x="${x}" y="${y}" fill="${color}" font-family="Microsoft YaHei,Noto Sans SC,sans-serif" font-size="${size}" font-weight="${weight}">${esc(text)}</text>`; }
function svgRect(x,y,w,h,fill,stroke=C.line,sw=1,r=12,dash='') { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash?` stroke-dasharray="${dash}"`:''}/>`; }
function wrap(text, max) { const out=[]; for(let i=0;i<text.length;i+=max) out.push(text.slice(i,i+max)); return out; }

const W=2560, rowH=380, headH=230, footH=570, rowGap=28;
const H=40+headH+topics.length*(rowH+rowGap)+150+footH+80;
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="${C.bg}"/>`;
svg+=svgRect(40,30,2480,headH,C.navy,C.navy,2,22);
svg+=svgText(76,88,'Pad 01｜成果案例真实文件名与建议顺序｜媒体可视化清单',34,C.white,800);
svg+=svgText(76,128,'客户确认稿 / 非定版开发指令　｜　CASE编号及首页顺序暂定　｜　程序未开发 · 生产 NO-GO',17,'#D7E8FA',700);
svg+=svgText(76,168,'客户确认内容树：Pad01成果案例 → 主题（暂定）→ 每主题条目01/02/03…；主题整组向下排列。',15,'#D7E8FA',500);
svg+=svgText(76,202,'17个独立真实缩略图｜PPT页、GIF代表帧、视频20秒代表帧｜箭头仅表示建议播放顺序',14,'#D7E8FA',500);
let y=30+headH+rowGap;
for (let ti=0; ti<topics.length; ti++) {
  const topic=topics[ti];
  svg+=svgRect(40,y,2480,rowH,ti%2?'#F8FBFF':C.white,C.line,2,20);
  svg+=svgRect(64,y+24,250,rowH-48,C.bluePale,'#BBD4F4',2,16);
  svg+=svgText(88,y+68,topic.provisional,15,C.blue,700);
  svg+=svgText(88,y+108,topic.name,26,C.navy,800);
  svg+=svgText(88,y+146,'Pad01 → 主题 → 条目',12,C.muted,500);
  svg+=svgText(88,y+180,'建议/暂定，非冻结',13,C.orangeDark,700);
  let cx=344;
  for (let ii=0; ii<topic.items.length; ii++) {
    const item=topic.items[ii], cw=330, ch=318;
    svg+=svgRect(cx,y+24,cw,ch,C.white,item.conflict?C.red:C.line,2,14,item.conflict?'8 6':'');
    svg+=`<image href="${dataUri(item.image)}" x="${cx}" y="${y+24}" width="${cw}" height="186" preserveAspectRatio="xMidYMid meet"/>`;
    svg+=svgText(cx+12,y+226,`条目 ${item.no}｜${item.type}`,13,item.conflict?C.red:C.blue,700);
    svg+=svgText(cx+12,y+252,item.page,12,C.ink,700);
    svg+=svgText(cx+12,y+274,`短名｜${item.file}`,10,C.muted,500);
    svg+=svgText(cx+12,y+296,`状态｜${item.status}`,10,item.conflict?C.red:C.orangeDark,600);
    svg+=svgText(cx+12,y+316,`待确认｜${item.pending}`,9,item.conflict?C.red:C.orangeDark,500);
    if(ii<topic.items.length-1){ svg+=`<line x1="${cx+cw+6}" y1="${y+182}" x2="${cx+cw+48}" y2="${y+182}" stroke="${C.cyan}" stroke-width="4"/><polygon points="${cx+cw+48},${y+182} ${cx+cw+36},${y+174} ${cx+cw+36},${y+190}" fill="${C.cyan}"/>`; }
    cx+=386;
  }
  const nx=1946;
  svg+=svgRect(nx,y+24,548,rowH-48,C.orangePale,C.orange,2,16);
  svg+=svgText(nx+20,y+60,'待确认事项',18,C.orangeDark,800);
  wrap(topic.note,28).slice(0,5).forEach((line,idx)=>{svg+=svgText(nx+20,y+92+idx*28,line,13,C.ink,500);});
  svg+=svgText(nx+20,y+rowH-48,'状态：未冻结',13,C.orangeDark,700);
  if(ti<topics.length-1){svg+=`<line x1="188" y1="${y+rowH}" x2="188" y2="${y+rowH+rowGap-7}" stroke="${C.cyan}" stroke-width="3" stroke-dasharray="8 5"/><polygon points="188,${y+rowH+rowGap-5} 180,${y+rowH+rowGap-17} 196,${y+rowH+rowGap-17}" fill="${C.cyan}"/>`;}
  y+=rowH+rowGap;
}
svg+=svgRect(40,y,2480,116,C.redPale,C.red,2,16,'10 7');
svg+=svgText(70,y+42,'ROMS 归属冲突｜补充稿第04页归海洋模拟 / 8月17日会议归 AI for Science，待客户确认',18,C.red,800);
svg+=svgText(70,y+78,'ROMS 1080P / 4K、主题归属与是否重复出现均未冻结。',14,C.ink,500);
y+=144;
svg+=svgRect(40,y,2480,footH,C.white,C.line,2,20);
svg+=svgText(70,y+42,'真实完整文件名 / 路径、版本与冻结门',21,C.navy,800);
const footerLines=[
'PPT｜waic成功案例交互展示0714_飞书下载.pptx',
'PPT｜20260817waic成功案例交互展示_飞书消息下载.pptx',
'视频｜4-是石科技x云道智造-并行优化-高端制造案例视频_飞书下载.mp4',
'视频｜6-是石科技x港科大-淘海数字孪生地球系统-并行优化-案例视频_飞书下载.mp4',
'ROMS候选｜ROMS-1080P.mp4 / ROMS-4K.mp4',
'必须保留｜0714第07/12页仅为视频封面；科研院所最新版、高端制造替换、ROMS清晰度、CASE编号/首页顺序均待确认。',
'唯一映射基线｜...\\diagrams\\2026-08-21T013300\\PAD01_MEDIA_PREVIEW_MANIFEST.md',
'V0.2视觉沟通参考替代V0.1，但仍是非定版开发指令；01非Pad运行界面；双Pad不可跨频道；07按频道返回。',
'P0未关闭｜程序未开发｜生产 NO-GO｜不得解释为已定版、可开发、可生产或现场验收'
];
footerLines.forEach((line,idx)=>{svg+=svgText(70,y+84+idx*43,line,idx===8?15:13,idx===8?C.red:(idx>=5?C.orangeDark:C.ink),idx===8?800:500);});
svg+='</svg>';
fs.writeFileSync(path.join(outDir,'diagram.preview.svg'),svg,'utf8');

console.log(JSON.stringify({ok:true, dsl:path.join(outDir,'diagram.dsl.json'), preview:path.join(outDir,'diagram.preview.svg'), media:mediaMap.size, topics:topics.length, connectors:connectors.length}, null, 2));
