# TV 自动播放修订 QC｜2026-09-15

## 结论

通过：TV 端不再渲染或要求点击“启用电视播放”。TV 页面加载后自动注册为显示端；Pad 发出播放指令后，视频元素直接进入播放状态。

## 检查范围

- 地址：`http://127.0.0.1:4175/tv`（本机完整联调包）
- 控制端：`http://127.0.0.1:4175/pad`
- 浏览器：Playwright 管理的 Chrome
- 检查时间：2026-09-15（Asia/Shanghai）

## 结果

1. TV 待机页：`hasActivationButton=false`，没有“启用电视播放”按钮；SSE 状态为“播控在线”。
2. Pad 发送“互联网”播放指令后，TV 自动出现 `<video>`，实测 `paused=false`、`readyState=4`、`muted=false`，无需点击 TV。
3. Pad 返回后 TV 回到品牌待机，仍无激活按钮。
4. TV 页面控制台：0 error；保留现有 THREE.Clock warning（非本轮改动）。

## 变更

- `src/TvDisplay.jsx`：删除 TV 本地 `armed` 状态、激活按钮和全屏手势入口；Pad 状态直接驱动 `video.play()`，失败时自动静音重试并恢复请求的声音状态。
- TV 启动脚本：专用 Chromium 应用窗口加入 `--autoplay-policy=no-user-gesture-required`。
- 相关说明与待机规范同步更新。

## 边界

本机浏览器联调通过不替代 REDMI 电视、播控盒、现场音频、网络和连续运行验收。若现场设备的系统浏览器不支持自动播放策略，需使用包内专用启动器或现场播放器策略；不再通过页面按钮阻塞流程。

## 证据

- `tv-standby-no-activation.png`
- `tv-playing-auto-start.png`
- `TV_AUTOSTART_QC.json`
