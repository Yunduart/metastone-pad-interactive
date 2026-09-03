# Xiaomi Pad 部署说明

## 本期测试拓扑：Pad 播控 + 电视播放

一台 Windows 主机或展项小主机保存网页、控制状态和视频。Xiaomi Pad 8 Pro 与电视机浏览器连接同一个专用局域网：Pad 负责选片与播控，电视负责全屏播放。

1. 主机安装 Node.js，并在项目目录执行 `npm install`。
2. 第一次执行 `npm run testenv:prepare`；之后双击 `启动_本期Pad与电视双端测试环境.cmd` 即可。
3. Pad 打开 `http://主机IP:4175/pad`。
4. 电视打开 `http://主机IP:4175/tv`，并点击一次“启用电视播放”，完成声音与全屏授权。
5. Pad 选择视频并播放；电视从品牌待机画面淡出到对应视频。暂停、继续、原速 / 2× / 4×、静音、上一条、下一条和退出都会同步。Pad 进度条为只读状态，不提供拖动跳转。
6. Windows 防火墙仅对“专用网络”放行 TCP 4175；不要把本期无身份验证的测试服务暴露到公网。
7. 平板锁定横屏、关闭自动休眠与系统手势干扰；电视浏览器关闭休眠、屏保和自动切源。

## 内容更新

- 成果案例影片放到 `public/videos/cases/`。
- 产品介绍影片放到 `public/videos/products/`。
- 测试期保持约定文件名，投放后刷新 Pad / TV 页面即可，无需重新构建。
- 执行 `npm run content:check` 可检查所有槽位。
- 正式定名时再在 `src/domains.js` 更新产品标题、英文名与文件名。

## 生产固化选项

正式驻场时可将网页封装为 Android WebView / Trusted Web Activity，或接入支持 Android Enterprise 的 EMM/DPC。Android 的 Lock Task Mode 可把设备限制在允许的应用中，并隐藏 Home、Overview 等系统界面；TWA 则适合由同一开发方控制的网站与 Android 应用进行全屏承载。

这一步属于独立的设备集成交付，不能仅凭浏览器原型判定为现场发布完成。上线前仍需在真实 Xiaomi Pad 上完成：设备所有者配置、开机自启、断网离线策略、全屏与返回键、音频、横竖屏、自动恢复、视频逐条播放，以及至少 20 分钟连续运行测试。

官方参考：

- Android Dedicated Devices: https://developer.android.com/work/dpc/dedicated-devices
- Android Lock Task Mode: https://developer.android.com/work/dpc/dedicated-devices/lock-task-mode
- Chrome Trusted Web Activity: https://developer.chrome.com/docs/android/trusted-web-activity
