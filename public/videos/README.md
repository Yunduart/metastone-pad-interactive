# 双板块媒体库与替换说明

当前媒体库依据以下两个最新目录同步：

- 成果案例：`D:\FOR_WORK\260818_MetaStone\0824案例介绍`
- 产品介绍：`D:\FOR_WORK\260818_MetaStone\0817是石科技产品视频互动展示`

执行 `scripts/sync-latest-media.ps1` 可重新核对源文件、按稳定英文路径复制独立视频，并将每个 PPT 页面导出为独立的 H.264 MP4。执行结果写入 `media-build/latest-media/media-sync-report.json`。

## 播放口径

- Pad 是纯控制端，不加载、不解码、不播放任何 MP4。
- 电视 / 播放盒浏览器是唯一媒体渲染端。
- 每个 PPT 页面当前生成一个 1920×1080、H.264、约 30fps 的临时循环 MP4；Pad 的上一项 / 下一项切换页面。
- 静态 PPT 页默认 8 秒一轮。
- 航空航天与高端制造页含动态 GIF，导出时分别保留两个完整 GIF 周期（约 10.08 秒、12.66 秒），不能替换为静帧。
- 最终动态设计视频可按相同 `media.id` 与稳定路径一对一替换，playlist 顺序无需改程序。

## 成果案例（14 项）

1. `CASE-01 互联网`：2 个 PPT 页面循环 MP4。
2. `CASE-02 大模型`：2 个 PPT 页面循环 MP4。
3. `CASE-03 航空航天`：1 个含动态 GIF 的页面循环 MP4。
4. `CASE-04 高端制造`：1 个含动态 GIF 的页面循环 MP4 + 1 支 CAE 案例视频。
5. `CASE-05 科研院所`：4 个 PPT 页面循环 MP4。
6. `CASE-06 海洋模拟`：2 支独立视频。
7. `CASE-07 AI FOR SCIENCE`：1 个 PPT 页面循环 MP4。

## 产品介绍（11 项）

`PRODUCT-01—09` 已全部映射；其中 `PRODUCT-03 国产异构超智算中心` 含第 1—3 集，其他产品各 1 支视频。实际稳定路径与源文件名见 `src/domains.js` 和同步报告。

## 校验

```powershell
npm run content:check
npm run media:qc
```

目标结果：`25/25 READY`、`MEDIA_QC=25/25 PASS`。媒体 QC 同时验证 H.264、分辨率、时长以及两个 GIF 页面输出中的多帧变化。
