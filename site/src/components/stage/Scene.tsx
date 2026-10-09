"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, MeshReflectorMaterial, OrbitControls, SoftShadows, SpotLight, useGLTF, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, Vignette } from "@react-three/postprocessing";
import { Color, MathUtils, MeshBasicMaterial, SRGBColorSpace, type Group, type Mesh, type Object3D, type PerspectiveCamera, type Texture } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import styles from "./ModelStage.module.css";

export type Placard = { id: string; title: string; caption: string };

const MODEL = "/models/maquette.glb";
const DRACO = "/draco/";

// Each screen on the model shows the real product it stands for.
const SCREENS: Record<string, string> = {
  Screen_MojKolega: "/work/mojkolega-card.jpg",
  Screen_Bridj: "/work/bridj-stack.jpg",
  Screen_AirLaser: "/work/airlaser-wire.jpg",
};

// The hero camera, framed to the approved comp: the whole plinth on the floor, seen from front-left.
const CAMERA = { position: [-1.8, 1.75, 9.6] as const, target: [0.25, 0.95, 0] as const, focalLength: 42, filmOffset: -5.2 };

// Portrait viewports give the model its own band below the copy, framed centred there.
const isPortrait = () => typeof window !== "undefined" && window.matchMedia("(max-aspect-ratio: 1/1)").matches;
const targetFor = (portrait: boolean): [number, number, number] => (portrait ? [0.15, 0.55, -0.1] : [...CAMERA.target]);

// three.js objects are imperative; framing and texture setup live outside components.
function frame(camera: PerspectiveCamera, aspect: number, portrait: boolean) {
  camera.filmGauge = 36;
  if (!portrait) {
    // Desktop: the model holds the right two thirds, leaving the left for the headline.
    camera.position.set(...CAMERA.position);
    camera.setFocalLength(CAMERA.focalLength);
    camera.filmOffset = CAMERA.filmOffset;
  } else {
    // Portrait: pull back and centre so the whole plinth fits its band below the copy.
    // Wider bands (tablets) zoom in so the plinth still fills the width.
    camera.position.set(-2.7, 2.7, 6.4);
    camera.setFocalLength(30 * Math.max(1, aspect * 0.72));
    camera.filmOffset = 0;
  }
  camera.lookAt(...targetFor(portrait));
  camera.updateProjectionMatrix();
}

function prepare(root: Object3D, textures: Record<string, Texture>) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const map = textures[mesh.name];
    if (map) {
      map.flipY = false; // glTF UV convention
      map.colorSpace = SRGBColorSpace;
      map.needsUpdate = true;
      map.anisotropy = 8;
      // Lit screens: unlit, untoned and pushed just past white so bloom gives them a glow.
      mesh.material = new MeshBasicMaterial({ map, toneMapped: false, color: new Color(1.25, 1.25, 1.25) });
    }
  });
  return root;
}

// Scroll progress through the hero, 0 at the top and 1 once it has scrolled away.
const motion = { progress: 0, reduced: false };

function useHeroScroll() {
  useEffect(() => {
    motion.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      motion.progress = MathUtils.clamp(window.scrollY / window.innerHeight, 0, 1);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

function lean(group: Group, delta: number, elapsed: number) {
  if (motion.reduced) return;
  // Enter the model: as the hero scrolls away, the whole room leans in towards the visitor.
  const e = smoothstep(motion.progress);
  // Arrival: the model settles into place once, in the first 1.6s.
  const intro = easeOutCubic(MathUtils.clamp(elapsed / 1.6, 0, 1));
  const k = 1 - Math.exp(-delta * 6);
  group.position.x = MathUtils.lerp(group.position.x, -0.45 * e, k);
  group.position.y = MathUtils.lerp(group.position.y, -0.3 * e - 0.35 * (1 - intro), k);
  group.position.z = MathUtils.lerp(group.position.z, 2.6 * e, k);
  group.rotation.y = MathUtils.lerp(group.rotation.y, 0.14 * e, k);
  const scale = 0.94 + 0.06 * intro;
  group.scale.setScalar(MathUtils.lerp(group.scale.x, scale, k));
}

function Dolly({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null);
  useHeroScroll();
  useFrame((state, delta) => {
    if (group.current) lean(group.current, delta, state.clock.elapsedTime);
  });
  return <group ref={group}>{children}</group>;
}

function Rig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const aspect = useThree((s) => s.size.width / s.size.height);
  const controls = useRef<OrbitControlsImpl>(null);
  const portrait = isPortrait();
  useLayoutEffect(() => frame(camera, aspect, portrait), [camera, aspect, portrait]);
  // Orbiting belongs to the resting hero; once the visitor scrolls, the scroll drives.
  useFrame(() => {
    if (controls.current) controls.current.enabled = motion.progress < 0.02;
  });
  return (
    <OrbitControls
      ref={controls}
      target={targetFor(portrait)}
      enablePan={false}
      enableZoom={false}
      enableDamping
      minPolarAngle={Math.PI / 3.4}
      maxPolarAngle={Math.PI / 2.3}
      minAzimuthAngle={-Math.PI / 2.6}
      maxAzimuthAngle={Math.PI / 12}
    />
  );
}

function Maquette() {
  const { scene } = useGLTF(MODEL, DRACO);
  const textures = useTexture(SCREENS) as Record<string, Texture>;

  const model = useMemo(() => prepare(scene.clone(true), textures), [scene, textures]);

  return <primitive object={model} />;
}

// Placards lie on the plinth in front of each model, tilted towards the visitor.
// The camera sits front-left, so placards shift right of each model to read as in front of it.
const PLACARD_X: Record<string, number> = { "moj-kolega": -0.9, bridj: 0.55, "air-laser": 1.95 };

function Placards({ placards }: { placards: Placard[] }) {
  return (
    <>
      {placards.map((p) => (
        <Html
          key={p.id}
          transform
          distanceFactor={1.6}
          position={[PLACARD_X[p.id] ?? 0, 0.09, 0.82]}
          rotation={[-0.25, 0, 0]}
          zIndexRange={[1, 0]}
        >
          <div className={styles.placard}>
            <span className={styles.placardTitle}>{p.title}</span>
            <span className={styles.placardCaption}>{p.caption}</span>
          </div>
        </Html>
      ))}
    </>
  );
}

function Gallery() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          resolution={512}
          blur={[400, 120]}
          mixBlur={1}
          mixStrength={1.2}
          roughness={0.85}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0b0b0d"
          metalness={0.4}
          mirror={0}
        />
      </mesh>
      <mesh position={[0, 3, -3.2]} receiveShadow>
        <planeGeometry args={[40, 10]} />
        <meshStandardMaterial color="#1e1b18" roughness={0.95} />
      </mesh>
    </>
  );
}

export default function Scene({ placards, active }: { placards: Placard[]; active: boolean }) {
  return (
    <Canvas frameloop={active ? "always" : "never"} shadows dpr={[1, 2]} gl={{ antialias: true }} camera={{ near: 0.1, far: 60 }}>
      <color attach="background" args={["#0e0f12"]} />
      <Rig />
      <SoftShadows size={18} samples={12} focus={0.6} />
      <ambientLight intensity={0.05} />
      {/* The gallery key: a warm beam raking in from the upper right, visible in the air. */}
      <SpotLight
        position={[4.5, 5.5, 2.5]}
        angle={0.62}
        penumbra={0.8}
        intensity={420}
        decay={2}
        color="#ffd2a6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        volumetric
        distance={11}
        attenuation={7}
        anglePower={5}
        radiusTop={0.1}
        radiusBottom={2.2}
        opacity={0.1}
      />
      {/* Soft studio bounce from authored light panels; nothing is downloaded. */}
      <Environment resolution={256} environmentIntensity={0.22}>
        <Lightformer form="rect" intensity={2.2} color="#ffd9b0" position={[4, 4, 3]} scale={[4, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.5} color="#9aa6c8" position={[-5, 2, 2]} scale={[3, 3, 1]} target={[0, 0, 0]} />
      </Environment>
      <Suspense fallback={null}>
        <Dolly>
          {/* The storefront glows from inside, like the lit shop in the comp. */}
          <pointLight position={[-1.45, 0.22, -0.15]} intensity={1.6} distance={1.4} color="#ffcf9a" />
          <Maquette />
          <Gallery />
          <Placards placards={placards} />
        </Dolly>
      </Suspense>
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <N8AO quality="medium" halfRes aoRadius={0.45} distanceFalloff={0.6} intensity={2.4} color="#000000" />
        <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.55} />
        <Vignette offset={0.32} darkness={0.55} />
      </EffectComposer>
    </Canvas>
  );
}

useGLTF.preload(MODEL, DRACO);
