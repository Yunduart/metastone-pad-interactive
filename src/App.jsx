import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Atom,
  ArrowCounterClockwise,
  ArrowRight,
  Buildings,
  CaretLeft,
  CaretRight,
  CirclesFour,
  Crosshair,
  Cube,
  CubeTransparent,
  Diamond,
  DotsNine,
  Factory,
  GlobeHemisphereWest,
  House,
  Package,
  Pause,
  Play,
  Polygon,
  RocketLaunch,
  SpeakerHigh,
  SpeakerSlash,
  Stack,
  Waves,
} from "@phosphor-icons/react";
import { OrbitScene } from "./OrbitScene.jsx";
import { TvDisplay } from "./TvDisplay.jsx";
import { CONTENT_CATALOGS, DEFAULT_CATALOG_ID, DEMO_DURATION } from "./domains.js";
import { PLAYBACK_RATES, normalizePlaybackRate } from "./playbackSync.js";
import {
  GALAXY_ELEVATION_LIMIT,
  GALAXY_SOURCE_CORE,
  galaxyCoreDragDelta,
  galaxyCoreDrift,
  galaxyOrbitTrack,
  galaxyPortalPhase,
  galaxyTrackPoint,
  galaxyViewportSize,
  projectGalaxyPoint,
  stepDampedSpring,
} from "./orbitMath.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getDeviceRole() {
  const pathRole = window.location.pathname.split("/").filter(Boolean).at(-1);
  const queryRole = new URLSearchParams(window.location.search).get("role");
  const role = queryRole ?? pathRole;
  if (role === "tv") return "tv";
  if (["pad", "pad01", "pad-01", "pad02", "pad-02"].includes(role)) return "pad";
  return "standalone";
}

function getAssignedCatalogId() {
  const params = new URLSearchParams(window.location.search);
  const pathRole = window.location.pathname.split("/").filter(Boolean).at(-1)?.toLowerCase();
  const requested = (params.get("pad") ?? params.get("channel") ?? params.get("catalog") ?? pathRole ?? "").toLowerCase();
  if (["02", "pad02", "pad-02", "products", "product-introduction"].includes(requested)) {
    return "product-introduction";
  }
  return "success-cases";
}

function createRuntimeId(prefix) {
  const randomId = globalThis.crypto?.randomUUID?.();
  return randomId ? `${prefix}-${randomId}` : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatTime(value) {
  const seconds = Math.max(0, Math.floor(value));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

const DOMAIN_ICONS = {
  atom: Atom,
  circles: CirclesFour,
  cube: Cube,
  diamond: Diamond,
  dots: DotsNine,
  factory: Factory,
  internet: GlobeHemisphereWest,
  package: Package,
  polygon: Polygon,
  research: Buildings,
  rocket: RocketLaunch,
  stack: Stack,
  "transparent-cube": CubeTransparent,
  waves: Waves,
};

const GALAXY_CORE_PORTAL = { x: GALAXY_SOURCE_CORE.x * 100, y: GALAXY_SOURCE_CORE.y * 100 };
const GALAXY_DRAG_THRESHOLD = 8;

function OrbitLabels({ catalog, domains, selectedId, viewState, onSelect, onCoreReset, galaxyAngleRef, dragGuardRef }) {
  const focusing = viewState === "FOCUSING";
  const labelsRef = useRef(null);
  const coreRef = useRef(null);
  const planetRefs = useRef(new Map());

  useEffect(() => {
    const root = labelsRef.current;
    if (!root) return undefined;
    const size = { width: root.clientWidth, height: root.clientHeight };
    const resizeObserver = new ResizeObserver(() => {
      size.width = root.clientWidth;
      size.height = root.clientHeight;
    });
    resizeObserver.observe(root);
    let frame = 0;
    let lastAngle = Number.NaN;
    let lastElevation = Number.NaN;
    let lastCoreOffset = Number.NaN;
    let lastCoreVerticalOffset = Number.NaN;
    let lastWidth = 0;
    let lastHeight = 0;
    let lastViewScale = Number.NaN;
    const renderPositions = () => {
      const angle = galaxyAngleRef.current;
      const elevation = dragGuardRef.current?.elevation ?? 0;
      const coreOffset = dragGuardRef.current?.coreOffset ?? 0;
      const coreVerticalOffset = dragGuardRef.current?.coreVerticalOffset ?? 0;
      const viewScale = dragGuardRef.current?.viewScale ?? 1;
      if (
        Math.abs(angle - lastAngle) <= 0.00001
        && Math.abs(elevation - lastElevation) <= 0.00001
        && Math.abs(coreOffset - lastCoreOffset) <= 0.00001
        && Math.abs(coreVerticalOffset - lastCoreVerticalOffset) <= 0.00001
        && Math.abs(viewScale - lastViewScale) <= 0.00001
        && size.width === lastWidth
        && size.height === lastHeight
      ) {
        frame = window.requestAnimationFrame(renderPositions);
        return;
      }
      lastAngle = angle;
      lastElevation = elevation;
      lastCoreOffset = coreOffset;
      lastCoreVerticalOffset = coreVerticalOffset;
      lastWidth = size.width;
      lastHeight = size.height;
      lastViewScale = viewScale;
      root.style.setProperty("--galaxy-view-scale", viewScale.toFixed(5));
      const viewport = galaxyViewportSize(size.width, size.height);
      const corePosition = [
        (GALAXY_CORE_PORTAL.x / 100 - 0.5) * viewport.width,
        (0.5 - GALAXY_CORE_PORTAL.y / 100) * viewport.height,
        0,
      ];
      const coreDrift = galaxyCoreDrift(angle, elevation, {
        width: viewport.width,
        height: viewport.height,
        horizontalOffset: coreOffset,
        verticalOffset: coreVerticalOffset,
      });
      const coreWorld = [
        corePosition[0] + coreDrift[0],
        corePosition[1] + coreDrift[1],
        coreDrift[2],
      ];
      const [pivotX, pivotY, corePerspective] = projectGalaxyPoint(coreWorld, size.width, size.height);
      if (coreRef.current) {
        coreRef.current.style.setProperty("--core-x", `${pivotX}px`);
        coreRef.current.style.setProperty("--core-y", `${pivotY}px`);
        coreRef.current.style.setProperty("--core-depth-scale", corePerspective.toFixed(4));
      }
      domains.forEach((domain, index) => {
        const node = planetRefs.current.get(domain.id);
        if (!node) return;
        const track = galaxyOrbitTrack(domain.orbitKey ?? domain.id);
        const phase = galaxyPortalPhase(domain.portal, { track });
        const trackPoint = galaxyTrackPoint(
          index,
          domains.length,
          viewport.width,
          viewport.height,
          angle,
          elevation,
          { track, phase },
        );
        const planetWorld = [
          coreWorld[0] + trackPoint[0],
          coreWorld[1] + trackPoint[1],
          coreWorld[2] + trackPoint[2],
        ];
        const [projectedX, projectedY, perspective] = projectGalaxyPoint(
          planetWorld,
          size.width,
          size.height,
        );
        const depthFactor = clamp((perspective - 0.94) / 0.12, 0, 1);
        node.style.setProperty("--label-x", `${projectedX}px`);
        node.style.setProperty("--label-y", `${projectedY}px`);
        node.style.setProperty("--orbit-depth-scale", perspective.toFixed(4));
        node.style.setProperty("--orbit-depth-opacity", (0.76 + depthFactor * 0.24).toFixed(4));
        node.style.setProperty("--orbit-depth-brightness", (0.88 + depthFactor * 0.16).toFixed(4));
        node.style.zIndex = String(18 + Math.round(planetWorld[2] * 10));
      });
      frame = window.requestAnimationFrame(renderPositions);
    };
    frame = window.requestAnimationFrame(renderPositions);
    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [domains, dragGuardRef, galaxyAngleRef, selectedId]);

  return (
    <div ref={labelsRef} className="orbit-labels" aria-label={`${catalog.title}视频星球`}>
      <button
        ref={coreRef}
        className="core-label"
        type="button"
        onClick={onCoreReset}
        aria-label={`返回${catalog.title}图谱中心`}
      >
        <span className="core-label__mark" aria-hidden="true">
          <img src="/assets/shishi-logo.svg" alt="" draggable="false" />
        </span>
        <strong>METASTONE</strong>
        <small>是 石 科 技</small>
      </button>

      {domains.map((domain) => {
        const Icon = DOMAIN_ICONS[domain.icon] ?? Cube;
        const active = domain.id === selectedId;
        const isEnglishLead = Boolean(domain.englishLead);

        return (
          <button
            key={domain.id}
            ref={(node) => {
              if (node) planetRefs.current.set(domain.id, node);
              else planetRefs.current.delete(domain.id);
            }}
            className={`planet-label${active ? " is-active" : ""}${focusing && !active ? " is-dimmed" : ""}${isEnglishLead ? " is-english-lead" : ""}`}
            type="button"
            style={{ "--label-x": `${domain.portal.x}%`, "--label-y": `${domain.portal.y}%` }}
            onClick={() => onSelect(domain.id)}
            aria-label={`发送${domain.title}到电视`}
            aria-pressed={active}
          >
            <Icon className="planet-label__icon" size={active ? 39 : 32} weight="light" aria-hidden="true" />
            <strong>{isEnglishLead ? domain.english : (domain.labelTitle ?? domain.title)}</strong>
            {isEnglishLead ? null : <span>{domain.english}</span>}
          </button>
        );
      })}
    </div>
  );
}

function FocusDock({ catalog, domain, total, onPlay }) {
  const firstMedia = domain.playlist?.[0];
  return (
    <aside className="focus-dock" aria-live="polite">
      <div className="focus-dock__meta">
        <div className="focus-dock__index">
          <strong>{domain.number}</strong>
          <span>/ {String(total).padStart(2, "0")}</span>
          <i aria-hidden="true" />
        </div>
        <div className="focus-dock__title">
          <strong>{domain.title}</strong>
          <span>{domain.english}</span>
          {domain.marker ? (
            <small>{domain.marker} · {domain.mediaCount ?? 1} 个可播项目</small>
          ) : domain.placeholder ? <small>待接入正式产品素材</small> : null}
        </div>
        <div className="focus-dock__time">
          <span>00:00</span>
          <span>{formatTime(firstMedia?.duration ?? DEMO_DURATION)}</span>
        </div>
        <div className="focus-dock__track" aria-hidden="true"><i /></div>
      </div>

      <button className="focus-dock__play" type="button" onClick={onPlay} aria-label={`在电视端播放${catalog.title}·${domain.title}`}>
        <span><Play size={38} weight="fill" aria-hidden="true" /></span>
        <strong>发送到电视</strong>
      </button>
    </aside>
  );
}

function PlaybackControls({
  catalog,
  domain,
  media,
  itemIndex,
  itemTotal,
  total,
  duration,
  playing,
  muted,
  playbackRate,
  progress,
  controlsVisible,
  onClose,
  onPrevious,
  onNext,
  onToggle,
  onMute,
  onRateChange,
}) {
  return (
    <div className={`player-controls${controlsVisible ? " is-visible" : ""}`}>
      <div className="player-controls__timeline">
        <div className="player-controls__readout">
          <span>{formatTime(progress)}</span>
          <small>电视端同步进度 · 只读</small>
          <span>{formatTime(duration)}</span>
        </div>
        <div
          className="player-controls__progress"
          role="progressbar"
          aria-label="播放端同步进度，只读"
          aria-valuemin="0"
          aria-valuemax={Math.max(duration, 0.1)}
          aria-valuenow={Math.min(progress, duration)}
        >
          <i style={{ width: `${(progress / Math.max(duration, 0.1)) * 100}%` }} />
        </div>
      </div>

      <div className="player-controls__identity">
        <button className="icon-button player-controls__return" type="button" onClick={onClose} aria-label={`返回${catalog.title}`}>
          <CaretLeft size={28} weight="bold" />
          <span>返回</span>
        </button>
        <div>
          <small>{domain.number} / {String(total).padStart(2, "0")} · {catalog.title} · 第 {itemIndex + 1}/{itemTotal} 项</small>
          <strong>{domain.title}</strong>
          <span>{media.title}</span>
        </div>
      </div>

      <div className="player-controls__console">
        <div className={`player-controls__transport${itemTotal > 1 ? " has-multiple-items" : ""}`}>
          <button className="player-controls__previous" type="button" onClick={onPrevious} aria-label="上一项" disabled={itemTotal <= 1}>
            <CaretLeft size={28} weight="bold" />
            <span>上一项</span>
          </button>
          <div className="player-controls__core">
            <button className="player-controls__play" type="button" onClick={onToggle} aria-label={playing ? "暂停电视播放" : "继续电视播放"}>
              {playing ? <Pause size={34} weight="fill" /> : <Play size={34} weight="fill" />}
            </button>
          </div>
          <button className="player-controls__next" type="button" onClick={onNext} aria-label="下一项" disabled={itemTotal <= 1}>
            <CaretRight size={28} weight="bold" />
            <span>下一项</span>
          </button>
        </div>
      </div>

      <div className="player-controls__secondary">
        <div className="player-controls__rates" role="group" aria-label="播放速度">
          {PLAYBACK_RATES.map((rate) => (
            <button
              key={rate}
              type="button"
              className={playbackRate === rate ? "is-active" : ""}
              aria-pressed={playbackRate === rate}
              aria-label={rate === 1 ? "原速播放" : `${rate}倍速播放`}
              onClick={() => onRateChange(rate)}
            >
              {rate === 1 ? "原速" : `${rate}×`}
            </button>
          ))}
        </div>
        <button className="icon-button player-controls__mute" type="button" onClick={onMute} aria-label={muted ? "开启声音" : "静音"}>
          {muted ? <SpeakerSlash size={28} /> : <SpeakerHigh size={28} />}
          <span>{muted ? "已静音" : "声音"}</span>
        </button>
      </div>
    </div>
  );
}

function MediaDirectory({ catalog, domain, itemIndex, onSelectItem }) {
  return (
    <aside className="pad-media-directory" aria-label={`${domain.title}资源目录`}>
      <header>
        <small>{catalog.padId} · 播放目录（按顺序）· {domain.playlist.length} 项</small>
        <strong>{catalog.sourceFolder} / {domain.sourceFolder}</strong>
      </header>
      <ol>
        {domain.playlist.map((item, index) => {
          const active = index === itemIndex;
          const mediaType = item.kind === "ppt-slide-video"
            ? `PPT 第 ${item.sourcePage} 页 → 循环 MP4`
            : "原始视频";
          return (
            <li key={item.id}>
              <button
                type="button"
                className={active ? "is-active" : ""}
                aria-current={active ? "true" : undefined}
                aria-label={`发送目录第 ${index + 1} 项到电视：${item.sourceFile}`}
                onClick={() => onSelectItem(index)}
              >
                <b>{String(index + 1).padStart(2, "0")}</b>
                <span>
                  <strong>{item.sourceFile}</strong>
                  <small>{mediaType}</small>
                </span>
                {active ? <em>当前</em> : <CaretRight size={18} weight="bold" />}
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function DemoFilm({ catalog, domain, playing }) {
  return (
    <div className={`demo-film${playing ? " is-playing" : ""}`} role="img" aria-label={`${catalog.title}·${domain.title}影片演示画面`}>
      <img src="/assets/orbital-space-background.png" alt="" />
      <div className="demo-film__shade" aria-hidden="true" />
      <div className="demo-film__copy">
        <span>METASTONE · {catalog.english} · {domain.number}</span>
        <strong>{domain.title}</strong>
        <small>{domain.english}</small>
      </div>
    </div>
  );
}

function EndSlate({ catalog, onReplay, onNext, onClose }) {
  return (
    <div className="end-slate" role="dialog" aria-label="当前内容播放结束">
      <small>{catalog.english} · ITEM COMPLETE</small>
      <strong>当前内容播放完毕</strong>
      <div>
        <button type="button" onClick={onReplay}><ArrowCounterClockwise size={21} />重播</button>
        <button type="button" onClick={onNext}><ArrowRight size={21} />下一项</button>
        <button type="button" onClick={onClose}><House size={21} />返回总览</button>
      </div>
    </div>
  );
}

function ControlPortal({
  catalog,
  domain,
  media,
  itemIndex,
  itemTotal,
  total,
  duration,
  viewState,
  playing,
  muted,
  playbackRate,
  progress,
  onEntered,
  onExited,
  onPlayingChange,
  onRateChange,
  onClose,
  onPrevious,
  onNext,
  onSelectItem,
  onMute,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setOpen(true));
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  useEffect(() => {
    if (viewState === "VIDEO_EXIT") setOpen(false);
  }, [viewState]);

  return (
    <section
      className={`video-portal${open ? " is-open" : ""}${viewState === "VIDEO_EXIT" ? " is-closing" : ""}`}
      style={{ "--portal-x": `${domain.portal.x}%`, "--portal-y": `${domain.portal.y}%` }}
      aria-label={`${domain.title}电视播控面板`}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget || event.propertyName !== "clip-path") return;
        if (open && viewState === "VIDEO_ENTER") onEntered();
        if (!open && viewState === "VIDEO_EXIT") onExited();
      }}
    >
      <div className="video-stage pad-control-stage">
        <DemoFilm catalog={catalog} domain={domain} playing={false} />
        <div className="pad-control-cluster">
          <div className={`pad-control-status${playing ? " is-playing" : " is-paused"}`} role="status" aria-live="polite">
            <small>PAD 控制端 · 本机不播放视频</small>
            <strong>{playing ? "电视端正在播放" : "电视端已暂停"}</strong>
            <span>{media.title}</span>
            <em>
              第 {itemIndex + 1} / {itemTotal} 项 · {media.kind === "ppt-slide-video" ? "PPT 页面循环 MP4" : "视频"}
            </em>
            <i aria-hidden="true" />
          </div>

          <MediaDirectory
            catalog={catalog}
            domain={domain}
            itemIndex={itemIndex}
            onSelectItem={onSelectItem}
          />
        </div>

        {viewState === "VIDEO_END" ? (
          <EndSlate catalog={catalog} onReplay={() => onPlayingChange(true)} onNext={onNext} onClose={onClose} />
        ) : null}
      </div>

      <PlaybackControls
        catalog={catalog}
        domain={domain}
        media={media}
        itemIndex={itemIndex}
        itemTotal={itemTotal}
        total={total}
        duration={duration}
        playing={playing}
        muted={muted}
        playbackRate={playbackRate}
        progress={progress}
        controlsVisible
        onClose={onClose}
        onPrevious={onPrevious}
        onNext={onNext}
        onToggle={() => onPlayingChange(!playing)}
        onMute={onMute}
        onRateChange={onRateChange}
      />
    </section>
  );
}

function CatalogSwitch({ activeId, disabled, catalogs = CONTENT_CATALOGS, locked = false, onChange }) {
  return (
    <nav className={`catalog-switch${locked ? " is-locked" : ""}`} aria-label={locked ? "当前 Pad 固定板块" : "内容板块"}>
      {catalogs.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            className={active ? "is-active" : ""}
            aria-pressed={active}
            disabled={disabled}
            data-no-galaxy-drag
            onClick={() => onChange(item.id)}
          >
            <small>{item.number}</small>
            <span>
              <strong>{item.title}</strong>
              <em>{item.english}</em>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function PadConsole({ remoteEnabled = false, assignedCatalogId = null }) {
  const isTestEnvironment = remoteEnabled;
  const initialCatalog = CONTENT_CATALOGS.find((item) => item.id === assignedCatalogId) ?? CONTENT_CATALOGS[0];
  const [catalogId, setCatalogId] = useState(initialCatalog.id ?? DEFAULT_CATALOG_ID);
  const catalog = useMemo(
    () => CONTENT_CATALOGS.find((item) => item.id === catalogId) ?? CONTENT_CATALOGS[0],
    [catalogId],
  );
  const domains = catalog.items;
  const [selectedId, setSelectedId] = useState(initialCatalog.items[0].id);
  const [activeId, setActiveId] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [viewState, setViewState] = useState("BOOT");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(DEMO_DURATION);
  const [controlServerReady, setControlServerReady] = useState(!remoteEnabled);
  const [tvConnected, setTvConnected] = useState(false);
  const [activityVersion, setActivityVersion] = useState(0);
  const [isGalaxyDragging, setIsGalaxyDragging] = useState(false);
  const [isCatalogSwitching, setIsCatalogSwitching] = useState(false);
  const enterTimerRef = useRef(null);
  const catalogTimerRefs = useRef([]);
  const controllerIdRef = useRef(createRuntimeId("pad"));
  const clientSequenceRef = useRef(0);
  const playbackIdRef = useRef(null);
  const appRef = useRef(null);
  const galaxyAngleRef = useRef(0);
  const galaxyMotionRef = useRef({
    dragging: false,
    dragActivated: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    totalDistance: 0,
    lastTime: 0,
    velocityX: 0,
    velocityY: 0,
    coreVelocity: 0,
    coreVerticalVelocity: 0,
    samples: [],
    targetAngle: 0,
    elevation: 0,
    targetElevation: 0,
    coreOffset: 0,
    targetCoreOffset: 0,
    coreVerticalOffset: 0,
    targetCoreVerticalOffset: 0,
    viewScale: 1,
    reducedMotion: false,
    returning: false,
    reboundAngleVelocity: 0,
    reboundElevationVelocity: 0,
    reboundCoreVelocity: 0,
    reboundCoreVerticalVelocity: 0,
    suppressClickUntil: 0,
  });

  const returnGalaxyToDefault = useCallback((immediate = false) => {
    const motion = galaxyMotionRef.current;
    const animateReturn = !immediate && !motion.reducedMotion && (
      Math.abs(galaxyAngleRef.current) > 0.0001
      || Math.abs(motion.elevation) > 0.0001
      || Math.abs(motion.coreOffset) > 0.0001
      || Math.abs(motion.coreVerticalOffset) > 0.0001
    );
    motion.returning = animateReturn;
    motion.reboundAngleVelocity = animateReturn ? clamp(motion.velocityX * 120, -0.42, 0.42) : 0;
    motion.reboundElevationVelocity = animateReturn ? clamp(motion.velocityY * 120, -0.2, 0.2) : 0;
    motion.reboundCoreVelocity = animateReturn ? clamp(motion.coreVelocity * 180, -0.075, 0.075) : 0;
    motion.reboundCoreVerticalVelocity = animateReturn
      ? clamp(motion.coreVerticalVelocity * 180, -0.06, 0.06)
      : 0;
    motion.velocityX = 0;
    motion.velocityY = 0;
    motion.coreVelocity = 0;
    motion.coreVerticalVelocity = 0;
    motion.samples = [];
    motion.targetAngle = 0;
    motion.targetElevation = 0;
    motion.targetCoreOffset = 0;
    motion.targetCoreVerticalOffset = 0;
    if (!animateReturn) {
      galaxyAngleRef.current = 0;
      motion.elevation = 0;
      motion.coreOffset = 0;
      motion.coreVerticalOffset = 0;
    }
  }, []);

  const selectedDomain = useMemo(
    () => domains.find((domain) => domain.id === selectedId) ?? domains[0],
    [domains, selectedId],
  );
  const activeIndex = useMemo(
    () => domains.findIndex((domain) => domain.id === activeId),
    [activeId, domains],
  );
  const activeDomain = activeIndex >= 0 ? domains[activeIndex] : null;
  const activeMedia = activeDomain?.playlist?.[activeMediaIndex] ?? activeDomain?.playlist?.[0] ?? null;

  const applyControlStatus = useCallback((state) => {
    setControlServerReady(true);
    setTvConnected(Number(state?.displayClients ?? 0) > 0);
    if (assignedCatalogId && state?.catalogId && state.catalogId !== assignedCatalogId) return;
    if (Number.isFinite(state?.progress)) setProgress(Math.max(0, state.progress));
    if (Number.isFinite(state?.duration) && state.duration > 0) setDuration(state.duration);
    if (typeof state?.playing === "boolean") setPlaying(state.playing);
    if (typeof state?.muted === "boolean") setMuted(state.muted);
    if (state?.playbackRate) setPlaybackRate(normalizePlaybackRate(state.playbackRate, 1));
    if (Number.isInteger(state?.itemIndex) && state.itemIndex >= 0) setActiveMediaIndex(state.itemIndex);

    if (state?.catalogId && state?.domainId) {
      const remoteCatalog = CONTENT_CATALOGS.find((item) => item.id === state.catalogId);
      const remoteDomain = remoteCatalog?.items.find((item) => item.id === state.domainId);
      if (remoteCatalog && remoteDomain) {
        setCatalogId(remoteCatalog.id);
        setSelectedId(remoteDomain.id);
        setActiveId(remoteDomain.id);
        if (state.command === "ENDED") setViewState("VIDEO_END");
        else setViewState((current) => (
          ["BOOT", "HOME_IDLE", "HOME_ATTRACT", "VIDEO_END"].includes(current)
            ? state.playing ? "VIDEO_PLAYING" : "VIDEO_PAUSED"
            : current
        ));
      }
    }
  }, [assignedCatalogId]);

  const sendRemoteControl = useCallback((command) => {
    if (!remoteEnabled) return;
    const payload = {
      ...command,
      controllerId: controllerIdRef.current,
      clientSequence: ++clientSequenceRef.current,
    };
    const playbackId = command.playbackId ?? playbackIdRef.current;
    if (playbackId) payload.playbackId = playbackId;
    fetch("/api/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.status === 409) return null;
        if (!response.ok) throw new Error(`control-${response.status}`);
        return response.json();
      })
      .then((state) => {
        if (state) applyControlStatus(state);
      })
      .catch(() => {
        setControlServerReady(false);
        setTvConnected(false);
      });
  }, [applyControlStatus, remoteEnabled]);

  useEffect(() => {
    if (!remoteEnabled) return undefined;
    const stream = new EventSource("/api/events?role=pad");
    stream.onopen = () => setControlServerReady(true);
    stream.onmessage = (event) => {
      try {
        applyControlStatus(JSON.parse(event.data));
      } catch {
        setControlServerReady(false);
      }
    };
    stream.onerror = () => {
      setControlServerReady(false);
      setTvConnected(false);
    };
    return () => {
      stream.close();
    };
  }, [applyControlStatus, remoteEnabled]);

  const markActivity = useCallback(() => {
    setActivityVersion((value) => value + 1);
    setViewState((current) => (current === "HOME_ATTRACT" ? "HOME_IDLE" : current));
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReducedMotion = () => {
      galaxyMotionRef.current.reducedMotion = reducedMotion.matches;
    };
    syncReducedMotion();
    reducedMotion.addEventListener("change", syncReducedMotion);
    let frame = 0;
    let previous = performance.now();
    const advanceInertia = (now) => {
      const motion = galaxyMotionRef.current;
      const delta = Math.min(34, now - previous);
      previous = now;
      if (motion.returning) {
        [galaxyAngleRef.current, motion.reboundAngleVelocity] = stepDampedSpring(
          galaxyAngleRef.current,
          motion.reboundAngleVelocity,
          0,
          delta,
        );
        [motion.elevation, motion.reboundElevationVelocity] = stepDampedSpring(
          motion.elevation,
          motion.reboundElevationVelocity,
          0,
          delta,
        );
        [motion.coreOffset, motion.reboundCoreVelocity] = stepDampedSpring(
          motion.coreOffset,
          motion.reboundCoreVelocity,
          0,
          delta,
        );
        [motion.coreVerticalOffset, motion.reboundCoreVerticalVelocity] = stepDampedSpring(
          motion.coreVerticalOffset,
          motion.reboundCoreVerticalVelocity,
          0,
          delta,
        );
        const settled = Math.abs(galaxyAngleRef.current) < 0.0002
          && Math.abs(motion.elevation) < 0.0002
          && Math.abs(motion.coreOffset) < 0.00008
          && Math.abs(motion.coreVerticalOffset) < 0.00008
          && Math.abs(motion.reboundAngleVelocity) < 0.0015
          && Math.abs(motion.reboundElevationVelocity) < 0.0015;
        if (settled) {
          motion.returning = false;
          galaxyAngleRef.current = 0;
          motion.elevation = 0;
          motion.coreOffset = 0;
          motion.coreVerticalOffset = 0;
        }
      } else {
        if (!motion.dragging && Math.abs(motion.velocityX) > 0.00001) {
          motion.targetAngle += motion.velocityX * delta;
          motion.velocityX *= reducedMotion.matches ? 0 : Math.pow(0.89, delta / 16.667);
        } else if (!motion.dragging) {
          motion.velocityX = 0;
        }
        if (!motion.dragging && Math.abs(motion.velocityY) > 0.00001) {
          motion.targetElevation = clamp(
            motion.targetElevation + motion.velocityY * delta,
            -GALAXY_ELEVATION_LIMIT,
            GALAXY_ELEVATION_LIMIT,
          );
          motion.velocityY *= reducedMotion.matches ? 0 : Math.pow(0.82, delta / 16.667);
        } else if (!motion.dragging) {
          motion.velocityY = 0;
        }
        if (!motion.dragging && Math.abs(motion.coreVelocity) > 0.0000001) {
          const nextCoreOffset = clamp(
            motion.targetCoreOffset + motion.coreVelocity * delta,
            -0.1,
            0.1,
          );
          if (nextCoreOffset === -0.1 || nextCoreOffset === 0.1) motion.coreVelocity = 0;
          motion.targetCoreOffset = nextCoreOffset;
          motion.coreVelocity *= reducedMotion.matches ? 0 : Math.pow(0.8, delta / 16.667);
        } else if (!motion.dragging) {
          motion.coreVelocity = 0;
        }
        const follow = reducedMotion.matches
          ? 1
          : 1 - Math.pow(motion.dragging ? 0.34 : 0.74, delta / 16.667);
        galaxyAngleRef.current += (motion.targetAngle - galaxyAngleRef.current) * follow;
        motion.elevation += (motion.targetElevation - motion.elevation) * follow;
        motion.coreOffset += (motion.targetCoreOffset - motion.coreOffset) * follow;
        motion.coreVerticalOffset += (
          motion.targetCoreVerticalOffset - motion.coreVerticalOffset
        ) * follow;
      }
      if (appRef.current) {
        appRef.current.style.setProperty("--galaxy-bg-x", `${(-motion.coreOffset * 118).toFixed(2)}px`);
        appRef.current.style.setProperty("--galaxy-bg-y", `${(-motion.coreVerticalOffset * 96).toFixed(2)}px`);
      }
      frame = window.requestAnimationFrame(advanceInertia);
    };
    frame = window.requestAnimationFrame(advanceInertia);
    return () => {
      reducedMotion.removeEventListener("change", syncReducedMotion);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const beginGalaxyDrag = useCallback((event) => {
    if (activeId || !["HOME_IDLE", "HOME_ATTRACT"].includes(viewState)) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target.closest?.("[data-no-galaxy-drag]")) return;
    const motion = galaxyMotionRef.current;
    motion.dragging = true;
    motion.dragActivated = false;
    motion.pointerId = event.pointerId;
    motion.startX = event.clientX;
    motion.startY = event.clientY;
    motion.lastX = event.clientX;
    motion.lastY = event.clientY;
    motion.totalDistance = 0;
    motion.lastTime = performance.now();
    motion.returning = false;
    motion.velocityX = 0;
    motion.velocityY = 0;
    motion.coreVelocity = 0;
    motion.coreVerticalVelocity = 0;
    motion.reboundAngleVelocity = 0;
    motion.reboundElevationVelocity = 0;
    motion.reboundCoreVelocity = 0;
    motion.reboundCoreVerticalVelocity = 0;
    motion.samples = [];
    motion.targetAngle = galaxyAngleRef.current;
    motion.targetElevation = motion.elevation;
    motion.targetCoreOffset = motion.coreOffset;
    motion.targetCoreVerticalOffset = motion.coreVerticalOffset;
  }, [activeId, viewState]);

  const moveGalaxyDrag = useCallback((event) => {
    const motion = galaxyMotionRef.current;
    if (!motion.dragging || motion.pointerId !== event.pointerId) return;
    const now = performance.now();
    const deltaX = event.clientX - motion.lastX;
    const deltaY = event.clientY - motion.lastY;
    const deltaTime = Math.max(8, now - motion.lastTime);
    const totalDistance = Math.hypot(event.clientX - motion.startX, event.clientY - motion.startY);
    motion.totalDistance = totalDistance;
    if (!motion.dragActivated && totalDistance >= GALAXY_DRAG_THRESHOLD) {
      motion.dragActivated = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsGalaxyDragging(true);
      if (event.pointerType !== "mouse" && typeof navigator.vibrate === "function") {
        navigator.vibrate(8);
      }
    }
    if (!motion.dragActivated) {
      motion.lastX = event.clientX;
      motion.lastY = event.clientY;
      motion.lastTime = now;
      return;
    }
    const angleDelta = deltaX * 0.0026;
    const elevationDelta = deltaY * 0.00125;
    const coreDelta = galaxyCoreDragDelta(deltaX, event.currentTarget.clientWidth);
    const coreVerticalDelta = galaxyCoreDragDelta(deltaY, event.currentTarget.clientHeight, 0.54);
    motion.targetAngle += angleDelta;
    motion.targetElevation = clamp(
      motion.targetElevation + elevationDelta,
      -GALAXY_ELEVATION_LIMIT,
      GALAXY_ELEVATION_LIMIT,
    );
    motion.targetCoreOffset = clamp(motion.targetCoreOffset + coreDelta, -0.1, 0.1);
    motion.targetCoreVerticalOffset = clamp(
      motion.targetCoreVerticalOffset + coreVerticalDelta,
      -0.075,
      0.075,
    );
    motion.samples.push({
      time: now,
      velocityX: angleDelta / deltaTime,
      velocityY: elevationDelta / deltaTime,
      coreVelocity: coreDelta / deltaTime,
      coreVerticalVelocity: coreVerticalDelta / deltaTime,
    });
    motion.samples = motion.samples.filter((sample) => now - sample.time <= 90);
    const sampleCount = Math.max(1, motion.samples.length);
    motion.velocityX = clamp(
      motion.samples.reduce((sum, sample) => sum + sample.velocityX, 0) / sampleCount,
      -0.0032,
      0.0032,
    );
    motion.velocityY = clamp(
      motion.samples.reduce((sum, sample) => sum + sample.velocityY, 0) / sampleCount,
      -0.0014,
      0.0014,
    );
    motion.coreVelocity = clamp(
      motion.samples.reduce((sum, sample) => sum + sample.coreVelocity, 0) / sampleCount,
      -0.00032,
      0.00032,
    );
    motion.coreVerticalVelocity = clamp(
      motion.samples.reduce((sum, sample) => sum + sample.coreVerticalVelocity, 0) / sampleCount,
      -0.00028,
      0.00028,
    );
    motion.lastX = event.clientX;
    motion.lastY = event.clientY;
    motion.lastTime = now;
    event.preventDefault();
  }, []);

  const endGalaxyDrag = useCallback((event) => {
    const motion = galaxyMotionRef.current;
    if (!motion.dragging || motion.pointerId !== event.pointerId) return;
    motion.dragging = false;
    motion.pointerId = null;
    if (motion.dragActivated) motion.suppressClickUntil = performance.now() + 320;
    returnGalaxyToDefault();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    motion.dragActivated = false;
    motion.samples = [];
    setIsGalaxyDragging(false);
  }, [returnGalaxyToDefault]);

  useEffect(() => {
    const timer = window.setTimeout(() => setViewState("HOME_IDLE"), 1150);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (viewState !== "HOME_IDLE" || activeId) return undefined;
    const timer = window.setTimeout(() => setViewState("HOME_ATTRACT"), 20000);
    return () => window.clearTimeout(timer);
  }, [activeId, activityVersion, viewState]);

  useEffect(() => {
    if (viewState !== "HOME_ATTRACT" || activeId) return undefined;
    const interval = window.setInterval(() => {
      setSelectedId((currentId) => {
        const index = domains.findIndex((domain) => domain.id === currentId);
        return domains[(index + 1) % domains.length].id;
      });
    }, 6000);
    return () => window.clearInterval(interval);
  }, [activeId, domains, viewState]);

  useEffect(() => () => {
    window.clearTimeout(enterTimerRef.current);
    catalogTimerRefs.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const selectDomain = useCallback((id) => {
    if (performance.now() < galaxyMotionRef.current.suppressClickUntil) return;
    if (activeId && viewState !== "VIDEO_EXIT") return;
    window.clearTimeout(enterTimerRef.current);
    const playbackId = createRuntimeId("playback");
    const domain = domains.find((item) => item.id === id);
    const media = domain?.playlist?.[0];
    if (!domain || !media) return;
    playbackIdRef.current = playbackId;
    setSelectedId(id);
    setActiveMediaIndex(0);
    setProgress(0);
    setDuration(media.duration);
    setPlaybackRate(1);
    setPlaying(false);
    setViewState("FOCUSING");
    enterTimerRef.current = window.setTimeout(() => {
      setActiveId(id);
      setPlaying(true);
      setViewState("VIDEO_ENTER");
      sendRemoteControl({
        type: "PLAY",
        catalogId: catalog.id,
        domainId: id,
        itemIndex: 0,
        playbackId,
        progress: 0,
        muted,
        playbackRate: 1,
      });
    }, 360);
  }, [activeId, catalog.id, domains, muted, sendRemoteControl, viewState]);

  const setPlayback = useCallback((nextPlaying) => {
    const nextProgress = nextPlaying && progress >= duration ? 0 : progress;
    if (nextPlaying) {
      if (progress >= duration) setProgress(0);
      setPlaying(true);
      setViewState("VIDEO_PLAYING");
      sendRemoteControl({ type: "RESUME", progress: nextProgress, muted, playbackRate });
    } else {
      setPlaying(false);
      setViewState("VIDEO_PAUSED");
      sendRemoteControl({ type: "PAUSE", progress: nextProgress, muted, playbackRate });
    }
    setActivityVersion((value) => value + 1);
  }, [duration, muted, playbackRate, progress, sendRemoteControl]);

  const changePlaybackRate = useCallback((rate) => {
    const nextRate = normalizePlaybackRate(rate, 1);
    setPlaybackRate(nextRate);
    sendRemoteControl({
      type: "RATE",
      playbackRate: nextRate,
      progress,
      playing,
      muted,
    });
    setActivityVersion((value) => value + 1);
  }, [muted, playing, progress, sendRemoteControl]);

  const playMediaAtIndex = useCallback((requestedIndex) => {
    if (!activeDomain?.playlist?.length) return;
    const next = (requestedIndex + activeDomain.playlist.length) % activeDomain.playlist.length;
    const media = activeDomain.playlist[next];
    const playbackId = createRuntimeId("playback");
    playbackIdRef.current = playbackId;
    setActiveMediaIndex(next);
    setProgress(0);
    setDuration(media.duration);
    setPlaybackRate(1);
    setPlaying(true);
    setViewState("VIDEO_PLAYING");
    sendRemoteControl({
      type: "PLAY",
      catalogId: catalog.id,
      domainId: activeDomain.id,
      itemIndex: next,
      playbackId,
      progress: 0,
      muted,
      playbackRate: 1,
    });
  }, [activeDomain, catalog.id, muted, sendRemoteControl]);

  const stepMedia = useCallback((direction) => {
    if (!activeDomain?.playlist?.length) return;
    playMediaAtIndex(activeMediaIndex + direction);
  }, [activeDomain, activeMediaIndex, playMediaAtIndex]);

  const beginClose = useCallback(() => {
    setPlaying(false);
    setPlaybackRate(1);
    setViewState("VIDEO_EXIT");
    sendRemoteControl({ type: "STOP" });
    playbackIdRef.current = null;
  }, [sendRemoteControl]);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      sendRemoteControl({ type: "MUTE", muted: next, progress, playing, playbackRate });
      return next;
    });
  }, [playbackRate, playing, progress, sendRemoteControl]);

  const finishClose = useCallback(() => {
    setActiveId(null);
    setActiveMediaIndex(0);
    setProgress(0);
    setDuration(DEMO_DURATION);
    setPlaying(false);
    setPlaybackRate(1);
    playbackIdRef.current = null;
    setViewState("HOME_IDLE");
    setActivityVersion((value) => value + 1);
  }, []);

  const resetHome = useCallback(() => {
    if (performance.now() < galaxyMotionRef.current.suppressClickUntil) return;
    returnGalaxyToDefault();
    window.clearTimeout(enterTimerRef.current);
    if (activeId) beginClose();
    else {
      setViewState("HOME_IDLE");
      setActivityVersion((value) => value + 1);
    }
  }, [activeId, beginClose, returnGalaxyToDefault]);

  const switchCatalog = useCallback((nextCatalogId) => {
    if (nextCatalogId === catalogId || activeId || isCatalogSwitching) return;
    const nextCatalog = CONTENT_CATALOGS.find((item) => item.id === nextCatalogId);
    if (!nextCatalog) return;

    catalogTimerRefs.current.forEach((timer) => window.clearTimeout(timer));
    catalogTimerRefs.current = [];
    setIsCatalogSwitching(true);
    setIsGalaxyDragging(false);
    galaxyMotionRef.current.dragging = false;
    galaxyMotionRef.current.dragActivated = false;
    galaxyMotionRef.current.pointerId = null;
    returnGalaxyToDefault();

    catalogTimerRefs.current.push(window.setTimeout(() => {
      setCatalogId(nextCatalog.id);
      setSelectedId(nextCatalog.items[0].id);
      setActiveId(null);
      setActiveMediaIndex(0);
      setProgress(0);
      setDuration(DEMO_DURATION);
      setPlaying(false);
      setPlaybackRate(1);
      playbackIdRef.current = null;
      setViewState("HOME_IDLE");
      setActivityVersion((value) => value + 1);
    }, 170));

    catalogTimerRefs.current.push(window.setTimeout(() => {
      setIsCatalogSwitching(false);
      catalogTimerRefs.current = [];
    }, 430));
  }, [activeId, catalogId, isCatalogSwitching, returnGalaxyToDefault]);

  return (
    <main
      ref={appRef}
      className={`domain-app catalog-${catalog.id} state-${viewState.toLowerCase()}${isGalaxyDragging ? " is-galaxy-dragging" : ""}${isCatalogSwitching ? " is-catalog-switching" : ""}`}
      onPointerDownCapture={markActivity}
      onPointerDown={beginGalaxyDrag}
      onPointerMove={moveGalaxyDrag}
      onPointerUp={endGalaxyDrag}
      onPointerCancel={endGalaxyDrag}
      onLostPointerCapture={endGalaxyDrag}
    >
      <OrbitScene
        domains={domains}
        selectedId={selectedId}
        onSelect={selectDomain}
        onCoreReset={resetHome}
        galaxyAngleRef={galaxyAngleRef}
        dragGuardRef={galaxyMotionRef}
      />

      <OrbitLabels
        catalog={catalog}
        domains={domains}
        selectedId={selectedId}
        viewState={viewState}
        onSelect={selectDomain}
        onCoreReset={resetHome}
        galaxyAngleRef={galaxyAngleRef}
        dragGuardRef={galaxyMotionRef}
      />

      <header className="domain-header">
        <img src="/assets/shishi-logo.svg" alt="METASTONE 是石科技" />
        <i aria-hidden="true" />
        <div>
          <strong>{remoteEnabled ? `${catalog.padId} · 视频播控` : "视频播控图谱"}</strong>
          <small>{catalog.status}</small>
        </div>
        <CatalogSwitch
          activeId={catalog.id}
          disabled={Boolean(activeId) || isCatalogSwitching || Boolean(assignedCatalogId)}
          catalogs={assignedCatalogId ? [catalog] : CONTENT_CATALOGS}
          locked={Boolean(assignedCatalogId)}
          onChange={switchCatalog}
        />
      </header>

      {isTestEnvironment ? (
        <div
          className={`test-environment-badge${tvConnected ? " is-linked" : ""}${!controlServerReady ? " is-offline" : ""}`}
          aria-label="客户体验测试版，仅供体验，不作为验收或生产放行"
        >
          <strong>客户体验测试版</strong>
          <span>{!controlServerReady ? "控制服务未连接" : tvConnected ? "电视端已连接" : "等待电视端"}</span>
          <small>仅供体验 · 非验收 / 非生产</small>
        </div>
      ) : null}

      <div className={`scene-instruction${isGalaxyDragging ? " is-dragging" : ""}`} role="status" aria-live="polite">
        <Crosshair size={36} weight="duotone" />
        <span>
          {isGalaxyDragging
            ? "探索轨道 · 松手回到默认构图"
            : assignedCatalogId
              ? "拖动星系浏览 · 轻触内容发送到电视"
              : "切换板块 · 拖动星系 · 轻触发送到电视"}
        </span>
      </div>

      <FocusDock catalog={catalog} domain={selectedDomain} total={domains.length} onPlay={() => selectDomain(selectedId)} />

      <div className={`boot-screen${viewState === "BOOT" ? " is-visible" : ""}`} aria-hidden={viewState !== "BOOT"}>
        <img src="/assets/shishi-logo.svg" alt="" />
        <span>LOADING ORBITAL MAP</span>
        <i />
      </div>

      {activeDomain && activeMedia ? (
        <ControlPortal
          catalog={catalog}
          domain={activeDomain}
          media={activeMedia}
          itemIndex={activeMediaIndex}
          itemTotal={activeDomain.playlist.length}
          total={domains.length}
          duration={duration}
          viewState={viewState}
          playing={playing}
          muted={muted}
          playbackRate={playbackRate}
          progress={progress}
          onEntered={() => setViewState(playing ? "VIDEO_PLAYING" : "VIDEO_PAUSED")}
          onExited={finishClose}
          onPlayingChange={setPlayback}
          onRateChange={changePlaybackRate}
          onClose={beginClose}
          onPrevious={() => stepMedia(-1)}
          onNext={() => stepMedia(1)}
          onSelectItem={playMediaAtIndex}
          onMute={toggleMute}
        />
      ) : null}
    </main>
  );
}

export function App() {
  const role = getDeviceRole();
  if (role === "tv") return <TvDisplay />;
  return (
    <PadConsole
      remoteEnabled={role === "pad"}
      assignedCatalogId={role === "pad" ? getAssignedCatalogId() : null}
    />
  );
}
