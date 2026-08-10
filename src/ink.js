export function initInkEffect() {
  const canvas = document.querySelector("#ink-canvas");
  const hero = document.querySelector(".hero");

  const ctx = canvas.getContext("2d");

  let width;
  let height;

  let lastX = null;
  let lastY = null;

  let particles = [];

  function resize() {
    const rect = hero.getBoundingClientRect();

    const dpr = Math.min(window.devicePixelRatio, 2);

    width = rect.width;
    height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();

  window.addEventListener("resize", resize);

  class InkParticle {
    constructor(x, y, speed) {
      this.x = x;
      this.y = y;

      this.life = 1;

      this.radius =
        Math.random() * 20 +
        18 +
        Math.min(speed * 0.18, 25);

      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      this.radius += 0.12;

      this.life -= 0.012;
    }

    draw() {
      const gradient = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.radius
      );

      gradient.addColorStop(
        0,
        `rgba(0,0,0,${0.25 * this.life})`
      );

      gradient.addColorStop(
        0.45,
        `rgba(0,0,0,${0.16 * this.life})`
      );

      gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
      );

      ctx.fillStyle = gradient;

      ctx.beginPath();

      ctx.arc(
        this.x,
        this.y,
        this.radius,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }
  }

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (lastX === null || lastY === null) {
      lastX = x;
      lastY = y;

      return;
    }

    const dx = x - lastX;
    const dy = y - lastY;

    const speed = Math.sqrt(dx * dx + dy * dy);

    const distance = Math.sqrt(dx * dx + dy * dy);

    const steps = Math.max(
      1,
      Math.floor(distance / 8)
    );

    for (let i = 0; i < steps; i++) {
      const progress = i / steps;

      const px =
        lastX +
        (x - lastX) * progress;

      const py =
        lastY +
        (y - lastY) * progress;

      particles.push(
        new InkParticle(px, py, speed)
      );
    }

    lastX = x;
    lastY = y;
  });

  hero.addEventListener("pointerleave", () => {
    lastX = null;
    lastY = null;
  });

  function animate() {
    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    particles = particles.filter(
      (particle) => particle.life > 0
    );

    requestAnimationFrame(animate);
  }

  animate();
}