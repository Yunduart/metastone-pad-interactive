# 成果案例 + 产品介绍｜飞书资料整合同步回执

日期：2026-08-21  
状态：客户物料 / 顺序确认输入；**非定版开发指令**；程序 NO-GO

## 飞书文档

- 文档：https://thevision.feishu.cn/docx/BACzdwYjJoiOpwxkeBPcRfvrnWg
- 更新前 revision：14
- 最终稳定 revision：42
- revision 增量：31 为首轮资料整合回读；32—33 正文/结构不变；34 增加 Pad01 媒体画板容器；35—36 澄清只读交接链与开发冻结门；37—39 增加 Pad02 候选媒体章节与画板容器；40—42 将客户可见正文统一为中性第09页排除口径，并完成全文 `KBA=0`。
- 新增主章节：`客户物料确认 / 文件命名与顺序（2026-08-21 资料整合）`
- 新章节 block_id：`doxcnLPhlmO5AMuWEibJHWTh3Hf`

## 图片插入与回读

| 图片 | 插入章节 | block_id | file_token | 回读 |
|---|---|---|---|---|
| `01_Pad01_成果案例_真实文件名与建议顺序.png` | `Pad 01｜成果案例真实文件名与建议顺序` 标题后 | `doxcnGVZE7KcQob2yFy6TrAkV8e` | `LizTbRdJwodoIqxGUQMcdfVbnVb` | 900×1020，成功 |
| `02_Pad02_产品介绍_候选文件池.png` | `Pad 02｜产品介绍候选文件池与 01—07 填写区` 标题后 | `doxcnkW4ZrOsXcooP46Ve8aVlTe` | `XkJubnwZ8oSWw9xfV5WcGDl8n6e` | 900×950，成功 |
| `03_双Pad_关键待确认项.png` | `关键待确认项（P0 / P1 / P2）` 标题后 | `doxcnzTkHMx4rNuUDqOoV3o9nhc` | `EzHnbNffPozO6xxPcqvcVyusnfh` | 900×971，成功 |

## 可编辑画板与节点级回读

| 画板 | token / block | raw 节点 | 独立媒体 | QC |
|---|---|---:|---:|---|
| 双 Pad 客户确认主板 | `Z9zewMnBmhSLR1botMociEE8n5b` | 285 | 0 image；22 svg | 150 text、76 composite、37 connector；回读成功 |
| Pad01 成果案例媒体板 | `Iw5Pwr1fWheM2EbJL7Ncjdn7n8c` / `doxcnMT2m8Sbcr8LuHCqR6Zb2pb` | 241 | 17 image / 17 unique token | 0 errors；17 个结构性包含 warning；0 text overflow / occlusion |
| Pad02 产品候选媒体板 | `SZwWwraJMhaciLbMg9QcQrbwng8` / `doxcnqtk9Hm0wvePYFp0UjsOofd` | 315 | 32 image / 32 unique token | 0 errors / 0 warnings；root z=0；图层违规 0；候选映射数 0 |

画板回读证据：`C:\Users\visua\Documents\ChatGPT\是石科技_空间体验升级项目\交付\是石科技_领域视频互动台_V1\requirements\dual-pad-media-control-communication-v0.1\diagrams\2026-08-21T020341`。

canonical 离线快照：`D:\FOR_WORK\260818_MetaStone\10_成果案例与产品介绍_整合_20260821\08_飞书本地快照_20260821\root最终快照_rev42_20260821_022803`。

## 新增文本位置

- Pad 01：图片后依次为“版本关系与媒体检查结论”“可复制的真实文件名 / 绝对路径 / 页码 / 来源状态”“核心文件 SHA256 校验”。
- Pad 02：图片后依次为“客户逐项填写区”“候选文件池：真实文件名 / 绝对路径 / 页码 / 来源状态”“媒体检查与排除项”。
- 待确认：图片后为 15 项 P0 / P1 / P2 表格。
- 后续章节：播放与交互口径、对现有程序需求基线的影响、版本冻结门。

## 已写入的关键事实

1. 0714 为 13 页全行业总稿；20260817 为高端制造 2 页 + 海洋模拟 2 页的 4 页局部补充，不能整体覆盖总稿。
2. 0714 第 5、6 页和 0817 第 1 页含 GIF，应转 H.264；0714 第 7、12 页只是播放封面，必须连接独立视频。
3. 互联网 / 大模型各 2 页；科研院所 4 页但需确认最新版；AI for Science 1 页；航空航天动图转 H.264。
4. 高端制造、海洋模拟独立视频与百度网盘本地件 SHA256 一致。
5. ROMS 在 AI for Science / 海洋模拟之间存在归属冲突，保持 P0。
6. Pad 02 产品 01—07 未正式映射；全部产品名称和候选文件均未锁定。
7. 新品发布 PPT 第 5、16 页含内嵌 MP4；第 9 页不纳入本轮候选 / 播放序列。相关内部排除来源只在本地台账留痕，客户可见正文与 Pad02 画板全文 `KBA=0`。
8. 旧“图片屏 / 视频屏”拓扑由“Pad 01 成果案例 / Pad 02 产品介绍 + mixed-media playlist”取代。
9. Pad 01 首页顺序与 CASE-01—07 未冻结；客户确认顺序后才冻结 topicId 与文件前缀。

## 开放事项

- P0：6 项。
  - Pad 02 产品 01—07 正式名称。
  - Pad 01 首页顺序与 CASE 编号。
  - Pad 02 各产品 PPT 页码、视频及顺序。
  - ROMS 归属。
  - 科研院所 4 页是否最新版。
  - 0714 与 20260817 的替换关系。
- P1：7 项。
  - 高端制造顺序、海洋模拟顺序、航空航天转码触发、新品发布 PPT 选页、内嵌视频是否独立播放、逐条手动 / 自动和时长、末项结束策略。
- P2：2 项。
  - 目标屏 / Pad / 播放端设备参数。
  - 客户确认人、日期与版本号。

## 对现有程序基线的影响

- `domain.video` 单媒体映射需演进为 mixed-media playlist。
- 需新增 Pad 01 / Pad 02 的 controllerId、channel、catalogId 与目标播放端锁定。
- CASE 编号、topicId、正式文件前缀在 P0 关闭前不得硬编码。
- 需新增 IMAGE / SLIDE_SHOWING 渲染及 OPEN_TOPIC、NEXT_ITEM、PREV_ITEM、JUMP_ITEM。
- 全局“上一步”文案改为“返回主题 / 返回列表”。
- 需补素材预检、解码失败、错通道、超时、断线恢复、幂等控制与真实双端联调。

## 回读 QC

- 三张图片均已移动到目标标题后，并通过 range 回读验证位置。
- `Pad 01 七个主题首页顺序与 CASE 编号` 已作为 P0 回读命中。
- `新品发布 PPT 第 5、16 页包含内嵌 MP4`、第 9 页 / KV Cache / KBA 排除均回读命中。
- 客户确认口径中的全局动作已改为“返回主题 / 返回列表”。
- 冻结门末尾明确：`非定版开发指令；客户确认输入；程序 NO-GO。`
- 三张图片、8 个表格、三块画板、版本冻结门、只读交接链和 NO-GO 文案均回读存在。
- 客户可见正文 `KBA=0`；Pad02 raw 客户可见文字 `KBA=0`。
- 图片上传、画板写入、移动与文档写入均无权限错误；最终稳定 revision 42。
