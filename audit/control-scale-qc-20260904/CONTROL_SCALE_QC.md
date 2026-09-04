# Pad 底部操作区尺寸修订与 GitHub 同步范围

日期：2026-09-04

## 用户问题与实施

- 问题：底部整体过小，操作按钮大小混用，视觉和触控节奏不一致。用户要求先优化，再上传 GitHub。
- 所有八个操作按钮采用统一的 64–80 px 响应式宽高；1920 px 宽画面为 80 × 80 px。上一项 / 下一项相同尺寸，播放 / 暂停仅用白色玻璃核心强调。
- 主控制标签统一为 16–18 px；图标统一 28 px，播放图标 34 px。
- 播控坞最大宽度由 1080 px 放大至 1560 px；进度独立到上方，所有操作位于同一排。
- 取消悬停放大/上移，补齐键盘聚焦描边，避免控制区在不同状态下忽大忽小。
- 保留玻璃材质、Pad 纯控制端、只读进度、原速 / 2× / 4×。不恢复拖动进度条，不在 Pad 播放视频。

## 当前验证

- 自动测试：30/30 PASS；命令为 `node --test tests/orbit-motion.test.mjs tests/tv-standby.test.mjs tests/playback-sync.test.mjs tests/control-server-sync.test.mjs tests/media-playlist.test.mjs tests/sites-worker.test.mjs`。
- 构建：Vite / Sites 包装 PASS；当前资产为 `index-BAV9g4sg.css` 与 `index-D2mdOi9h.js`。保留既有大于 500 kB chunk 提示，未将其当作构建失败。
- 浏览器：临时使用本机 Chrome 验证 `http://127.0.0.1:4175/pad` 和 `/pad02`。此前内置浏览器 bootstrap 问题不在本轮修复范围。
- 1920 × 1200、1536 × 1024、1280 × 800、1024 × 768：每组 13 项尺寸/布局/材质/控制端检查全部通过；Pad02 单项状态同样通过。
- 12 项操作检查全部通过：悬停尺寸稳定、键盘焦点可见、暂停、恢复、下一项、上一项、2×、4×、原速、静音、返回、单项禁用切换。
- 1920 × 1200 实测：8 个按钮均为 80 × 80 px，中心线 Y=1108；播控坞 1560 × 171.8 px。页面溢出、按钮裁切、目录碰撞、Pad video 元素均为 0。
- 浏览器 console/request errors 为 0；存在一条既有 THREE.Clock 废弃提示。该检查不代表两台真实设备端到端同步验收。

## 视觉证据

以下文件与本报告同目录，均是本轮最终构建的真实浏览器截图或结果，不是概念生成图：

- `before-1920x1200.png`：旧版问题基线。
- `before-after-full.png`：同分辨率、同频道/首项/播放状态前后全帧对照（计时时刻不同）。
- `before-after-controls.png`：同像素比例底部局部对照，上旧下新。
- `pad-1920x1200.png`、`pad-1536x1024.png`、`pad-1280x800.png`、`pad-1024x768.png`：四尺寸。
- `pad-paused-1920x1200.png`：暂停状态。
- `pad02-single-item-1920x1200.png`：单条产品、上一项/下一项禁用状态。
- `browser-qc.json`：最终机器结果；可用 `scripts/qc-pad-control-layout.cjs` 重新检查。

视觉结论：本次底部操作区没有剩余 P0/P1/P2 问题。目录次要文字偏小、单项目录留白较多作为 P3 后续优化；真实 Pad 与展厅光照/触控/网络联调仍独立验收。

## GitHub 同步边界

- 本轮用户授权更新私有仓库 `Yunduart/metastone-pad-interactive` 的源码、播放目录配置、相关测试和精选 QC 证据。
- 为保持 App / TV / server 数据结构一致，同步已在工作区的 playlist、itemIndex、itemId、duration、loop 相关改动；不只孤立推送 CSS。
- 本地 25 个映射 MP4 合计 3,044,571,327 bytes 不纳入 Git；PPT 转码中间文件目录 `media-build/` 同样忽略。大媒体仍由独立媒体包管理。
- 未发布新 GitHub Release / 客户 ZIP，未部署 Sites；`v0.1.0-client-test` 原下载包不能代表本次源码。
- 生产/现场放行不在本轮范围。真实 Pad、TV、控制中继和现场网络验收不可由本轮浏览器截图替代。

当前状态：本地实施、代码测试、构建与浏览器视觉/操作检查完成；源码提交由本轮 Git 历史记录；不是新客户端发布或生产批准。
