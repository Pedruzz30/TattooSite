import { Renderer, Program, Mesh, Triangle } from "ogl";
 
/*
 * Fundo do hero: shader "Liquid Chrome", portado do componente React
 * original da biblioteca React Bits (DavidHDev/react-bits, MIT,
 * https://github.com/DavidHDev/react-bits — src/content/Backgrounds/
 * LiquidChrome/LiquidChrome.jsx), com duas mudanças em cima do original:
 *
 * 1. Ciclo de vida adaptado de useEffect/cleanup do React para JS puro
 *    com destroy() explícito.
 * 2. O mapeamento de cor deixou de ser cromado e virou tinta — ver o
 *    comentário no fim de renderImage(). Toda a distorção do uv, que é
 *    o que produz o movimento líquido, continua igual à do original.
 *
 * As props do componente original viram parâmetros de initLiquidChrome:
 * baseColor, speed, amplitude, frequencyX, frequencyY, interactive.
 * inkColor é nosso, não existe no componente original.
 */
export function initLiquidChrome({
  container,
  baseColor = [0.133, 0.137, 0.121],
  inkColor = [0.02, 0.021, 0.018],
  speed = 0.2,
  amplitude = 0.3,
  frequencyX = 3,
  frequencyY = 3,
  interactive = true
} = {}) {
  if (!container) return null;
 
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
 
  if (prefersReducedMotion) return null;
 
  const renderer = new Renderer({ antialias: true });
  const gl = renderer.gl;
  gl.clearColor(1, 1, 1, 1);
 
  const vertexShader = `
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;
 
  const fragmentShader = `
    precision highp float;
    uniform float uTime;
    uniform vec3 uResolution;
    uniform vec3 uBaseColor;
    uniform vec3 uInkColor;
    uniform float uAmplitude;
    uniform float uFrequencyX;
    uniform float uFrequencyY;
    uniform vec2 uMouse;
    varying vec2 vUv;
 
    vec4 renderImage(vec2 uvCoord) {
        vec2 fragCoord = uvCoord * uResolution.xy;
        vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);
 
        for (float i = 1.0; i < 10.0; i++){
            uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
            uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
        }
 
        vec2 diff = (uvCoord - uMouse);
        float dist = length(diff);
        float falloff = exp(-dist * 20.0);
        float ripple = sin(10.0 * dist - uTime * 2.0) * 0.03;
        uv += (diff / (dist + 0.0001)) * ripple * falloff;
 
        /*
         * Aqui o original fazia uBaseColor / abs(sin(...)): uma divisão
         * que estoura para branco onde o seno tende a zero. Esse estouro
         * especular é o que lê como metal polido — tinta não faz isso.
         * Pigmento satura para o preto conforme concentra, então o mesmo
         * campo vira densidade de pigmento em vez de brilho.
         */
        float wave = abs(sin(uTime - uv.y - uv.x));

        // Os filamentos finos (wave -> 0) agora são onde a tinta adensa.
        // O expoente controla o quanto ela sangra para fora do filamento:
        // menor = mancha mais difusa, maior = traço mais definido.
        float pigment = pow(1.0 - wave, 2.6);

        // O fundo respira devagar entre os dois tons do gradiente do hero,
        // para o papel não ficar chapado atrás da tinta.
        float depth = 0.5 + 0.5 * sin(uv.x * 0.6 + uv.y * 0.4 - uTime * 0.5);
        vec3 ground = mix(uBaseColor, uBaseColor * 2.0, depth);

        vec3 color = mix(ground, uInkColor, pigment);
        return vec4(color, 1.0);
    }
 
    void main() {
        vec4 col = vec4(0.0);
        int samples = 0;
        for (int i = -1; i <= 1; i++){
            for (int j = -1; j <= 1; j++){
                vec2 offset = vec2(float(i), float(j)) * (1.0 / min(uResolution.x, uResolution.y));
                col += renderImage(vUv + offset);
                samples++;
            }
        }
        gl_FragColor = col / float(samples);
    }
  `;
 
  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uResolution: {
        value: new Float32Array([
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height
        ])
      },
      uBaseColor: { value: new Float32Array(baseColor) },
      uInkColor: { value: new Float32Array(inkColor) },
      uAmplitude: { value: amplitude },
      uFrequencyX: { value: frequencyX },
      uFrequencyY: { value: frequencyY },
      /*
       * Sem interação, o mouse é fixado longe da tela em vez de (0,0).
       * O shader aplica um ripple com falloff exp(-dist * 20.0) ao
       * redor de uMouse: parado em (0,0) ele cairia bem no canto
       * inferior esquerdo, pulsando com uTime — um artefato visível.
       * A 10 unidades de distância o falloff zera em toda a tela.
       *
       * O valor 10 não é arbitrário: uMouse entra nas ondas como
       * cos(... + uMouse.x * PI), e 10 * PI são exatamente 5 períodos
       * completos, então a fase do padrão fica idêntica à de (0,0).
       */
      uMouse: { value: new Float32Array(interactive ? [0, 0] : [10, 10]) }
    }
  });
  const mesh = new Mesh(gl, { geometry, program });
 
  function resize() {
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    const resUniform = program.uniforms.uResolution.value;
    resUniform[0] = gl.canvas.width;
    resUniform[1] = gl.canvas.height;
    resUniform[2] = gl.canvas.width / gl.canvas.height;
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();
 
  function handleMouseMove(event) {
    const rect = container.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1 - (event.clientY - rect.top) / rect.height;
    const mouseUniform = program.uniforms.uMouse.value;
    mouseUniform[0] = x;
    mouseUniform[1] = y;
  }
 
  function handleTouchMove(event) {
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      const rect = container.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width;
      const y = 1 - (touch.clientY - rect.top) / rect.height;
      const mouseUniform = program.uniforms.uMouse.value;
      mouseUniform[0] = x;
      mouseUniform[1] = y;
    }
  }
 
  if (interactive) {
    container.addEventListener("mousemove", handleMouseMove, {
      passive: true
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: true
    });
  }
 
  let animationId = null;
 
  function update(t) {
    animationId = requestAnimationFrame(update);
    program.uniforms.uTime.value = t * 0.001 * speed;
    renderer.render({ scene: mesh });
  }
 
  function handleVisibilityChange() {
    if (document.hidden) {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    } else if (animationId === null) {
      animationId = requestAnimationFrame(update);
    }
  }
 
  document.addEventListener("visibilitychange", handleVisibilityChange);
 
  animationId = requestAnimationFrame(update);
 
  gl.canvas.className = "hero-liquid-chrome-canvas";
  container.prepend(gl.canvas);
 
  function destroy() {
    if (animationId !== null) cancelAnimationFrame(animationId);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    if (interactive) {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("touchmove", handleTouchMove);
    }
    if (gl.canvas.parentElement) {
      gl.canvas.parentElement.removeChild(gl.canvas);
    }
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
 
  return { destroy };
}