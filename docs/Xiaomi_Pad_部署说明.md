# Xiaomi Pad 部署说明

## 本期测试拓扑：Pad 播控 + 电视播放

一台 Windows 主机或展项小主机保存网页、控制状态和视频。Xiaomi Pad 8 Pro 与电视机浏览器连接同一个专用局域网：Pad 负责选片与播控，电视负责全屏播放。

1. 主机安装 Node.js，并在项目目录执行 `npm install`。
2. 第一次执行 `npm run testenv:prepare`；之后双击 `启动_本期Pad与电视双端测试环境.cmd` 即可。
3. Pad 01 打开 `http://主机IP:4175/pad`（固定成果案例）；Pad 02 打开 `http://主机IP:4175/pad02`（固定产品介绍）。
4. 电视打开 `http://主机IP:4175/tv`，并点击一次“启用电视播放”，完成声音与全屏授权。
5. Pad 选择内容并向控制服务发命令；电视从品牌待机画面淡出到对应媒体。暂停、继续、原速 / 2× / 4×、静音、上一项、下一项和退出都会同步。Pad 进度条为只读状态，不提供拖动跳转，且 Pad 页面不加载、解码或播放 MP4。播控区采用中央轨道控制器：播放 / 暂停位于发光圆形核心，多条内容时“下一项”保持为中央控制器内更大的中文触控操作。
6. Windows 防火墙仅对“专用网络”放行 TCP 4175；不要把本期无身份验证的测试服务暴露到公网。
7. 平板锁定横屏、关闭自动休眠与系统手势干扰；电视浏览器关闭休眠、屏保和自动切源。

## 内容更新

- 最新源目录通过 `scripts/sync-latest-media.ps1` 同步到 `public/videos/cases/` 与 `public/videos/products/`。
- PPT 按页输出临时循环 H.264 MP4；含 GIF 页面必须用动态导出结果，不可使用静态截图。
- 执行 `npm run content:check` 检查 25 个播放项；执行 `npm run media:qc` 检查编码、分辨率、时长与 GIF 动态帧。
- 正式动态设计视频沿用 `src/domains.js` 中稳定 item ID 与路径一对一替换。

## 生产固化选项

正式驻场时可将网页封装为 Android WebView / Trusted Web Activity，或接入支持 Android Enterprise 的 EMM/DPC。Android 的 Lock Task Mode 可把设备限制在允许的应用中，并隐藏 Home、Overview 等系统界面；TWA 则适合由同一开发方控制的网站与 Android 应用进行全屏承载。

这一步属于独立的设备集成交付，不能仅凭浏览器原型判定为现场发布完成。上线前仍需在真实 Xiaomi Pad 上完成：设备所有者配置、开机自启、断网离线策略、全屏与返回键、音频、横竖屏、自动恢复、视频逐条播放，以及至少 20 分钟连续运行测试。

官方参考：

- Android Dedicated Devices: https://developer.android.com/work/dpc/dedicated-devices
- Android Lock Task Mode: https://developer.android.com/work/dpc/dedicated-devices/lock-task-mode
- Chrome Trusted Web Activity: https://developer.chrome.com/docs/android/trusted-web-activity
