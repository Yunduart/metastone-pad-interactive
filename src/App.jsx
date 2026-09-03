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
  X,
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
  if (["pad", "tv"].includes(role)) return role;
  return "standalone";
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
            aria-label={`播放${domain.title}视频`}
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
            <small>{domain.marker} · {domain.mediaCount ?? 1} 部源影片</small>
          ) : domain.placeholder ? <small>待接入正式产品素材</small> : null}
        </div>
        <div className="focus-dock__time">
          <span>00:00</span>
          <span>{formatTime(DEMO_DURATION)}</span>
        </div>
        <div className="focus-dock__track" aria-hidden="true"><i /></div>
      </div>

      <button className="focus-dock__play" type="button" onClick={onPlay} aria-label={`播放${catalog.title}·${domain.title}视频`}>
        <span><Play size={38} weight="fill" aria-hidden="true" /></span>
        <strong>播放影片</strong>
      </button>
    </aside>
  );
}

function PlaybackControls({
  catalog,
  domain,
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
      <div className="player-controls__identity">
        <button className="icon-button" type="button" onClick={onClose} aria-label={`返回${catalog.title}`}>
          <X size={23} weight="bold" />
        </button>
        <div>
          <small>{domain.number} / {String(total).padStart(2, "0")} · {catalog.title}</small>
          <strong>{domain.title}</strong>
          <span>{domain.english}</span>
        </div>
      </div>

      <div className="player-controls__transport">
        <button type="button" onClick={onPrevious} aria-label="上一个视频">
          <CaretLeft size={25} weight="bold" />
        </button>
        <button className="player-controls__play" type="button" onClick={onToggle} aria-label={playing ? "暂停视频" : "播放视频"}>
          {playing ? <Pause size={27} weight="fill" /> : <Play size={27} weight="fill" />}
        </button>
        <button type="button" onClick={onNext} aria-label="下一个视频">
          <CaretRight size={25} weight="bold" />
        </button>
      </div>

      <div className="player-controls__timeline">
        <span>{formatTime(progress)}</span>
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
        <span>{formatTime(duration)}</span>
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
        <button className="icon-button" type="button" onClick={onMute} aria-label={muted ? "开启声音" : "静音"}>
          {muted ? <SpeakerSlash size={22} /> : <SpeakerHigh size={22} />}
        </button>
      </div>
    </div>
  );
}

function DemoFilm({ catalog, domain, playing }) {
  return (
    <div className={`demo-film${playing ? " is-playing" : ""}`} role="img" aria-label={`${catalog.title}·${domain.title}影片演示画面`}>
      <img src="/assets/metastone-domain-map-source.png" alt="" />
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
    <div className="end-slate" role="dialog" aria-label="视频播放结束">
      <small>{catalog.english} · FILM COMPLETE</small>
      <strong>影片播放完毕</strong>
      <div>
        <button type="button" onClick={onReplay}><ArrowCounterClockwise size={21} />重播</button>
        <button type="button" onClick={onNext}><ArrowRight size={21} />下一视频</button>
        <button type="button" onClick={onClose}><House size={21} />返回总览</button>
      </div>
    </div>
  );
}

function VideoPortal({
  catalog,
  domain,
  total,
  duration,
  viewState,
  playing,
  muted,
  playbackRate,
  progress,
  onEntered,
  onExited,
  onProgress,
  onDurationChange,
  onMediaFallbackChange,
  onPlayingChange,
  onRateChange,
  onSyncSample,
  onEnded,
  onClose,
  onPrevious,
  onNext,
  onMute,
}) {
  const videoRef = useRef(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const [open, setOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [mediaReady, setMediaReady] = useState(!domain.video);
  const [mediaError, setMediaError] = useState(false);
  const [mediaAttempt, setMediaAttempt] = useState(0);
  const [showBuffering, setShowBuffering] = useState(false);

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

  useEffect(() => {
    setMediaReady(!domain.video);
    setMediaError(false);
    setMediaAttempt(0);
    setShowBuffering(false);
    setControlsVisible(true);
    onMediaFallbackChange(false);
  }, [domain, onMediaFallbackChange]);

  useEffect(() => {
    if (!domain.video || !mediaError) return undefined;

    let cancelled = false;
    const retryMedia = async () => {
      try {
        const response = await fetch(`${domain.video}?availability=${Date.now()}`, {
          method: "HEAD",
          cache: "no-store",
        });
        if (!cancelled && response.ok) {
          setMediaAttempt((attempt) => attempt + 1);
          setMediaReady(false);
          setMediaError(false);
          setShowBuffering(true);
          onMediaFallbackChange(false);
        }
      } catch {
        // The test slot is allowed to stay empty; retry quietly after media is copied in.
      }
    };

    retryMedia();
    const timer = window.setInterval(retryMedia, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [domain.video, mediaError, onMediaFallbackChange]);

  useEffect(() => {
    if (!domain.video || mediaReady || mediaError) return undefined;
    const timer = window.setTimeout(() => setShowBuffering(true), 1500);
    return () => window.clearTimeout(timer);
  }, [domain.video, mediaError, mediaReady]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !domain.video || !mediaReady) return;
    video.muted = muted;
    video.playbackRate = normalizePlaybackRate(playbackRate, 1);
    if (playing) video.play().catch(() => onPlayingChange(false));
    else video.pause();
  }, [domain.video, mediaReady, muted, onPlayingChange, playbackRate, playing]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const videoProgress = videoRef.current?.currentTime;
      onSyncSample(Number.isFinite(videoProgress) ? videoProgress : progressRef.current);
    }, 500);
    return () => window.clearInterval(interval);
  }, [onSyncSample]);

  useEffect(() => {
    if (!playing || viewState === "VIDEO_END") {
      setControlsVisible(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setControlsVisible(false), 2800);
    return () => window.clearTimeout(timer);
  }, [playing, progress, viewState]);

  const showControls = () => setControlsVisible(true);

  return (
    <section
      className={`video-portal${open ? " is-open" : ""}${viewState === "VIDEO_EXIT" ? " is-closing" : ""}`}
      style={{ "--portal-x": `${domain.portal.x}%`, "--portal-y": `${domain.portal.y}%` }}
      aria-label={`${domain.title}视频播放器`}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget || event.propertyName !== "clip-path") return;
        if (open && viewState === "VIDEO_ENTER") onEntered();
        if (!open && viewState === "VIDEO_EXIT") onExited();
      }}
      onPointerMove={showControls}
    >
      <div
        className="video-stage"
        onClick={(event) => {
          if (event.target.closest("button, input")) return;
          onPlayingChange(!playing);
          setControlsVisible(true);
        }}
      >
        {domain.video && !mediaError ? (
          <video
            key={`${domain.id}-${mediaAttempt}`}
            ref={videoRef}
            src={`${domain.video}?attempt=${mediaAttempt}`}
            autoPlay
            playsInline
            muted={muted}
            preload="metadata"
            onLoadedMetadata={(event) => {
              const nextDuration = event.currentTarget.duration;
              if (Number.isFinite(nextDuration) && nextDuration > 0) onDurationChange(nextDuration);
            }}
            onCanPlay={() => {
              setMediaReady(true);
              setMediaError(false);
              setShowBuffering(false);
              onMediaFallbackChange(false);
            }}
            onTimeUpdate={(event) => onProgress(event.currentTarget.currentTime)}
            onEnded={onEnded}
            onError={() => {
              setMediaError(true);
              setShowBuffering(false);
              onDurationChange(DEMO_DURATION);
              onMediaFallbackChange(true);
            }}
          />
        ) : (
          <DemoFilm catalog={catalog} domain={domain} playing={playing} />
        )}

        {showBuffering ? <div className="buffering" aria-label="视频加载中"><i /></div> : null}

        {mediaError ? (
          <div className="media-fallback-note" role="status">
            <strong>测试槽位</strong>
            <span>等待 {domain.fileName.split("/").at(-1)}</span>
          </div>
        ) : null}

        {!playing && viewState !== "VIDEO_END" ? (
          <button className="video-stage__resume" type="button" onClick={() => onPlayingChange(true)} aria-label="继续播放">
            <Play size={42} weight="fill" />
          </button>
        ) : null}

        {viewState === "VIDEO_END" ? (
          <EndSlate catalog={catalog} onReplay={() => onPlayingChange(true)} onNext={onNext} onClose={onClose} />
        ) : null}
      </div>

      <PlaybackControls
        catalog={catalog}
        domain={domain}
        total={total}
        duration={duration}
        playing={playing}
        muted={muted}
        playbackRate={playbackRate}
        progress={progress}
        controlsVisible={controlsVisible || viewState === "VIDEO_END"}
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

function CatalogSwitch({ activeId, disabled, onChange }) {
  return (
    <nav className="catalog-switch" aria-label="内容板块">
      {CONTENT_CATALOGS.map((item) => {
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

function PadConsole({ remoteEnabled = false }) {
  const isTestEnvironment = remoteEnabled;
  const [catalogId, setCatalogId] = useState(DEFAULT_CATALOG_ID);
  const catalog = useMemo(
    () => CONTENT_CATALOGS.find((item) => item.id === catalogId) ?? CONTENT_CATALOGS[0],
    [catalogId],
  );
  const domains = catalog.items;
  const [selectedId, setSelectedId] = useState(CONTENT_CATALOGS[0].items[0].id);
  const [activeId, setActiveId] = useState(null);
  const [viewState, setViewState] = useState("BOOT");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(DEMO_DURATION);
  const [mediaFallback, setMediaFallback] = useState(false);
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

  const applyControlStatus = useCallback((state) => {
    setControlServerReady(true);
    setTvConnected(Number(state?.displayClients ?? 0) > 0);
  }, []);

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
    let active = true;
    const checkLink = () => {
      fetch("/api/state", { cache: "no-store" })
        .then((response) => {
          if (!response.ok) throw new Error(`state-${response.status}`);
          return response.json();
        })
        .then((state) => {
          if (active) applyControlStatus(state);
        })
        .catch(() => {
          if (!active) return;
          setControlServerReady(false);
          setTvConnected(false);
        });
    };
    checkLink();
    const interval = window.setInterval(checkLink, 2000);
    return () => {
      active = false;
      window.clearInterval(interval);
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

  useEffect(() => {
    if (activeIndex < 0 || !playing || (activeDomain.video && !mediaFallback)) return undefined;
    const interval = window.setInterval(() => {
      setProgress((current) => {
        const next = current + 0.1 * playbackRate;
        if (next >= duration) {
          window.setTimeout(() => {
            setPlaying(false);
            setViewState("VIDEO_END");
          }, 0);
          return duration;
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [activeDomain, activeIndex, duration, mediaFallback, playbackRate, playing]);

  useEffect(() => {
    if (viewState !== "VIDEO_END") return undefined;
    const timer = window.setTimeout(() => {
      setPlaying(false);
      setPlaybackRate(1);
      setViewState("VIDEO_EXIT");
      sendRemoteControl({ type: "STOP" });
      playbackIdRef.current = null;
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [sendRemoteControl, viewState]);

  useEffect(() => {
    if (viewState !== "VIDEO_PAUSED") return undefined;
    const timer = window.setTimeout(() => {
      setPlaybackRate(1);
      setViewState("VIDEO_EXIT");
      sendRemoteControl({ type: "STOP" });
      playbackIdRef.current = null;
    }, 100000);
    return () => window.clearTimeout(timer);
  }, [activityVersion, sendRemoteControl, viewState]);

  useEffect(() => () => {
    window.clearTimeout(enterTimerRef.current);
    catalogTimerRefs.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const selectDomain = useCallback((id) => {
    if (performance.now() < galaxyMotionRef.current.suppressClickUntil) return;
    if (activeId && viewState !== "VIDEO_EXIT") return;
    window.clearTimeout(enterTimerRef.current);
    const playbackId = createRuntimeId("playback");
    playbackIdRef.current = playbackId;
    setSelectedId(id);
    setProgress(0);
    setDuration(DEMO_DURATION);
    setMediaFallback(false);
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
        playbackId,
        progress: 0,
        muted,
        playbackRate: 1,
      });
    }, 360);
  }, [activeId, catalog.id, muted, sendRemoteControl, viewState]);

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

  const syncPlayback = useCallback((sampleProgress) => {
    if (!activeId || !playbackIdRef.current) return;
    sendRemoteControl({
      type: "SYNC",
      catalogId: catalog.id,
      domainId: activeId,
      progress: sampleProgress,
      playing,
      muted,
      playbackRate,
    });
  }, [activeId, catalog.id, muted, playbackRate, playing, sendRemoteControl]);

  const stepDomain = useCallback((direction) => {
    const current = activeIndex < 0 ? 0 : activeIndex;
    const next = (current + direction + domains.length) % domains.length;
    const domain = domains[next];
    const playbackId = createRuntimeId("playback");
    playbackIdRef.current = playbackId;
    setSelectedId(domain.id);
    setActiveId(domain.id);
    setProgress(0);
    setDuration(DEMO_DURATION);
    setMediaFallback(false);
    setPlaybackRate(1);
    setPlaying(true);
    setViewState("VIDEO_PLAYING");
    sendRemoteControl({
      type: "PLAY",
      catalogId: catalog.id,
      domainId: domain.id,
      playbackId,
      progress: 0,
      muted,
      playbackRate: 1,
    });
  }, [activeIndex, catalog.id, domains, muted, sendRemoteControl]);

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
    setProgress(0);
    setDuration(DEMO_DURATION);
    setMediaFallback(false);
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
      setProgress(0);
      setDuration(DEMO_DURATION);
      setMediaFallback(false);
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
          <strong>视频播控图谱</strong>
          <small>{catalog.status}</small>
        </div>
        <CatalogSwitch
          activeId={catalog.id}
          disabled={Boolean(activeId) || isCatalogSwitching}
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
        <span>{isGalaxyDragging ? "探索轨道 · 松手回到默认构图" : "切换板块 · 拖动星系 · 轻触播放"}</span>
      </div>

      <FocusDock catalog={catalog} domain={selectedDomain} total={domains.length} onPlay={() => selectDomain(selectedId)} />

      <div className={`boot-screen${viewState === "BOOT" ? " is-visible" : ""}`} aria-hidden={viewState !== "BOOT"}>
        <img src="/assets/shishi-logo.svg" alt="" />
        <span>LOADING ORBITAL MAP</span>
        <i />
      </div>

      {activeDomain ? (
        <VideoPortal
          catalog={catalog}
          domain={activeDomain}
          total={domains.length}
          duration={duration}
          viewState={viewState}
          playing={playing}
          muted={muted}
          playbackRate={playbackRate}
          progress={progress}
          onEntered={() => setViewState(playing ? "VIDEO_PLAYING" : "VIDEO_PAUSED")}
          onExited={finishClose}
          onProgress={(value) => setProgress(clamp(value, 0, duration))}
          onDurationChange={(value) => {
            setDuration(value);
            setProgress((current) => clamp(current, 0, value));
          }}
          onMediaFallbackChange={setMediaFallback}
          onPlayingChange={setPlayback}
          onRateChange={changePlaybackRate}
          onSyncSample={syncPlayback}
          onEnded={() => {
            setPlaying(false);
            setProgress(duration);
            setViewState("VIDEO_END");
            sendRemoteControl({ type: "PAUSE", progress: duration, muted, playbackRate });
          }}
          onClose={beginClose}
          onPrevious={() => stepDomain(-1)}
          onNext={() => stepDomain(1)}
          onMute={toggleMute}
        />
      ) : null}
    </main>
  );
}

export function App() {
  const role = getDeviceRole();
  if (role === "tv") return <TvDisplay />;
  return <PadConsole remoteEnabled={role === "pad"} />;
}
