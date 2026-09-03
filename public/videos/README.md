# 双板块视频替换说明

正式视频统一放在 `public/videos/` 下，并按板块分目录。

## 成果案例

放入 `public/videos/cases/`：

1. `01-large-models.mp4` — 大模型
2. `02-research-institutes.mp4` — 科研院所
3. `03-high-end-manufacturing.mp4` — 高端制造
4. `04-ocean-simulation.mp4` — 海洋模拟
5. `05-internet.mp4` — 互联网
6. `06-aerospace.mp4` — 航空航天
7. `07-ai-for-science.mp4` — AI FOR SCIENCE

这些路径已自动映射，放入文件后 Pad / TV 会在约 3 秒内自动重新检测，不需要再修改代码或手动刷新。

Windows 如果开启了“隐藏已知文件类型的扩展名”，重命名时请特别确认最终名称不是
`01-large-models.mp4.mp4` 这类双扩展名。可在本目录运行 `npm run content:check`
核对系统实际识别到的文件名。

## 产品介绍

产品页已映射 9 个产品名称和 11 条源影片。测试环境中的稳定投放槽位仍使用数字文件名，不要直接改动客户源文件：

1. `01-product-film.mp4` — 国产 Token 优化工厂
2. `02-product-film.mp4` — 超智算集群
3. `03-product-film.mp4` — 国产异构超智算中心（当前星球入口；该产品共 3 部影片）
4. `04-product-film.mp4` — 国产 Token 优化工厂计算速度大比拼：CPU vs GPU
5. `05-product-film.mp4` — 国产 Token 优化工厂－技术优势
6. `06-product-film.mp4` — AI Infra
7. `07-product-film.mp4` — PD 分离
8. `08-product-film.mp4` — 投机解码
9. `09-product-film.mp4` — 多层级 KV Cache

PRODUCT-03 的第 2/3 集已在 `src/domains.js` 的 `sourceMedia` 中登记；完整 playlist 切换逻辑仍按 PRD 的 mixed-media playlist 阶段实现。

建议统一为 1920 × 1080、H.264 MP4、AAC 音频。测试服务会直接读取本目录并支持视频字节范围请求；投放或替换文件后会自动重新检测，不需要重新构建。

执行 `npm run content:check` 可查看全部 16 个槽位中哪些已放入素材。当前客户体验测试包为 2/16 READY，其余 14 个槽位仅显示明确的演示/缺失提示。
