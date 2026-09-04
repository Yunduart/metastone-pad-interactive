const videoPath = (fileName) => `/videos/${fileName}`;

const playable = ({
  id,
  title,
  fileName,
  duration,
  kind = "video",
  loop = false,
  sourceFile,
  sourcePage,
  containsAnimatedGif = false,
}) => ({
  id,
  title,
  fileName,
  video: videoPath(fileName),
  duration,
  kind,
  loop,
  sourceFile,
  sourcePage,
  containsAnimatedGif,
});

const withPlaylist = (item) => {
  const first = item.playlist[0];
  return {
    ...item,
    mediaCount: item.playlist.length,
    video: first.video,
    fileName: first.fileName,
  };
};

// CASE numbering follows the latest 2026-08-24 source folders. Every PPT page
// is an independent looping H.264 item so the final motion render can replace
// it one-for-one later without changing media IDs or playlist order.
const CASE_DOMAINS = [
  withPlaylist({
    id: "internet",
    number: "01",
    marker: "CASE-01",
    sourceFolder: "1-互联网",
    title: "互联网",
    english: "INTERNET",
    icon: "internet",
    portal: { x: 12, y: 63.5 },
    playlist: [
      playable({ id: "case-01-slide-01", title: "互联网 · 第 1 页", fileName: "cases/01-internet/01-slide-01-loop.mp4", duration: 8.0193, kind: "ppt-slide-video", loop: true, sourceFile: "互联网.pptx", sourcePage: 1 }),
      playable({ id: "case-01-slide-02", title: "互联网 · 第 2 页", fileName: "cases/01-internet/02-slide-02-loop.mp4", duration: 8.0193, kind: "ppt-slide-video", loop: true, sourceFile: "互联网.pptx", sourcePage: 2 }),
    ],
  }),
  withPlaylist({
    id: "large-models",
    number: "02",
    marker: "CASE-02",
    sourceFolder: "2-大模型",
    title: "大模型",
    english: "LARGE MODELS",
    icon: "cube",
    portal: { x: 59.5, y: 23 },
    playlist: [
      playable({ id: "case-02-slide-01", title: "大模型 · 第 1 页", fileName: "cases/02-large-models/01-slide-01-loop.mp4", duration: 8.0193, kind: "ppt-slide-video", loop: true, sourceFile: "大模型.pptx", sourcePage: 1 }),
      playable({ id: "case-02-slide-02", title: "大模型 · 第 2 页", fileName: "cases/02-large-models/02-slide-02-loop.mp4", duration: 8.0193, kind: "ppt-slide-video", loop: true, sourceFile: "大模型.pptx", sourcePage: 2 }),
    ],
  }),
  withPlaylist({
    id: "aerospace",
    number: "03",
    marker: "CASE-03",
    sourceFolder: "3-航空航天",
    title: "航空航天",
    english: "AEROSPACE",
    icon: "rocket",
    portal: { x: 39, y: 75.5 },
    playlist: [
      playable({ id: "case-03-slide-01", title: "航空航天 · 第 1 页（动态 GIF）", fileName: "cases/03-aerospace/01-slide-01-loop.mp4", duration: 10.0983, kind: "ppt-slide-video", loop: true, sourceFile: "航空航天.pptx", sourcePage: 1, containsAnimatedGif: true }),
    ],
  }),
  withPlaylist({
    id: "high-end-manufacturing",
    number: "04",
    marker: "CASE-04",
    sourceFolder: "4-高端制造",
    title: "高端制造",
    english: "HIGH-END MANUFACTURING",
    icon: "factory",
    portal: { x: 70.5, y: 40 },
    playlist: [
      playable({ id: "case-04-slide-01", title: "高端制造 · 第 1 页（动态 GIF）", fileName: "cases/04-high-end-manufacturing/01-slide-01-loop.mp4", duration: 12.6723, kind: "ppt-slide-video", loop: true, sourceFile: "1-高端制造.pptx", sourcePage: 1, containsAnimatedGif: true }),
      playable({ id: "case-04-video-02", title: "CAE 软件案例介绍", fileName: "cases/04-high-end-manufacturing/02-cae-software-case.mp4", duration: 333.08, sourceFile: "2-CAE 软件案例介绍.mp4" }),
    ],
  }),
  withPlaylist({
    id: "research-institutes",
    number: "05",
    marker: "CASE-05",
    sourceFolder: "5-科研院所",
    title: "科研院所",
    english: "SCIENTIFIC RESEARCH INSTITUTES",
    icon: "research",
    portal: { x: 20, y: 28 },
    playlist: [1, 2, 3, 4].map((page) => playable({
      id: `case-05-slide-${String(page).padStart(2, "0")}`,
      title: `科研院所 · 第 ${page} 页`,
      fileName: `cases/05-research-institutes/${String(page).padStart(2, "0")}-slide-${String(page).padStart(2, "0")}-loop.mp4`,
      duration: 8.0193,
      kind: "ppt-slide-video",
      loop: true,
      sourceFile: "科研院所.pptx",
      sourcePage: page,
    })),
  }),
  withPlaylist({
    id: "ocean-simulation",
    number: "06",
    marker: "CASE-06",
    sourceFolder: "6-海洋模拟",
    title: "海洋模拟",
    english: "OCEAN SIMULATION",
    icon: "waves",
    portal: { x: 83, y: 52.5 },
    playlist: [
      playable({ id: "case-06-video-01", title: "港科大－淘海数字孪生地球系统－并行优化", fileName: "cases/06-ocean-simulation/01-taohai-digital-twin-parallel-optimization.mp4", duration: 141.015011, sourceFile: "1-港科大-淘海数字孪生地球系统-并行优化.mp4" }),
      playable({ id: "case-06-video-02", title: "让 ROMS 区域海洋建模系统高效跑起来", fileName: "cases/06-ocean-simulation/02-roms-regional-ocean-modeling.mp4", duration: 141.696, sourceFile: "2-让ROMS区域海洋建模系统高效跑起来.mp4" }),
    ],
  }),
  withPlaylist({
    id: "ai-for-science",
    number: "07",
    marker: "CASE-07",
    sourceFolder: "7-AI for  Science",
    title: "AI for Science",
    english: "AI FOR SCIENCE",
    icon: "atom",
    englishLead: true,
    portal: { x: 58, y: 65 },
    playlist: [
      playable({ id: "case-07-slide-01", title: "AI FOR SCIENCE · 第 1 页", fileName: "cases/07-ai-for-science/01-slide-01-loop.mp4", duration: 8.0193, kind: "ppt-slide-video", loop: true, sourceFile: "AI for  Science.pptx", sourcePage: 1 }),
    ],
  }),
];

const PRODUCT_DOMAINS = [
  withPlaylist({
    id: "product-01", number: "01", marker: "PRODUCT-01", sourceFolder: "1-国产Token优化工厂", title: "国产 Token 优化工厂", labelTitle: "国产Token优化工厂", english: "DOMESTIC TOKEN OPTIMIZATION FACTORY", icon: "diamond", orbitKey: "large-models", portal: { x: 52.75, y: 29.81 },
    playlist: [playable({ id: "product-01-video-01", title: "是石科技国产 Token 优化工厂产品介绍", fileName: "products/01-token-factory/01-product-introduction.mp4", duration: 61.354, sourceFile: "是石科技国产Token优化工厂产品介绍.mp4" })],
  }),
  withPlaylist({
    id: "product-02", number: "02", marker: "PRODUCT-02", sourceFolder: "2-超智算集群", title: "超智算集群", english: "SUPERINTELLIGENT COMPUTING CLUSTER", icon: "dots", orbitKey: "research-institutes", portal: { x: 21.95, y: 34.07 },
    playlist: [playable({ id: "product-02-video-01", title: "是石科技超智算集群介绍", fileName: "products/02-supercomputing-cluster/01-product-introduction.mp4", duration: 38.805, sourceFile: "是石科技超智算集群介绍.mp4" })],
  }),
  withPlaylist({
    id: "product-03", number: "03", marker: "PRODUCT-03", sourceFolder: "3-国产异构超智算中心", title: "国产异构超智算中心", english: "DOMESTIC HETEROGENEOUS AI COMPUTING CENTER", icon: "package", orbitKey: "high-end-manufacturing", portal: { x: 59.82, y: 41.5 },
    playlist: [
      playable({ id: "product-03-video-01", title: "国产异构超智算中心 第 1 集", fileName: "products/03-heterogeneous-center/01-episode-01.mp4", duration: 83.604, sourceFile: "国产异构超智算中心 第1集.mp4" }),
      playable({ id: "product-03-video-02", title: "AI 为什么需要记忆 第 2 集", fileName: "products/03-heterogeneous-center/02-episode-02.mp4", duration: 92.970667, sourceFile: "AI为什么需要记忆 第2集.mp4" }),
      playable({ id: "product-03-video-03", title: "芯片之间怎么秒传数据 第 3 集", fileName: "products/03-heterogeneous-center/03-episode-03.mp4", duration: 113.642667, sourceFile: "芯片之间怎么秒传数据 第3集.mp4" }),
    ],
  }),
  withPlaylist({
    id: "product-04", number: "04", marker: "PRODUCT-04", sourceFolder: "4-国产Token优化工厂计算速度大比拼：CPU vs GPU", title: "国产 Token 优化工厂计算速度大比拼：CPU vs GPU", labelTitle: "CPU vs GPU 速度比拼", english: "CPU VS GPU PERFORMANCE", icon: "circles", orbitKey: "ocean-simulation", portal: { x: 69.24, y: 55.18 },
    playlist: [playable({ id: "product-04-video-01", title: "Token 优化工厂－CPU 国产移植 GPU 1080P", fileName: "products/04-cpu-vs-gpu/01-cpu-vs-gpu.mp4", duration: 60.032, sourceFile: "Token优化工厂-CPU国产移植GPU1080P.mp4" })],
  }),
  withPlaylist({
    id: "product-05", number: "05", marker: "PRODUCT-05", sourceFolder: "5-国产Token优化工厂-技术优势", title: "国产 Token 优化工厂－技术优势", labelTitle: "Token优化工厂技术优势", english: "TOKEN FACTORY ADVANTAGES", icon: "polygon", orbitKey: "internet", portal: { x: 13.85, y: 58.87 },
    playlist: [playable({ id: "product-05-video-01", title: "国产 Token 优化工厂产品优势盘点", fileName: "products/05-token-factory-advantages/01-product-advantages.mp4", duration: 78.272, sourceFile: "是石科技国产Token优化工厂产品优势盘点.mp4" })],
  }),
  withPlaylist({
    id: "product-06", number: "06", marker: "PRODUCT-06", sourceFolder: "6-AI infra", title: "AI Infra", english: "AI INFRASTRUCTURE", icon: "stack", orbitKey: "aerospace", portal: { x: 27.49, y: 68.68 },
    playlist: [playable({ id: "product-06-video-01", title: "AI Infra", fileName: "products/06-ai-infra/01-ai-infra.mp4", duration: 70.953, sourceFile: "AIinfra.mp4" })],
  }),
  withPlaylist({
    id: "product-07", number: "07", marker: "PRODUCT-07", sourceFolder: "7-PD分离", title: "PD 分离", english: "PD DISAGGREGATION", icon: "transparent-cube", orbitKey: "ai-for-science", portal: { x: 48.25, y: 61.31 },
    playlist: [playable({ id: "product-07-video-01", title: "AI 动画－PD 分离", fileName: "products/07-pd-disaggregation/01-pd-disaggregation.mp4", duration: 54.975, sourceFile: "AI动画-PD分离.mp4" })],
  }),
  withPlaylist({
    id: "product-08", number: "08", marker: "PRODUCT-08", sourceFolder: "8-投机解码", title: "投机解码", english: "SPECULATIVE DECODING", icon: "cube", orbitKey: "aerospace", portal: { x: 27.49, y: 27.32 },
    playlist: [playable({ id: "product-08-video-01", title: "投机解码", fileName: "products/08-speculative-decoding/01-speculative-decoding.mp4", duration: 60.032, sourceFile: "投机解码.mp4" })],
  }),
  withPlaylist({
    id: "product-09", number: "09", marker: "PRODUCT-09", sourceFolder: "9-多层级KV Cache", title: "多层级 KV Cache", english: "MULTI-LEVEL KV CACHE", icon: "atom", orbitKey: "high-end-manufacturing", portal: { x: 55.83, y: 57.89 },
    playlist: [playable({ id: "product-09-video-01", title: "多层级 KV Cache", fileName: "products/09-multi-level-kv-cache/01-kv-cache.mp4", duration: 68.074667, sourceFile: "KVCache.mp4" })],
  }),
];

export const CONTENT_CATALOGS = [
  {
    id: "success-cases",
    padId: "Pad 01",
    sourceFolder: "0824案例介绍",
    number: "01",
    title: "成果案例",
    english: "SUCCESS CASES",
    status: "7 个主题 · 14 个播放项",
    itemNoun: "案例",
    items: CASE_DOMAINS,
  },
  {
    id: "product-introduction",
    padId: "Pad 02",
    sourceFolder: "0817是石科技产品视频互动展示",
    number: "02",
    title: "产品介绍",
    english: "PRODUCT INTRODUCTION",
    status: "9 个产品 · 11 个播放项",
    itemNoun: "产品",
    items: PRODUCT_DOMAINS,
  },
];

export const DEFAULT_CATALOG_ID = CONTENT_CATALOGS[0].id;
export const DOMAINS = CASE_DOMAINS;
export const DEMO_DURATION = 225;
