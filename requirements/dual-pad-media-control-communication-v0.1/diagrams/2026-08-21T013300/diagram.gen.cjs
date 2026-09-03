const fs = require('fs');
const path = require('path');

const outDir = __dirname;
const assetDir = path.join(outDir, 'assets');
const outFile = path.join(outDir, 'diagram.svg');

const W = 3300;
const H = 4240;
const ROW_Y = 275;
const ROW_STEP = 445;
const ROW_H = 420;
const CARD_X = 410;
const CARD_STEP = 480;
const CARD_W = 430;
const CARD_H = 370;
const CARD_Y_OFFSET = 40;
const NOTE_X = 2390;
const NOTE_W = 830;

const C = {
  navy: '#0B2D5B',
  blue: '#1E5FBD',
  blue2: '#2F80ED',
  bluePale: '#EAF3FF',
  cyan: '#0AA9B8',
  cyanPale: '#DDF8FA',
  orange: '#F2994A',
  orangeDark: '#B85C00',
  orangePale: '#FFF3DE',
  red: '#D64545',
  redPale: '#FFF0F0',
  green: '#258B74',
  greenPale: '#E5F7F2',
  ink: '#183153',
  muted: '#60758F',
  line: '#C7D6E8',
  bg: '#F2F7FC',
  white: '#FFFFFF'
};

function esc(v) {
  return String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function pngData(name) {
  const file = path.join(assetDir, name);
  if (!fs.existsSync(file)) throw new Error(`Missing asset: ${file}`);
  return `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`;
}

function rect(x, y, w, h, fill, stroke = 'none', sw = 0, r = 0, dash = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
}

function line(x1, y1, x2, y2, stroke, sw = 3, dash = '', marker = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}${marker ? ` marker-end="url(#${marker})"` : ''}/>`;
}

function polyline(points, stroke, sw = 3, dash = '', markerStart = '', markerEnd = '') {
  return `<polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}${markerStart ? ` marker-start="url(#${markerStart})"` : ''}${markerEnd ? ` marker-end="url(#${markerEnd})"` : ''}/>`;
}

function text(x, y, value, size, fill = C.ink, weight = 400, anchor = 'start', extra = '') {
  return `<text x="${x}" y="${y}" font-family="Noto Sans SC, Microsoft YaHei, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${extra}>${esc(value)}</text>`;
}

function textLines(x, y, lines, size, fill = C.ink, weight = 400, gap = 24, anchor = 'start') {
  const spans = lines.map((t, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : gap}">${esc(t)}</tspan>`).join('');
  return `<text x="${x}" y="${y}" font-family="Noto Sans SC, Microsoft YaHei, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${spans}</text>`;
}

function pill(x, y, value, fill, color, w, stroke = 'none', dash = '') {
  return `${rect(x, y, w, 30, fill, stroke, stroke === 'none' ? 0 : 1.5, 15, dash)}${text(x + w / 2, y + 21, value, 14, color, 700, 'middle')}`;
}

const rows = [
  {
    caseNo: 'CASE-01', topic: '互联网', index: '01 / 07',
    note: ['CASE 编号与首页顺序待客户确认', '两页保留关系、停留时长与切换方式待确认'],
    cards: [
      {n:'01', type:'PPT转图', image:'internet-01.png', source:'0714总稿｜第01页', status:['待客户确认']},
      {n:'02', type:'PPT转图', image:'internet-02.png', source:'0714总稿｜第02页', status:['待客户确认']}
    ]
  },
  {
    caseNo: 'CASE-02', topic: '大模型', index: '02 / 07',
    note: ['CASE 编号与首页顺序待客户确认', '两页保留关系、停留时长与切换方式待确认'],
    cards: [
      {n:'01', type:'PPT转图', image:'llm-01.png', source:'0714总稿｜第03页', status:['待客户确认']},
      {n:'02', type:'PPT转图', image:'llm-02.png', source:'0714总稿｜第04页', status:['待客户确认']}
    ]
  },
  {
    caseNo: 'CASE-03', topic: '航空航天', index: '03 / 07',
    note: ['0714 第05页为内嵌 GIF 代表帧', '现场不运行原生 PPT；H.264 转码参数待确认'],
    cards: [
      {n:'01', type:'动画→H.264', image:'aerospace-gif-frame.png', source:'0714总稿｜第05页内嵌GIF', status:['动图代表帧', '转码参数待确认']}
    ]
  },
  {
    caseNo: 'CASE-04', topic: '高端制造', index: '04 / 07',
    note: ['补充稿第01页是否替换 0714 第06页待确认', '0714 第07页仅为视频封面；须关联独立视频', '补充稿第02页是否保留、视频播放方式待确认'],
    cards: [
      {n:'01', type:'动画→H.264', candidate:'替换待确认', image:'high-gif-frame.png', source:'20260817补充稿｜第01页GIF', status:['是否替换0714第06页', '待客户确认']},
      {n:'02', type:'PPT转图', image:'manufacturing-02.png', source:'20260817补充稿｜第02页', status:['是否保留封面待确认']},
      {n:'03', type:'视频', image:'high-video-frame.png', source:'云道智造案例视频｜20秒帧', status:['真实文件见底部', '播放方式待确认']}
    ]
  },
  {
    caseNo: 'CASE-05', topic: '科研院所', index: '05 / 07',
    note: ['第08—11页是否为最新版待确认', '需徐霞 / 乔双丽确认版本与四页顺序', '各条目播放方式仍未冻结'],
    cards: [
      {n:'01', type:'PPT转图', image:'research-01.png', source:'0714总稿｜第08页', status:['四页是否最新版', '待徐霞/乔双丽确认']},
      {n:'02', type:'PPT转图', image:'research-02.png', source:'0714总稿｜第09页', status:['待客户确认']},
      {n:'03', type:'PPT转图', image:'research-03.png', source:'0714总稿｜第10页', status:['待客户确认']},
      {n:'04', type:'PPT转图', image:'research-04.png', source:'0714总稿｜第11页', status:['待客户确认']}
    ]
  },
  {
    caseNo: 'CASE-06', topic: '海洋模拟', index: '06 / 07',
    note: ['0714 第12页仅为视频封面；须关联独立视频', 'ROMS 封面：补充稿归海洋模拟', '与 8月17日会议口径冲突，待客户确认'],
    cards: [
      {n:'01', type:'PPT转图', image:'marine-01.png', source:'20260817补充稿｜第03页', status:['待客户确认']},
      {n:'02', type:'视频', image:'marine-video-frame.png', source:'淘海数字孪生地球｜20秒帧', status:['真实文件见底部', '播放方式待确认']},
      {n:'—', type:'PPT转图', candidate:'候选/归属待确认', image:'marine-03-roms-cover.png', source:'补充稿第04页｜ROMS封面', status:['补充稿归海洋模拟', '主题归属待确认'], conflict:true}
    ]
  },
  {
    caseNo: 'CASE-07', topic: 'AI for Science', index: '07 / 07',
    note: ['ROMS：8月17日会议归 AI for Science', 'ROMS 主题归属与 1080P / 4K 选择待确认', 'CASE 编号、顺序与播放方式均未冻结'],
    cards: [
      {n:'01', type:'PPT转图', image:'ai-science-01.png', source:'0714总稿｜第13页', status:['待客户确认']},
      {n:'02', type:'视频', candidate:'候选/归属待确认', image:'roms-video-frame.png', source:'ROMS-1080P.mp4｜20秒帧', status:['另有ROMS-4K.mp4', '归属/清晰度待确认'], conflict:true}
    ]
  }
];

function typeStyle(type) {
  if (type.includes('动画')) return {fill:C.orangePale, stroke:C.orange, color:C.orangeDark, width:112};
  if (type === '视频') return {fill:C.cyanPale, stroke:C.cyan, color:'#087985', width:62};
  return {fill:C.bluePale, stroke:C.blue2, color:C.blue, width:76};
}

function cardSvg(card, x, rowY) {
  const y = rowY + CARD_Y_OFFSET;
  const ts = typeStyle(card.type);
  const border = card.conflict ? C.red : C.line;
  const dash = card.conflict ? '10 7' : '';
  let s = `<g id="card-${esc(card.image.replace('.png',''))}">`;
  s += rect(x, y, CARD_W, CARD_H, C.white, border, card.conflict ? 2.5 : 1.5, 18, dash);
  s += pill(x + 14, y + 12, `条目 ${card.n}`, C.navy, C.white, 74);
  s += pill(x + 96, y + 12, card.type, ts.fill, ts.color, ts.width, ts.stroke);
  if (card.candidate) {
    const cw = card.candidate.length > 8 ? 145 : 100;
    s += pill(x + CARD_W - cw - 14, y + 12, card.candidate, C.redPale, C.red, cw, C.red, '6 4');
  }
  s += rect(x + 15, y + 52, 400, 225, '#EEF3F8', C.line, 1, 10);
  s += `<image x="${x + 15}" y="${y + 52}" width="400" height="225" href="${pngData(card.image)}" preserveAspectRatio="xMidYMid meet"/>`;
  s += text(x + 18, y + 305, card.source, 17, C.ink, 700);
  s += textLines(x + 18, y + 334, card.status, 14, card.conflict ? C.red : C.orangeDark, 650, 20);
  s += `</g>`;
  return s;
}

function rowSvg(row, idx) {
  const y = ROW_Y + idx * ROW_STEP;
  const fill = idx % 2 === 0 ? '#FFFFFF' : '#F8FBFF';
  let s = `<g id="row-${row.caseNo}">`;
  s += rect(60, y, 3160, ROW_H, fill, C.line, 1.5, 24);
  s += rect(78, y + 26, 304, ROW_H - 52, C.bluePale, '#BBD4F4', 1.5, 20);
  s += rect(78, y + 26, 12, ROW_H - 52, idx === 6 ? C.cyan : C.blue2, 'none', 0, 6);
  s += text(110, y + 92, row.caseNo, 23, C.blue, 800);
  s += text(110, y + 138, row.topic, row.topic.length > 8 ? 27 : 31, C.navy, 800);
  s += pill(110, y + 174, `暂定 ${row.index}`, '#FFFFFF', C.muted, 112, C.line);
  s += textLines(110, y + 246, ['仅用于客户逐项确认', '不代表开发放行'], 17, C.muted, 500, 28);

  s += text(CARD_X, y + 27, '当前建议顺序（箭头仅表示沟通稿顺序，待确认）', 15, C.cyan, 700);
  row.cards.forEach((card, i) => {
    const x = CARD_X + i * CARD_STEP;
    s += cardSvg(card, x, y);
    if (i < row.cards.length - 1) {
      const ay = y + CARD_Y_OFFSET + 165;
      s += line(x + CARD_W + 8, ay, x + CARD_STEP - 12, ay, C.cyan, 4, '', 'arrow-cyan');
    }
  });

  s += rect(NOTE_X, y + 28, NOTE_W, ROW_H - 56, C.orangePale, '#F4C27A', 1.5, 20);
  s += rect(NOTE_X, y + 28, 10, ROW_H - 56, C.orange, 'none', 0, 5);
  s += text(NOTE_X + 32, y + 78, '待确认事项', 22, C.orangeDark, 800);
  row.note.forEach((t, i) => {
    s += `<circle cx="${NOTE_X + 40}" cy="${y + 128 + i * 58}" r="5" fill="${i === row.note.length - 1 && idx >= 5 ? C.red : C.orange}"/>`;
    s += text(NOTE_X + 58, y + 135 + i * 58, t, 17, i === row.note.length - 1 && idx >= 5 ? C.red : C.ink, 600);
  });
  s += pill(NOTE_X + 32, y + ROW_H - 68, '状态：未冻结', C.white, C.orangeDark, 118, C.orange);
  s += `</g>`;
  return s;
}

let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
svg += `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
svg += `<defs>
  <marker id="arrow-cyan" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L12,6 L0,12 z" fill="${C.cyan}"/></marker>
  <marker id="arrow-red" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L12,6 L0,12 z" fill="${C.red}"/></marker>
  <marker id="arrow-orange-start" markerWidth="12" markerHeight="12" refX="2" refY="6" orient="auto" markerUnits="strokeWidth"><path d="M12,0 L0,6 L12,12 z" fill="${C.orange}"/></marker>
</defs>`;
svg += rect(0, 0, W, H, C.bg);
svg += rect(0, 0, W, 250, C.navy);
svg += `<circle cx="3060" cy="68" r="118" fill="#174777"/><circle cx="3160" cy="162" r="72" fill="#0D6A89"/>`;
svg += polyline('2710,28 2920,28 2920,92 3210,92', '#2A6CA7', 4);
svg += text(70, 78, 'Pad 01｜成果案例真实文件名与建议顺序｜媒体可视化清单', 42, C.white, 850);
svg += pill(70, 108, '客户确认稿 / 非定版开发指令', '#EAF3FF', C.blue, 252, '#8CB9F0');
svg += pill(338, 108, 'CASE编号及首页顺序暂定', C.orangePale, C.orangeDark, 220, C.orange);
svg += pill(574, 108, '程序未开发 · 生产 NO-GO', C.redPale, C.red, 226, C.red, '6 4');
svg += text(70, 177, '17 个真实缩略图｜PPT页 / GIF代表帧 / 视频20秒代表帧｜所有顺序与状态均待确认', 19, '#D7E8FA', 600);

svg += pill(910, 108, 'PPT转图', C.bluePale, C.blue, 86, C.blue2);
svg += pill(1008, 108, '动画→H.264', C.orangePale, C.orangeDark, 122, C.orange);
svg += pill(1142, 108, '视频', C.cyanPale, '#087985', 66, C.cyan);
svg += pill(1220, 108, '候选/归属待确认', C.redPale, C.red, 162, C.red, '6 4');
svg += text(90, 231, '主题（暂定）', 18, '#D7E8FA', 700);
svg += text(CARD_X, 231, '媒体卡｜真实缩略图＋来源短名＋确认状态', 18, '#D7E8FA', 700);
svg += text(NOTE_X + 24, 231, '右列｜必须关闭的确认项', 18, '#FFE4BE', 700);

rows.forEach((row, idx) => { svg += rowSvg(row, idx); });

// ROMS 封面（海洋模拟）与 ROMS 视频（AI for Science）的跨主题冲突连接。
const marineRowY = ROW_Y + 5 * ROW_STEP;
const aiRowY = ROW_Y + 6 * ROW_STEP;
const coverX = CARD_X + 2 * CARD_STEP + CARD_W / 2;
const videoX = CARD_X + 1 * CARD_STEP + CARD_W / 2;
const conflictY = marineRowY + ROW_H + 11;
svg += polyline(`${coverX},${marineRowY + CARD_Y_OFFSET + CARD_H + 2} ${coverX},${conflictY} ${videoX},${conflictY} ${videoX},${aiRowY + CARD_Y_OFFSET - 4}`, C.orange, 9, '16 11', 'arrow-orange-start', '');
svg += polyline(`${coverX},${marineRowY + CARD_Y_OFFSET + CARD_H + 2} ${coverX},${conflictY} ${videoX},${conflictY} ${videoX},${aiRowY + CARD_Y_OFFSET - 4}`, C.red, 4, '10 8', '', 'arrow-red');
svg += rect(1235, conflictY - 28, 1100, 58, C.white, C.red, 2, 18, '8 6');
svg += text(1785, conflictY + 9, 'ROMS 冲突：补充稿归海洋模拟 / 8月17日会议归 AI for Science，待客户确认', 18, C.red, 800, 'middle');

const fy = 3390;
svg += rect(60, fy, 3160, 790, C.white, C.line, 1.5, 24);
svg += rect(60, fy, 3160, 62, C.navy, 'none', 0, 24);
svg += text(92, fy + 41, '真实完整文件名 / 路径与版本说明', 24, C.white, 800);
svg += pill(2830, fy + 16, '素材覆盖 17 / 17', C.greenPale, C.green, 170, C.green);

svg += text(92, fy + 105, '原始完整文件名', 20, C.blue, 800);
svg += textLines(92, fy + 139, [
  'PPT｜waic成功案例交互展示0714_飞书下载.pptx',
  'PPT｜20260817waic成功案例交互展示_飞书消息下载.pptx',
  '视频｜4-是石科技x云道智造-并行优化-高端制造案例视频_飞书下载.mp4',
  '视频｜6-是石科技x港科大-淘海数字孪生地球系统-并行优化-案例视频_飞书下载.mp4',
  'ROMS候选｜ROMS-1080P.mp4 / ROMS-4K.mp4'
], 17, C.ink, 550, 33);

svg += text(1840, fy + 105, '未关闭确认项', 20, C.orangeDark, 800);
svg += textLines(1840, fy + 139, [
  '• 科研院所四页最新版（徐霞 / 乔双丽）',
  '• 高端制造替换关系与补充稿封面保留',
  '• ROMS 海洋模拟 / AI for Science 归属',
  '• ROMS 1080P / 4K、所有条目播放方式',
  '• CASE-01—07 编号与 Pad 01 首页顺序'
], 17, C.ink, 600, 33);

svg += rect(90, fy + 322, 3060, 96, C.redPale, C.red, 2, 16, '10 7');
svg += text(120, fy + 358, '生产门禁', 20, C.red, 850);
svg += text(260, fy + 358, '本板只用于客户逐项确认素材、顺序和真实文件名；程序未开发，P0 未关闭，维持生产 NO-GO。', 19, C.red, 750);
svg += text(120, fy + 392, '不得把本板解释为开发定版、程序团队通知、可生产放行或现场验收。', 17, C.red, 650);

svg += text(92, fy + 464, 'V0.2 视觉沟通口径（替代 V0.1，但仍是非定版开发指令）', 20, C.blue, 800);
svg += textLines(92, fy + 500, [
  '最新视觉参考｜D:\\FOR_WORK\\260818_MetaStone\\10_成果案例与产品介绍_整合_20260821\\07_设计协同\\V0.2_平面视觉概念评审版',
  '01 为评审总览页，不是 Pad 运行界面；双 Pad 不得跨频道选择；07 返回按频道变量：P01→主题列表，P02→产品列表。',
  'Pad02 的 14 项候选源仍全部未分配；程序评估基线沿用飞书 revision 31；P0 未关闭前维持 NO-GO。'
], 16, C.ink, 550, 31);

svg += text(92, fy + 610, '必须保留的媒体提示', 20, C.orangeDark, 800);
svg += textLines(92, fy + 646, [
  '0714 第07 / 12页只是视频封面，必须关联独立视频；0714 第05 / 06页与 20260817 第01页含 GIF，应转 H.264。',
  '缩略图为 PPT 页、GIF 代表帧或视频 20 秒代表帧；图片按原始 16:9 比例嵌入，未拉伸。'
], 16, C.ink, 550, 31);

svg += text(92, fy + 722, '唯一映射基线（完整路径）', 18, C.blue, 800);
svg += textLines(92, fy + 754, [
  'C:\\Users\\visua\\Documents\\ChatGPT\\是石科技_空间体验升级项目\\交付\\是石科技_领域视频互动台_V1\\requirements\\',
  'dual-pad-media-control-communication-v0.1\\diagrams\\2026-08-21T013300\\PAD01_MEDIA_PREVIEW_MANIFEST.md'
], 14, C.muted, 550, 27);

svg += `</svg>`;
fs.writeFileSync(outFile, svg, 'utf8');
console.log(JSON.stringify({ok:true, outFile, width:W, height:H, rows:rows.length, media:rows.reduce((n,r)=>n+r.cards.length,0)}, null, 2));
