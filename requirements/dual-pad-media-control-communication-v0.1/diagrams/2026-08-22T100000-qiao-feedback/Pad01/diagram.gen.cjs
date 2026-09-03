const fs = require('node:fs');
const path = require('node:path');

const outDir = __dirname;
const media = new Map(JSON.parse(fs.readFileSync(path.join(outDir, 'media-map.json'), 'utf8')).map(x => [x.file, x.token]));
const C = {
  bg:'#F2F7FC', navy:'#0B2D5B', ink:'#183153', muted:'#60758F', white:'#FFFFFF',
  blue:'#1E5FBD', blue2:'#2F80ED', bluePale:'#EAF3FF', cyan:'#0AA9B8', cyanPale:'#DDF8FA',
  orange:'#F2994A', orangeDark:'#B85C00', orangePale:'#FFF3DE', red:'#D64545', redPale:'#FFF0F0',
  green:'#258B74', greenPale:'#E5F7F2', line:'#C7D6E8'
};

function token(file) {
  const value = media.get(file);
  if (!value) throw new Error(`Missing media token: ${file}`);
  return value;
}
function text(id, value, width, size=12, color=C.ink) {
  return {type:'text', id, text:value, width, height:'fit-content', fontSize:size, textColor:color, textAlign:'left'};
}
function tag(id, value, width, fill=C.bluePale, border=C.blue2, color=C.blue) {
  return {type:'rect', id, text:value, width, height:'fit-content', fillColor:fill, borderColor:border, borderWidth:2,
    borderRadius:11, fontSize:11, textColor:color, textAlign:'center', verticalAlign:'middle'};
}

const topics = [
  {id:'internet', order:'主题 01（暂定）', name:'互联网', note:'CASE 编号与首页顺序仍待客户冻结。', items:[
    {id:'internet-01', no:'01', type:'PPT转图', image:'internet-01.png', page:'0714总稿｜第01页', file:'waic成功案例0714｜第01页', status:'本地页预览已存在｜顺序/时长待确认'},
    {id:'internet-02', no:'02', type:'PPT转图', image:'internet-02.png', page:'0714总稿｜第02页', file:'waic成功案例0714｜第02页', status:'本地页预览已存在｜顺序/时长待确认'}
  ]},
  {id:'llm', order:'主题 02（暂定）', name:'大模型', note:'两页内容、停留时长和结束动作待客户确认。', items:[
    {id:'llm-01', no:'01', type:'PPT转图', image:'llm-01.png', page:'0714总稿｜第03页', file:'waic成功案例0714｜第03页', status:'本地页预览已存在｜顺序/时长待确认'},
    {id:'llm-02', no:'02', type:'PPT转图', image:'llm-02.png', page:'0714总稿｜第04页', file:'waic成功案例0714｜第04页', status:'本地页预览已存在｜顺序/时长待确认'}
  ]},
  {id:'aerospace', order:'主题 03（暂定）', name:'航空航天', note:'0714第05页 GIF 必须转 H.264；转码参数与播放方式待确认。', items:[
    {id:'aerospace-01', no:'01', type:'GIF→H.264', image:'aerospace-gif-frame.png', page:'0714总稿｜第05页内嵌GIF', file:'waic成功案例0714｜第05页动图', status:'代表帧已存在｜转码与时长待确认'}
  ]},
  {id:'manufacturing', order:'主题 04（暂定）', name:'高端制造', note:'补充稿第01/02页与独立视频的组合及顺序待客户确认。', items:[
    {id:'manufacturing-01', no:'01', type:'GIF→H.264', image:'high-gif-frame.png', page:'20260817补充稿｜第01页GIF', file:'20260817成功案例补充｜第01页', status:'代表帧已存在｜替换关系待确认'},
    {id:'manufacturing-02', no:'02', type:'PPT转图', image:'manufacturing-02.png', page:'20260817补充稿｜第02页', file:'20260817成功案例补充｜第02页', status:'本地页预览已存在｜是否保留待确认'},
    {id:'manufacturing-03', no:'03', type:'视频', image:'high-video-frame.png', page:'独立视频｜代表帧', file:'4-是石科技x云道智造-并行优化-高端制造案例视频_飞书下载.mp4', status:'文件已校验｜播放方式待确认'}
  ]},
  {id:'research', order:'主题 05（暂定）', name:'科研院所', note:'四页是否为最新版，仍需徐霞/乔双丽确认。', items:[
    {id:'research-01', no:'01', type:'PPT转图', image:'research-01.png', page:'0714总稿｜第08页', file:'waic成功案例0714｜第08页', status:'最新版/顺序待确认'},
    {id:'research-02', no:'02', type:'PPT转图', image:'research-02.png', page:'0714总稿｜第09页', file:'waic成功案例0714｜第09页', status:'最新版/顺序待确认'},
    {id:'research-03', no:'03', type:'PPT转图', image:'research-03.png', page:'0714总稿｜第10页', file:'waic成功案例0714｜第10页', status:'最新版/顺序待确认'},
    {id:'research-04', no:'04', type:'PPT转图', image:'research-04.png', page:'0714总稿｜第11页', file:'waic成功案例0714｜第11页', status:'最新版/顺序待确认'}
  ]},
  {id:'marine', order:'主题 06（暂定）', name:'海洋模拟', note:'旧“补充稿第04页/ROMS封面”已撤下。最新视频号 ROMS 原视频待徐霞提供，未收件前不得用于程序。', items:[
    {id:'marine-01', no:'01', type:'PPT转图', image:'marine-01.png', page:'20260817补充稿｜第03页', file:'20260817成功案例补充｜第03页', status:'本地页预览已存在｜顺序待确认'},
    {id:'marine-02', no:'02', type:'视频', image:'marine-video-frame.png', page:'独立视频｜代表帧', file:'6-是石科技x港科大-淘海数字孪生地球系统-并行优化-案例视频_飞书下载.mp4', status:'文件已校验｜播放方式待确认'},
    {id:'marine-roms-latest', no:'03', type:'视频｜待收件', page:'最新视频号发布 ROMS 视频', file:'真实文件名待徐霞提供', status:'待收件｜不得以截图/封面代替交付文件', placeholder:true}
  ]},
  {id:'ai-science', order:'主题 07（暂定）', name:'AI for Science', note:'ROMS-1080P/4K“异构并行优化”属于产品视频，已移出成果案例；产品归属未确认前不映射。', items:[
    {id:'ai-science-01', no:'01', type:'PPT转图', image:'ai-science-01.png', page:'0714总稿｜第13页', file:'waic成功案例0714｜第13页', status:'本地页预览已存在｜顺序/时长待确认'}
  ]}
];

function itemCard(item) {
  const body = item.placeholder
    ? {type:'frame', id:`pending-panel-${item.id}`, layout:'vertical', gap:10, padding:20, width:330, height:186,
       fillColor:C.redPale, borderColor:C.red, borderWidth:2, borderDash:'dashed', borderRadius:12,
       children:[text(`pending-title-${item.id}`,'原视频待徐霞提供',290,22,C.red), text(`pending-desc-${item.id}`,'仅确认目录需求；尚无可交付媒体文件。',290,13,C.ink)]}
    : {type:'image', id:`image-${item.id}`, width:330, height:186, image:{src:token(item.image)}};
  return {type:'frame', id:`card-${item.id}`, layout:'vertical', gap:7, padding:[0,0,12,0], width:330, height:'fit-content',
    children:[body,
      {type:'frame', id:`tags-${item.id}`, layout:'horizontal', gap:8, padding:[0,12,0,12], width:330, height:'fit-content', children:[
        tag(`no-${item.id}`,`条目 ${item.no}`,72,C.navy,C.navy,C.white),
        tag(`type-${item.id}`,item.type,130,item.placeholder?C.redPale:(item.type.includes('视频')?C.cyanPale:C.bluePale),item.placeholder?C.red:(item.type.includes('视频')?C.cyan:C.blue2),item.placeholder?C.red:(item.type.includes('视频')?'#087985':C.blue))
      ]},
      text(`page-${item.id}`,item.page,304,13,C.ink),
      text(`file-${item.id}`,`真实文件/页｜${item.file}`,304,10,C.muted),
      tag(`status-${item.id}`,`状态｜${item.status}`,304,item.placeholder?C.redPale:C.orangePale,item.placeholder?C.red:C.orange,item.placeholder?C.red:C.orangeDark),
      text(`fields-${item.id}`,'播放：□手动下一步 □自动　时长：____秒　确认人：____',304,10,C.orangeDark)
    ]};
}

function topicRow(topic, index) {
  return {type:'frame', id:`topic-${topic.id}`, layout:'horizontal', gap:34, padding:22, width:2440, height:'fit-content', alignItems:'start',
    fillColor:index%2?'#F8FBFF':C.white, borderColor:C.line, borderWidth:2, borderRadius:20, children:[
      {type:'frame', id:`label-${topic.id}`, layout:'vertical', gap:12, padding:18, width:250, height:'fit-content',
       fillColor:C.bluePale, borderColor:'#BBD4F4', borderWidth:2, borderRadius:16, children:[
        tag(`order-${topic.id}`,topic.order,214,C.white,C.blue2,C.blue), text(`name-${topic.id}`,topic.name,214,25,C.navy),
        text(`tree-${topic.id}`,'Pad01成果案例 → 主题 → 条目',214,11,C.muted), text(`freeze-${topic.id}`,'建议顺序 / 编号暂定',214,12,C.orangeDark)
      ]},
      {type:'frame', id:`items-${topic.id}`, layout:'horizontal', gap:42, padding:0, width:'fit-content', height:'fit-content', alignItems:'start', children:topic.items.map(itemCard)},
      {type:'frame', id:`note-${topic.id}`, layout:'vertical', gap:10, padding:16, width:360, height:'fit-content',
       fillColor:C.orangePale, borderColor:C.orange, borderWidth:2, borderRadius:16, children:[
        text(`note-title-${topic.id}`,'待确认事项',328,17,C.orangeDark), text(`note-body-${topic.id}`,topic.note,328,12,C.ink),
        tag(`note-state-${topic.id}`,'状态：未冻结',150,C.white,C.orange,C.orangeDark)
      ]}
    ]};
}

const header = {type:'frame', id:'header', layout:'vertical', gap:12, padding:28, width:2440, height:'fit-content',
  fillColor:C.navy, borderColor:C.navy, borderWidth:2, borderRadius:20, children:[
    text('title','Pad 01｜成果案例 01—07｜真实媒体与建议顺序',2384,32,C.white),
    {type:'frame', id:'header-tags', layout:'horizontal', gap:12, padding:0, width:'fit-content', height:'fit-content', children:[
      tag('tag-source','乔双丽群反馈 2026-08-21',240,C.bluePale,'#8CB9F0',C.blue),
      tag('tag-order','CASE编号及首页顺序暂定',220,C.orangePale,C.orange,C.orangeDark),
      tag('tag-nogo','程序未开发 · 生产 NO-GO',220,C.redPale,C.red,C.red)
    ]},
    text('header-note','15个独立真实缩略图 + 1个 ROMS 待收件卡｜旧 ROMS 封面已撤下｜异构并行优化视频已移出成果案例',2384,14,'#D7E8FA')
  ]};

const change = {type:'frame', id:'change-callout', layout:'vertical', gap:8, padding:18, width:2440, height:'fit-content',
  fillColor:C.redPale, borderColor:C.red, borderWidth:2, borderDash:'dashed', borderRadius:16, children:[
    text('change-title','本轮关键修订',2404,19,C.red),
    text('change-body','海洋模拟：新增“最新视频号 ROMS 视频”待收件项，移除补充稿第04页/旧封面。AI for Science：只保留0714第13页；ROMS-1080P/4K“异构并行优化”转为产品视频待归属确认。',2404,13,C.ink)
  ]};

const footer = {type:'frame', id:'footer', layout:'vertical', gap:10, padding:22, width:2440, height:'fit-content',
  fillColor:C.white, borderColor:C.line, borderWidth:2, borderRadius:18, children:[
    text('footer-title','确认门与证据口径',2396,20,C.navy),
    text('footer-rule','客户逐项确认 → 顺序确认 → 真实文件名确认 → 播放方式/时长确认 → 确认人/日期/版本 → 项目经理标记已定版 → 才能进入开发。',2396,13,C.ink),
    text('footer-evidence','wiki 勾选仅证明目录存在；待收件项不得以群截图、封面或代表帧冒充已交付原视频。',2396,13,C.orangeDark),
    tag('footer-nogo','当前：客户确认输入 / 非定版开发指令 / 程序 NO-GO',2396,C.redPale,C.red,C.red)
  ]};

const root = {type:'frame', id:'root', x:40, y:40, layout:'vertical', gap:26, padding:30, width:2500, height:'fit-content',
  fillColor:C.bg, borderColor:'#AFC5DD', borderWidth:2, borderRadius:24,
  children:[header, change, ...topics.map(topicRow), footer]};

const connectors=[];
for (const topic of topics) {
  for (let i=0;i<topic.items.length-1;i++) connectors.push({type:'connector', id:`flow-${topic.items[i].id}-${topic.items[i+1].id}`,
    connector:{from:topic.items[i].placeholder?`pending-panel-${topic.items[i].id}`:`image-${topic.items[i].id}`,to:topic.items[i+1].placeholder?`pending-panel-${topic.items[i+1].id}`:`image-${topic.items[i+1].id}`,fromAnchor:'right',toAnchor:'left',lineShape:'straight',lineColor:C.cyan,lineWidth:3,endArrow:'triangle',label:'建议播放顺序'}});
}
for (let i=0;i<topics.length-1;i++) connectors.push({type:'connector', id:`topic-flow-${i+1}-${i+2}`,
  connector:{from:`label-${topics[i].id}`,to:`label-${topics[i+1].id}`,fromAnchor:'bottom',toAnchor:'top',lineShape:'rightAngle',lineColor:C.cyan,lineWidth:3,lineStyle:'dashed',endArrow:'arrow',label:'主题顺序暂定'}});

const document={version:2,nodes:[root,...connectors]};
fs.writeFileSync(path.join(outDir,'diagram.dsl.json'),`${JSON.stringify(document,null,2)}\n`,'utf8');
process.stdout.write(`${JSON.stringify({ok:true,topics:topics.length,imageNodes:topics.flatMap(x=>x.items).filter(x=>!x.placeholder).length,pendingNodes:topics.flatMap(x=>x.items).filter(x=>x.placeholder).length,connectors:connectors.length},null,2)}\n`);
