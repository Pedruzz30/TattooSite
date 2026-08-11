export function initInk() {
  const hero = document.querySelector(".hero");
  const canvas = document.querySelector("#ink-canvas");

  if (!hero || !canvas) return;

  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let dpr = 1;

  let mouseX = 0;
  let mouseY = 0;

  let previousX = 0;
  let previousY = 0;

  let inside = false;

  const drops = [];

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

      ctx.scale(
        this.stretchX,
        this.stretchY
      );

      const gradient = ctx.createRadialGradient(
        0,
        0,
        this.size * 0.05,
        0,
        0,
        this.size
      );

      gradient.addColorStop(
        0,
        `rgba(0,0,0,${this.opacity * this.life})`
      );

      gradient.addColorStop(
        0.55,
        `rgba(0,0,0,${this.opacity * 0.9 * this.life})`
      );

      gradient.addColorStop(
        0.82,
        `rgba(0,0,0,${this.opacity * 0.4 * this.life})`
      );

      gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
      );

      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function createInkTrail(x, y, speed) {
    const amount = Math.min(
      Math.floor(speed / 4) + 1,
      5
    );

    for (let i = 0; i < amount; i++) {
      const offsetX = (Math.random() - 0.5) * 22;
      const offsetY = (Math.random() - 0.5) * 22;

      const size =
        35 +
        Math.random() * 40 +
        Math.min(speed * 0.6, 25);

      drops.push(
        new InkDrop(
          x + offsetX,
          y + offsetY,
          size
        )
      );
    }

    /*
     * Pequenos respingos.
     */
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

  hero.addEventListener("pointerenter", (event) => {
    const rect = hero.getBoundingClientRect();

    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    previousX = mouseX;
    previousY = mouseY;

    inside = true;
  });

  hero.addEventListener("pointermove", (event) => {
    if (!inside) return;

    const rect = hero.getBoundingClientRect();

    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    const dx = mouseX - previousX;
    const dy = mouseY - previousY;

    const distance = Math.sqrt(
      dx * dx + dy * dy
    );

    /*
     * Interpola o caminho.
     * Isso impede espaços entre as manchas
     * quando mexemos o mouse rápido.
     */
    const steps = Math.max(
      1,
      Math.floor(distance / 10)
    );

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;

      const x =
        previousX +
        (mouseX - previousX) * progress;

      const y =
        previousY +
        (mouseY - previousY) * progress;

      createInkTrail(
        x,
        y,
        distance
      );
    }

    previousX = mouseX;
    previousY = mouseY;
  });

  hero.addEventListener("pointerleave", () => {
    inside = false;
  });

  function animate() {
    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    /*
     * Blur dá a sensação das manchas
     * se fundindo umas nas outras.
     */
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

    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);

  resize();
  animate();
}
