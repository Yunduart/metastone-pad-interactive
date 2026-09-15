# Design QA — 首页构图、玻璃星球与双轴拖拽（2026-09-10，当前）

## 2026-09-10 15:29 本机预览恢复与接续核验

- 接续当前已完成、未上传的首页修正，没有重复重写既有实现。已重新启动独立本机预览 `http://127.0.0.1:4191/pad` 与 `/pad02`，在用户授权的独立测试浏览器中核验；实际载入 `index-VPFx5_Ck.js`。
- 当前自动测试重新执行 34 / 34 PASS。两栏目各左、右、上、下拖动共 8 次 PASS；最大回位误差 0.251601 CSS px，0 误发控制命令，卡片拖动让位与回位恢复均通过，场景滚动为 `[0,0]`，0 页面溢出，Pad 0 video，0 浏览器运行/HTTP 错误。
- 新证据目录：`E:\Yun\知识库\codex\home\artifacts\metastone-home-fix-20260910\output\playwright\20260910-1527`；机器记录 `browser-result.json` 的检查时间为 `2026-09-10T07:29:31.735Z`。两栏目截图均为 1536 × 1024 / DPR 1，成果案例为大模型选中，与源图一致的状态。
- 本轮已打开检查新鲜首页截图、`comparison.png` 全图同尺寸对照、`globe-detail.png` 主球细节和 `card-detail.png` 卡片细节。未发现新增 P0/P1/P2；主球密集地理光点和高光的柔和程度仍按既有 P3 精修项保留，不宣称 100% 还原。
- 本轮仅新增核验资料与本记录；程序实现沿用本日已有修正版，未改动媒体目录、Pad/TV 播控协议或生产设备，未上传 GitHub。实体触控、现场联调、客户视觉验收仍待完成。
- 工具边界：CLI 临时会话打开时中断，随后使用已安装的稳定浏览器运行库在独立可见测试浏览器中完成上述全部检查；浏览器截图并非旧缓存证据。

## 2026-09-10 12:18 交付前复核

- 本机页面实际加载 `index-VPFx5_Ck.js`；`/pad` 和 `/pad02` 两栏目在 1536 × 1024 同尺寸复核。34 / 34 自动检查通过。
- 浏览器四向手势共 8 次通过：左拖主球向右、右拖向左，上下为独立反向视差；松手回默认构图，最大回位差 0.252 CSS px。拖动时预览卡片让位，结束后恢复；0 误发控制命令、0 页面溢出、场景滚动 `[0,0]`、Pad 0 video、0 运行/HTTP 错误。已有 THREE.Clock 警告保留。
- 本轮独立记录：`E:\Yun\知识库\codex\home\artifacts\metastone-home-fix-20260910\recheck-result-20260910-1218.json`。
- 本轮最终截图与对照已单独存入 `E:\Yun\知识库\codex\home\artifacts\metastone-home-fix-20260910\output\playwright\20260910-1218`：两栏目首页、左拖状态、全图对照、主球细节、玻璃卡片细节。全图与局部对照确认保留不对称层次与共同轨道投影，未发现新增 P0/P1/P2；源图更密的地理微光仍为 P3。
- 本轮延续已完成的首页修正，没有追加改动媒体目录、播放协议或 TV 同步算法；未上传 GitHub、未更新飞书、未做实体 Pad/TV 现场验收。当前状态：本机修正/复核完成，待用户视觉确认。

## 2026-09-10 11:49 本机复核

- 已重新启动独立本机服务 `http://127.0.0.1:4191/pad` 与 `/pad02`，实际浏览器加载 `index-VPFx5_Ck.js`；未将旧 4175 页面视作更新证据。
- 重新执行现有自动测试：34 / 34 PASS。两栏目各左、右、上、下拖动，共 8 次复核通过；方向与反向视差一致，松手恢复、卡片让位/恢复、0 误发控制命令、0 溢出、场景滚动 `[0,0]`、Pad 无 video 元素。回位误差最大 0.253 CSS px。
- 新证据：证据根目录下 `recheck-result-20260910-1149.json`；截图 `output/playwright/recheck-cases-1536x1024.png`、`recheck-products-1536x1024.png`、`recheck-reference-before-after.png`、`recheck-globe-detail.png`、`recheck-glass-card-detail.png`。源图和新截图按 1536 × 1024 同尺寸合并比较，确认构图/文案/玻璃表面没有新增 P0/P1/P2 偏差。
- 新浏览器检查 0 运行错误、0 HTTP 错误；已有 THREE.Clock 弃用警告保留。本次没有重新进行实体 Pad/TV 联调，没有修改媒体、同步逻辑或上传 GitHub。
- 本机修正结果仍为 passed；静态效果图中更细密的地理高光/玻璃反射保留为 P3 精修，不宣称 100% 还原或客户视觉验收。

## Scope and visual truth

- User request: correct the homepage after the original-artwork fidelity review. This is a local implementation, not permission for a new GitHub release.
- Source visual truth: `C:\Users\visua\Documents\ChatGPT\是石科技_空间体验升级项目\交付\是石科技_领域视频互动台_V1\design\图一_轨道中枢_选定视觉稿_v1.png` (1536 × 1024).
- Evidence root: `E:\Yun\知识库\codex\home\artifacts\metastone-home-fix-20260910`.
- Source copy: `reference-selected.png`; pre-fix capture: `before-large-models.png`; revised capture: `output\playwright\02-after-large-models-1536x1024.png`, all relative to the evidence root.
- Comparison state: Pad01 homepage, 大模型 selected, 1536 × 1024 CSS pixels; measured devicePixelRatio ≈ 1 (1.0000000298), screenshots explicitly captured at CSS scale, no browser chrome. The complete comparison contains the three native-size captures, not separate unrelated image views. `final-preview-metadata.json` also verifies the final loaded client asset names and zero scene scroll.
- Full-view evidence: `output\playwright\reference-before-after.png` (4688 × 1099 including captions and spacing). Focused comparisons: `globe-detail.png`, `glass-card-detail.png`, and `drag-detail.png` in the same directory. All four were opened and visually reviewed.
- Explicit product deviations retained: the later requested near-black/indigo background; current Pad01/Pad02 identities, real media counts, and “发送到电视” wording. 大模型 remains CASE-02 in the current catalog, even though the original concept image showed 01. The source artwork is not a rasterized replacement for the working interface.

## Findings, fixes and comparison history

| ID | Earlier finding | Fix and post-fix evidence | Result |
| --- | --- | --- | --- |
| H01 / P1 | Rings were centered on the left brand sphere, cutting the large outer orbit at the left edge and changing the selected composition. | Separate composition centers for visible tracks; preserve unequal theme spacing and shared label/planet projection. Full comparison and all eight viewport captures show complete default rings. | Fixed |
| H02 / P2 | Coarse polygon wire and thick halo bands flattened the globe into a frosted sphere; the brand mark was undersized. | Reuse the existing Earth/normal/brand assets; grade ocean and illuminated coast separately, reduce cloud wash and network opacity, refine the thin rim, enlarge the actual brand asset. `globe-detail.png`. | Fixed; micro-lighting remains P3 |
| H03 / P2 | The lower-right card had an opaque split action panel instead of one glass surface. | One translucent, background-filtered surface, restrained highlight and continuous border; retain a clear TV-send action. `glass-card-detail.png`. | Fixed |
| H04 / P2 | Case titles were too quiet and AI FOR SCIENCE wrapped. | Increase case title hierarchy and keep the English-led theme on one line; no change to catalog identity. Full capture. | Fixed |
| H05 / P2 | Nine-product labels became small and broke at arbitrary characters. | Display-only semantic line breaks, larger labels and consistent line heights; preserve full canonical names in the catalog and detail card. `products-home-1536x1024.png` and `products-home-1024x768.png`. | Fixed |
| H06 / P1 | Drag could clip themes or place them under the fixed preview card; CSS scale also offset some labels from their WebGL anchors. | Constrain the whole galaxy rather than individual nodes; fade the preview card during drag/return; compose CSS translation and scale in one transform. 32 drag checks plus `drag-detail.png`. | Fixed |
| H07 / P1 | Touch drag ended prematurely when implicit capture moved from a child canvas to the main scene. | Ignore only that bubbling capture handoff; preserve actual pointer-up, cancellation and capture-loss handling. `touch-before.json`, `touch-after.json` and final `playback-smoke-verified.json`. | Fixed |
| H08 / P1 | After a node-origin drag and playback return, focusing a transformed/hidden home action could scroll the clipped main scene and shift the entire composition. | Use `overflow: clip` and make hidden home actions inert. Final check explicitly measures scene scroll, not just document overflow. `browser-qc-verified.json`: scroll `[0,0]`, projection error below 0.014 CSS px. | Fixed |

Intermediate evidence is not reused as a final pass. In particular, the earlier `browser-qc-final.json` filename predates the H08 discovery and is historical; `browser-qc-verified.json` is the canonical post-fix browser result. Initial playback-harness retries also assumed an unmuted, idle session; the final harness returns an existing session through the UI and handles its current mute state before testing.

## Required fidelity surfaces

- **Typography:** retain the project Bahnschrift / DIN / Microsoft YaHei UI / Noto Sans SC stack. At 1536 × 1024, case titles are about 20.58 px, selected 大模型 29.95 px; AI FOR SCIENCE is single-line. Product labels use intentional two-line groupings instead of character wrapping. The source font is not separately supplied, so exact font-file equivalence is not claimed.
- **Spacing/layout:** the large core stays at 34% / 48%; independent oval centers retain the left-heavy, asymmetric source composition. No uniform radial menu was introduced. The card remains lower right. The same transforms drive sphere positions, tracks and labels; no per-node edge clamping.
- **Color/surfaces:** retain the user-requested dark indigo setting rather than restoring the earlier brighter blue background. Cobalt oceans, finer icy edges and restrained transparent glass replace thick pale halos and hard card panels. Playback controls retain the previously agreed equal-size glass style.
- **Image fidelity:** existing Earth, normal, starfield and brand assets are reused; no new generated assets, approximate logos or screenshot-as-interface. The live Earth longitude and continent lighting naturally differ from the static concept. Fine geographic highlights are still softer than the artwork and are listed below as P3 polish, not claimed pixel-identical.
- **Copy/content:** actual seven-case / nine-product catalogs and 14 / 11 media items are unchanged. The Pad remains a controller, not a local player; the homepage CTA continues to say it sends to TV. No seek slider, new media mapping or cross-channel selector was added.

## Verification

- Build: PASS; client assets `index-VPFx5_Ck.js`, `index-xVD7vH7q.css`. Automated suite: **34 / 34 PASS**. Detailed record: `build-and-test-result.json`.
- Browser geometry: both catalogs at 1536 × 1024, 1920 × 1280, 1280 × 800 and 1024 × 768; **8 viewport/catalog combinations, 32 mouse gestures**.
- Final browser result: 0 document overflow, 0 offscreen gesture labels, 0 accidental control commands, 0 Pad video elements. Maximum default-pose restore error 0.0000763 CSS px; maximum DOM-anchor projection error 0.01361 px. Reduced-motion return core error 0.00959 px. Final main-scene scroll `[0,0]`.
- Touch: browser-emulated continuous drag remains `is-galaxy-dragging`; touch cancellation returns to `state-home_idle`. This is not physical Xiaomi Pad certification.
- Pad/TV regression: actual first MP4 starts on TV, pause/resume works, next/previous select the expected two 大模型 films, 2× / 4× / original speed and mute work, return removes the TV video. The Pad has zero `<video>` and zero range inputs; all eight controls measure about 79.86 × 79.86 CSS px at the test viewport.
- The original-speed browser sample briefly read 0.96 while its existing drift correction was active; this is recorded, not misreported as an exact constant 1.00. No synchronization algorithm was changed in this homepage pass.
- Console/runtime and HTTP errors: 0 in the final homepage run. One existing `THREE.Clock` deprecation warning remains. Build retains the existing large-bundle warning.
- Canonical behavior evidence: `browser-qc-verified.json`, `playback-smoke-verified.json`; default/drag/product screenshots under `output\playwright`.

## Follow-up polish and release boundary

- P3: the source's denser pinpoint coastline glow and brighter glass reflections can be further art-directed after user review. This pass resolves the identified geometry, hierarchy and interaction defects; it does not assert 100% screenshot identity or customer visual approval.
- Physical Pad touch/brightness, Redmi TV, venue LAN/reconnect, prolonged running and installation acceptance were not tested. Mobile portrait is outside this landscape exhibition-console scope.
- Local program changes are uncommitted and unuploaded. No GitHub release, Feishu update, source-media write or production approval occurred. Existing unrelated audit directories are preserved.
- Implementation checklist: shared orbit geometry; material/typography/card changes; touch capture fix; focus-scroll prevention; automated/browser/visual comparisons; local preview — completed. Customer visual review and physical integration acceptance — pending.

final result: passed

---

# Historical Design QA — Pad 操作尺寸统一（2026-09-04）

## Findings and verification gate

- [P1, fixed and visually verified] User feedback: `底部的操作UI过小，有大有小，非常奇怪。` The preceding 1920 × 1200 capture shows a 1080 × 122 dock with 32 px rate controls, 46 px return/mute, 56 px previous/next height, and a 68 px playback core. The inconsistent scale and small labels made the Pad controls difficult to scan and operate.
- Source visual truth: the existing glass material and cosmic artwork, scoped by the user's new size/alignment correction. Evidence: `audit/control-scale-qc-20260904/before-1920x1200.png` (1920 × 1200, DPR 1, TV playing / first item).
- Implementation: `src/App.jsx` and `src/styles.css`, local `/pad`. All eight buttons now use the same responsive 64–80 px width/height token; previous/next are identical; the dock maximum width is 1560 px. Playback remains differentiated by its white glass core, not size. A dedicated top timeline row allows every action to share the same centerline.
- Rendered implementation: `audit/control-scale-qc-20260904/pad-1920x1200.png`, captured fresh using the installed Chrome channel after the user asked to continue optimization and GitHub synchronization. This temporary local QC fallback does not establish that the in-app browser bootstrap issue is repaired.
- Full-view / focused comparisons: `audit/control-scale-qc-20260904/before-after-full.png` and `before-after-controls.png`. Both compare the same Pad01 / first playlist item / playing state at 1920 × 1200, DPR 1; capture time differs naturally while playback runs. The control crop preserves equal pixel scale. The previous day's PASS is not reused as evidence for this revision.

## Required fidelity surfaces

- Fonts / typography: control labels share 16–18 px; previous/next/return/mute use one 28 px icon family; metadata is 12 px and main identity 18–24 px. Fresh captures show no clipped control labels and a coherent, larger action hierarchy.
- Spacing / rhythm: common 64–80 px button token, symmetric navigation, full-width read-only timeline above the action row. Browser geometry passes at 1920 × 1200, 1536 × 1024, 1280 × 800 and 1024 × 768: eight equal controls, shared centerline, no page overflow, no dock clipping and no directory collision. At 1920 × 1200 every button is 80 × 80 px, and the dock is 1560 × 171.8 px.
- Colors / tokens: previous glass fill, backdrop blur, fine edge and reflection are preserved. No material restyling or extra glow added.
- Image fidelity: existing starfield and icon library are unchanged; no new or substitute raster assets.
- Copy / content: added visible `返回` and `声音 / 已静音` labels. Kept exact media identity, original/2×/4×, controller-only Pad and read-only progress. No extra shuffle/repeat or seek controls were introduced. Media mapping and TV behavior are outside this specific size correction.

## Implementation checklist / completed verification

- Completed: scoped JSX/CSS and common touch-scale regression test; all 30 automatic tests and Vite / Sites packaging build pass.
- Completed: fresh default, paused and Pad02 single-item captures; all 13 geometry/material checks pass at four viewports and Pad02. All 12 browser action checks pass: hover footprint, visible keyboard focus, pause/resume, next/previous, three rates, mute, return and single-item disabled navigation.
- Completed: removed hover scaling/translation so button size and alignment do not jump; added scoped touch-action and a visible keyboard focus ring. Browser console/request errors: 0; one pre-existing non-blocking THREE.Clock deprecation warning remains.
- Senior-style visual comparison and independent read-only review found no remaining P0/P1/P2 blocker in the requested bottom control scope. P3 follow-up: directory metadata is small/quiet, and the single-item directory retains generous whitespace; these are separate from this footer correction. Real Pad brightness, touch distance and venue network/TV acceptance remain unverified.
- Current result covers local Web UI only, not production approval or a newly released client package. Historical larger-next-button guidance below is superseded by this current equal-size requirement.

---

# Historical Design QA — Pad 轻量播控坞（2026-09-03，返工版）

## Current visual truth and evidence

- Source visual truth: `C:\Users\visua\AppData\Local\Temp\codex-clipboard-f79e44f3-0f84-4f4d-8e0f-6dc1902f0f65.png`.
- Source pixels: 224 × 448, portrait music-player reference. It is a control-language reference, not a request to copy its portrait, music metadata, shuffle, or repeat functions.
- Browser implementation: `audit/control-ui-qc-20260903/pad01-orbital-control-default.png`.
- Implementation viewport and pixels: 1920 × 1200 CSS px at DPR 1, matching the target 3:2 Pad landscape surface.
- Full-view same-input comparison: `audit/control-ui-qc-20260903/control-reference-comparison-v2.png`.
- Focused control comparison: `audit/control-ui-qc-20260903/control-focus-comparison-v2.png`.
- Browser machine result: `audit/control-ui-qc-20260903/browser-qc.json`.
- Compared states: TV playing, TV paused, next playlist item, and 2× rate selected.

The source and implementation intentionally use different orientations. The full comparison preserves both complete screens. The focused comparison crops the source control area at 224 × 268 and the implementation footer at 1360 × 210, then places both into one image for hierarchy and proportion review. Pixel parity is not claimed across unrelated device orientations.

## Current fidelity surfaces

- Fonts and typography: the existing exhibit type system is retained. `电视端正在播放`, exact media name, current item, `上一项`, `下一项`, and speed labels remain readable without wrapping. The former play/pause caption under the core was removed because the icon and state-specific accessible name already communicate the action.
- Spacing and layout rhythm: the first rejected version's three bottom cards and 154 px half-dome are gone. One 1080 × 122 px transport dock is centered at viewport X=960 px. Its 68 × 68 px play/pause core sits between a 56 × 56 px previous control and a 128 × 56 px next-item control. The directory ends at Y=617 px and the dock begins at Y=1048 px, leaving a clear separation.
- Colors and visual tokens: one white core, one restrained cobalt halo, a quiet indigo dock, and cyan progress/active accents translate the reference without stacking multiple neon rings. The directory and transport dock now use true background-visible glass: 37–38% base tint, 30 px backdrop blur, 145–150% saturation lift, a fine cold edge, restrained inner highlight, and a soft off-axis reflection. The next button uses a low-saturation blue fill rather than the rejected bright cyan gradient.
- Image quality and asset fidelity: the existing clean `orbital-space-background.png` is used in control mode. The former rasterized overview screenshot—which visibly duplicated planet labels and old controls behind the new UI—was removed. No placeholder or new generated asset was introduced.
- Copy and content: the read-only `电视端同步进度 · 只读`, `原速 / 2× / 4×`, mute, exact filename, item count, return action, and ordered playlist remain present. Unapproved shuffle/repeat controls remain absent.
- Accessibility and interaction: Pad mounts zero `<video>` elements. Play/pause, next item, and 2× rate were browser-tested. Persistent controls remain inside the viewport with zero page overflow, and the larger next-item touch target remains larger than previous.

## Current findings

- No actionable P0, P1, or P2 issue remains in the current focused comparison.
- Accepted product deviation: `下一项` stays larger and text-labeled rather than mirroring the icon-only previous button. This is a deliberate task-priority choice for the exhibition Pad.
- Accepted product deviation: the controls are translated into a restrained landscape dock rather than recreating the reference's portrait half-circle.
- P3 follow-up: verify white-core brightness and the smallest metadata at the real Xiaomi Pad viewing distance and exhibition ambient light.

## Current comparison history

- Pass 11 P1: the old full-width desktop toolbar lacked the source's clear circular playback focus.
- First fix: added a luminous central core, but also introduced three disconnected bottom cards, a large half-dome, stacked neon rings, and an oversized cyan next button.
- User verdict: `太丑了`.
- Pass 12 P1: the first fix was visually heavy, game-HUD-like, and competed with the media directory.
- Second fix: removed the half-dome and extra rings, consolidated the footer into one lower-opacity dock, reduced core and previous-control scale, quieted the next control, converted the left status block to typography rather than another card, and replaced the duplicated overview screenshot with the clean orbital-space plate.
- User clarification: `效果图是有玻璃质感`.
- Final fix: kept the lightweight geometry, replaced the remaining flat navy surfaces with genuinely translucent, background-filtered glass, and added only a fine cold rim plus one soft internal reflection so the material reads as glass without returning to the rejected neon HUD treatment.
- Post-fix evidence: `audit/control-ui-qc-20260903/control-reference-comparison-v2.png` and `control-focus-comparison-v2.png`. Browser QC reports exact horizontal centering, 0 overflow, 0 directory collision, 0 Pad video elements, and working play/pause, next-item, and rate actions. Console errors are 0; the sole warning is the existing non-blocking `THREE.Clock` deprecation.

---

# Historical Design QA — 图一 WebGL 轨道中枢

## Visual truth and browser evidence

- Source visual truth: `design/图一_轨道中枢_选定视觉稿_v1.png`
- Source pixels: 1536 × 1024, 3:2 landscape.
- Final browser implementation: `qa/galaxy-deep-space-home.png`
- Current dual-catalog / spacecraft implementation screenshot: not captured; automated browser capture is blocked in this pass.
- Current 4K TV standby implementation: `output/playwright/tv-standby-v1-20260831/tv-standby-4k-v1.png` (3840 × 2160).
- TV standby source/implementation comparison: `output/playwright/tv-standby-v1-20260831/tv-standby-source-vs-implementation.png` (3840 × 1080).
- Final full-view comparison: `qa/galaxy-deep-space-reference-comparison.png`
- Background before / after comparison: `qa/galaxy-background-before-after.png`
- Final focused label / icon comparison: `qa/galaxy-3d-motion-label-focus.png`
- Dragged interaction state: `qa/galaxy-deep-space-drag.png`
- Prior planet-material evidence: `qa/planet-art-final.png`, `qa/planet-art-final-comparison.png`, `qa/planet-art-focused-comparison.png`, `qa/planet-art-drag-rotated.png`
- Earlier planet-material iteration evidence: `qa/planet-art-pass-01.png`, `qa/planet-art-pass-05.png`, `qa/planet-art-pass-07.png`
- Local route: `http://127.0.0.1:4174/`
- Browser CSS viewport: approximately 1537 × 1024 at DPR 0.8; the normalized implementation tile is 1536 × 1024.
- Compared states: `HOME_IDLE`, selected `01 大模型`; a post-drag rotated `HOME_IDLE` state; two consecutive left drags; one right drag; and the post-drag video enter / playing / return journey.

## Capture normalization

The in-app browser rendered a repeated physical surface. The first complete 1536 × 1024 tile was cropped without scaling, then placed beside the 1536 × 1024 source at 1:1 size in one 3072 × 1024 image. No browser chrome or device frame is present. The implementation remains live WebGL plus accessible DOM controls; the source artwork is not used as a UI screenshot replacement.

The full-view comparison retains each design at native 1:1 resolution, so the header lockup, planet labels, icons, orbit lines, instruction, dock border, typography, and play control remain readable. The current 900 × 360 focused comparison uses the same 450 × 360 crop from source and implementation to inspect the selected 大模型 globe, enlarged icon, reduced Chinese-title scale, English label, and adjacent orbit hierarchy at 1:1 scale. Earlier focused planet-material evidence remains available for the center globe and shader treatment.

## Required fidelity surfaces

- Fonts and typography: the header lockup was resized to the source proportions, the extra English header subtitle was removed, and Chinese/English node hierarchy, tracking, weights, and line breaks now follow the source. In the latest pass the Chinese planet titles were reduced one optical step while the domain icons were enlarged, producing the requested icon-led hierarchy without reducing touch-target size. The selected title, counter, time, and dock CTA remain readable at tablet distance.
- Spacing and layout rhythm: central globe, seven node centers, three orbit families, energy link, top header, lower-left hint, and lower-right dock match the 1536 × 1024 source composition. Persistent controls remain inside the frame with no clipping or collision.
- Colors and visual tokens: the palette is now led by near-black indigo and deep midnight navy, with the former royal-blue field desaturated into restrained cold-blue nebula haze. Crisp stars, cobalt planets, ice blue-white labels, and cyan energy accents remain luminous against the receding background. Planet values still separate dark ocean, illuminated terrain, cloud veil, specular highlight, atmosphere, and bloom instead of flattening them into one pale-blue layer.
- Image quality and asset fidelity: the existing METASTONE SVG remains the brand source. The WebGL planets sample the supplied 2048 px Earth and normal rasters directly through a dedicated material shader, with independent cloud alpha and varied initial longitudes. A sparse icosahedral wire overlay replaces the former latitude/longitude grid and follows the triangular network language of the source. No visible logo, planet, or decorative image was replaced with CSS/div art.
- Copy and content: all seven source categories are present: 大模型、科研院所、高端制造、海洋模拟、互联网、航空航天、AI FOR SCIENCE. Header, English labels, counter, and playback copy are source-aligned. The lower-left instruction was intentionally extended to `拖动旋转星系 · 轻触星球播放影片` so the new gesture is discoverable.
- Icons and controls: semantic iconography is consistent, centered, and uses one line-weight family. Planet labels and dock CTA are real buttons with named accessible actions.
- States and interactions: hover/selection scaling, globe/cloud drift, star parallax, selected energy pulse, focusing transition, video enter/play/pause/next/close states, attract cycle, and reduced-motion handling are implemented. Blank-area pointer/touch drag now follows a smoothed target angle, rotates all seven planets and labels around the central globe, carries the selected energy link, applies restrained release inertia, suppresses accidental clicks after movement, and preserves upright label typography. Planet depth changes across the orbit, the three tracks use real z-depth with distinct front/back values, drag velocity tilts their planes directionally, and a restrained camera dolly plus star-field parallax makes the gesture read as spatial view conversion.
- Viewport and accessibility: the target is the Xiaomi Pad 8 Pro landscape composition. Tablet-sized touch targets, keyboard-reachable buttons, semantic labels, visible focus behavior, and `prefers-reduced-motion` support are present.

## Findings

- Browser capture is now available through the installed Chrome channel. The `/tv` route was captured at the target 3840 × 2160 viewport; the selected asymmetric galaxy composition, left-mid core, right-side standby hierarchy and connection state are all visible without clipping. TV playback activation is automatic after the Pad command; no TV-side activation control is rendered.
- No actionable P0, P1, or P2 fidelity issues remain in the final 1:1 comparison or the left/right drag checks.
- Accepted dynamic variation: the WebGL Earth texture rotates, so the visible landmass orientation will not remain pixel-identical to the static source; this is intentional and preserves the requested live spatial effect.
- Accepted copy variation: the gesture hint is longer than the source because it documents the user-requested drag behavior; it remains inside the original lower-left instruction zone.
- P3 / planet texture: the source still carries slightly denser white geographic micro-detail than the live sphere. The implementation keeps a softer texture response to avoid shimmering and blocky aliasing while the galaxy is dragged; this does not affect hierarchy, legibility, or the requested luminous-glass direction.
- P3 / media gate: final category MP4 files were not present in the supplied workspace. The seven slots currently use the animated demo-film state. Replacing those media files will not require a UI-layout change.

## Main-journey verification

- Galaxy drag: dragged across a blank scene region at the Xiaomi Pad viewport after the background grade. All seven DOM labels moved with their WebGL planets, planet sizes changed with depth, the selected energy link followed the active planet, the three-dimensional tracks tilted with drag direction, and the center identity / UI dock remained stable. Evidence: `qa/galaxy-deep-space-drag.png`.
- Continuous edge behavior: two consecutive left drags were measured separately. Edge-adjacent nodes continued around the orbit on the second drag instead of repeating a clamped coordinate; for example, 海洋模拟 moved from approximately `(610.5, 797.1)` after the first left drag to `(141.5, 469.1)` after the second. A separate right drag also produced a different seven-node arrangement. Every measured label remained fully inside the 1537 × 1024 CSS viewport.
- Drag safety: after release, the app remained `state-home_idle`; no video opened accidentally. The browser check reported seven labels and `labelsInside: true` at the 1537 × 1024 CSS viewport.
- Post-drag play: clicked `海洋模拟` after rotation; the app reached `state-video_playing`, opened `.video-portal.is-open`, and displayed the matching title.
- Pause: clicked `暂停视频`; the app reached `state-video_paused`.
- Next domain: clicked `下一个领域`; the heading changed to `互联网` and playback resumed.
- Return: clicked `返回领域总览`; the app returned to `state-home_idle`.
- Browser console: no runtime errors. The only message is the non-blocking upstream `THREE.Clock` deprecation warning from the current Three.js integration.
- Production build: passed (`npm run build`).
- Sites packaging tests: 4 / 4 passed (`npm run test:sites`).

## Comparison history

- Pass 1 P1: initial program was a flat 16:9 image with an unrelated transport strip, not the selected orbital control interface.
- Fix: rebuilt the screen as a WebGL orbital scene with a DOM touch layer and a complete video interaction state machine.
- Pass 2 P1: labels detached under tablet capture scaling; central and peripheral geometry did not align with the 3:2 source.
- Fix: moved labels to measured DOM controls and calibrated each node, central globe, and focus dock against the 1536 × 1024 composition.
- Pass 3 P2: user feedback identified a material art-direction mismatch: sparse/dark space, gray-brown planets, hard cyan rings, and a flatter dock.
- Fix: generated a dense navy/cobalt space plate, derived a blue-white Earth texture, added restrained post-process bloom, replaced hard concentric rings with softer atmospheric Fresnel shells, strengthened orbit hierarchy, deepened the play button, and corrected header scale/copy.
- Post-fix evidence: `qa/webgl-art-comparison-final.png` shows the selected source and final implementation side by side at equal pixel size. The composition, header proportions, star density, blue-white spheres, orbit hierarchy, and dock treatment now follow the same visual system.
- Pass 4 P2: the first drag implementation moved the WebGL planets correctly but mirrored the DOM label rotation because screen Y and world Y run in opposite directions; a modest swipe could also clip the Internet node at the left edge.
- Fix: inverted the DOM orbital transform to match WebGL projection, reduced swipe sensitivity and inertial velocity, added consistent WebGL/DOM safe-area clamps, and retained click suppression for moved pointers.
- Post-fix interaction evidence: `qa/webgl-drag-rotated.png` shows all seven labels centered on their planets after rotation and inside the Xiaomi Pad viewport. The corresponding browser check reports `state-home_idle`, seven visible labels, no accidental video portal, and no runtime errors.
- Pass 5 P2: the previously verified interaction build still rendered the planets as broadly pale/flat spheres; surface, cloud, atmosphere, and dense spherical wireframe competed at similar values, so the result lacked the source's deep cobalt ocean and luminous terrain hierarchy.
- Fix: replaced the flat base/overlay stack with a texture-backed WebGL material that grades ocean and terrain separately, uses the normal raster for relief accents, isolates cloud opacity, reduces post-process washout, softens the two atmosphere shells, swaps the dense spherical wireframe for a restrained icosahedral network, and varies globe longitude so selected and secondary nodes do not repeat one face.
- Post-fix visual evidence: `qa/planet-art-final-comparison.png` and `qa/planet-art-focused-comparison.png` show the source and final implementation together at equal pixel scale. `qa/planet-art-drag-rotated.png` confirms the same material remains coherent during the requested galaxy rotation.
- Pass 6 P2: user feedback identified two motion issues: planets visually stopped at the hard safe-area clamp, and the orbit tracks still read as flat while dragging. The requested visual hierarchy also called for smaller Chinese titles and larger icons.
- Fix: replaced the hard clamp with a continuous arctangent soft boundary shared by WebGL and DOM projection; changed direct angle mutation to a smoothed target-angle follow with restrained inertia; added orbital z-depth and DOM perspective scaling; rebuilt each track as front/back three-dimensional arcs with independent tilt and drag-velocity yaw; added camera dolly and star parallax response; and changed title/icon scale without changing touch targets.
- Post-fix evidence: `qa/galaxy-3d-motion-comparison.png` and `qa/galaxy-3d-motion-label-focus.png` verify the default state and new icon/title balance against the source at 1:1 scale. `qa/galaxy-3d-motion-drag.png` plus the two-step coordinate checks verify the spatial drag and non-freezing edge behavior.
- Pass 7 P2: user feedback identified that the background remained too uniformly blue and did not recede deeply enough behind the luminous planets.
- Fix: preserved the original star/nebula image asset but moved it to an isolated background layer, reduced saturation, shifted the base to near-black indigo, restored a controlled amount of nebula luminance, and added a restrained edge vignette. Layout, WebGL materials, labels, orbit geometry, hit areas, and playback logic were not changed.
- Post-fix evidence: `qa/galaxy-background-before-after.png` directly shows the reduction in blue dominance, while `qa/galaxy-deep-space-reference-comparison.png` compares the selected source and revised implementation at equal 3:2 scale. `qa/galaxy-deep-space-drag.png` verifies that the deeper grade remains coherent after spatial rotation. No actionable P0/P1/P2 issue remains.
- Pass 8 verification gate: implemented the shared two-catalog content model, a 54 px tablet-safe catalog switch, product-film placeholders, a darker planet shader response, and a Phosphor spacecraft that follows the selected quadratic energy link tangent. Production build, four Sites packaging tests, the two-catalog data contract, and both localhost/LAN HTTP endpoints passed. Browser-rendered screenshot and live touch-journey evidence for this exact pass are still missing because the browser-control bootstrap is unavailable, so this pass cannot be marked visually accepted yet.
- Pass 9 functional test environment: added separate `/pad` and `/tv` routes on the LAN test server, server-sent control state, direct source-video delivery with byte-range support, 14 automatic video-slot mappings, real-duration playback, and missing-media fallback. The connected TV route received `PLAY → PAUSE → SEEK → RESUME → MUTE → STOP`; its SSE connection remained live while the final `STOP` returned the state to standby. Both LAN routes and the state API returned HTTP 200, invalid commands returned 400, unknown API routes returned 404, and a range request returned 206.
- Pass 10 TV standby: replaced the centered readiness icon with the live asymmetric WebGL galaxy, removed the selected-node energy line from standby, added a restrained 12-second loop, established the right-lower `成果案例 · 产品介绍` information hierarchy, and lowered technical status prominence. Browser capture at 3840 × 2160 shows no overflow, no title wrap, and no collision with the core or peripheral planets. Build and the current orbit, playback-sync and Sites suites all pass.

final result: passed
