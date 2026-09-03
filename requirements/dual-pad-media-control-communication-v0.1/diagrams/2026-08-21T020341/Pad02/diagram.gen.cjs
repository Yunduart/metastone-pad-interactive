const fs = require('fs');
const path = require('path');

const outDir = __dirname;
const media = new Map(JSON.parse(fs.readFileSync(path.join(outDir, 'media-map.json'), 'utf8')).map(x => [x.file, x.token]));

const C = {
  bg:'#F2F7FC', navy:'#0B2D5B', ink:'#183153', muted:'#60758F', white:'#FFFFFF',
  blue:'#1E5FBD', blue2:'#2F80ED', bluePale:'#EAF3FF', cyan:'#0AA9B8', cyanPale:'#DDF8FA',
  orange:'#F2994A', orangeDark:'#B85C00', orangePale:'#FFF3DE', red:'#D64545', redPale:'#FFF0F0',
  green:'#258B74', greenPale:'#E5F7F2', line:'#C7D6E8'
};

function tok(file){ const value=media.get(file); if(!value) throw new Error(`Missing token: ${file}`); return value; }
function text(id,value,width,size=12,color=C.ink,align='left'){return {type:'text',id,text:value,width,height:'fit-content',fontSize:size,textColor:color,textAlign:align};}
function tag(id,value,width,fill=C.bluePale,border=C.blue2,color=C.blue){return {type:'rect',id,text:value,width,height:'fit-content',fillColor:fill,borderColor:border,borderWidth:2,borderRadius:12,fontSize:11,textColor:color,textAlign:'center',verticalAlign:'middle'};}

function mediaCard(item, width=300, imageH=169){
  return {
    type:'frame', id:`card-${item.id}`, layout:'vertical', gap:6, padding:0, width, height:'fit-content',
    children:[
      {type:'image', id:`image-${item.id}`, width, height:imageH, image:{src:tok(item.image)}},
      {type:'frame', id:`meta-${item.id}`, layout:'vertical', gap:6, padding:10, width, height:'fit-content',
       fillColor:C.white, borderColor:item.alert?C.red:C.line, borderWidth:2, borderDash:item.alert?'dashed':'solid', borderRadius:10,
       children:[
        {type:'frame', id:`tags-${item.id}`, layout:'horizontal', gap:6, padding:0, width:'fit-content', height:'fit-content', children:[
          tag(`item-${item.id}`,item.item,82,C.navy,C.navy,C.white),
          tag(`type-${item.id}`,item.type,item.type.length>8?150:110,item.alert?C.redPale:(item.type.includes('视频')?C.cyanPale:C.bluePale),item.alert?C.red:(item.type.includes('视频')?C.cyan:C.blue2),item.alert?C.red:(item.type.includes('视频')?'#087985':C.blue))
        ]},
        text(`name-${item.id}`,item.name,width-20,12,C.ink),
        text(`file-${item.id}`,`真实文件/页｜${item.file}`,width-20,10,C.muted),
        tag(`status-${item.id}`,`状态｜${item.status}`,width-20,item.alert?C.redPale:C.orangePale,item.alert?C.red:C.orange,item.alert?C.red:C.orangeDark),
        text(`pending-${item.id}`,`待确认｜${item.pending}`,width-20,10,item.alert?C.red:C.orangeDark)
       ]}
    ]
  };
}

function row(id, items, cardWidth=300, imageH=169){
  return {type:'frame',id,layout:'horizontal',gap:26,padding:18,width:'fit-content',height:'fit-content',alignItems:'start',
    fillColor:'#F8FBFF',borderColor:C.line,borderWidth:2,borderRadius:16,
    children:items.map(x=>mediaCard(x,cardWidth,imageH))};
}

const slides = [
  ['01','新品发布封面'],['02','从规模竞赛到效率竞赛'],['03','算力效率成为新生产力'],['04','国产Token优化工厂｜四大瓶颈'],
  ['05','拓元 Vectron'],['06','稳定、高效的 Token'],['07','拓元 Vectron 架构'],['08','AI 全链路优化'],
  ['10','全模态推理的 Token 压缩'],['11','长上下文后训练优化'],['12','深度推理优化'],['13','智能体长程任务记忆'],
  ['14','从技术突破到规模化应用'],['15','体验中心入口'],['16','拓元体验中心页面'],['17','AI Infra 能力'],
  ['18','国家级算力 / 产业级基础设施'],['19','AI 时代结尾主张']
].map(([n,name])=>({id:`slide-${n}`,item:`第${n}页`,type:'PPT代表页',image:`slide-${n}.png`,name,file:`P02_CANDIDATE_VECTRON_slide_${n}.png`,status:'候选页 / 未分配产品槽',pending:'是否选用、归属产品、页面顺序'}));

const sourceCards = [
  {id:'source-editable',item:'页面源A',type:'可编辑PPTX',image:'deck-editable-slide-01.png',name:'新品发布 PPT｜19页可编辑母版',file:'Update【可编辑】是石科技新品发布PPT0717.pptx',status:'候选源 / 未分配产品槽',pending:'选页与正式产品映射'},
  {id:'source-control',item:'页面源B',type:'控台参考PPTX',image:'deck-control-slide-01.png',name:'新品发布 PPT｜19页图片化控台版',file:'Update【控台】是石科技新品发布PPT0717.pptx',status:'仅播放/视觉参考',pending:'不可作为编辑母版；产品映射待确认'}
];

const embedded = [
  {id:'embedded-v05',item:'第05页',type:'PPT内嵌视频',image:'cand-v05-frame.png',name:'新品发布 PPT 第05页内嵌视频｜5.05秒代表帧',file:'P02_CANDIDATE_VECTRON_新品发布PPT第05页内嵌视频.mp4',status:'已提取 / 候选',pending:'是否独立成播放条目'},
  {id:'embedded-v16',item:'第16页',type:'PPT内嵌视频',image:'cand-v16-frame.png',name:'新品发布 PPT 第16页内嵌视频｜20秒代表帧',file:'P02_CANDIDATE_VECTRON_新品发布PPT第16页内嵌视频.mp4',status:'已提取 / 候选',pending:'是否独立成播放条目'}
];

const independents = [
  {id:'video-01',item:'候选01',type:'独立视频',image:'cand-01-frame.png',name:'国产 Token 优化工厂产品介绍｜20秒代表帧',file:'1-是石科技国产Token优化工厂产品介绍-60s横版-4k.mp4',status:'候选 / 未分配产品槽',pending:'正式产品号与顺序'},
  {id:'video-02',item:'候选02',type:'独立视频',image:'cand-02-frame.png',name:'超智算集群介绍｜20秒代表帧',file:'2-是石科技超智算集群介绍-(4K).mp4',status:'候选 / 未分配产品槽',pending:'正式产品号与顺序'},
  {id:'video-03',item:'候选03',type:'独立视频',image:'cand-03-frame.png',name:'Token 优化工厂产品优势盘点｜20秒代表帧',file:'3-是石科技国产Token优化工厂产品优势盘点-4k.mp4',status:'候选 / 未分配产品槽',pending:'正式产品号与顺序'},
  {id:'video-04',item:'候选04',type:'独立视频',image:'cand-04-frame.png',name:'AI Infra 行业介绍｜20秒代表帧',file:'4-是石科技AIinfra行业介绍-4K.mp4',status:'候选 / 未分配产品槽',pending:'正式产品号与顺序'},
  {id:'video-05',item:'候选05',type:'独立视频',image:'cand-05-frame.png',name:'Token 优化工厂｜PD 分离｜20秒代表帧',file:'5-是石科技国产Token优化工厂-PD分离-1080P.mp4',status:'候选 / 未分配产品槽',pending:'正式产品号与顺序'},
  {id:'video-06',item:'候选06',type:'独立视频',image:'cand-06-frame.png',name:'Token 优化工厂｜投机解码｜20秒代表帧',file:'6-是石科技国产Token优化工厂-投机解码-1080p.mp4',status:'候选 / 未分配产品槽',pending:'正式产品号与顺序'},
  {id:'video-08',item:'候选08',type:'独立视频',image:'cand-08-frame.png',name:'CPU 国产移植 GPU｜20秒代表帧',file:'8-是石科技国产Token优化工厂-CPU国产移植GPU-1080P.mp4',status:'候选 / 未分配产品槽',pending:'正式产品号与顺序'},
  {id:'video-09',item:'候选09',type:'独立视频',image:'cand-09-frame.png',name:'行业 Agent 产品规划介绍｜20秒代表帧',file:'9-行业Agent产品规划介绍-4K.mp4',status:'候选 / 未分配产品槽',pending:'正式产品号与顺序'},
  {id:'video-experience',item:'体验台',type:'独立视频',image:'cand-experience-frame.png',name:'拓元体验台｜40秒代表帧',file:'【控台】拓元体验台.mp4',status:'候选 / 未分配产品槽',pending:'正式产品号与顺序'},
  {id:'file-power',item:'扩展源',type:'独立PPTX',image:'power-project-slide-01.png',name:'算电协同落地实践｜29页内容源',file:'【编辑版V2】是石科技-从0到1国内首个铁铬液流离网算电协同示范项目的落地实践.pptx',status:'候选文件 / 未分配产品槽',pending:'不建议整套播放；选页与归属待确认'}
];

const sourceRow = row('ppt-source-row',sourceCards,420,236);
const slideRows = [row('ppt-pages-row-1',slides.slice(0,5)),row('ppt-pages-row-2',slides.slice(5,10)),row('ppt-pages-row-3',slides.slice(10,15)),row('ppt-pages-row-4',slides.slice(15))];
const embeddedRow = row('embedded-row',embedded,420,236);
const independentRows = [row('independent-row-1',independents.slice(0,4),400,225),row('independent-row-2',independents.slice(4,8),400,225),row('independent-row-3',independents.slice(8),400,225)];

function group(id,titleText,subtitle,children,color=C.blue){
  return {type:'frame',id,layout:'vertical',gap:18,padding:24,width:1960,height:'fit-content',fillColor:C.white,borderColor:C.line,borderWidth:2,borderRadius:20,children:[
    {type:'frame',id:`title-${id}`,layout:'vertical',gap:6,padding:16,width:1912,height:'fit-content',fillColor:C.bluePale,borderColor:color,borderWidth:2,borderRadius:14,children:[
      text(`heading-${id}`,titleText,1880,22,C.navy),text(`subtitle-${id}`,subtitle,1880,12,C.muted)
    ]},
    ...children
  ]};
}

const header = {type:'frame',id:'header',layout:'vertical',gap:12,padding:28,width:1960,height:'fit-content',fillColor:C.navy,borderColor:C.navy,borderWidth:2,borderRadius:20,children:[
  text('title','Pad 02｜候选文件池媒体流程图｜客户确认稿',1904,32,C.white),
  {type:'frame',id:'header-tags',layout:'horizontal',gap:12,padding:0,width:'fit-content',height:'fit-content',children:[
    tag('tag-confirm','客户确认稿 / 非定版开发指令',250,C.bluePale,'#8CB9F0',C.blue),
    tag('tag-unassigned','PRODUCT-01—07 全部空位 / 未分配',280,C.orangePale,C.orange,C.orangeDark),
    tag('tag-nogo','程序未开发 · 生产 NO-GO',220,C.redPale,C.red,C.red)
  ]},
  text('scope-note','14个候选源仅作为客户选材池：页面源2 + PPT内嵌视频2 + 独立视频/文件10。任何候选都未映射到正式产品号。',1904,15,'#D7E8FA'),
  text('v02-note','V0.2 仅为视觉沟通参考；不能据此冻结产品编号、播放顺序或开发指令。',1904,13,'#D7E8FA')
]};

const productSlots = {type:'frame',id:'product-slots',layout:'vertical',gap:12,padding:20,width:1960,height:'fit-content',fillColor:C.orangePale,borderColor:C.orange,borderWidth:2,borderRadius:18,children:[
  text('slots-title','正式产品槽（客户待填）｜下列空位与候选池之间不建立映射',1920,18,C.orangeDark),
  {type:'frame',id:'slots-row',layout:'horizontal',gap:14,padding:0,width:'fit-content',height:'fit-content',children:Array.from({length:7},(_,i)=>tag(`slot-${i+1}`,`PRODUCT-0${i+1}\n空位 / 未分配`,250,C.white,C.orange,C.orangeDark))}
]};

const exclusion = {type:'frame',id:'exclusion',layout:'vertical',gap:8,padding:18,width:1960,height:'fit-content',fillColor:C.redPale,borderColor:C.red,borderWidth:2,borderDash:'dashed',borderRadius:16,children:[
  text('exclusion-title','本轮排除说明｜新品发布 PPT 第09页不纳入候选',1924,19,C.red),
  text('exclusion-body','第09页及对应候选视频07不进入本轮客户候选清单、设计稿或播放列表；该页仅在内部排除记录留痕。',1924,13,C.ink)
]};

const groupPpt = group('group-ppt','A｜候选 PPT 页 / 页面源','可编辑母版与控台参考版是页面源；18张可选代表页逐张展示，第09页排除。',[sourceRow,...slideRows]);
const groupEmbedded = group('group-embedded','B｜PPT 内嵌视频（第05 / 16页）','两支已从新品发布 PPT 提取，是否独立成播放条目仍待客户确认。',[embeddedRow],C.cyan);
const groupIndependent = group('group-independent','C｜独立候选视频 / 文件','9支独立视频与1个算电协同扩展PPT，全部未分配产品槽。',independentRows,C.cyan);

const footer = {type:'frame',id:'footer',layout:'vertical',gap:10,padding:22,width:1960,height:'fit-content',fillColor:C.white,borderColor:C.line,borderWidth:2,borderRadius:18,children:[
  text('footer-title','来源基线 / 完整路径 / 冻结门',1916,20,C.navy),
  text('footer-root','本地来源根｜D:\\FOR_WORK\\260818_MetaStone\\10_成果案例与产品介绍_整合_20260821',1916,11,C.ink),
  text('footer-csv','清单｜00_交付总览\\01_素材总清单.csv；00_交付总览\\02_双Pad播放清单_客户确认版.csv',1916,11,C.ink),
  text('footer-deck','页面源｜D:\\FOR_WORK\\260818_MetaStone\\是石科技内容中心库\\品牌物料文件\\是石科技新品发布会PPT\\是石科技新品发布会PPT\\Update【可编辑】是石科技新品发布PPT0717.pptx',1916,10,C.muted),
  text('footer-video','独立视频源｜D:\\FOR_WORK\\260818_MetaStone\\是石科技waic物料\\WAIC大屏和电视视频\\（候选01—06、08、09；07排除）',1916,10,C.muted),
  text('footer-status','P0未关闭｜PRODUCT-01—07 未分配｜页码/文件/顺序待客户确认｜程序未开发｜生产 NO-GO',1916,14,C.red)
]};

const root = {type:'frame',id:'root',x:40,y:40,layout:'vertical',gap:26,padding:30,width:2020,height:'fit-content',fillColor:C.bg,borderColor:'#AFC5DD',borderWidth:2,borderRadius:24,children:[
  header,productSlots,exclusion,groupPpt,groupEmbedded,groupIndependent,footer
]};

const connectors=[];
connectors.push({type:'connector',id:'group-flow-a-b',connector:{from:'group-ppt',to:'group-embedded',fromAnchor:'bottom',toAnchor:'top',lineShape:'rightAngle',lineColor:C.cyan,lineWidth:3,lineStyle:'dashed',endArrow:'arrow',label:'候选分组 / 非产品映射'}});
connectors.push({type:'connector',id:'group-flow-b-c',connector:{from:'group-embedded',to:'group-independent',fromAnchor:'bottom',toAnchor:'top',lineShape:'rightAngle',lineColor:C.cyan,lineWidth:3,lineStyle:'dashed',endArrow:'arrow',label:'候选分组 / 非播放顺序'}});
const pptChain=['title-group-ppt','ppt-source-row','ppt-pages-row-1','ppt-pages-row-2','ppt-pages-row-3','ppt-pages-row-4'];
for(let i=0;i<pptChain.length-1;i++){
  connectors.push({type:'connector',id:`ppt-link-${i+1}`,connector:{from:pptChain[i],to:pptChain[i+1],fromAnchor:'bottom',toAnchor:'top',lineShape:'rightAngle',lineColor:C.cyan,lineWidth:2,lineStyle:'solid',endArrow:'arrow',label:i===0?'页面候选':'逐行展示 / 非播放顺序'}});
}
connectors.push({type:'connector',id:'embedded-link',connector:{from:'title-group-embedded',to:'embedded-row',fromAnchor:'bottom',toAnchor:'top',lineShape:'straight',lineColor:C.cyan,lineWidth:2,endArrow:'arrow',label:'已提取 / 待确认'}});
const independentChain=['title-group-independent','independent-row-1','independent-row-2','independent-row-3'];
for(let i=0;i<independentChain.length-1;i++){
  connectors.push({type:'connector',id:`independent-link-${i+1}`,connector:{from:independentChain[i],to:independentChain[i+1],fromAnchor:'bottom',toAnchor:'top',lineShape:'rightAngle',lineColor:C.cyan,lineWidth:2,endArrow:'arrow',label:i===0?'候选文件':'逐行展示 / 非播放顺序'}});
}

const doc={version:2,nodes:[root,...connectors]};
fs.writeFileSync(path.join(outDir,'diagram.dsl.json'),JSON.stringify(doc,null,2),'utf8');
console.log(JSON.stringify({ok:true,out:path.join(outDir,'diagram.dsl.json'),media:media.size,imageNodes:32,connectors:connectors.length,excluded:['PPT第09页','候选视频07']},null,2));
