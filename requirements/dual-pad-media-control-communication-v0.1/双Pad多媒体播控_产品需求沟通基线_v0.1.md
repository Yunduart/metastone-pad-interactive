# 双 Pad“成果案例 / 产品介绍”多媒体播控

## 产品 / 程序交接沟通基线 v0.1

- 版本日期：2026-08-20
- 管理角色：程序_产品经理
- 文档状态：**当前沟通版 / 需求快照**
- 总体成熟度：**PARTIAL**
- 程序开发放行：**NO-GO**
- 生产与现场放行：**NO-GO**
- 飞书文档：[BACzdwYjJoiOpwxkeBPcRfvrnWg](https://thevision.feishu.cn/docx/BACzdwYjJoiOpwxkeBPcRfvrnWg)
- 当前线上画板 token：`Z9zewMnBmhSLR1botMociEE8n5b`

> 版本事实（2026-08-20 实时复核）：线上画板已覆盖为“双 Pad 内容物料、播放顺序与状态确认图”，并以 user 身份完成 image/raw 回读；线上 raw 为 `285 nodes`，预览为 `491,162 bytes`，且与本地 `diagrams/2026-08-20T215605/board-verified.png` 同尺寸、同画面。本地目录已有 `diagram.svg/png/json` 与 `board-verified.png/json`。这证明双 Pad 沟通板已线上化并可回读，但不等于客户定版、程序开发放行或已实现。当前图将 7 个主题列在上方，物料填写区仍是供每个主题复制使用的通用 5 项卡片；尚未把填写口实际展开到每个主题/产品下面，严格口径下仍需下一版展开，或由配套 Excel 完整承载。

> 程序事实：当前 V1 仍为单主题 `domain.video` 映射、单全局控制状态和单视频渲染。双 Pad 身份/频道锁定、mixed-media playlist、多媒体渲染、新命令和异常恢复均未实现。本文件不得作为“已开发”或“已定版”通知。

---

## 0. 四级状态口径

| 状态 | 定义 | 本轮用法 |
|---|---|---|
| **已确认** | 项目经理/用户已明确的产品事实 | 可进入需求基线，但不等于代码完成或客户签字 |
| **待客户确认** | 素材、顺序、时长、现场绑定或策略仍需客户/现场选择 | 必须留空或标记，不得由产品或程序代填 |
| **待开发** | 产品口径已明确，但当前程序尚未实现 | 项目经理明确“已定版”后才可进入评估与开发 |
| **已实现** | 已有代码、测试和对应运行证据 | 双 Pad 本轮暂无此类；不得用旧单 Pad 功能代替 |

### 0.1 当前状态总表

| 项目 | 状态 | 说明 |
|---|---|---|
| Pad 01 / Pad 02 固定栏目分工 | 已确认 | Pad 01＝成果案例；Pad 02＝产品介绍 |
| 成果案例 7 个一级主题 | 已确认 | 大模型、科研院所、高端制造、海洋模拟、互联网、航空航天、AI FOR SCIENCE |
| 产品介绍 01—07 占位槽 | 已确认 | 正式名称和媒体均待客户填写，不得虚构 |
| 线上双 Pad 沟通画板已更新并回读 | 已确认 | raw 285 nodes；仍是沟通/确认稿，不是定版 |
| 一级主题下纵向多条媒体清单 | 已确认 | 每条可为图片、PPT 转图或视频 |
| PPT 现场处理原则 | 已确认 | 只播放转换后的图片或 H.264 MP4，不打开原生 PPT |
| 每条真实素材、顺序、时长、播放方式 | 待客户确认 | 逐条填写、逐条冻结 |
| Pad/播放盒/电视资产映射 | 待客户确认 | 逻辑角色已定，现场 `controllerId → targetId → displayId` 待贴标 |
| 自动混播/自动推进/末条策略 | 待客户确认 | 数据结构支持多类型；运行策略不自动锁定 |
| 双 Pad / playlist / 新命令 / 异常恢复 | 待开发 | 当前 V1 未实现 |
| 双 Pad 本轮代码和真机联调 | 已实现：无 | 当前只能做需求与差距分析 |

---

## 1. 已确认的产品结构

### 1.1 固定分工与隔离

| 控制端 | 固定栏目 | 建议逻辑频道 | 必须独立维护的状态 |
|---|---|---|---|
| Pad 01 | 成果案例 | `CASES` | `controllerId`、`channel`、`catalogId`、`topicId`、`itemIndex`、`itemType`、`status`、`progress`、`targetId` |
| Pad 02 | 产品介绍 | `PRODUCTS` | `controllerId`、`channel`、`catalogId`、`topicId`、`itemIndex`、`itemType`、`status`、`progress`、`targetId` |

- 两端可以共用同一播放内核，但控制身份、频道、内容目录和目标播放端必须锁定。
- 前端不能仅靠按钮或页面路由防串台；服务端必须验证 `controllerId + channel + catalogId + targetId + sessionId`。
- 任一状态事件必须带来源和目标 ID，Pad 01 不得看到或改变 Pad 02 的播放实例，反之亦然。

### 1.2 合并式内容层级

“Pad 频道边界”和“客户填写”不再拆成两个流程区块。每个 Pad 下面直接纵向列主题/产品及其媒体子项，子项行同时承担客户填写、文件追踪和程序 manifest 来源。

```text
Pad 01｜成果案例
├─ 01 大模型
│  ├─ 01-01 预览图｜内容名称____｜文件名称____｜类型____｜顺序____
│  ├─ 01-02 预览图｜内容名称____｜文件名称____｜类型____｜顺序____
│  └─ + 新增子项
├─ 02 科研院所
├─ 03 高端制造
├─ 04 海洋模拟
├─ 05 互联网
├─ 06 航空航天
└─ 07 AI FOR SCIENCE

Pad 02｜产品介绍
├─ 01 产品名称____
│  ├─ 01-01 预览图｜内容名称____｜文件名称____｜类型____｜顺序____
│  └─ + 新增子项
├─ 02 产品名称____
...
└─ 07 产品名称____
```

### 1.3 mixed-media playlist 的确认边界

- **已确认**：一个主题/产品不再对应一个 `domain.video`，而是一个可增删、可排序的 playlist；条目类型允许图片、PPT 转图、视频。
- **待客户确认**：图片和视频之间是否自动连续、不同类型的预加载方式、图片默认停留时长、视频结束是否自动下一项、末条是否回列表。
- **待开发**：playlist 数据模型、图片渲染、视频渲染、类型切换、缓存和运行状态。

---

## 2. 客户逐条物料确认表

### 2.1 每条必须保留的填写字段

| 字段组 | 字段 | 规则 |
|---|---|---|
| 归属 | 当前 Pad、板块、主题编号、主题名称、客户确认人 | Pad/板块预填；产品名称和确认人保留空口 |
| 编号 | 子项编号、内容 ID、播放顺序 | 内容 ID 唯一；允许继续新增子项 |
| 内容 | 内容名称、预览图文件名 | 预览图与实际播放文件分开记录 |
| 素材 | 类型：□图片 □PPT 转图 □视频 | 原生 PPT 不能作为程序播放类型 |
| 文件 | 原始文件名称、程序交付文件名称 | 交付文件名固定、唯一、可追溯 |
| 播放 | □手动下一步 □自动 | 每条单独确认，不用默认值冒充客户选择 |
| 时间 | 停留/时长：____ 秒 | 图片、PPT 页、视频均按最终交付物记录 |
| 结束 | 下一项 / 停留 / 重播 / 回主题列表 / 回首页 | 逐条或按主题确认 |
| 操作 | 上一步、下一步、跳转；视频另有播放、暂停、进度、静音 | 权限和展示方式待确认 |
| 技术 | 分辨率、画幅、编码、是否有声音 | 以最终交付文件为准 |
| 审计 | 版本、提供方、确认日期、项目经理、同步状态、备注 | 同步状态：□待定版 □已同步 |

### 2.2 建议文件名

- 成果案例：`P01_CASE_01_01_内容简称.ext`
- 产品介绍：`P02_PRODUCT_01_01_内容简称.ext`
- PPT 转图多页可追加页码：`P01_CASE_01_01_内容简称_P001.png`
- PPT 转视频分章节可追加章节：`P02_PRODUCT_01_01_内容简称_CH01.mp4`

文件名规则目前是**建议规则**；客户/项目经理确认前，不能把示例文字当正式交付文件。

配套可填写文件：`阿乐展厅_双Pad多媒体与硬件确认台账_v0.1_待填写.xlsx`。

---

## 3. 双 Pad 拓扑与绑定表

### 3.1 产品拓扑

```text
Pad 01 / CASES ── controllerId + channel ── 控制服务 ── targetId A ── 播放盒 A ── 既有电视/屏幕 A
Pad 02 / PRODUCTS ─ controllerId + channel ─ 控制服务 ── targetId B ── 播放盒 B ── 既有电视/屏幕 B
```

两条链路的角色分工已确认；设备资产、网络地址和屏幕编号待现场核实。

### 3.2 绑定台账

| 绑定项 | Pad 01 / 成果案例 | Pad 02 / 产品介绍 | 状态 |
|---|---|---|---|
| `controllerId` | 待现场贴标 | 待现场贴标 | 待客户确认 |
| `channel` | `CASES` | `PRODUCTS` | 已确认 |
| `catalogId` | 建议 `cases` | 建议 `products` | 命名待确认 |
| `targetId` | 待现场贴标 | 待现场贴标 | 待客户确认 / P0 |
| 播放盒资产编号 | 待填 | 待填 | 待客户确认 / P0 |
| 播放盒 IP / 主机名 | 待填 | 待填 | 待客户确认 / P0 |
| 电视/屏幕资产编号 | 待填 | 待填 | 待客户确认 / P0 |
| 屏幕型号/分辨率/接口 | 待填 | 待填 | 待客户确认 / P0 |
| 音频输出 | 待填 | 待填 | 待客户确认 |
| 并发/接管权限 | 固定控制自己的 target；异常接管策略待定 | 固定控制自己的 target；异常接管策略待定 | 待客户确认 |

### 3.3 串控防护

1. 服务端保存 `controllerId → channel → catalogId → targetId` 绑定，不接受前端临时改写。
2. 控制命令必须包含 `commandId`、`sessionId`、`controllerId`、`channel`、`targetId`、`topicId`、`itemIndex` 和 `expectedRevision`。
3. 相同 `commandId` 重试只返回原结果，不重复执行。
4. 通道、目录或目标不匹配时返回 `CHANNEL_MISMATCH` / `TARGET_MISMATCH`，不得静默切换目标。
5. 重连时先获取权威快照，再续接事件流；不能用本地旧状态覆盖播放端。

---

## 4. 状态机与事件迁移

### 4.1 状态域

连接状态与播放状态分开管理：

- 连接域：`OFFLINE → CONNECTING → ONLINE → RECOVERING`
- 播放域：`HOME_IDLE → TOPIC_LIST → PLAYLIST_READY → ITEM_LOADING → IMAGE_SHOWING / SLIDE_SHOWING / VIDEO_PLAYING → ITEM_END → WAIT_NEXT → SESSION_END`

`SLIDE_SHOWING` 只表示 PPT 已转换后的图片页，不表示原生 PPT 播放。

### 4.2 简化主链

```text
选择主题 / OPEN_TOPIC
  → PLAYLIST_READY
  → ITEM_LOADING
  → IMAGE_SHOWING / SLIDE_SHOWING / VIDEO_PLAYING
  → ITEM_END
  → WAIT_NEXT
  → NEXT_ITEM / PREV_ITEM / JUMP_ITEM / 自动推进（若客户确认）
  → 下一项 ITEM_LOADING
  → 最后一项 ITEM_END
  → SESSION_END
  → REPLAY 或 EXIT / RETURN_HOME
```

### 4.3 状态迁移表

| ID | 当前状态 | 事件 / 命令 | 条件 | 下一状态 | 系统动作 | 状态 |
|---|---|---|---|---|---|---|
| ST-01 | HOME_IDLE / TOPIC_LIST | `OPEN_TOPIC` | controller/channel/catalog 绑定合法 | PLAYLIST_READY | 加载主题 playlist，定位首项 | 已确认需求 / 待开发 |
| ST-02 | PLAYLIST_READY | `PLAY` 或自动首项 | 目标在线、文件存在 | ITEM_LOADING | 创建/复用 session，校验媒体 | 已确认需求 / 待开发 |
| ST-03 | ITEM_LOADING | 图片就绪 | `itemType=image` | IMAGE_SHOWING | 显示图片并启动已确认时长 | 已确认需求 / 待开发 |
| ST-04 | ITEM_LOADING | PPT 转图页就绪 | `itemType=slide` | SLIDE_SHOWING | 显示页图并启动页时长 | 已确认需求 / 待开发 |
| ST-05 | ITEM_LOADING | 视频就绪 | `itemType=video` | VIDEO_PLAYING | 从指定进度开始播放 | 已确认需求 / 待开发 |
| ST-06 | VIDEO_PLAYING | `PAUSE` | session/revision 有效 | VIDEO_PAUSED | 保存进度并回传状态 | 已确认需求 / 待开发 |
| ST-07 | VIDEO_PAUSED | `PLAY` | session/revision 有效 | VIDEO_PLAYING | 继续播放 | 已确认需求 / 待开发 |
| ST-08 | VIDEO_PLAYING | `SEEK` / `MUTE` | 视频支持 | VIDEO_PLAYING | 更新进度或静音状态 | 已确认需求 / 待开发 |
| ST-09 | 任一展示/播放态 | 自然结束/图片时长到 | — | ITEM_END | 记录 endedAt、进度和 itemIndex | 已确认需求 / 待开发 |
| ST-10 | ITEM_END | 结束处理完成 | 非末项 | WAIT_NEXT | 显示上一步/下一步/跳转 | 已确认需求 / 待开发 |
| ST-11 | WAIT_NEXT | `NEXT_ITEM` | 存在下一项 | ITEM_LOADING | `itemIndex + 1`，加载下一项 | 已确认需求 / 待开发 |
| ST-12 | WAIT_NEXT | `PREV_ITEM` | 存在上一项 | ITEM_LOADING | `itemIndex - 1`，加载上一项 | 已确认需求 / 待开发 |
| ST-13 | WAIT_NEXT / 播放态 | `JUMP_ITEM` | 索引合法 | ITEM_LOADING | 定位指定项并加载 | 已确认需求 / 待开发 |
| ST-14 | ITEM_END | 自动推进 | 当前条目标记自动且非末项 | ITEM_LOADING | 切下一项 | 待客户确认 / 待开发 |
| ST-15 | 末项 ITEM_END | 结束处理完成 | 已到最后一项 | SESSION_END | 显示重播/回主题列表 | 已确认需求 / 待开发 |
| ST-16 | SESSION_END | 重播 | playlist 有效 | ITEM_LOADING | 回到首项或当前项，策略待定 | 待客户确认 / 待开发 |
| ST-17 | 任意非离线态 | `EXIT` | — | RETURN_HOME | 停止媒体、释放 session、回待机 | 已确认需求 / 待开发 |
| ST-18 | ITEM_LOADING | 文件缺失/解码失败/超时 | — | ERROR | 保留上下文、显示错误码与重试/返回 | 已确认需求 / 待开发 |
| ST-19 | 任意态 | Pad/target 断线 | 心跳超时 | OFFLINE / RECOVERING | 冻结危险操作、保存权威快照 | 已确认需求 / 待开发 |
| ST-20 | RECOVERING | 恢复成功 | 绑定与 revision 仍有效 | ITEM_LOADING / VIDEO_PAUSED / HOME_IDLE | 依据已确认恢复策略重建 | 待客户确认 / 待开发 |

状态图源文件：`双Pad播放状态机_沟通版_v0.1.lifecycle.json`。交互式 HTML 因当前 Archify 运行依赖缺失未生成，不作为本轮交付完成项。

---

## 5. 命令、接口与状态字段

### 5.1 命令基线

| 命令 | 适用对象 | 作用 | 当前状态 |
|---|---|---|---|
| `OPEN_TOPIC` | Pad / playlist | 打开指定主题并准备清单 | 已确认需求 / 待开发 |
| `NEXT_ITEM` | Pad / playlist | 进入下一项 | 已确认需求 / 待开发 |
| `PREV_ITEM` | Pad / playlist | 返回上一项 | 已确认需求 / 待开发 |
| `JUMP_ITEM` | Pad / playlist | 跳转到指定 itemIndex | 已确认需求 / 待开发 |
| `PLAY` | 视频/当前项 | 开始或继续 | 已确认需求 / 待开发 |
| `PAUSE` | 视频 | 暂停 | 已确认需求 / 待开发 |
| `SEEK` | 视频 | 修改播放进度 | 已确认需求 / 待开发 |
| `MUTE` | 视频/播放端 | 设置静音状态 | 已确认需求 / 待开发 |
| `EXIT` | session | 停止并回首页/主题列表 | 已确认需求 / 待开发 |

### 5.2 最小状态快照

```json
{
  "controllerId": "PAD-01",
  "channel": "CASES",
  "catalogId": "cases",
  "targetId": "TARGET-A",
  "sessionId": "session-uuid",
  "topicId": "CASE-01",
  "itemIndex": 0,
  "itemType": "image|slide|video",
  "status": "PLAYLIST_READY|ITEM_LOADING|IMAGE_SHOWING|SLIDE_SHOWING|VIDEO_PLAYING|WAIT_NEXT|SESSION_END|ERROR",
  "progress": 0,
  "muted": false,
  "manifestVersion": "pending",
  "revision": 1
}
```

### 5.3 接口草案

| 接口 ID | 方法 / 路径 | 作用 | 关键字段 | 状态 |
|---|---|---|---|---|
| API-01 | `GET /api/v1/controllers/{controllerId}/catalog` | 获取固定频道和主题清单 | controllerId、channel、catalogId、manifestVersion | 待开发 |
| API-02 | `GET /api/v1/targets/{targetId}` | 获取播放端在线与能力 | targetId、displayId、capabilities、currentSessionId | 待开发 |
| API-03 | `POST /api/v1/sessions` | 创建播放 session | controllerId、channel、catalogId、targetId、topicId | 待开发 |
| API-04 | `POST /api/v1/sessions/{sessionId}/commands` | 发送幂等命令 | commandId、action、itemIndex、expectedRevision | 待开发 |
| API-05 | `GET /api/v1/sessions/{sessionId}` | 获取权威状态 | 全量状态快照 | 待开发 |
| API-06 | `GET /api/v1/events?controllerId=&targetId=` | 状态事件流 | eventId、revision、source、target、payload | 待开发 |
| API-07 | `POST /api/v1/endpoints/{id}/heartbeat` | Pad/播放端心跳与能力上报 | role、channel、appVersion、bootId、lastSeen | 待开发 |
| API-08 | `POST /api/v1/manifests/validate` | 检查清单、文件、顺序和格式 | manifestVersion、topics、items | 待开发 |
| API-09 | `GET /api/v1/diagnostics` | 运维诊断 | 绑定、在线状态、缺失文件、最近错误 | 待开发 / 权限待确认 |

机器可读草案：`双Pad播控接口草案_v0.1.yaml`。

---

## 6. 异常与恢复清单

| EX ID | 场景 | 期望行为 | Pad 提示 | 错误码 / 记录 | 验收 |
|---|---|---|---|---|---|
| EX-01 | Pad 离线 | 目标端按已确认策略继续/暂停；不影响另一通道 | 离线对象与最后更新时间 | `CONTROLLER_OFFLINE` | 双真机 |
| EX-02 | 播放端离线 | 禁止继续发危险命令，进入恢复 | 目标端离线 | `TARGET_OFFLINE` | 真机 |
| EX-03 | 通道错配 | 拒绝命令，不切换另一频道 | 通道不匹配 | `CHANNEL_MISMATCH` | 自动 + 双真机 |
| EX-04 | 目标错配/串控 | 拒绝命令并记录来源和目标 | 控制对象不匹配 | `TARGET_MISMATCH` | 自动 + 双真机 |
| EX-05 | 重复点击 | 相同 commandId 返回原结果，不重复执行 | 保持单次反馈 | `COMMAND_DUPLICATE` | 自动 |
| EX-06 | 旧页面命令 | revision 冲突并下发最新快照 | 状态已更新 | `STALE_REVISION` | 自动 |
| EX-07 | 素材缺失 | 不黑屏，保留安全画面，可返回/重试 | 文件缺失 + 文件名 | `MEDIA_MISSING` | 自动 + 真机 |
| EX-08 | 加载失败 | 进入 ERROR，可重试或跳过（若允许） | 加载失败 | `LOAD_FAILED` | 真机 |
| EX-09 | 解码失败 | 进入 ERROR，不伪报播放成功 | 格式/编码不可播放 | `DECODE_FAILED` | 真机 |
| EX-10 | 加载超时 | 保持当前/待机画面，允许重试 | 加载超时 | `LOAD_TIMEOUT` | 真机 |
| EX-11 | 原生 PPT 进入 manifest | 校验失败，禁止上屏 | 请先转图片或视频 | `NATIVE_PPT_REJECTED` | 自动 |
| EX-12 | 图片无时长且要求自动 | 阻止自动编排或使用经批准默认值 | 待补时长 | `DURATION_REQUIRED` | 自动 |
| EX-13 | 自动播放受限 | 目标端提示一次性启用，不伪报播放 | 目标端待启用 | `AUTOPLAY_BLOCKED` | 真机 |
| EX-14 | 页面刷新/服务重启 | 拉取快照，防止幽灵 session | 恢复中 | bootId、revision | 集成 |
| EX-15 | 播放中网络中断 | 本地媒体可继续则继续；控制状态标离线 | 控制暂不可用 | 断线/恢复时间 | 现场 |
| EX-16 | 末项结束 | 只显示有效操作，不出现无效“下一项” | 重播 / 回主题列表 | `SESSION_END` | 双真机 |
| EX-17 | manifest 播放中更新 | 当前 session 使用版本快照，新版下次生效 | 新版本待生效 | manifestVersion | 集成 |
| EX-18 | 恢复失败 | 返回安全首页/待机，不无限重试 | 恢复失败 | retryCount、lastError | 现场 |

异常参数（心跳阈值、重试次数、加载超时、自动回首页时间）均为**待客户/技术确认**。

---

## 7. PPT 媒体策略

| PPT 条件 | 交付方式 | 程序条目 | 必须确认 |
|---|---|---|---|
| 无动画、无转场、无音频 | 逐页导出 PNG/JPG | 每页作为独立 `slide` / 图片步骤 | 页序、单页时长、分辨率、画幅 |
| 有动画、转场或音频 | 转为 H.264 MP4 | 一个或多个 `video` 条目 | 章节切分、字幕、音频、总时长、码率 |
| 内容较长或需分段控制 | 按章节导出多个 H.264 MP4 | 多个连续视频条目 | 章节名称、顺序、结束行为 |

- 现场程序**不直接打开原生 PPT**。
- 源 PPT 仍在台账保留，用于追溯；程序 manifest 只引用转换后的图片/视频。
- 转换完成后必须逐页/逐视频对照原稿，检查字体替换、缺图、裁切、动画、音频和页序。

---

## 8. 冻结与交接门

```text
物料逐项确认
  → 顺序确认
  → 文件名确认
  → 播放方式 / 时长确认
  → 客户确认
  → 版本冻结
  → 项目经理明确“已定版”
  → 程序评估
  → 开发 / 联调
```

### 8.1 冻结记录

| 字段 | 填写值 |
|---|---|
| 确认版本 | ____ |
| 确认日期 | ____ |
| 客户确认人 | ____ |
| 项目经理 | ____ |
| 同步状态 | □待定版 □已同步 |
| 飞书画板 revision / token | ____ |
| manifestVersion | ____ |

### 8.2 放行规则

1. 未完成逐项物料、顺序、文件名、方式/时长和客户确认：不得冻结。
2. 项目经理未明确“已定版”：不得通知程序团队进入正式评估/开发。
3. Excel、飞书画板、PRD/接口任一不一致：保持 `PARTIAL / NO-GO`。
4. 程序测试通过不等于现场放行；必须完成两个真实 Pad、两个真实播放端和实际电视/屏幕联调。

---

## 9. 当前程序差距

| GAP ID | 当前 V1 | 本轮目标 | 状态 |
|---|---|---|---|
| GAP-01 | 单全局 `controlState` | 按 controller/channel/target/session 隔离 | 待开发 / P0 |
| GAP-02 | 通用 `/pad` 与 `/tv`，无固定身份 | Pad 01/02 固定频道和目标绑定 | 待开发 / P0 |
| GAP-03 | `displayClients` 只统计连接数 | 独立 targetId、capability、heartbeat、status | 待开发 / P0 |
| GAP-04 | 无 commandId/sessionId/revision | 幂等、并发冲突和串台保护 | 待开发 / P0 |
| GAP-05 | 每主题一个 `domain.video` | 每主题一个 mixed-media playlist | 待开发 / P0 |
| GAP-06 | 预置七个视频路径 | 从客户确认表生成版本化 manifest | 待开发 / P0 |
| GAP-07 | TV 端只有 `<video>` | 图片/slide/video 渲染与类型切换 | 待开发 / P0 |
| GAP-08 | 旧逻辑结束后自动回星图 | WAIT_NEXT / 自动推进 / SESSION_END 按条目策略 | 待客户确认 + 待开发 |
| GAP-09 | 单 Pad + 单 TV 测试拓扑 | 两个真实 Pad + 两个真实播放端 | 验收未执行 |
| GAP-10 | 线上已是双 Pad 沟通版，但物料区仍为通用 5 项复制模板 | 每个主题/产品下实际展开纵向填写口，或由配套 Excel 完整承载 | 图示 PARTIAL / 待深化 |

结论：本轮只完成需求快照、差距和交接材料；**没有开发授权，也没有双 Pad 已实现项**。

---

## 10. 图、表、PRD 一致性检查

| 核对项 | Excel | 飞书画板 | PRD / 接口 | 通过条件 |
|---|---|---|---|---|
| Pad 固定分工 | Pad 01/02 | 两条固定栏目 | controller/channel/catalog | 三者一致 |
| 主题编号 | 01—07 | 同编号纵向主题 | topicId | 无缺项、无重号 |
| 子项编号 | 01-01… | 主题下纵向媒体行 | itemId/itemIndex | 一行一条、顺序一致 |
| 预览与文件 | 预览图、源文件、交付文件 | 图片位 + 文件名 | thumbnail/finalAsset | 不混淆预览和播放文件 |
| PPT 转换 | 源 PPT + 最终图片/视频 | 只展示最终格式 | itemType=slide/video | 无原生 PPT 状态 |
| 播放方式 | 手动/自动、时长 | 行内字段或图例 | autoAdvance/duration | 三端同值 |
| 拓扑 | controller/target/display | Pad→盒→屏 | 绑定与错误码 | 未确认项清晰标待定 |
| 版本 | 版本/确认人/日期 | 图版号/revision | manifestVersion | 可追溯 |

### 当前一致性结论

- 线上双 Pad 沟通板已完成 image/raw 回读：**PASS（版本存在性与可读取性）**。
- 线上/本地双 Pad 板 vs “每个主题/产品下面逐项留口”的严格结构：**PARTIAL / 需展开或由 Excel 完整承载**。
- 当前 V1 程序 vs 本轮需求：**FAIL / 待开发**。
- 本文 + 配套 Excel：按同一字段体系编制，待表格 QC 后记为**沟通材料一致**，不等于客户定版。

---

## 11. 仍待客户 / 项目经理确认

### P0｜冻结前

1. Pad 01、播放盒 A、电视/屏幕 A 的资产编号、IP、接口和安装位置。
2. Pad 02、播放盒 B、电视/屏幕 B 的资产编号、IP、接口和安装位置。
3. 成果案例 7 个主题下的全部子项、实际文件、顺序、播放方式和时长。
4. 产品介绍 01—07 的正式名称及全部子项。
5. 每份 PPT 转图片还是 H.264 MP4；逐页/逐章节时长和声音要求。
6. 哪些条目手动下一步，哪些允许自动推进。
7. 末条结束后重播当前主题、回主题列表还是回首页；超时多久。
8. 现场是否需要声音，使用 HDMI/电视还是独立音响。
9. 双 Pad 是否允许管理员接管、临时换屏或互斥锁。
10. 客户确认方式和项目经理“已定版”的证据载体。

### P1｜开发与联调前

1. 图片/视频预加载、缓存和离线更新策略。
2. 心跳、重试、超时和断电恢复参数。
3. 播放盒操作系统、浏览器版本、自动启动和远程维护方式。
4. manifest 更新、版本回退和文件校验责任人。

---

## 12. 验收基线

- 两个 Pad 分别只能控制自己固定的频道和播放端，连续快速操作无串台。
- 每个主题的纵向清单、预览、文件名、顺序与已冻结台账一致。
- 图片、PPT 转图、视频均能正确加载；原生 PPT 被 manifest 校验拒绝。
- 上一步、下一步、跳转、播放、暂停、进度、静音和退出按条目类型正确可用。
- 离线、加载失败、解码失败、素材缺失、通道错配、超时和恢复均有明确状态与错误记录。
- 刷新、断线重连、服务重启和断电后进入已确认的安全状态。
- Excel、飞书画板、manifest、程序 UI 和现场资产标识一致。

当前最终判断：**线上双 Pad 沟通画板已更新并回读；客户物料仍待逐项填写与冻结；当前程序 V1 未开发双 Pad 功能，现场联调未执行。总体 PARTIAL，生产 NO-GO。**
