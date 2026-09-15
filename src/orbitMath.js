export const GALAXY_ORBIT_FLATTENING = 0.42;
export const GALAXY_CAMERA_Z = 12;
export const GALAXY_CAMERA_FOV = 40;
export const GALAXY_DEPTH_AMPLITUDE = 0.46;
export const GALAXY_LAYOUT_SCALE = 0.68;
export const GALAXY_ELEVATION_LIMIT = 0.34;
export const GALAXY_PRIMARY_TRACK = Object.freeze({
  centerX: 0.4,
  centerY: 0.478,
  radiusX: 0.32,
  radiusY: 0.205,
  phase: -1.2,
  baseDepth: -0.18,
  depth: 0.52,
});
export const GALAXY_OUTER_TRACK = Object.freeze({
  centerX: 0.44,
  centerY: 0.447,
  radiusX: 0.401,
  radiusY: 0.258,
  phase: -1.05,
  baseDepth: -0.18,
  depth: 0.66,
});

export const GALAXY_WIDE_TRACK = Object.freeze({
  centerX: 0.44,
  centerY: 0.488,
  radiusX: 0.42,
  radiusY: 0.255,
  phase: -1.05,
  baseDepth: -0.18,
  depth: 0.66,
});

export const GALAXY_ORBIT_TRACK_BY_KEY = Object.freeze({
  "large-models": GALAXY_OUTER_TRACK,
  "research-institutes": GALAXY_OUTER_TRACK,
  "high-end-manufacturing": GALAXY_PRIMARY_TRACK,
  "ocean-simulation": GALAXY_OUTER_TRACK,
  internet: GALAXY_OUTER_TRACK,
  aerospace: GALAXY_WIDE_TRACK,
  "ai-for-science": GALAXY_PRIMARY_TRACK,
});

export const GALAXY_SOURCE_CORE = Object.freeze({ x: 0.34, y: 0.48 });

export const ORBIT_BASE_DEPTH = Object.freeze({
  "large-models": 0.34,
  "research-institutes": 0.2,
  "high-end-manufacturing": 0.28,
  "ocean-simulation": 0.18,
  internet: 0.18,
  aerospace: 0.24,
  "ai-for-science": 0.25,
});

export function softBoundary(value, min, max, softness = 0.28) {
  const center = (min + max) * 0.5;
  const halfRange = Math.max(0.0001, (max - min) * 0.5);
  const knee = halfRange * (1 - softness);
  const offset = value - center;
  const distance = Math.abs(offset);
  if (distance <= knee) return value;

  const tail = halfRange - knee;
  const easedTail = tail * (2 / Math.PI) * Math.atan(((distance - knee) / tail) * (Math.PI / 2));
  return center + Math.sign(offset || 1) * (knee + easedTail);
}

export function stepDampedSpring(
  value,
  velocity,
  target = 0,
  deltaMs = 16.667,
  { stiffness = 46, damping = 10.4 } = {},
) {
  const deltaSeconds = Math.min(0.034, Math.max(0, deltaMs) / 1000);
  const acceleration = -stiffness * (value - target) - damping * velocity;
  const nextVelocity = velocity + acceleration * deltaSeconds;
  const nextValue = value + nextVelocity * deltaSeconds;
  return [nextValue, nextVelocity];
}

export function galaxyCoreDragDelta(deltaX, viewportWidth, sensitivity = 0.72) {
  return -(deltaX / Math.max(1, viewportWidth)) * sensitivity;
}

export function isGalaxyCaptureHandoff(event) {
  // Touch starts with implicit capture on the canvas/label. Moving ownership
  // to the scene emits a bubbling loss from that child, not a cancelled drag.
  return event.type === "lostpointercapture"
    && event.target !== event.currentTarget
    && event.currentTarget.hasPointerCapture(event.pointerId);
}

export function orbitalDepth(x, y, angle, { screenSpace = false, amplitude = GALAXY_DEPTH_AMPLITUDE } = {}) {
  const worldY = screenSpace ? -y : y;
  const phase = Math.atan2(worldY / GALAXY_ORBIT_FLATTENING, x);
  return Math.sin(phase + angle) * amplitude;
}

export function galaxyCoreDrift(
  angle,
  elevation = 0,
  {
    width = 1,
    height = 1,
    screenSpace = false,
    horizontalOffset,
    verticalOffset = 0,
  } = {},
) {
  const horizontal = Number.isFinite(horizontalOffset)
    ? horizontalOffset * width
    : Math.sin(angle * 0.72) * width * 0.115;
  const screenY = (
    Math.sin(angle * 0.36) * 0.012
    + Math.sin(elevation) * 0.045
    + verticalOffset
  ) * height;
  const depth = (Math.cos(angle * 0.72) - 1) * 0.16;

  return [horizontal, screenSpace ? screenY : -screenY, depth];
}

export function portalOrbitOffset(
  portal,
  width,
  height,
  { screenSpace = false, scale = GALAXY_LAYOUT_SCALE } = {},
) {
  const x = (portal.x / 100 - GALAXY_SOURCE_CORE.x) * width * scale;
  const screenY = (portal.y / 100 - GALAXY_SOURCE_CORE.y) * height * scale;
  return [x, screenSpace ? screenY : -screenY];
}

export function galaxyTrackOffset(
  index,
  total,
  width,
  height,
  { screenSpace = false, track = GALAXY_PRIMARY_TRACK } = {},
) {
  const phase = track.phase + (index / Math.max(1, total)) * Math.PI * 2;
  const x = Math.cos(phase) * width * track.radiusX;
  const screenY = Math.sin(phase) * height * track.radiusY;
  return [x, screenSpace ? screenY : -screenY, phase];
}

export function galaxyViewportSize(
  pixelWidth,
  pixelHeight,
  { cameraZ = GALAXY_CAMERA_Z, fov = GALAXY_CAMERA_FOV } = {},
) {
  const height = 2 * Math.tan((fov * Math.PI) / 360) * cameraZ;
  return {
    width: height * (pixelWidth / Math.max(1, pixelHeight)),
    height,
  };
}

export function galaxyTrackPoint(
  index,
  total,
  width,
  height,
  angle = 0,
  elevation = 0,
  { track = GALAXY_PRIMARY_TRACK, phase } = {},
) {
  const basePhase = Number.isFinite(phase)
    ? phase
    : track.phase + (index / Math.max(1, total)) * Math.PI * 2;
  const theta = basePhase + angle;
  // Ring centres are composition anchors, not the left-hand brand planet.
  // Include their offsets before tilting so DOM labels and WebGL stay on-ring.
  const x = ((track.centerX ?? GALAXY_SOURCE_CORE.x) - GALAXY_SOURCE_CORE.x) * width
    + Math.cos(theta) * width * track.radiusX;
  const y = (GALAXY_SOURCE_CORE.y - (track.centerY ?? GALAXY_SOURCE_CORE.y)) * height
    + Math.sin(theta) * height * track.radiusY;
  const z = track.baseDepth - Math.sin(theta) * track.depth;
  const elevationCosine = Math.cos(elevation);
  const elevationSine = Math.sin(elevation);

  return [
    x,
    y * elevationCosine - z * elevationSine,
    y * elevationSine + z * elevationCosine,
    theta,
  ];
}

export function galaxyOrbitTrack(orbitKey) {
  return GALAXY_ORBIT_TRACK_BY_KEY[orbitKey] ?? GALAXY_PRIMARY_TRACK;
}

export function galaxyPortalPhase(
  portal,
  { track = GALAXY_PRIMARY_TRACK, core = GALAXY_SOURCE_CORE } = {},
) {
  const x = portal.x / 100 - (track.centerX ?? core.x);
  const y = (track.centerY ?? core.y) - portal.y / 100;
  return Math.atan2(y / track.radiusY, x / track.radiusX);
}

export function galaxyPlanetRadius(orbitKey, width, height) {
  const scales = {
    "large-models": 1.28, "research-institutes": 0.94,
    "high-end-manufacturing": 1.08, "ocean-simulation": 1.04,
    internet: 1.1, aerospace: 0.92, "ai-for-science": 1.08,
  };
  return Math.min(height, width / 1.48) * 0.0545 * (scales[orbitKey] ?? 1);
}

export function projectGalaxyLayout(domains, width, height, motion = {}) {
  const { angle = 0, elevation = 0, horizontalOffset = 0, verticalOffset = 0 } = motion;
  const viewport = galaxyViewportSize(width, height);
  const drift = galaxyCoreDrift(angle, elevation, { ...viewport, horizontalOffset, verticalOffset });
  const core = [
    (GALAXY_SOURCE_CORE.x - 0.5) * viewport.width + drift[0],
    (0.5 - GALAXY_SOURCE_CORE.y) * viewport.height + drift[1], drift[2],
  ];
  return {
    core: projectGalaxyPoint(core, width, height),
    nodes: domains.map((domain, index) => {
      const key = domain.orbitKey ?? domain.id;
      const track = galaxyOrbitTrack(key);
      const phase = galaxyPortalPhase(domain.portal, { track });
      const offset = galaxyTrackPoint(index, domains.length, viewport.width, viewport.height,
        angle, elevation, { track, phase });
      const point = projectGalaxyPoint(core.map((value, axis) => value + offset[axis]), width, height);
      return { id: domain.id, point, radius: galaxyPlanetRadius(key, width, height) * point[2] };
    }),
  };
}

export function galaxyMotionClearance(domains, width, height, motion, { dock, top } = {}) {
  const layout = projectGalaxyLayout(domains, width, height, motion);
  const margin = Math.max(20, width * 0.02);
  const safeTop = top ?? Math.max(108, height * 0.115);
  const safeBottom = height - Math.max(54, height * 0.075);
  const coreRadius = Math.min(height, width / 1.48) * 0.155;
  let clearance = Infinity;
  for (const node of layout.nodes) {
    const [x, y, perspective] = node.point;
    // Reserve room for a selected sphere AND its full accessible label.
    const rx = Math.max(node.radius * 1.28, Math.min(190, Math.max(132, width * 0.115)) * perspective * 0.54);
    const ry = Math.max(node.radius * 1.28, 55 * perspective);
    clearance = Math.min(clearance, x - rx - margin, width - margin - x - rx,
      y - ry - safeTop, safeBottom - y - ry,
      Math.hypot(x - layout.core[0], y - layout.core[1]) - coreRadius - node.radius * 1.15 - 8);
    if (dock) {
      // A single common motion limit: never clamp individual planets off their ring.
      const dx = Math.max(dock.left - x, 0, x - dock.right);
      const dy = Math.max(dock.top - y, 0, y - dock.bottom);
      const sphereSeparation = Math.hypot(dx, dy) - node.radius * 1.28;
      const labelSeparation = Math.max(dock.left - x - rx, x - rx - dock.right,
        dock.top - y - 55 * perspective, y - 55 * perspective - dock.bottom);
      clearance = Math.min(clearance, sphereSeparation - 10, labelSeparation - 10);
    }
  }
  return clearance;
}

export function constrainGalaxyMotion(motion, domains, width, height, bounds = {}) {
  const scaled = (scale) => ({
    angle: (motion.angle ?? 0) * scale,
    elevation: (motion.elevation ?? 0) * scale,
    horizontalOffset: (motion.horizontalOffset ?? 0) * scale,
    verticalOffset: (motion.verticalOffset ?? 0) * scale,
  });
  let low = 0;
  let high = 1;
  // Find the first obstruction along the gesture, even if its endpoint is clear.
  for (let step = 1; step <= 12; step += 1) {
    const scale = step / 12;
    if (galaxyMotionClearance(domains, width, height, scaled(scale), bounds) < 0) {
      high = scale;
      break;
    }
    low = scale;
  }
  if (low === 1) return { ...scaled(1), scale: 1 };
  for (let step = 0; step < 12; step += 1) {
    const mid = (low + high) * 0.5;
    if (galaxyMotionClearance(domains, width, height, scaled(mid), bounds) >= 0) low = mid;
    else high = mid;
  }
  const scale = low * 0.995;
  return { ...scaled(scale), scale };
}

export function projectGalaxyPoint(
  point,
  pixelWidth,
  pixelHeight,
  { cameraZ = GALAXY_CAMERA_Z, fov = GALAXY_CAMERA_FOV } = {},
) {
  const viewport = galaxyViewportSize(pixelWidth, pixelHeight, { cameraZ, fov });
  const perspective = cameraZ / Math.max(0.001, cameraZ - point[2]);
  return [
    pixelWidth * 0.5 + (point[0] / viewport.width) * pixelWidth * perspective,
    pixelHeight * 0.5 - (point[1] / viewport.height) * pixelHeight * perspective,
    perspective,
  ];
}

export function rotateGalaxyOffset(
  x,
  y,
  angle,
  elevation = 0,
  { screenSpace = false, depth = 0 } = {},
) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const logicalY = screenSpace ? -y : y;
  const ellipseY = logicalY / GALAXY_ORBIT_FLATTENING;
  const rotatedX = x * cosine - ellipseY * sine;
  const rotatedY = (ellipseY * cosine + x * sine) * GALAXY_ORBIT_FLATTENING;
  const baseDepth = depth + orbitalDepth(x, logicalY, angle);
  const elevationCosine = Math.cos(elevation);
  const elevationSine = Math.sin(elevation);

  if (screenSpace) {
    const radius = Math.max(1, Math.hypot(x, logicalY));
    const screenY = -rotatedY * elevationCosine + rotatedX * elevationSine * 0.11;
    const tiltedDepth = baseDepth + (rotatedY / radius) * elevationSine * 0.42;
    return [rotatedX, screenY, tiltedDepth];
  }

  return [
    rotatedX,
    rotatedY * elevationCosine - baseDepth * elevationSine,
    rotatedY * elevationSine + baseDepth * elevationCosine,
  ];
}
