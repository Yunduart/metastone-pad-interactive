import { useEffect, useMemo, useRef, useState } from "react";
import { Play, WifiHigh, WifiSlash } from "@phosphor-icons/react";
import { CONTENT_CATALOGS } from "./domains.js";
import { OrbitScene } from "./OrbitScene.jsx";
import { normalizePlaybackRate, planPlaybackCorrection } from "./playbackSync.js";

const EMPTY_REMOTE_STATE = {
  sequence: 0,
  command: "IDLE",
  catalogId: null,
  domainId: null,
  itemIndex: 0,
  itemId: null,
  playing: false,
  muted: false,
  playbackRate: 1,
  progress: 0,
};

const STANDBY_LOOP_MS = 12000;

function TvStandbyGalaxy({ active }) {
  const galaxyAngleRef = useRef(0);
  const dragGuardRef = useRef({
    elevation: 0,
    coreOffset: 0,
    coreVerticalOffset: 0,
    velocityX: 0,
    velocityY: 0,
    viewScale: 1,
    reducedMotion: false,
    suppressClickUntil: 0,
  });

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const startedAt = performance.now();
    let frame = 0;

    const renderLoop = (now) => {
      const motion = dragGuardRef.current;
      motion.reducedMotion = reducedMotion.matches;

      if (active && !reducedMotion.matches) {
        const phase = (((now - startedAt) % STANDBY_LOOP_MS) / STANDBY_LOOP_MS) * Math.PI * 2;
        galaxyAngleRef.current = Math.sin(phase) * 0.052;
        motion.elevation = Math.sin(phase) * 0.012;
        motion.coreOffset = Math.sin(phase) * 0.006;
        motion.coreVerticalOffset = Math.sin(phase * 2) * 0.0035;
        motion.velocityX = Math.cos(phase) * 0.00042;
        motion.velocityY = Math.cos(phase * 2) * 0.00018;
      } else {
        galaxyAngleRef.current = 0;
        motion.elevation = 0;
        motion.coreOffset = 0;
        motion.coreVerticalOffset = 0;
        motion.velocityX = 0;
        motion.velocityY = 0;
      }

      frame = window.requestAnimationFrame(renderLoop);
    };

    frame = window.requestAnimationFrame(renderLoop);
    return () => window.cancelAnimationFrame(frame);
  }, [active]);

  return (
    <div className="tv-standby__galaxy" aria-hidden="true">
      <OrbitScene
        domains={CONTENT_CATALOGS[0].items}
        selectedId={null}
        onSelect={() => undefined}
        onCoreReset={() => undefined}
        galaxyAngleRef={galaxyAngleRef}
        dragGuardRef={dragGuardRef}
        showEnergyLink={false}
      />
    </div>
  );
}

function TvFallback({ catalog, domain, media }) {
  return (
    <div className="tv-fallback" role="status">
      <img src="/assets/metastone-domain-map-source.png" alt="" />
      <div className="tv-fallback__shade" aria-hidden="true" />
      <div className="tv-fallback__copy">
        <small>TEST SLOT · {catalog.english} · {domain.number}</small>
        <strong>{domain.title}</strong>
        <span>{domain.english}</span>
        <em>等待媒体文件：{media.fileName}</em>
      </div>
    </div>
  );
}

export function TvDisplay() {
  const videoRef = useRef(null);
  const [remoteState, setRemoteState] = useState(EMPTY_REMOTE_STATE);
  const [connected, setConnected] = useState(false);
  const [armed, setArmed] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [mediaAttempt, setMediaAttempt] = useState(0);

  const catalog = useMemo(
    () => CONTENT_CATALOGS.find((item) => item.id === remoteState.catalogId) ?? null,
    [remoteState.catalogId],
  );
  const domain = useMemo(
    () => catalog?.items.find((item) => item.id === remoteState.domainId) ?? null,
    [catalog, remoteState.domainId],
  );
  const media = useMemo(
    () => domain?.playlist?.[remoteState.itemIndex] ?? domain?.playlist?.[0] ?? null,
    [domain, remoteState.itemIndex],
  );

  useEffect(() => {
    const stream = new EventSource("/api/events?role=tv");
    stream.onopen = () => setConnected(true);
    stream.onmessage = (event) => {
      try {
        setRemoteState(JSON.parse(event.data));
        setConnected(true);
      } catch {
        setConnected(false);
      }
    };
    stream.onerror = () => setConnected(false);
    return () => stream.close();
  }, []);

  useEffect(() => {
    setMediaError(false);
    setMediaAttempt(0);
  }, [media?.id]);

  useEffect(() => {
    if (!media?.video || !mediaError) return undefined;

    let cancelled = false;
    const retryMedia = async () => {
      try {
        const response = await fetch(`${media.video}?availability=${Date.now()}`, {
          method: "HEAD",
          cache: "no-store",
        });
        if (!cancelled && response.ok) {
          setMediaAttempt((attempt) => attempt + 1);
          setMediaError(false);
        }
      } catch {
        // Keep the standby visual active until the file becomes available.
      }
    };

    retryMedia();
    const timer = window.setInterval(retryMedia, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [media?.video, mediaError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !media || mediaError) return;
    const baseRate = normalizePlaybackRate(remoteState.playbackRate, 1);
    const correction = planPlaybackCorrection({
      currentTime: video.currentTime,
      targetTime: remoteState.progress,
      playing: remoteState.playing,
      playbackRate: baseRate,
    });
    video.muted = remoteState.muted;
    video.playbackRate = correction.playbackRate;
    if (correction.seekTo !== null && video.readyState >= 1) video.currentTime = correction.seekTo;
    if (remoteState.playing && armed) video.play().catch(() => undefined);
    else video.pause();
  }, [armed, media, mediaError, remoteState]);

  const armDisplay = async () => {
    setArmed(true);
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {
      // Fullscreen may be unavailable in an embedded browser; playback remains enabled.
    }
    if (remoteState.playing) videoRef.current?.play().catch(() => undefined);
  };

  return (
    <main className="tv-display">
      <div
        className="tv-display__test-mark"
        aria-label="客户体验测试版，仅供体验，不作为验收或生产放行"
      >
        客户体验测试版 · 非验收 / 非生产
      </div>
      <header className={`tv-display__header${domain ? " is-media-active" : ""}`}>
        {!domain ? <img src="/assets/shishi-logo.svg" alt="METASTONE 是石科技" /> : null}
        <div className={`tv-display__connection${connected ? " is-connected" : ""}`}>
          {connected ? <WifiHigh size={20} weight="duotone" /> : <WifiSlash size={20} weight="duotone" />}
          <span>
            <strong>{connected ? "播控在线" : "系统待机"}</strong>
            <small>{connected ? "PAD CONTROL ONLINE" : "WAITING FOR PAD CONTROL"}</small>
          </span>
        </div>
      </header>

      <section className={`tv-display__standby${domain ? " is-hidden" : ""}`} aria-hidden={Boolean(domain)}>
        <TvStandbyGalaxy active={!domain} />
        <div className="tv-standby__depth" aria-hidden="true" />

        <div className="tv-standby__core-copy" aria-hidden="true">
          <i />
          <strong>METASTONE</strong>
          <span>是 石 科 技</span>
        </div>

        <div className="tv-standby__message">
          <small>METASTONE · INTERACTIVE MEDIA SYSTEM</small>
          <strong>成果案例 <i /> 产品介绍</strong>
          <span>请在 Pad 端选择内容</span>
          <em>SELECT CONTENT ON THE PAD TO BEGIN</em>
        </div>

        <div className="tv-standby__footer" aria-hidden="true">
          <span>07 SUCCESS CASES</span>
          <i />
          <span>09 PRODUCT STORIES</span>
          <i />
          <span>4K PLAYBACK READY</span>
        </div>
      </section>

      {domain && catalog && media ? (
        <section className="tv-display__stage" aria-label={`${catalog.title}·${domain.title}·${media.title}电视播放画面`}>
          {!mediaError ? (
            <video
              key={`${domain.id}-${media.id}-${mediaAttempt}`}
              ref={videoRef}
              src={`${media.video}?attempt=${mediaAttempt}`}
              playsInline
              loop={media.loop}
              preload="auto"
              onLoadedMetadata={(event) => {
                if (Number.isFinite(remoteState.progress)) event.currentTarget.currentTime = remoteState.progress;
                event.currentTarget.playbackRate = normalizePlaybackRate(remoteState.playbackRate, 1);
              }}
              onCanPlay={(event) => {
                event.currentTarget.muted = remoteState.muted;
                event.currentTarget.playbackRate = normalizePlaybackRate(remoteState.playbackRate, 1);
                if (remoteState.playing && armed) event.currentTarget.play().catch(() => undefined);
              }}
              onError={() => setMediaError(true)}
            />
          ) : (
            <TvFallback catalog={catalog} domain={domain} media={media} />
          )}

          <div className="tv-display__meta">
            <small>{catalog.number} · {catalog.english}</small>
            <strong>{domain.title}</strong>
            <span>{remoteState.itemIndex + 1} / {domain.playlist.length} · {media.title}</span>
          </div>
        </section>
      ) : null}

      {!armed ? (
        <button className="tv-display__arm" type="button" onClick={armDisplay}>
          <Play size={22} weight="fill" />
          启用电视播放
        </button>
      ) : null}
    </main>
  );
}
