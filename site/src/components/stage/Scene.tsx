"use client";

import { Suspense, useLayoutEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, MeshReflectorMaterial, OrbitControls, SoftShadows, SpotLight, useGLTF, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, Vignette } from "@react-three/postprocessing";
import { Color, MeshBasicMaterial, SRGBColorSpace, type Mesh, type Object3D, type PerspectiveCamera, type Texture } from "three";

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

// Portrait screens give the model its own band, so it is framed centred there.
const targetFor = (aspect: number): [number, number, number] =>
  aspect >= 1 ? [...CAMERA.target] : [0.1, 0.6, -0.2];

// three.js objects are imperative; framing and texture setup live outside components.
function frame(camera: PerspectiveCamera, aspect: number) {
  camera.filmGauge = 36;
  if (aspect >= 1) {
    // Desktop: the model holds the right two thirds, leaving the left for the headline.
    camera.position.set(...CAMERA.position);
    camera.setFocalLength(CAMERA.focalLength);
    camera.filmOffset = CAMERA.filmOffset;
  } else {
    // Portrait: pull back and centre so the whole plinth fits its band below the copy.
    camera.position.set(-4.2, 3.8, 8.6);
    camera.setFocalLength(34);
    camera.filmOffset = 0;
  }
  camera.lookAt(...targetFor(aspect));
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

function Rig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const aspect = useThree((s) => s.size.width / s.size.height);
  useLayoutEffect(() => frame(camera, aspect), [camera, aspect]);
  return (
    <OrbitControls
      target={targetFor(aspect)}
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

export default function Scene({ placards }: { placards: Placard[] }) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} camera={{ near: 0.1, far: 60 }}>
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
        {/* The storefront glows from inside, like the lit shop in the comp. */}
        <pointLight position={[-1.45, 0.22, -0.15]} intensity={1.6} distance={1.4} color="#ffcf9a" />
        <Maquette />
        <Gallery />
        <Placards placards={placards} />
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
