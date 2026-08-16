import * as THREE from "three";

/*
 * Fundo do hero com shader de fluido rodando na GPU.
 *
 * Diferente das tentativas anteriores (canvas 2D com respingos,
 * filtro SVG feDisplacementMap na imagem), este efeito não toca a
 * imagem PNG da onda de tinta nem processa pixels na CPU — ele
 * substitui só o background estático do .hero por uma textura
 * gerada matematicamente (fractal brownian motion) que roda inteira
 * na GPU via fragment shader. A imagem da onda continua por cima,
 * intocada.
 *
 * Ativado só com pointer fino (mouse) e sem prefers-reduced-motion,
 * mesmo critério usado no resto do hero.
 */
export function initFluidBackground() {
  const hero = document.querySelector(".hero");

  if (!hero) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) return;

  const canvas = document.createElement("canvas");
  canvas.className = "hero-fluid-canvas";
  hero.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: "low-power"
  });

  const dpr = Math.min(window.devicePixelRatio || 1, 1);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    precision lowp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uMouseStrength;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float smoothNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 2; i++) {
        v += amp * smoothNoise(p);
        p *= 2.0;
        amp *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = vUv;

      float dist = length(uv - uMouse);
      float ripple = uMouseStrength * exp(-dist * 3.0) * 0.3;

      vec2 flow = uv * 2.6 + vec2(uTime * 0.02, uTime * 0.015) + ripple;

      float n = fbm(flow);

      vec3 colorDark = vec3(0.133, 0.137, 0.121);
      vec3 colorLight = vec3(0.271, 0.275, 0.251);

      vec3 color = mix(colorDark, colorLight, n);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uMouseStrength: { value: 0 }
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  function resize() {
    const rect = hero.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });

  /*
   * Interação com o mouse, com throttle: atualiza a posição alvo no
   * máximo a cada 50ms (20x/s) em vez de a cada pointermove — o
   * shader já suaviza visualmente, então não perde fluidez, e evita
   * disparar trabalho a uma taxa maior que a tela consegue desenhar.
   */
  let heroBounds = null;
  let targetStrength = 0;
  let currentStrength = 0;
  let lastMouseUpdate = 0;
  const mouseUpdateInterval = 50;

  hero.addEventListener("pointerenter", () => {
    heroBounds = hero.getBoundingClientRect();
    targetStrength = 1;
  });

  hero.addEventListener(
    "pointermove",
    (event) => {
      const now = performance.now();
      if (now - lastMouseUpdate < mouseUpdateInterval) return;
      lastMouseUpdate = now;

      if (!heroBounds) heroBounds = hero.getBoundingClientRect();
      const x = (event.clientX - heroBounds.left) / heroBounds.width;
      const y = 1 - (event.clientY - heroBounds.top) / heroBounds.height;
      uniforms.uMouse.value.set(x, y);
    },
    { passive: true }
  );

  hero.addEventListener("pointerleave", () => {
    targetStrength = 0;
  });

  let frameId = null;
  let time = 0;

  function animate() {
    time += 0.008;
    uniforms.uTime.value = time;

    currentStrength += (targetStrength - currentStrength) * 0.05;
    uniforms.uMouseStrength.value = currentStrength;

    renderer.render(scene, camera);
    frameId = requestAnimationFrame(animate);
  }

  frameId = requestAnimationFrame(animate);

  /*
   * Pausa o loop quando a aba não está visível — evita gasto de
   * GPU/bateria à toa em segundo plano.
   */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    } else if (frameId === null) {
      frameId = requestAnimationFrame(animate);
    }
  });
}