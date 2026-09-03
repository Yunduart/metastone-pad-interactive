const fs = require('node:fs');
const path = require('node:path');

const outDir = __dirname;
const media = new Map(JSON.parse(fs.readFileSync(path.join(outDir,'media-map.json'),'utf8')).map(x=>[x.file,x.token]));
const C={bg:'#F2F7FC',navy:'#0B2D5B',ink:'#183153',muted:'#60758F',white:'#FFFFFF',blue:'#1E5FBD',blue2:'#2F80ED',bluePale:'#EAF3FF',cyan:'#0AA9B8',cyanPale:'#DDF8FA',orange:'#F2994A',orangeDark:'#B85C00',orangePale:'#FFF3DE',red:'#D64545',redPale:'#FFF0F0',green:'#258B74',greenPale:'#E5F7F2',line:'#C7D6E8'};

function tok(file){const value=media.get(file);if(!value)throw new Error(`Missing media token: ${file}`);return value;}
function text(id,value,width,size=12,color=C.ink){return {type:'text',id,text:value,width,height:'fit-content',fontSize:size,textColor:color,textAlign:'left'};}
function tag(id,value,width,fill=C.bluePale,border=C.blue2,color=C.blue){return {type:'rect',id,text:value,width,height:'fit-content',fillColor:fill,borderColor:border,borderWidth:2,borderRadius:11,fontSize:11,textColor:color,textAlign:'center',verticalAlign:'middle'};}

const products=[
  {id:'p01',code:'PRODUCT-01',name:'国产 Token 优化工厂',note:'乔双丽候选映射：候选1 + 候选2。',items:[
    {id:'p01-01',no:'01',type:'PPT内嵌视频',image:'cand-v16-frame.png',file:'P02_CANDIDATE_VECTRON_新品发布PPT第16页内嵌视频.mp4',status:'本地候选已存在｜最终采用待确认'},
    {id:'p01-02',no:'02',type:'独立视频',image:'cand-01-frame.png',file:'1-是石科技国产Token优化工厂产品介绍-60s横版-4k.mp4',status:'本地候选已存在｜顺序待确认'}
  ]},
  {id:'p02',code:'PRODUCT-02',name:'超智算集群',note:'乔双丽候选映射：候选3。',items:[
    {id:'p02-01',no:'01',type:'独立视频',image:'cand-02-frame.png',file:'2-是石科技超智算集群介绍-(4K).mp4',status:'本地候选已存在｜播放方式待确认'}
  ]},
  {id:'p03',code:'PRODUCT-03',name:'国产异构超智算中心',note:'目录总10集；群聊最新口径已发布2集，其余8集待发布。已发布2集原视频仍待徐霞提供。',items:[
    {id:'p03-01',no:'01',type:'视频｜待收件',file:'真实文件名待徐霞提供｜已发布第1集',status:'待收件｜不得以截图/代表帧冒充',placeholder:true},
    {id:'p03-02',no:'02',type:'视频｜待收件',file:'真实文件名待徐霞提供｜已发布第2集',status:'待收件｜不得以截图/代表帧冒充',placeholder:true}
  ]},
  {id:'p04',code:'PRODUCT-04',name:'国产 Token 优化工厂计算速度大比拼：CPU vs GPU',note:'乔双丽候选映射：候选8。',items:[
    {id:'p04-01',no:'01',type:'独立视频',image:'cand-08-frame.png',file:'8-是石科技国产Token优化工厂-CPU国产移植GPU-1080P.mp4',status:'本地候选已存在｜标题/顺序待确认'}
  ]},
  {id:'p05',code:'PRODUCT-05',name:'国产 Token 优化工厂-技术优势',note:'乔双丽候选映射：候选4。',items:[
    {id:'p05-01',no:'01',type:'独立视频',image:'cand-03-frame.png',file:'3-是石科技国产Token优化工厂产品优势盘点-4k.mp4',status:'本地候选已存在｜播放方式待确认'}
  ]},
  {id:'p06',code:'PRODUCT-06',name:'AI infra',note:'乔双丽候选映射：候选5。',items:[
    {id:'p06-01',no:'01',type:'独立视频',image:'cand-04-frame.png',file:'4-是石科技AIinfra行业介绍-4K.mp4',status:'本地候选已存在｜显示名待确认'}
  ]},
  {id:'p07',code:'PRODUCT-07',name:'PD 分离',note:'乔双丽候选映射：候选6。',items:[
    {id:'p07-01',no:'01',type:'独立视频',image:'cand-05-frame.png',file:'5-是石科技国产Token优化工厂-PD分离-1080P.mp4',status:'本地候选已存在｜播放方式待确认'}
  ]},
  {id:'p08',code:'PRODUCT-08',name:'投机解码',note:'乔双丽候选映射：候选7。',items:[
    {id:'p08-01',no:'01',type:'独立视频',image:'cand-06-frame.png',file:'6-是石科技国产Token优化工厂-投机解码-1080p.mp4',status:'本地候选已存在｜播放方式待确认'}
  ]},
  {id:'p09',code:'PRODUCT-09',name:'多层级 KV Cache',note:'本地找到两份逐字节相同候选；待乔双丽或徐霞确认采用版本，确认前不得硬编码。',items:[
    {id:'p09-01',no:'01',type:'独立视频｜候选',image:'cand-07-frame.png',file:'7-是石科技国产Token优化工厂-多层级KVCache-1080P.mp4',status:'本地候选已找到｜版本待确认'}
  ]}
];

function itemCard(item){
  const visual=item.placeholder
    ? {type:'frame',id:`pending-${item.id}`,layout:'vertical',gap:10,padding:20,width:420,height:236,fillColor:C.redPale,borderColor:C.red,borderWidth:2,borderDash:'dashed',borderRadius:12,children:[text(`pending-title-${item.id}`,'原视频待徐霞提供',380,23,C.red),text(`pending-body-${item.id}`,'目录/集数已确认到沟通层；真实媒体文件尚未收到。',380,13,C.ink)]}
    : {type:'image',id:`image-${item.id}`,width:420,height:236,image:{src:tok(item.image)}};
  return {type:'frame',id:`card-${item.id}`,layout:'vertical',gap:7,padding:[0,0,12,0],width:420,height:'fit-content',children:[
    visual,
    {type:'frame',id:`tags-${item.id}`,layout:'horizontal',gap:8,padding:[0,12,0,12],width:420,height:'fit-content',children:[
      tag(`no-${item.id}`,`条目 ${item.no}`,72,C.navy,C.navy,C.white),
      tag(`type-${item.id}`,item.type,160,item.placeholder?C.redPale:(item.type.includes('视频')?C.cyanPale:C.bluePale),item.placeholder?C.red:(item.type.includes('视频')?C.cyan:C.blue2),item.placeholder?C.red:(item.type.includes('视频')?'#087985':C.blue))
    ]},
    text(`file-${item.id}`,`真实文件名｜${item.file}`,394,11,C.ink),
    tag(`status-${item.id}`,`状态｜${item.status}`,394,item.placeholder?C.redPale:C.orangePale,item.placeholder?C.red:C.orange,item.placeholder?C.red:C.orangeDark)
  ]};
}

function productRow(product,index){
  return {type:'frame',id:`product-${product.id}`,layout:'horizontal',gap:34,padding:22,width:2440,height:'fit-content',alignItems:'start',fillColor:index%2?'#F8FBFF':C.white,borderColor:C.line,borderWidth:2,borderRadius:20,children:[
    {type:'frame',id:`label-${product.id}`,layout:'vertical',gap:12,padding:18,width:300,height:'fit-content',fillColor:C.bluePale,borderColor:'#BBD4F4',borderWidth:2,borderRadius:16,children:[
      tag(`code-${product.id}`,product.code,264,C.white,C.blue2,C.blue),text(`name-${product.id}`,product.name,264,20,C.navy),text(`channel-${product.id}`,'Pad02 / 产品介绍',264,11,C.muted),tag(`state-${product.id}`,'工作目录｜未开发冻结',264,C.orangePale,C.orange,C.orangeDark)
    ]},
    {type:'frame',id:`items-${product.id}`,layout:'horizontal',gap:44,padding:0,width:'fit-content',height:'fit-content',alignItems:'start',children:product.items.map(itemCard)},
    {type:'frame',id:`confirm-${product.id}`,layout:'vertical',gap:10,padding:16,width:430,height:'fit-content',fillColor:C.orangePale,borderColor:C.orange,borderWidth:2,borderRadius:16,children:[
      text(`mapping-${product.id}`,'当前映射 / 待确认',398,17,C.orangeDark),text(`note-${product.id}`,product.note,398,12,C.ink),
      text(`mode-${product.id}`,'播放方式：□手动下一步 □自动',398,12,C.ink),text(`duration-${product.id}`,'停留/时长：____秒',398,12,C.ink),
      text(`confirmer-${product.id}`,'客户确认人：____　日期：____',398,12,C.ink),tag(`freeze-${product.id}`,'未冻结 / 不得写死',180,C.white,C.orange,C.orangeDark)
    ]}
  ]};
}

const header={type:'frame',id:'header',layout:'vertical',gap:12,padding:28,width:2440,height:'fit-content',fillColor:C.navy,borderColor:C.navy,borderWidth:2,borderRadius:20,children:[
  text('title','Pad 02｜PRODUCT-01—09｜产品目录与真实媒体映射',2384,32,C.white),
  {type:'frame',id:'header-tags',layout:'horizontal',gap:12,padding:0,width:'fit-content',height:'fit-content',children:[
    tag('tag-source','乔双丽群反馈 2026-08-21',240,C.bluePale,'#8CB9F0',C.blue),
    tag('tag-directory','当前工作目录 01—09',210,C.orangePale,C.orange,C.orangeDark),
    tag('tag-nogo','程序未开发 · 生产 NO-GO',220,C.redPale,C.red,C.red)
  ]},
  text('scope-note','9个独立真实视频缩略图 + 2个“已发布但待收件”文字卡｜映射用于客户确认，不是程序开发放行',2384,14,'#D7E8FA')
]};

const evidence={type:'frame',id:'evidence',layout:'vertical',gap:8,padding:18,width:2440,height:'fit-content',fillColor:C.greenPale,borderColor:C.green,borderWidth:2,borderRadius:16,children:[
  text('evidence-title','P09 本地候选核验',2404,19,C.green),
  text('evidence-body','7-是石科技国产Token优化工厂-多层级KVCache-1080P.mp4 与内容中心库 KVCache1080P.mp4：均 99,388,090 bytes，SHA256=68E245958DA2170FD48FD43F414D063E2CF6DA93F87A8DB0724CE0F6AC770CE6。两份相同，但采用哪一路径仍待乔双丽或徐霞确认。',2404,12,C.ink)
]};

const exclusions={type:'frame',id:'exclusions',layout:'vertical',gap:8,padding:18,width:2440,height:'fit-content',fillColor:C.redPale,borderColor:C.red,borderWidth:2,borderDash:'dashed',borderRadius:16,children:[
  text('exclusions-title','本轮删除 / 排除 / 暂不映射',2404,19,C.red),
  text('exclusions-body','整套“新品发布PPT”页面候选、PPT第05页内嵌视频、拓元体验台、算电协同落地实践：不进入当前目录。候选9“9-行业Agent产品规划介绍-4K.mp4”无产品映射，不硬塞。ROMS-1080P/4K“异构并行优化”虽为产品视频，但产品归属未确认，暂不映射。',2404,13,C.ink)
]};

const footer={type:'frame',id:'footer',layout:'vertical',gap:10,padding:22,width:2440,height:'fit-content',fillColor:C.white,borderColor:C.line,borderWidth:2,borderRadius:18,children:[
  text('footer-title','播放控制与冻结门',2396,20,C.navy),
  text('footer-control','图片/PPT转图：上一页、下一页；视频：播放、暂停、进度、静音、下一项；最后一项：重播或返回产品列表。Pad01/Pad02 controllerId、channel、catalogId 与目标播放端必须锁定，严禁串控。',2396,13,C.ink),
  text('footer-freeze','客户逐项确认 → 顺序确认 → 真实文件名确认 → 播放方式/时长确认 → 确认人/日期/版本 → 项目经理标记已定版 → 才能进入开发。',2396,13,C.orangeDark),
  tag('footer-nogo','当前：客户确认输入 / 非定版开发指令 / 程序 NO-GO',2396,C.redPale,C.red,C.red)
]};

const root={type:'frame',id:'root',x:40,y:40,layout:'vertical',gap:26,padding:30,width:2500,height:'fit-content',fillColor:C.bg,borderColor:'#AFC5DD',borderWidth:2,borderRadius:24,children:[header,evidence,...products.map(productRow),exclusions,footer]};
const connectors=[];
for(const product of products){for(let i=0;i<product.items.length-1;i++)connectors.push({type:'connector',id:`flow-${product.items[i].id}-${product.items[i+1].id}`,connector:{from:product.items[i].placeholder?`pending-${product.items[i].id}`:`image-${product.items[i].id}`,to:product.items[i+1].placeholder?`pending-${product.items[i+1].id}`:`image-${product.items[i+1].id}`,fromAnchor:'right',toAnchor:'left',lineShape:'straight',lineColor:C.cyan,lineWidth:3,endArrow:'triangle',label:'条目顺序待确认'}});}
for(let i=0;i<products.length-1;i++)connectors.push({type:'connector',id:`product-flow-${i+1}-${i+2}`,connector:{from:`label-${products[i].id}`,to:`label-${products[i+1].id}`,fromAnchor:'bottom',toAnchor:'top',lineShape:'rightAngle',lineColor:C.cyan,lineWidth:3,lineStyle:'dashed',endArrow:'arrow',label:'目录顺序 01→09'}});

const document={version:2,nodes:[root,...connectors]};
fs.writeFileSync(path.join(outDir,'diagram.dsl.json'),`${JSON.stringify(document,null,2)}\n`,'utf8');
process.stdout.write(`${JSON.stringify({ok:true,products:products.length,imageNodes:products.flatMap(x=>x.items).filter(x=>!x.placeholder).length,pendingNodes:products.flatMap(x=>x.items).filter(x=>x.placeholder).length,connectors:connectors.length},null,2)}\n`);
