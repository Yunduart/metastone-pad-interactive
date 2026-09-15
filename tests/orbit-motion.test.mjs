import assert from "node:assert/strict";
import test from "node:test";
import { CONTENT_CATALOGS } from "../src/domains.js";
import {
  GALAXY_ELEVATION_LIMIT,
  GALAXY_SOURCE_CORE,
  GALAXY_OUTER_TRACK,
  GALAXY_PRIMARY_TRACK,
  GALAXY_WIDE_TRACK,
  constrainGalaxyMotion,
  galaxyMotionClearance,
  galaxyCoreDragDelta,
  galaxyCoreDrift,
  galaxyOrbitTrack,
  galaxyPortalPhase,
  galaxyTrackPoint,
  galaxyViewportSize,
  isGalaxyCaptureHandoff,
  projectGalaxyPoint,
  stepDampedSpring,
} from "../src/orbitMath.js";

const WIDTH = 1500;
const HEIGHT = 1000;
const CASES = CONTENT_CATALOGS[0].items;
const PRODUCTS = CONTENT_CATALOGS[1].items;

test("touch implicit capture transfer is not mistaken for release or cancellation", () => {
  const child = {};
  const owner = { hasPointerCapture: id => id === 7 };
  const event = { type: "lostpointercapture", pointerId: 7, target: child, currentTarget: owner };
  assert.equal(isGalaxyCaptureHandoff(event), true);
  assert.equal(isGalaxyCaptureHandoff({ ...event, target: owner }), false, "actual owner loss ends drag");
  assert.equal(isGalaxyCaptureHandoff({ ...event, pointerId: 8 }), false, "uncaptured pointer is not a transfer");
  assert.equal(isGalaxyCaptureHandoff({ ...event, type: "pointercancel" }), false);
  assert.equal(isGalaxyCaptureHandoff({ ...event, type: "pointerup" }), false);
});

test("the left-side core uses inverse two-axis drag parallax", () => {
  const leftDrag = galaxyCoreDragDelta(-240, WIDTH);
  const rightDrag = galaxyCoreDragDelta(240, WIDTH);
  const upwardDrag = galaxyCoreDragDelta(-160, HEIGHT, 0.54);
  const downwardDrag = galaxyCoreDragDelta(160, HEIGHT, 0.54);

  assert.ok(leftDrag > 0, "dragging left must move the core toward the right");
  assert.ok(rightDrag < 0, "dragging right must move the core toward the left");
  assert.equal(leftDrag, -rightDrag);
  assert.ok(upwardDrag > 0, "dragging up must move the core downward in screen space");
  assert.ok(downwardDrag < 0, "dragging down must move the core upward in screen space");
  assert.equal(upwardDrag, -downwardDrag);
});

test("the release spring returns to the default composition without diverging", () => {
  let value = 0.86;
  let velocity = 0.24;
  let maximum = Math.abs(value);

  for (let frame = 0; frame < 120; frame += 1) {
    [value, velocity] = stepDampedSpring(value, velocity, 0, 16.667);
    maximum = Math.max(maximum, Math.abs(value));
  }

  assert.ok(maximum < 0.95, `spring should stay restrained, got ${maximum}`);
  assert.ok(Math.abs(value) < 0.0002, `spring should settle at zero, got ${value}`);
  assert.ok(Math.abs(velocity) < 0.001, `spring velocity should settle, got ${velocity}`);
});

test("vertical core parallax is projected consistently in DOM and WebGL space", () => {
  const screenPoint = galaxyCoreDrift(0, 0, {
    width: WIDTH,
    height: HEIGHT,
    screenSpace: true,
    verticalOffset: 0.075,
  });
  const worldPoint = galaxyCoreDrift(0, 0, {
    width: WIDTH,
    height: HEIGHT,
    verticalOffset: 0.075,
  });

  assert.ok(screenPoint[1] > 0);
  assert.equal(screenPoint[1], -worldPoint[1]);
});

test("product catalog exposes the nine named products and eleven source films", () => {
  assert.deepEqual(
    PRODUCTS.map((product) => product.title),
    [
      "国产 Token 优化工厂",
      "超智算集群",
      "国产异构超智算中心",
      "国产 Token 优化工厂计算速度大比拼：CPU vs GPU",
      "国产 Token 优化工厂－技术优势",
      "AI Infra",
      "PD 分离",
      "投机解码",
      "多层级 KV Cache",
    ],
  );
  assert.equal(PRODUCTS.reduce((total, product) => total + product.mediaCount, 0), 11);
  assert.equal(new Set(PRODUCTS.map((product) => product.marker)).size, 9);
  assert.ok(PRODUCTS.every((product) => !product.placeholder));
});

test("METASTONE core travels in both drag directions", () => {
  const positive = galaxyCoreDrift(0, 0, {
    width: WIDTH,
    height: HEIGHT,
    screenSpace: true,
    horizontalOffset: 0.1,
  });
  const negative = galaxyCoreDrift(0, 0, {
    width: WIDTH,
    height: HEIGHT,
    screenSpace: true,
    horizontalOffset: -0.1,
  });

  assert.ok(positive[0] > WIDTH * 0.09);
  assert.ok(negative[0] < -WIDTH * 0.09);
  assert.ok(Math.abs(positive[0] + negative[0]) < 0.0001);
});

test("horizontal and vertical gestures map to independent axes", () => {
  const domain = CASES[0];
  const track = galaxyOrbitTrack(domain.orbitKey ?? domain.id);
  const phase = galaxyPortalPhase(domain.portal, { track });
  const horizontal = galaxyTrackPoint(0, CASES.length, WIDTH, HEIGHT, 0.8, 0, { phase, track });
  const elevated = galaxyTrackPoint(0, CASES.length, WIDTH, HEIGHT, 0.8, GALAXY_ELEVATION_LIMIT, {
    phase,
    track,
  });

  assert.equal(horizontal[0], elevated[0]);
  assert.notEqual(horizontal[1], elevated[1]);
  assert.notEqual(horizontal[2], elevated[2]);
});

test("the seven labels retain horizontal spread while the galaxy rotates", () => {
  for (const angle of [0, 0.6, 1.2, 1.8, 2.4, 3]) {
    const core = galaxyCoreDrift(angle, 0, { width: WIDTH, height: HEIGHT, screenSpace: true });
    const xs = CASES.map((domain, index) => {
      const track = galaxyOrbitTrack(domain.orbitKey ?? domain.id);
      const phase = galaxyPortalPhase(domain.portal, { track });
      const [rotatedX] = galaxyTrackPoint(index, CASES.length, WIDTH, HEIGHT, angle, 0, { phase, track });
      return WIDTH * GALAXY_SOURCE_CORE.x + core[0] + rotatedX;
    });
    const spread = Math.max(...xs) - Math.min(...xs);
    assert.ok(spread > WIDTH * 0.5, `expected horizontal spread at angle ${angle}, got ${spread}`);
  }
});

test("every planet starts exactly on its assigned visible orbit ring", () => {
  CASES.forEach((domain, index) => {
    const track = galaxyOrbitTrack(domain.orbitKey ?? domain.id);
    const phase = galaxyPortalPhase(domain.portal, { track });
    const [x, y] = galaxyTrackPoint(index, CASES.length, WIDTH, HEIGHT, 0, 0, { phase, track });
    const normalized = ((x - (track.centerX - GALAXY_SOURCE_CORE.x) * WIDTH) / (WIDTH * track.radiusX)) ** 2
      + ((y - (GALAXY_SOURCE_CORE.y - track.centerY) * HEIGHT) / (HEIGHT * track.radiusY)) ** 2;
    assert.ok(Math.abs(normalized - 1) < 1e-10, `${domain.title} is not on the ring`);
  });
});

test("the opening composition keeps deliberately uneven angular spacing", () => {
  const phases = CASES.map((domain) => {
    const track = galaxyOrbitTrack(domain.orbitKey ?? domain.id);
    const phase = galaxyPortalPhase(domain.portal, { track });
    return (phase + Math.PI * 2) % (Math.PI * 2);
  }).sort((a, b) => a - b);
  const gaps = phases.map((phase, index) => {
    const next = phases[(index + 1) % phases.length] + (index === phases.length - 1 ? Math.PI * 2 : 0);
    return next - phase;
  });

  assert.ok(Math.max(...gaps) - Math.min(...gaps) > 0.45);
});

test("DOM labels and WebGL planets share the same projection at extreme tilt", () => {
  const viewport = galaxyViewportSize(WIDTH, HEIGHT);
  const angle = 1.32;
  const elevation = GALAXY_ELEVATION_LIMIT;
  const drift = galaxyCoreDrift(angle, elevation, {
    width: viewport.width,
    height: viewport.height,
    horizontalOffset: 0.1,
  });
  const core = [
    (GALAXY_SOURCE_CORE.x - 0.5) * viewport.width + drift[0],
    (0.5 - GALAXY_SOURCE_CORE.y) * viewport.height + drift[1],
    drift[2],
  ];

  CASES.forEach((domain, index) => {
    const track = galaxyOrbitTrack(domain.orbitKey ?? domain.id);
    const phase = galaxyPortalPhase(domain.portal, { track });
    const offset = galaxyTrackPoint(
      index,
      CASES.length,
      viewport.width,
      viewport.height,
      angle,
      elevation,
      { phase, track },
    );
    const world = [core[0] + offset[0], core[1] + offset[1], core[2] + offset[2]];
    const projected = projectGalaxyPoint(world, WIDTH, HEIGHT);
    const perspective = 12 / (12 - world[2]);
    const expectedX = WIDTH * 0.5 + (world[0] / viewport.width) * WIDTH * perspective;
    const expectedY = HEIGHT * 0.5 - (world[1] / viewport.height) * HEIGHT * perspective;

    assert.ok(Math.abs(projected[0] - expectedX) < 0.000001);
    assert.ok(Math.abs(projected[1] - expectedY) < 0.000001);
  });
});

test("every planet remains on its tilted assigned ring while the galaxy rotates", () => {
  const width = 13.1;
  const height = 8.7;
  const angle = -1.18;
  const elevation = -GALAXY_ELEVATION_LIMIT;

  CASES.forEach((domain, index) => {
    const track = galaxyOrbitTrack(domain.orbitKey ?? domain.id);
    const phase = galaxyPortalPhase(domain.portal, { track });
    const [x, y, z, theta] = galaxyTrackPoint(
      index,
      CASES.length,
      width,
      height,
      angle,
      elevation,
      { phase, track },
    );
    const sourceX = (track.centerX - GALAXY_SOURCE_CORE.x) * width + Math.cos(theta) * width * track.radiusX;
    const sourceY = (GALAXY_SOURCE_CORE.y - track.centerY) * height + Math.sin(theta) * height * track.radiusY;
    const sourceZ = track.baseDepth - Math.sin(theta) * track.depth;
    const cosine = Math.cos(elevation);
    const sine = Math.sin(elevation);

    assert.ok(Math.abs(x - sourceX) < 0.000001);
    assert.ok(Math.abs(y - (sourceY * cosine - sourceZ * sine)) < 0.000001);
    assert.ok(Math.abs(z - (sourceY * sine + sourceZ * cosine)) < 0.000001);
  });
});

test("visible rings have composition centres separate from the brand sphere and fit horizontally", () => {
  for (const track of [GALAXY_PRIMARY_TRACK, GALAXY_OUTER_TRACK, GALAXY_WIDE_TRACK]) {
    assert.notEqual(track.centerX, GALAXY_SOURCE_CORE.x);
    assert.ok(track.centerX - track.radiusX >= 0.019);
    assert.ok(track.centerX + track.radiusX <= 0.87);
    assert.ok(track.baseDepth + track.depth > track.baseDepth - track.depth, "front/lower half is nearer the camera");
  }
});

test("both catalogues start in a clear, asymmetric home pose at supported viewports", () => {
  for (const [width, height] of [[1536, 1024], [1920, 1280], [1280, 800], [1024, 768]]) {
    for (const catalog of CONTENT_CATALOGS) {
      const clearance = galaxyMotionClearance(catalog.items, width, height, {});
      assert.ok(clearance >= 0, `${catalog.id} ${width}x${height}: ${clearance}`);
    }
  }
});

test("drag bounds limit the whole galaxy, without moving any planet off its ring", () => {
  for (const [width, height] of [[1536, 1024], [1920, 1280], [1280, 800], [1024, 768]]) {
    for (const catalog of CONTENT_CATALOGS) {
      for (const dx of [-700, -365, -120, 120, 365, 700]) {
        for (const dy of [-300, 0, 300]) {
          const target = {
            angle: dx * 0.0011,
            elevation: Math.max(-0.34, Math.min(0.34, dy * 0.00125)),
            horizontalOffset: Math.max(-0.1, Math.min(0.1, galaxyCoreDragDelta(dx, width))),
            verticalOffset: Math.max(-0.075, Math.min(0.075, galaxyCoreDragDelta(dy, height, 0.54))),
          };
          const safe = constrainGalaxyMotion(target, catalog.items, width, height);
          assert.ok(safe.scale >= 0 && safe.scale <= 1);
          assert.ok(galaxyMotionClearance(catalog.items, width, height, safe) >= -0.001,
            `${catalog.id} ${width}x${height}, gesture ${dx},${dy}`);
          for (const key of ["angle", "elevation", "horizontalOffset", "verticalOffset"]) {
            assert.equal(safe[key], target[key] * safe.scale, "one common transform, no per-label clamps");
          }
        }
      }
    }
  }
});
