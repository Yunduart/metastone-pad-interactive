export const PLAYBACK_RATES = Object.freeze([1, 2, 4]);

const finiteOr = (value, fallback) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

export function normalizePlaybackRate(value, fallback = 1) {
  const next = finiteOr(value, fallback);
  return PLAYBACK_RATES.includes(next) ? next : fallback;
}

export function projectPlaybackProgress(state, nowMs = Date.now()) {
  const progress = Math.max(0, finiteOr(state?.progress, 0));
  if (!state?.playing) return progress;
  const anchorAtMs = finiteOr(state?.anchorAtMs, nowMs);
  const elapsedSeconds = Math.max(0, nowMs - anchorAtMs) / 1000;
  return progress + elapsedSeconds * normalizePlaybackRate(state?.playbackRate, 1);
}

export function planPlaybackCorrection({
  currentTime,
  targetTime,
  playing,
  playbackRate,
  hardSeekThreshold = 0.4,
  softCorrectionThreshold = 0.08,
}) {
  const current = Math.max(0, finiteOr(currentTime, 0));
  const target = Math.max(0, finiteOr(targetTime, current));
  const baseRate = normalizePlaybackRate(playbackRate, 1);
  const drift = target - current;
  const absoluteDrift = Math.abs(drift);

  if (!playing) {
    return {
      mode: absoluteDrift > 0.04 ? "seek" : "hold",
      drift,
      seekTo: absoluteDrift > 0.04 ? target : null,
      playbackRate: baseRate,
    };
  }

  if (absoluteDrift > hardSeekThreshold) {
    return {
      mode: "seek",
      drift,
      seekTo: target,
      playbackRate: baseRate,
    };
  }

  if (absoluteDrift > softCorrectionThreshold) {
    return {
      mode: "nudge",
      drift,
      seekTo: null,
      playbackRate: baseRate * (drift > 0 ? 1.04 : 0.96),
    };
  }

  return {
    mode: "locked",
    drift,
    seekTo: null,
    playbackRate: baseRate,
  };
}
