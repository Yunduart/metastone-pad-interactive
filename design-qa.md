# Design QA — 图一 WebGL 轨道中枢

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

- Browser capture is now available through the installed Chrome channel. The `/tv` route was captured at the target 3840 × 2160 viewport; the selected asymmetric galaxy composition, left-mid core, right-side standby hierarchy, connection state and one-time activation control are all visible without clipping.
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
- Pass 10 TV standby: replaced the centered readiness icon with the live asymmetric WebGL galaxy, removed the selected-node energy line from standby, added a restrained 12-second loop, established the right-lower `成果案例 · 产品介绍` information hierarchy, lowered technical status prominence, and retained the truthful one-time playback activation. Browser capture at 3840 × 2160 shows no overflow, no title wrap, and no collision with the core or peripheral planets. Build and the current orbit, playback-sync and Sites suites all pass.

final result: passed
