import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WifiHigh, WifiSlash } from "@phosphor-icons/react";
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

const TV_STATE_FIELDS = [
  "sequence",
  "command",
  "catalogId",
  "domainId",
  "itemIndex",
  "itemId",
  "playing",
  "muted",
  "playbackRate",
  "duration",
  "loop",
  "playbackId",
];

function hasTvStateChanged(previous, next) {
  return TV_STATE_FIELDS.some((field) => previous?.[field] !== next?.[field]);
}

/**
 * The TV is a display endpoint, not a second controller.  Start playback as
 * soon as the Pad publishes a PLAY/RESUME state.  Some Chromium builds still
 * reject an audible play() call without a gesture, so retry muted and restore
 * the requested sound state once the element is actually playing.  This keeps
 * the TV route non-blocking without exposing a TV-side activation button.
 */
function startTvPlayback(video, requestedMuted, isActive = () => true) {
  if (!video) return;
  video.muted = requestedMuted;
  const attempt = video.play();
  if (!attempt || typeof attempt.catch !== "function") return;
  attempt.catch(() => {
    if (requestedMuted || !isActive()) return;
    video.muted = true;
    const mutedAttempt = video.play();
    if (mutedAttempt && typeof mutedAttempt.then === "function") {
      mutedAttempt
        .then(() => {
          if (isActive() && !video.paused) video.muted = requestedMuted;
        })
        .catch(() => undefined);
    }
  });
}

function syncTvVideo(video, state, isActive = () => true) {
  if (!video || !state) return;
  const baseRate = normalizePlaybackRate(state.playbackRate, 1);
  const correction = planPlaybackCorrection({
    currentTime: video.currentTime,
    targetTime: state.progress,
    playing: state.playing,
    playbackRate: baseRate,
  });

  if (video.muted !== Boolean(state.muted)) video.muted = Boolean(state.muted);
  if (Math.abs(video.playbackRate - correction.playbackRate) > 0.01) {
    video.playbackRate = correction.playbackRate;
  }
  if (
    correction.seekTo !== null
    && video.readyState >= 1
    && Math.abs(video.currentTime - correction.seekTo) > 0.08
  ) {
    video.currentTime = correction.seekTo;
  }

  if (state.playing) {
    if (video.paused) startTvPlayback(video, state.muted, isActive);
  } else if (!video.paused && !video.seeking) {
    video.pause();
  }
}

/**
 * Explicitly release the media element when the TV leaves playback mode.
 * Removing the source and reloading it is important on low-power Windows
 * playback boxes: pause() alone can leave the decoder/buffer alive after a
 * stutter or a media switch, so a later return can accumulate hidden videos.
 */
function clearTvVideo(video) {
  if (!video) return;
  try {
    video.pause();
  } catch {
    // The element may already be detached while React is replacing a keyed item.
  }
  video.removeAttribute("src");
  video.load();
}

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
        renderProfile="tv-low"
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
  const remoteStateRef = useRef(EMPTY_REMOTE_STATE);
  const [remoteState, setRemoteState] = useState(EMPTY_REMOTE_STATE);
  const [connected, setConnected] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [mediaAttempt, setMediaAttempt] = useState(0);

  const setVideoRef = useCallback((node) => {
    // React invokes callback refs with null before a keyed video is removed or
    // when the user taps 返回. Clear the exact old node before releasing it so
    // no decoder, buffer, or hidden playback instance survives the transition.
    if (!node && videoRef.current) clearTvVideo(videoRef.current);
    videoRef.current = node;
  }, []);

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
        const nextState = JSON.parse(event.data);
        remoteStateRef.current = nextState;
        // Progress snapshots arrive twice per second. Keep them in a ref so
        // the TV does not reconcile the whole display tree on every tick;
        // only commands/media changes need a React render.
        setRemoteState((previous) => (
          hasTvStateChanged(previous, nextState) ? nextState : previous
        ));
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
    // Capture the exact node owned by this media item. On a keyed source
    // switch React may mount the replacement before passive cleanup runs, so
    // relying only on the live ref can miss the old decoder. This closure
    // always pauses and empties the previous node before it is discarded.
    const activeVideo = videoRef.current;
    return () => clearTvVideo(activeVideo);
  }, [media?.id, mediaAttempt, mediaError]);

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
    if (!media || mediaError) return undefined;
    const sync = () => {
      const video = videoRef.current;
      syncTvVideo(video, remoteStateRef.current, () => videoRef.current === video);
    };
    sync();
    // The server remains authoritative, but the TV only needs a light drift
    // check. This avoids calling play(), assigning playbackRate, or seeking on
    // every SSE progress broadcast.
    const timer = window.setInterval(sync, 500);
    return () => window.clearInterval(timer);
  }, [media?.id, mediaError, remoteState.sequence]);

  return (
    <main className={`tv-display${domain ? " is-media-active" : ""}`}>
      <header className={`tv-display__header${domain ? " is-media-active" : ""}`}>
        {!domain ? <img src="/assets/metastone-official-logo.png" alt="METASTONE 是石科技" /> : null}
        <div className={`tv-display__connection${connected ? " is-connected" : ""}`}>
          {connected ? <WifiHigh size={20} weight="duotone" /> : <WifiSlash size={20} weight="duotone" />}
          <span>
            <strong>{connected ? "播控在线" : "系统待机"}</strong>
            <small>{connected ? "PAD CONTROL ONLINE" : "WAITING FOR PAD CONTROL"}</small>
          </span>
        </div>
      </header>

      <section className={`tv-display__standby${domain ? " is-hidden" : ""}`} aria-hidden={Boolean(domain)}>
        {!domain ? <TvStandbyGalaxy active /> : null}
        <div className="tv-standby__depth" aria-hidden="true" />

        <div className="tv-standby__core-copy" aria-hidden="true">
          <i />
          <img className="tv-standby__core-logo" src="/assets/metastone-official-logo.png" alt="METASTONE 是石科技" />
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
              ref={setVideoRef}
              src={`${media.video}?attempt=${mediaAttempt}`}
              playsInline
              autoPlay={Boolean(remoteState.playing)}
              loop={media.loop}
              preload="auto"
              onLoadedMetadata={(event) => {
                if (videoRef.current !== event.currentTarget) return;
                syncTvVideo(event.currentTarget, remoteStateRef.current, () => videoRef.current === event.currentTarget);
              }}
              onCanPlay={(event) => {
                if (videoRef.current !== event.currentTarget) return;
                syncTvVideo(event.currentTarget, remoteStateRef.current, () => videoRef.current === event.currentTarget);
              }}
              onError={(event) => {
                if (videoRef.current === event.currentTarget) setMediaError(true);
              }}
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
    </main>
  );
}
