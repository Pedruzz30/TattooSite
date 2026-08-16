
/*
 * Efeito de tinta do hero: manchas ambientais que se movem
 * sozinhas, devagar, dando profundidade ao fundo sem depender
 * de interação nenhuma.
 *
 * Existia uma segunda camada de respingos que seguiam o mouse,
 * removida por travar a página: cada pointermove interpolava o
 * caminho em passos de 10px e criava até 5 gotas por passo, cada
 * uma viva por ~3,7s recriando um gradiente radial por quadro —
 * e tudo isso era desenhado sob ctx.filter = "blur(5px)", que é
 * altíssimo custo em canvas 2D. Se um dia voltar, o blur precisa
 * sair e as gotas precisam de teto de quantidade.
 */
export function initInk() {
  const hero = document.querySelector(".hero");
  const canvas = document.querySelector(".hero-ink-canvas");
 
  if (!hero || !canvas) return;
 
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
 
  const ctx = canvas.getContext("2d");
 
  let width = 0;
  let height = 0;
  let dpr = 1;
 
  function resize() {
    const rect = hero.getBoundingClientRect();
 
    width = rect.width;
    height = rect.height;
 
    dpr = Math.min(window.devicePixelRatio || 1, 2);
 
    canvas.width = width * dpr;
    canvas.height = height * dpr;
 
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
 
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
 
  /*
   * Manchas ambientais.
   * Posições em porcentagem da tela (0-100), assim continuam
   * proporcionais se a janela for redimensionada.
   */
  const ambientBlobCount = 4;
  const ambientBlobs = Array.from({ length: ambientBlobCount }, () => ({
    baseX: 15 + Math.random() * 70,
    baseY: 15 + Math.random() * 70,
    radiusRatio: 0.16 + Math.random() * 0.1,
    phase: Math.random() * Math.PI * 2,
    speed: 0.00018 + Math.random() * 0.00022,
    driftX: 0.12 + Math.random() * 0.1,
    driftY: 0.08 + Math.random() * 0.08,
    opacity: 0.05 + Math.random() * 0.04
  }));
 
  function drawAmbientLayer(time) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
 
    for (const blob of ambientBlobs) {
      const x =
        (blob.baseX / 100) * width +
        Math.sin(time * blob.speed + blob.phase) * width * blob.driftX;
      const y =
        (blob.baseY / 100) * height +
        Math.cos(time * blob.speed * 0.7 + blob.phase) * height * blob.driftY;
      const radius =
        Math.min(width, height) *
        blob.radiusRatio *
        (0.85 + 0.15 * Math.sin(time * blob.speed * 1.3 + blob.phase));
 
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(140,130,105,${blob.opacity})`);
      gradient.addColorStop(0.55, `rgba(90,85,65,${blob.opacity * 0.5})`);
      gradient.addColorStop(1, "rgba(90,85,65,0)");
 
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
 
    ctx.restore();
  }
 
  let animationFrame = null;
 
  function animate(time) {
    ctx.clearRect(0, 0, width, height);
 
    if (!prefersReducedMotion) {
      drawAmbientLayer(time);
    }
 
    animationFrame = requestAnimationFrame(animate);
  }
 
  window.addEventListener("resize", resize);
 
  resize();
 
  // Com prefers-reduced-motion, desenha só um quadro estático das
  // manchas (sem loop) em vez de nada: mantém a atmosfera visual
  // sem gastar ciclos de CPU com uma animação contínua.
  if (prefersReducedMotion) {
    drawAmbientLayer(0);
  } else {
    animationFrame = requestAnimationFrame(animate);
  }
}
