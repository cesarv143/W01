/*
 * Para ti — experiencia 3D de partículas.
 * Three.js integrado con React Three Fiber (sin JSX: usamos htm).
 * Todo el render ocurre en el cliente (sin SSR del lienzo).
 * Máquina de estados: 'cover' -> 'travel' -> 'reveal' -> 'final'.
 */
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import htm from 'htm';

const html = htm.bind(React.createElement);
const { damp, lerp, clamp } = THREE.MathUtils;

/* ======================================================================
 *  PERSONALIZA AQUÍ — palabras / cualidades que flotan junto a la galaxia
 *  y el mensaje principal de cumpleaños. Cambia estos textos libremente.
 * ==================================================================== */
const BIRTHDAY_MESSAGE = 'Feliz cumpleaños linda';
const WORDS = [
  'Hermosa', 'Inteligente', 'Valiente', 'Bondadosa',
  'Radiante', 'Divertida', 'Soñadora', 'Única',
];

/* --- Textura de brillo generada matemáticamente (sin recursos externos) --- */
function makeGlowTexture() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0.0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.3)');
  g.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/* --- Cantidad y tamaño de partículas adaptados a móvil / escritorio --- */
function adaptiveCounts() {
  const w = window.innerWidth;
  const mobile = w < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  if (mobile) {
    return { stars: 900, galaxy: 6000, heart: 1600,
             starSize: 0.55, galSize: 0.11, heartSize: 0.13, dpr: [1, 1.6], mobile: true };
  }
  return { stars: 1800, galaxy: 14000, heart: 3200,
           starSize: 0.4, galSize: 0.08, heartSize: 0.1, dpr: [1, 2], mobile: false };
}

/* --- Campo de estrellas / túnel --- */
function starGeometry(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [new THREE.Color('#ffffff'), new THREE.Color('#ff8fc7'), new THREE.Color('#b39dff')];
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const rad = 1.5 + Math.random() * 9;
    positions[i * 3] = Math.cos(ang) * rad;
    positions[i * 3 + 1] = Math.sin(ang) * rad;
    positions[i * 3 + 2] = -Math.random() * 220;
    const col = palette[(Math.random() * palette.length) | 0];
    colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
  }
  return { positions, colors };
}

/* --- Galaxia espiral --- */
function galaxyGeometry(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const arms = 5, radius = 10, spin = 1.1, randomness = 0.32, pow = 2.6;
  const inside = new THREE.Color('#fff4ff');
  const mid = new THREE.Color('#ff5fa2');
  const outside = new THREE.Color('#8a5cff');
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 1.6) * radius;
    const armAngle = ((i % arms) / arms) * Math.PI * 2;
    const spinAngle = r * spin;
    const sign = () => (Math.random() < 0.5 ? 1 : -1);
    const rx = Math.pow(Math.random(), pow) * sign() * randomness * r;
    const ry = Math.pow(Math.random(), pow) * sign() * randomness * r * 0.35;
    const rz = Math.pow(Math.random(), pow) * sign() * randomness * r;
    const a = armAngle + spinAngle;
    positions[i * 3] = Math.cos(a) * r + rx;
    positions[i * 3 + 1] = ry;
    positions[i * 3 + 2] = Math.sin(a) * r + rz;
    const col = inside.clone();
    const t = r / radius;
    if (t < 0.5) col.lerpColors(inside, mid, t / 0.5);
    else col.lerpColors(mid, outside, (t - 0.5) / 0.5);
    colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
  }
  return { positions, colors };
}

/* --- Corazón de partículas (curva paramétrica) elevado sobre la galaxia --- */
function heartGeometry(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scale = 0.16, yOffset = 6.0;
  const pink = new THREE.Color('#ff4d8d');
  const white = new THREE.Color('#ffe0ec');
  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const fill = Math.pow(Math.random(), 0.5); // sesgo hacia el borde
    let x = 16 * Math.pow(Math.sin(t), 3);
    let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    x *= fill; y *= fill;
    positions[i * 3] = x * scale;
    positions[i * 3 + 1] = y * scale + yOffset;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
    const col = white.clone().lerp(pink, Math.random());
    colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
  }
  return { positions, colors };
}
/* --- Objetivos de cámara por estado --- */
const camTargets = {
  cover:  { pos: [0, 0, 18],  look: [0, 0, 0] },
  travel: { pos: [0, 0, 10],  look: [0, 0, 0] },
  reveal: { pos: [0, 5, 17],  look: [0, 2.3, 0] },
};

/* --- Escena: estrellas + galaxia + corazón, animadas por useFrame --- */
function Experience({ phase, counts }) {
  const { camera } = useThree();
  const starsRef = useRef();
  const galaxyRef = useRef();
  const heartRef = useRef();
  const coreRef = useRef();
  const wordsRef = useRef();
  const phaseRef = useRef(phase);
  const tStart = useRef(0);
  const lookRef = useRef(new THREE.Vector3(0, 0, 0));

  const glow = useMemo(makeGlowTexture, []);
  const star = useMemo(() => starGeometry(counts.stars), [counts]);
  const gal = useMemo(() => galaxyGeometry(counts.galaxy), [counts]);
  const hrt = useMemo(() => heartGeometry(counts.heart), [counts]);

  useEffect(() => {
    phaseRef.current = phase;
    tStart.current = performance.now() / 1000;
  }, [phase]);

  useFrame((state, dRaw) => {
    const t = state.clock.getElapsedTime();
    const delta = Math.min(dRaw, 0.05);
    const ph = phaseRef.current;
    const local = (performance.now() / 1000) - tStart.current;

    // Estrellas / túnel espacial
    const stars = starsRef.current;
    if (stars) {
      let speed = 3;
      if (ph === 'travel') speed = lerp(10, 170, clamp(local / 1.0, 0, 1));
      else if (ph === 'reveal') speed = lerp(120, 6, clamp(local / 1.5, 0, 1));
      else if (ph === 'final') speed = 4;
      const pos = stars.geometry.attributes.position.array;
      for (let i = 2; i < pos.length; i += 3) {
        pos[i] += speed * delta;
        if (pos[i] > 22) pos[i] -= 230;
      }
      stars.geometry.attributes.position.needsUpdate = true;
      const op = ph === 'travel' ? 1.0 : ph === 'reveal' ? 0.25 : ph === 'final' ? 0.18 : 0.9;
      stars.material.opacity = damp(stars.material.opacity, op, 3, delta);
      stars.rotation.z += delta * 0.02;
    }

    const show = ph === 'reveal' || ph === 'final';

    // Galaxia espiral
    const gx = galaxyRef.current;
    if (gx) {
      gx.rotation.y += delta * 0.06;
      const s = damp(gx.scale.x, show ? 1 : 0.15, 2.2, delta);
      gx.scale.setScalar(s);
      gx.children.forEach((ch) => {
        if (ch.material) ch.material.opacity = damp(ch.material.opacity, show ? 1 : 0, 2.5, delta);
      });
      if (coreRef.current) coreRef.current.scale.setScalar(2.6 + Math.sin(t * 2) * 0.35);
    }

    // Palabras flotantes girando lentamente alrededor de la galaxia
    if (wordsRef.current) wordsRef.current.rotation.y += delta * 0.05;

    // Corazón de partículas
    const hr = heartRef.current;
    if (hr) {
      hr.children.forEach((ch) => {
        if (ch.material) ch.material.opacity = damp(ch.material.opacity, show ? 1 : 0, 2.2, delta);
      });
      const sc = damp(hr.scale.x, show ? 1 : 0.3, 2.4, delta);
      hr.scale.setScalar(sc);
      hr.position.y = Math.sin(t * 0.8) * 0.3;
      hr.rotation.y += delta * 0.12;
    }

    // Cámara (controlada hasta que el usuario arrastra en 'final')
    if (ph !== 'final') {
      const tg = camTargets[ph] || camTargets.cover;
      camera.position.x = damp(camera.position.x, tg.pos[0], 2, delta);
      camera.position.y = damp(camera.position.y, tg.pos[1], 2, delta);
      camera.position.z = damp(camera.position.z, tg.pos[2], 2, delta);
      lookRef.current.x = damp(lookRef.current.x, tg.look[0], 2, delta);
      lookRef.current.y = damp(lookRef.current.y, tg.look[1], 2, delta);
      lookRef.current.z = damp(lookRef.current.z, tg.look[2], 2, delta);
      camera.lookAt(lookRef.current);
    }
  });

  const matProps = (size) => ({
    size, sizeAttenuation: true, map: glow, vertexColors: true,
    transparent: true, opacity: 0, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  });

  return html`
    <group>
      <points ref=${starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args=${[star.positions, 3]} />
          <bufferAttribute attach="attributes-color" args=${[star.colors, 3]} />
        <//>
        <pointsMaterial ...${matProps(counts.starSize)} />
      <//>

      <group ref=${galaxyRef} scale=${[0.15, 0.15, 0.15]}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args=${[gal.positions, 3]} />
            <bufferAttribute attach="attributes-color" args=${[gal.colors, 3]} />
          <//>
          <pointsMaterial ...${matProps(counts.galSize)} />
        <//>
        <sprite ref=${coreRef} scale=${[2.6, 2.6, 2.6]}>
          <spriteMaterial map=${glow} color=${'#ffe3f2'} transparent=${true} opacity=${0}
            depthWrite=${false} blending=${THREE.AdditiveBlending} toneMapped=${false} />
        <//>
      <//>

      ${html`<${Words} phase=${phase} />`}

      <group ref=${heartRef} scale=${[0.3, 0.3, 0.3]}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args=${[hrt.positions, 3]} />
            <bufferAttribute attach="attributes-color" args=${[hrt.colors, 3]} />
          <//>
          <pointsMaterial ...${matProps(counts.heartSize)} />
        <//>
      <//>
    <//>
  `;
}

/* --- Palabras-cualidad + mensaje de cumpleaños ancladas en 3D --- */
function Words({ phase }) {
  const show = phase === 'reveal' || phase === 'final';
  const groupRef = useRef();
  useFrame((_, dRaw) => {
    if (groupRef.current) groupRef.current.rotation.y += Math.min(dRaw, 0.05) * 0.05;
  });
  const items = WORDS.map((w, i) => {
    const ang = (i / WORDS.length) * Math.PI * 2;
    const radius = 8.2 + (i % 2 ? 1.1 : 0);
    const x = Math.cos(ang) * radius;
    const z = Math.sin(ang) * radius;
    const y = 0.6 + (i % 3) * 1.7;
    return html`
      <${Html} key=${i} position=${[x, y, z]} center distanceFactor=${14} zIndexRange=${[8, 0]}>
        <span class=${'galaxy-word' + (show ? ' show' : '')} style=${{ transitionDelay: (0.3 + i * 0.22) + 's' }}>${w}</span>
      <//>`;
  });
  return html`
    <group ref=${groupRef}>
      ${items}
      <${Html} position=${[0, 8.4, 0]} center distanceFactor=${16} zIndexRange=${[9, 0]}>
        <div class=${'birthday-title' + (show ? ' show' : '')}>${BIRTHDAY_MESSAGE}</div>
      <//>
    </group>
  `;
}

/* --- Portada (HTML sobre el lienzo) --- */
function Overlay({ phase, onStart }) {
  const hidden = phase !== 'cover';
  return html`
    <div class=${'overlay' + (hidden ? ' hidden' : '')}>
      <p class="eyebrow">Un universo hecho de luz</p>
      <h1 class="title">Para ti</h1>
      <p class="subtitle">Mi linda Nallely.</p>
      <button class="start-btn" onClick=${onStart} aria-label="Iniciar la animación">Iniciar el viaje</button>
    </div>
  `;
}

/* --- App: máquina de estados --- */
function App() {
  const [phase, setPhase] = useState('cover');
  const counts = useMemo(adaptiveCounts, []);

  const start = () => {
    setPhase('travel');
    setTimeout(() => setPhase('reveal'), 2600);
    setTimeout(() => setPhase('final'), 2600 + 3400);
  };

  return html`
    <${React.Fragment}>
      <${Canvas}
        camera=${{ position: [0, 0, 18], fov: 60, near: 0.1, far: 400 }}
        dpr=${counts.dpr}
        gl=${{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args=${['#000008']} />
        <fog attach="fog" args=${['#05000f', 32, 140]} />
        <${Experience} phase=${phase} counts=${counts} />
        ${phase === 'final' && html`
          <${OrbitControls}
            makeDefault enableDamping dampingFactor=${0.08}
            enablePan=${false} rotateSpeed=${0.6}
            target=${[0, 2.3, 0]} minDistance=${6} maxDistance=${44}
          />`}
      <//>
      <${Overlay} phase=${phase} onStart=${start} />
      <div class=${'hint' + (phase === 'final' ? ' show' : '')}>Arrastra para mirar alrededor</div>
    <//>
  `;
}

createRoot(document.getElementById('root')).render(html`<${App} />`);

