
/*
 * Efeito de tinta do hero, em duas camadas:
 *
 * 1. Manchas ambientais — se movem sozinhas, devagar, dando
 *    profundidade ao fundo mesmo sem interação nenhuma.
 * 2. Respingos de mouse — reagem ao movimento do cursor,
 *    recompensando quem interage.
 *
 * As duas camadas rodam no mesmo canvas e no mesmo loop de
 * animação, então o custo de performance é de um único
 * requestAnimationFrame, não dois.
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
   * Camada 1 — manchas ambientais.
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
 
  /*
   * Camada 2 — respingos de mouse.
   * Só é ativada em dispositivos com ponteiro fino (mouse real);
   * em touch não faz sentido e evita gasto de bateria à toa.
   */
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  const drops = [];
 
  let mouseX = 0;
  let mouseY = 0;
  let previousX = 0;
  let previousY = 0;
  let pointerInside = false;
 
  class InkDrop {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.life = 1;
      this.growth = Math.random() * 0.35 + 0.15;
      this.xSpeed = (Math.random() - 0.5) * 0.25;
      this.ySpeed = (Math.random() - 0.5) * 0.25;
      this.opacity = Math.random() * 0.12 + 0.16;
      this.stretchX = Math.random() * 0.8 + 0.7;
      this.stretchY = Math.random() * 0.8 + 0.7;
    }
 
    update() {
      this.x += this.xSpeed;
      this.y += this.ySpeed;
      this.size += this.growth;
      this.life -= 0.0045;
    }
 
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.stretchX, this.stretchY);
 
      const gradient = ctx.createRadialGradient(
        0,
        0,
        this.size * 0.05,
        0,
        0,
        this.size
      );
 
      gradient.addColorStop(0, `rgba(0,0,0,${this.opacity * this.life})`);
      gradient.addColorStop(
        0.55,
        `rgba(0,0,0,${this.opacity * 0.9 * this.life})`
      );
      gradient.addColorStop(
        0.82,
        `rgba(0,0,0,${this.opacity * 0.4 * this.life})`
      );
      gradient.addColorStop(1, "rgba(0,0,0,0)");
 
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
 
  function createInkTrail(x, y, speed) {
    const amount = Math.min(Math.floor(speed / 4) + 1, 5);
 
    for (let i = 0; i < amount; i++) {
      const offsetX = (Math.random() - 0.5) * 22;
      const offsetY = (Math.random() - 0.5) * 22;
      const size = 35 + Math.random() * 40 + Math.min(speed * 0.6, 25);
 
      drops.push(new InkDrop(x + offsetX, y + offsetY, size));
    }
 
    // Pequenos respingos em movimentos rápidos.
    if (speed > 15 && Math.random() > 0.4) {
      const splashes = Math.floor(Math.random() * 3) + 1;
 
      for (let i = 0; i < splashes; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 55 + 15;
 
        drops.push(
          new InkDrop(
            x + Math.cos(angle) * distance,
            y + Math.sin(angle) * distance,
            Math.random() * 8 + 4
          )
        );
      }
    }
  }
 
  if (hasFinePointer && !prefersReducedMotion) {
    hero.addEventListener("pointerenter", (event) => {
      const rect = hero.getBoundingClientRect();
 
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
      previousX = mouseX;
      previousY = mouseY;
      pointerInside = true;
    });
 
    hero.addEventListener("pointermove", (event) => {
      if (!pointerInside) return;
 
      const rect = hero.getBoundingClientRect();
 
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
 
      const dx = mouseX - previousX;
      const dy = mouseY - previousY;
      const distance = Math.sqrt(dx * dx + dy * dy);
 
      // Interpola o caminho para não deixar buracos com movimento rápido.
      const steps = Math.max(1, Math.floor(distance / 10));
 
      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const x = previousX + (mouseX - previousX) * progress;
        const y = previousY + (mouseY - previousY) * progress;
 
        createInkTrail(x, y, distance);
      }
 
      previousX = mouseX;
      previousY = mouseY;
    });
 
    hero.addEventListener("pointerleave", () => {
      pointerInside = false;
    });
  }
 
  function drawSplashLayer() {
    if (drops.length === 0) return;
 
    ctx.save();
    ctx.filter = "blur(5px)";
 
    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
 
      drop.update();
      drop.draw();
 
      if (drop.life <= 0) {
        drops.splice(i, 1);
      }
    }
 
    ctx.restore();
  }
 
  let animationFrame = null;
 
  function animate(time) {
    ctx.clearRect(0, 0, width, height);
 
    if (!prefersReducedMotion) {
      drawAmbientLayer(time);
    }
 
    drawSplashLayer();
 
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