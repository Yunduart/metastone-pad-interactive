# TV 播放性能修订 QC｜2026-09-15

## 问题

目标机器 CPU 为 Intel N150；系统播放器播放同一原视频流畅，而 TV 网页程序出现明显卡顿。

## 根因判断

TV 播放态原先仍保持待机星系 WebGL、Bloom 后处理和待机背景动画运行。N150 上这些渲染任务会与浏览器视频解码争用 GPU/CPU，系统播放器没有这组额外渲染，因此表现不同。

## 已实施

1. TV 进入视频播放态后不再挂载待机星系 WebGL。
2. TV 播放态关闭待机背景动画和叠加后处理。
3. TV 待机星系使用低功耗 GPU 路径、DPR=1、关闭抗锯齿和 Bloom。
4. TV 仅进度变化的 SSE 状态不再触发整棵显示树重渲染；播放同步改为 ref + 500ms 轻量漂移校正。
5. Pad/TV 与三维场景采用懒加载，首屏主脚本由约 1.35MB 降至约 317KB。
6. 交付包 MP4 使用 `public, max-age=86400` 缓存，重复播放可复用 Range 分片；开发时可用 `MEDIA_CACHE_CONTROL=no-store` 关闭。
7. 视频节点在返回、换页或失败重试被移除时显式执行“暂停 → 移除 `src` → `load()`”，清理卡顿后可能残留的解码器、缓冲和后台视频实例。
8. Pad 控制协议、视频文件、播放顺序和 TV 自动播放逻辑不变。

## 验证

- 全量源码测试：36/36 PASS（含 `test:standby` 6/6）。
- `npm run build`：PASS。
- 首屏构建分包：主入口约 317KB；三维场景独立懒加载 chunk 约 1.02MB。
- 播放态 DOM：不再创建待机 WebGL canvas；返回待机后重新创建星系 canvas。
- 已刷新本地 4175/4176 播放入口并更新交付包资产。
- 实际浏览器回读：待机 `canvasCount=1`；Pad 发出播放后 `canvasCount=0`、视频 `paused=false`、`readyState=4`；返回待机后恢复 `canvasCount=1`。
- 返回清理回读：返回后 `videoCount=0`、`playingVideos=0`，且视频元素已从 DOM 移除；重复播放/返回不累积隐藏视频实例。
- 截图：`standby-low-power.png`、`playing-no-webgl.png`。

## 边界

当前开发机不是 Intel N150，无法替代目标机的帧率、温度、硬件解码和长时间播放测试。目标机仍需确认 Edge/Chrome 硬件加速已开启，并在 1080p/4K 原视频、连续播放 30 分钟条件下复测。
