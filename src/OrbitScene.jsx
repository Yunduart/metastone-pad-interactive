import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { RocketLaunch } from "@phosphor-icons/react";
import * as THREE from "three";
import {
  GALAXY_CAMERA_Z,
  GALAXY_OUTER_TRACK,
  GALAXY_PRIMARY_TRACK,
  GALAXY_SOURCE_CORE,
  galaxyCoreDrift,
  galaxyOrbitTrack,
  galaxyPortalPhase,
  galaxyTrackPoint,
} from "./orbitMath.js";

const GLOW_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const GLOW_FRAGMENT = `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 viewDirection = normalize(-vViewPosition);
    float rim = pow(1.0 - clamp(dot(vNormal, viewDirection), 0.0, 1.0), 2.4);
    gl_FragColor = vec4(uColor, rim * uStrength);
  }
`;

const PLANET_VERTEX = `
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vNormalView = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const PLANET_FRAGMENT = `
  uniform sampler2D uEarthMap;
  uniform sampler2D uNormalMap;
  uniform float uActive;
  uniform float uHero;
  uniform float uDepth;

  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewPosition;

  void main() {
    vec3 source = texture2D(uEarthMap, vUv).rgb;
    vec3 relief = texture2D(uNormalMap, vUv).rgb * 2.0 - 1.0;
    float luminance = dot(source, vec3(0.2126, 0.7152, 0.0722));
    float land = smoothstep(0.11, 0.48, luminance);
    float ice = smoothstep(0.68, 0.96, luminance);
    float reliefEdge = clamp(length(relief.xy), 0.0, 1.0) * land;

    vec3 deepOcean = vec3(0.0005, 0.004, 0.022);
    vec3 glacier = vec3(0.16, 0.42, 0.88);
    vec3 gradedSource = pow(max(source, vec3(0.0)), vec3(1.8));
    vec3 color = deepOcean + gradedSource * vec3(0.30, 0.59, 0.94);
    color += land * vec3(0.008, 0.052, 0.17) * (0.8 + uActive * 0.18);
    color = mix(color, glacier, ice * (0.1 + uActive * 0.035));

    vec3 normal = normalize(vNormalView);
    vec3 viewDirection = normalize(-vViewPosition);
    vec3 lightDirection = normalize(vec3(-0.42, 0.58, 0.72));
    float keyLight = max(dot(normal, lightDirection), 0.0);
    float wrapLight = smoothstep(-0.62, 0.82, dot(normal, lightDirection));
    float rim = pow(1.0 - clamp(dot(normal, viewDirection), 0.0, 1.0), 2.7);
    vec3 halfVector = normalize(lightDirection + viewDirection);
    float specular = pow(max(dot(normal, halfVector), 0.0), 38.0);

    float bodyLight = 0.34 + wrapLight * 0.33 + pow(keyLight, 1.35) * 0.15;
    bodyLight += uHero * 0.052 + uActive * 0.048;
    color *= bodyLight * (0.61 + uActive * 0.17 + uHero * 0.10);
    color += reliefEdge * vec3(0.065, 0.22, 0.62) * (0.31 + uActive * 0.075 + uHero * 0.11);
    color += specular * vec3(0.3, 0.62, 1.08) * (0.16 + uActive * 0.13);
    color += rim * vec3(0.08, 0.31, 1.0) * (0.25 + uActive * 0.19 + uHero * 0.09);

    float edgeFalloff = smoothstep(0.0, 0.18, dot(normal, viewDirection));
    color *= mix(0.72, 1.0, edgeFalloff) * mix(0.82, 1.08, uDepth);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const CLOUD_FRAGMENT = `
  uniform sampler2D uCloudsMap;
  uniform float uOpacity;
  uniform float uHero;
  uniform float uDepth;

  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewPosition;

  void main() {
    vec3 cloudSource = texture2D(uCloudsMap, vUv).rgb;
    float cloud = dot(cloudSource, vec3(0.3333));
    float structure = smoothstep(0.7, 0.99, cloud);
    vec3 normal = normalize(vNormalView);
    vec3 viewDirection = normalize(-vViewPosition);
    float rim = pow(1.0 - clamp(dot(normal, viewDirection), 0.0, 1.0), 2.4);
    float light = 0.7 + max(dot(normal, normalize(vec3(-0.36, 0.62, 0.7))), 0.0) * 0.3;
    vec3 color = mix(vec3(0.18, 0.58, 1.08), vec3(0.78, 0.95, 1.28), structure);
    float alpha = (structure * uOpacity * light + rim * (0.018 + uHero * 0.018)) * mix(0.76, 1.08, uDepth);
    gl_FragColor = vec4(color, alpha);
  }
`;

function Atmosphere({ radius, active = false, hero = false }) {
  const innerUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(active ? "#8bd7ff" : "#397bd8") },
      uStrength: { value: active ? (hero ? 0.22 : 0.24) : 0.095 },
    }),
    [active, hero],
  );
  const outerUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(active ? "#2d7fff" : "#2259bd") },
      uStrength: { value: active ? (hero ? 0.038 : 0.042) : 0.019 },
    }),
    [active, hero],
  );

  return (
    <>
      <mesh scale={1.022}>
        <sphereGeometry args={[radius, 48, 48]} />
        <shaderMaterial
          vertexShader={GLOW_VERTEX}
          fragmentShader={GLOW_FRAGMENT}
          uniforms={innerUniforms}
          side={THREE.FrontSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh scale={1.09}>
        <sphereGeometry args={[radius, 40, 40]} />
        <shaderMaterial
          vertexShader={GLOW_VERTEX}
          fragmentShader={GLOW_FRAGMENT}
          uniforms={outerUniforms}
          side={THREE.FrontSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

function PlanetSurface({
  radius,
  earthMap,
  normalMap,
  cloudsMap,
  active,
  hero = false,
  depthRef,
  rotationOffset = 0,
  rotationSpeed = 0.026,
}) {
  const earthRef = useRef(null);
  const cloudsRef = useRef(null);
  const surfaceUniforms = useMemo(
    () => ({
      uEarthMap: { value: earthMap },
      uNormalMap: { value: normalMap },
      uActive: { value: active ? 1 : 0 },
      uHero: { value: hero ? 1 : 0 },
      uDepth: { value: hero ? 1 : 0.6 },
    }),
    [active, earthMap, hero, normalMap],
  );
  const cloudUniforms = useMemo(
    () => ({
      uCloudsMap: { value: cloudsMap },
      uOpacity: { value: active ? (hero ? 0.005 : 0.006) : 0.002 },
      uHero: { value: hero ? 1 : 0 },
      uDepth: { value: hero ? 1 : 0.6 },
    }),
    [active, cloudsMap, hero],
  );

  useFrame((state, delta) => {
    const depth = depthRef?.current ?? (hero ? 1 : 0.6);
    surfaceUniforms.uDepth.value = active ? Math.max(0.72, depth) : depth;
    cloudUniforms.uDepth.value = active ? Math.max(0.72, depth) : depth;
    if (earthRef.current) earthRef.current.rotation.y += delta * rotationSpeed;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * rotationSpeed * 1.42;
  });

  return (
    <>
      <mesh ref={earthRef} rotation={[0, rotationOffset, 0]}>
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial
          vertexShader={PLANET_VERTEX}
          fragmentShader={PLANET_FRAGMENT}
          uniforms={surfaceUniforms}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={cloudsRef} scale={1.011} rotation={[0, rotationOffset + 0.2, 0]}>
        <sphereGeometry args={[radius, 48, 48]} />
        <shaderMaterial
          vertexShader={PLANET_VERTEX}
          fragmentShader={CLOUD_FRAGMENT}
          uniforms={cloudUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <mesh>
        <icosahedronGeometry args={[radius * 1.018, active || hero ? 3 : 2]} />
        <meshBasicMaterial
          color={active ? "#98d8ff" : "#4b8cdb"}
          wireframe
          transparent
          opacity={active ? (hero ? 0.024 : 0.022) : 0.007}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <Atmosphere radius={radius} active={active} hero={hero} />
    </>
  );
}

function CorePlanet({ position, radius, textures, onReset, dragGuardRef }) {
  const groupRef = useRef(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.3) * 0.008;
    const next = THREE.MathUtils.damp(groupRef.current.scale.x, pulse, 4, delta);
    groupRef.current.scale.setScalar(next);
  });

  return (
    <group ref={groupRef} position={position}>
      <PlanetSurface
        radius={radius}
        earthMap={textures.earthMap}
        normalMap={textures.normalMap}
        cloudsMap={textures.cloudsMap}
        active
        hero
        rotationOffset={-0.58}
        rotationSpeed={0.018}
      />

      <mesh
        onClick={(event) => {
          event.stopPropagation();
          if (performance.now() < (dragGuardRef?.current?.suppressClickUntil ?? 0)) return;
          onReset();
        }}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}
      >
        <sphereGeometry args={[radius * 1.06, 28, 28]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

    </group>
  );
}

function ActiveOrbitHalo({ radius, active, hovered }) {
  const primaryRef = useRef(null);
  const secondaryRef = useRef(null);
  const visible = active || hovered;

  useFrame((state, delta) => {
    if (!visible) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.15) * (active ? 0.028 : 0.014);
    if (primaryRef.current) {
      primaryRef.current.rotation.z += delta * 0.22;
      primaryRef.current.scale.setScalar(pulse);
    }
    if (secondaryRef.current) {
      secondaryRef.current.rotation.z -= delta * 0.13;
      secondaryRef.current.scale.setScalar(2 - pulse * 0.98);
    }
  });

  if (!visible) return null;

  return (
    <group>
      <mesh ref={primaryRef} rotation={[0.44, 0.08, 0.1]}>
        <torusGeometry args={[radius * 1.24, radius * 0.008, 8, 112]} />
        <meshBasicMaterial
          color="#9eefff"
          transparent
          opacity={active ? 0.28 : 0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={secondaryRef} rotation={[-0.34, 0.17, 1.1]}>
        <torusGeometry args={[radius * 1.36, radius * 0.004, 8, 112]} />
        <meshBasicMaterial
          color="#5e9dff"
          transparent
          opacity={active ? 0.11 : 0.055}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function DomainPlanet({
  domain,
  index,
  total,
  phase,
  track,
  corePosition,
  radius,
  textures,
  active,
  onSelect,
  galaxyAngleRef,
  dragGuardRef,
  viewport,
}) {
  const groupRef = useRef(null);
  const depthRef = useRef(0.6);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = active ? 1.2 : hovered ? 1.07 : 1;
    const next = THREE.MathUtils.damp(groupRef.current.scale.x, target, 7, delta);
    groupRef.current.scale.setScalar(next);
    const orbitOffset = galaxyTrackPoint(
      index,
      total,
      viewport.width,
      viewport.height,
      galaxyAngleRef.current,
      dragGuardRef.current?.elevation ?? 0,
      { phase, track },
    );
    groupRef.current.position.set(
      corePosition[0] + orbitOffset[0],
      corePosition[1] + orbitOffset[1],
      orbitOffset[2],
    );
    const perspective = GALAXY_CAMERA_Z / Math.max(0.001, GALAXY_CAMERA_Z - orbitOffset[2]);
    depthRef.current = THREE.MathUtils.clamp((perspective - 0.94) / 0.12, 0, 1);
  });

  return (
    <group ref={groupRef}>
      <PlanetSurface
        radius={radius}
        earthMap={textures.earthMap}
        normalMap={textures.normalMap}
        cloudsMap={textures.cloudsMap}
        active={active}
        depthRef={depthRef}
        rotationOffset={-0.78 + Number(domain.number) * 0.27}
        rotationSpeed={0.028 + Number(domain.number) * 0.002}
      />

      <ActiveOrbitHalo radius={radius} active={active} hovered={hovered} />

      <mesh
        onClick={(event) => {
          event.stopPropagation();
          if (performance.now() < (dragGuardRef?.current?.suppressClickUntil ?? 0)) return;
          onSelect(domain.id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[radius * 1.16, 28, 28]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

    </group>
  );
}

function GestureCamera({ dragGuardRef }) {
  useFrame(() => {
    const motion = dragGuardRef.current;
    if (motion) motion.viewScale = 1;
  });

  return null;
}

function StarDust({ width, height, galaxyAngleRef, dragGuardRef }) {
  const farRef = useRef(null);
  const nearRef = useRef(null);
  const positions = useMemo(() => {
    const makeLayer = (count, seedStart, spreadX, spreadY, minDepth, depthRange) => {
      let seed = seedStart;
      const random = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      const values = new Float32Array(count * 3);
      for (let index = 0; index < count; index += 1) {
        values[index * 3] = (random() - 0.5) * width * spreadX;
        values[index * 3 + 1] = (random() - 0.5) * height * spreadY;
        values[index * 3 + 2] = minDepth - random() * depthRange;
      }
      return values;
    };
    return {
      far: makeLayer(280, 173, 1.46, 1.38, -4.4, 7.4),
      near: makeLayer(88, 911, 1.16, 1.12, -0.4, 3.6),
    };
  }, [height, width]);

  useFrame((state, delta) => {
    if (!farRef.current || !nearRef.current) return;
    const motion = dragGuardRef.current;
    const normalizedX = motion?.reducedMotion
      ? 0
      : THREE.MathUtils.clamp((motion?.velocityX ?? 0) / 0.0032, -1, 1);
    const normalizedY = motion?.reducedMotion
      ? 0
      : THREE.MathUtils.clamp((motion?.velocityY ?? 0) / 0.0014, -1, 1);
    const horizontal = motion?.coreOffset ?? 0;
    const vertical = motion?.coreVerticalOffset ?? 0;
    const farTarget = galaxyAngleRef.current * 0.018 + state.clock.elapsedTime * 0.0013;
    const nearTarget = galaxyAngleRef.current * 0.064 + state.clock.elapsedTime * 0.0032;

    farRef.current.rotation.z = THREE.MathUtils.damp(farRef.current.rotation.z, farTarget, 2.2, delta);
    nearRef.current.rotation.z = THREE.MathUtils.damp(nearRef.current.rotation.z, nearTarget, 3.4, delta);
    farRef.current.rotation.y = THREE.MathUtils.damp(
      farRef.current.rotation.y,
      normalizedX * 0.018 + (motion?.elevation ?? 0) * 0.035,
      3.5,
      delta,
    );
    nearRef.current.rotation.y = THREE.MathUtils.damp(
      nearRef.current.rotation.y,
      normalizedX * 0.07 + (motion?.elevation ?? 0) * 0.12,
      4.6,
      delta,
    );
    farRef.current.position.x = THREE.MathUtils.damp(
      farRef.current.position.x,
      -horizontal * width * 0.08 - normalizedX * 0.035,
      3.7,
      delta,
    );
    farRef.current.position.y = THREE.MathUtils.damp(
      farRef.current.position.y,
      vertical * height * 0.06 - normalizedY * 0.022,
      3.7,
      delta,
    );
    nearRef.current.position.x = THREE.MathUtils.damp(
      nearRef.current.position.x,
      -horizontal * width * 0.28 - normalizedX * 0.13,
      5.2,
      delta,
    );
    nearRef.current.position.y = THREE.MathUtils.damp(
      nearRef.current.position.y,
      vertical * height * 0.24 - normalizedY * 0.08,
      5.2,
      delta,
    );
  });

  return (
    <group>
      <points ref={farRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions.far, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#7da8e2"
          size={0.024}
          transparent
          opacity={0.44}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points ref={nearRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions.near, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#d5efff"
          size={0.048}
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function ellipseArcPoints(radiusX, radiusY, depth, start, end, segments = 180) {
  const points = [];
  for (let index = 0; index <= segments; index += 1) {
    const angle = start + (index / segments) * (end - start);
    points.push([
      Math.cos(angle) * radiusX,
      Math.sin(angle) * radiusY,
      -0.18 + Math.sin(angle) * depth,
    ]);
  }
  return points;
}

function OrbitLine({
  center,
  radiusX,
  radiusY,
  rotation,
  opacity,
  depth,
  tiltX,
  tiltY,
  spinFactor,
  lineWidth = 0.88,
  galaxyAngleRef,
  dragGuardRef,
  lockToGalaxy = false,
}) {
  const groupRef = useRef(null);
  const frontPoints = useMemo(
    () => ellipseArcPoints(radiusX, radiusY, depth, 0, Math.PI),
    [depth, radiusX, radiusY],
  );
  const backPoints = useMemo(
    () => ellipseArcPoints(radiusX, radiusY, depth, Math.PI, Math.PI * 2),
    [depth, radiusX, radiusY],
  );

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const motion = dragGuardRef.current;
    if (lockToGalaxy) {
      groupRef.current.rotation.set(motion?.elevation ?? 0, 0, 0);
      return;
    }
    const normalizedVelocity = motion?.reducedMotion
      ? 0
      : THREE.MathUtils.clamp((motion?.velocityX ?? 0) / 0.0032, -1, 1);
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      tiltX + (motion?.elevation ?? 0) * 0.72 + normalizedVelocity * 0.025,
      5.4,
      delta,
    );
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      tiltY - normalizedVelocity * 0.17,
      5.4,
      delta,
    );
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      rotation + galaxyAngleRef.current * spinFactor,
      3.2,
      delta,
    );
  });

  return (
    <group ref={groupRef} position={center} rotation={[tiltX, tiltY, rotation]}>
      <Line
        points={backPoints}
        color="#4a84d7"
        lineWidth={lineWidth * 0.72}
        transparent
        opacity={opacity * 0.36}
        depthWrite={false}
      />
      <Line
        points={frontPoints}
        color="#8bd4ff"
        lineWidth={lineWidth}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </group>
  );
}

function EnergyLink({
  corePosition,
  coreRadius,
  targetIndex,
  total,
  phase,
  track,
  width,
  height,
  galaxyAngleRef,
  dragGuardRef,
  active,
}) {
  const broadRef = useRef(null);
  const coreRef = useRef(null);
  const pulseRef = useRef(null);
  const vesselRef = useRef(null);
  const lastAngleRef = useRef(Number.NaN);
  const lastElevationRef = useRef(Number.NaN);
  const curve = useMemo(
    () => new THREE.QuadraticBezierCurve3(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()),
    [],
  );
  const coreVector = useMemo(() => new THREE.Vector3(...corePosition), [corePosition]);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const workPoint = useMemo(() => new THREE.Vector3(), []);
  const linePositions = useMemo(() => new Float32Array(73 * 3), []);
  const points = useMemo(() => Array.from({ length: 73 }, () => [0, 0, 0]), []);

  useEffect(() => {
    lastAngleRef.current = Number.NaN;
    lastElevationRef.current = Number.NaN;
  }, [targetIndex]);

  useFrame((state) => {
    if (!pulseRef.current || !broadRef.current || !coreRef.current || !active) return;
    const angle = galaxyAngleRef.current;
    const elevation = dragGuardRef.current?.elevation ?? 0;
    if (
      Math.abs(angle - lastAngleRef.current) > 0.00001
      || Math.abs(elevation - lastElevationRef.current) > 0.00001
      || Number.isNaN(lastAngleRef.current)
    ) {
      lastAngleRef.current = angle;
      lastElevationRef.current = elevation;
      const orbitOffset = galaxyTrackPoint(
        targetIndex,
        total,
        width,
        height,
        angle,
        elevation,
        { phase, track },
      );
      const orbitEnd = [
        corePosition[0] + orbitOffset[0],
        corePosition[1] + orbitOffset[1],
        orbitOffset[2],
      ];
      const end = curve.v2.set(...orbitEnd);
      direction.copy(end).sub(coreVector).normalize();
      const start = curve.v0.set(
        corePosition[0] + direction.x * coreRadius * 0.76,
        corePosition[1] + direction.y * coreRadius * 0.76 + coreRadius * 0.05,
        0.2,
      );
      curve.v1.copy(start).lerp(end, 0.52);
      curve.v1.y += Math.min(0.85, Math.abs(end.x - start.x) * 0.12);
      curve.v1.z += 0.36;
      for (let index = 0; index <= 72; index += 1) {
        curve.getPoint(index / 72, workPoint);
        const offset = index * 3;
        linePositions[offset] = workPoint.x;
        linePositions[offset + 1] = workPoint.y;
        linePositions[offset + 2] = workPoint.z;
      }
      broadRef.current.geometry.setPositions(linePositions);
      coreRef.current.geometry.setPositions(linePositions);
    }
    const progress = (state.clock.elapsedTime * 0.22) % 1;
    curve.getPoint(progress, pulseRef.current.position);
    curve.getTangent(progress, tangent);
    if (vesselRef.current) {
      const screenAngle = Math.atan2(-tangent.y, tangent.x) - Math.PI / 4;
      vesselRef.current.style.transform = `rotate(${screenAngle}rad)`;
    }
  });

  return (
    <group visible={active}>
      <Line
        ref={broadRef}
        points={points}
        color="#65e5ff"
        lineWidth={5.2}
        transparent
        opacity={0.12}
        depthWrite={false}
      />
      <Line
        ref={coreRef}
        points={points}
        color="#b9f5ff"
        lineWidth={1.6}
        transparent
        opacity={0.96}
        depthWrite={false}
      />
      <group ref={pulseRef}>
        <Html center zIndexRange={[12, 12]} style={{ pointerEvents: "none" }}>
          <span ref={vesselRef} className="energy-vessel" aria-hidden="true">
            <RocketLaunch size={23} weight="duotone" />
          </span>
        </Html>
      </group>
    </group>
  );
}

function buildLayout(width, height, domains) {
  const unit = Math.min(height, width / 1.48);
  const nodeRadius = unit * 0.05;
  const radiusScale = {
    "large-models": 1.28,
    "research-institutes": 0.9,
    "high-end-manufacturing": 1.08,
    "ocean-simulation": 1.04,
    internet: 1.1,
    aerospace: 0.92,
    "ai-for-science": 1.08,
  };
  const corePosition = [
    (GALAXY_SOURCE_CORE.x - 0.5) * width,
    (0.5 - GALAXY_SOURCE_CORE.y) * height,
    0,
  ];
  return {
    core: { position: corePosition, radius: unit * 0.153 },
    nodes: Object.fromEntries(domains.map((domain, index) => {
      const track = galaxyOrbitTrack(domain.orbitKey ?? domain.id);
      const phase = galaxyPortalPhase(domain.portal, { track });
      const [x, y, z] = galaxyTrackPoint(index, domains.length, width, height, 0, 0, { phase, track });
      return [domain.id, {
        position: [corePosition[0] + x, corePosition[1] + y, z],
        radius: nodeRadius * (radiusScale[domain.orbitKey ?? domain.id] ?? 1),
        index,
        phase,
        track,
      }];
    })),
  };
}

function GalaxyAssembly({ width, height, galaxyAngleRef, dragGuardRef, children }) {
  const groupRef = useRef(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const elevation = dragGuardRef.current?.elevation ?? 0;
    const drift = galaxyCoreDrift(galaxyAngleRef.current, elevation, {
      width,
      height,
      horizontalOffset: dragGuardRef.current?.coreOffset ?? 0,
      verticalOffset: dragGuardRef.current?.coreVerticalOffset ?? 0,
    });
    groupRef.current.position.set(drift[0], drift[1], drift[2]);
  });

  return <group ref={groupRef}>{children}</group>;
}

function OrbitWorld({
  domains,
  selectedId,
  onSelect,
  onCoreReset,
  galaxyAngleRef,
  dragGuardRef,
  showEnergyLink,
}) {
  const { gl, viewport } = useThree();
  const [earthMap, normalMap, cloudsMap] = useTexture([
    "/assets/earth-blue-2048.jpg",
    "/assets/earth-normal-2048.jpg",
    "/assets/earth-clouds-1024.png",
  ]);
  const layout = useMemo(
    () => buildLayout(viewport.width, viewport.height, domains),
    [domains, viewport.height, viewport.width],
  );
  const selected = layout.nodes[selectedId] ?? layout.nodes[domains[0].id];

  useEffect(() => {
    earthMap.colorSpace = THREE.SRGBColorSpace;
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    earthMap.anisotropy = anisotropy;
    normalMap.anisotropy = anisotropy;
    cloudsMap.anisotropy = anisotropy;
  }, [cloudsMap, earthMap, gl, normalMap]);

  const textures = { earthMap, normalMap, cloudsMap };
  const corePosition = layout.core.position;

  return (
    <>
      <ambientLight intensity={0.68} color="#86afff" />
      <directionalLight position={[-4, 6, 8]} intensity={2.7} color="#e8f7ff" />
      <pointLight position={[5, 1, 5]} intensity={42} distance={19} color="#267dff" />
      <pointLight position={[-6, -3, 4]} intensity={28} distance={17} color="#5bcfff" />
      <GestureCamera dragGuardRef={dragGuardRef} />
      <StarDust
        width={viewport.width}
        height={viewport.height}
        galaxyAngleRef={galaxyAngleRef}
        dragGuardRef={dragGuardRef}
      />

      <GalaxyAssembly
        width={viewport.width}
        height={viewport.height}
        galaxyAngleRef={galaxyAngleRef}
        dragGuardRef={dragGuardRef}
      >
        <OrbitLine
          center={corePosition}
          radiusX={viewport.width * 0.27}
          radiusY={viewport.height * 0.15}
          rotation={0.12}
          opacity={0.22}
          depth={0.34}
          tiltX={0.055}
          tiltY={-0.08}
          spinFactor={0.028}
          galaxyAngleRef={galaxyAngleRef}
          dragGuardRef={dragGuardRef}
        />
        <OrbitLine
          center={corePosition}
          radiusX={viewport.width * GALAXY_PRIMARY_TRACK.radiusX}
          radiusY={viewport.height * GALAXY_PRIMARY_TRACK.radiusY}
          rotation={0}
          opacity={0.4}
          lineWidth={1.08}
          depth={GALAXY_PRIMARY_TRACK.depth}
          tiltX={0}
          tiltY={0}
          spinFactor={0}
          galaxyAngleRef={galaxyAngleRef}
          dragGuardRef={dragGuardRef}
          lockToGalaxy
        />
        <OrbitLine
          center={corePosition}
          radiusX={viewport.width * GALAXY_OUTER_TRACK.radiusX}
          radiusY={viewport.height * GALAXY_OUTER_TRACK.radiusY}
          rotation={0}
          opacity={0.23}
          lineWidth={0.96}
          depth={GALAXY_OUTER_TRACK.depth}
          tiltX={0}
          tiltY={0}
          spinFactor={0}
          galaxyAngleRef={galaxyAngleRef}
          dragGuardRef={dragGuardRef}
          lockToGalaxy
        />

        {showEnergyLink ? (
          <EnergyLink
            corePosition={corePosition}
            coreRadius={layout.core.radius}
            targetIndex={selected.index}
            total={domains.length}
            phase={selected.phase}
            track={selected.track}
            width={viewport.width}
            height={viewport.height}
            galaxyAngleRef={galaxyAngleRef}
            dragGuardRef={dragGuardRef}
            active
          />
        ) : null}

        <CorePlanet
          position={layout.core.position}
          radius={layout.core.radius}
          textures={textures}
          onReset={onCoreReset}
          dragGuardRef={dragGuardRef}
        />

        {domains.map((domain) => {
          const item = layout.nodes[domain.id];
          return (
            <DomainPlanet
              key={domain.id}
              domain={domain}
              index={item.index}
              total={domains.length}
              phase={item.phase}
              track={item.track}
              corePosition={corePosition}
              radius={item.radius}
              textures={textures}
              active={domain.id === selectedId}
              onSelect={onSelect}
              galaxyAngleRef={galaxyAngleRef}
              dragGuardRef={dragGuardRef}
              viewport={viewport}
            />
          );
        })}
      </GalaxyAssembly>

      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.52}
          mipmapBlur
          radius={0.62}
        />
      </EffectComposer>
    </>
  );
}

export function OrbitScene({
  domains,
  selectedId,
  onSelect,
  onCoreReset,
  galaxyAngleRef,
  dragGuardRef,
  showEnergyLink = true,
}) {
  const fallbackAngleRef = useRef(0);
  const resolvedAngleRef = galaxyAngleRef ?? fallbackAngleRef;
  return (
    <div className="orbit-canvas" aria-hidden="false">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 12], fov: 40, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onPointerMissed={() => { document.body.style.cursor = "default"; }}
      >
        <Suspense fallback={null}>
          <OrbitWorld
            domains={domains}
            selectedId={selectedId}
            onSelect={onSelect}
            onCoreReset={onCoreReset}
            galaxyAngleRef={resolvedAngleRef}
            dragGuardRef={dragGuardRef}
            showEnergyLink={showEnergyLink}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
