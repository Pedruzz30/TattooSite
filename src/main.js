import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initInk } from "./js/effects/ink.js";
import { initLiquidChrome } from "./js/effects/liquidchrome.js";

gsap.registerPlugin(ScrollTrigger);

// TESTE LiquidChrome: initInk() está desligado de propósito para medir
// só o custo do shader WebGL. As manchas do ink.js desenham por cima
// do canvas do chrome (mesmo z-index, depois no DOM) e somariam custo
// de CPU ao teste. Reativar assim que o teste terminar.
// initInk();

const heroLiquidContainer = document.querySelector(".hero");

if (heroLiquidContainer) {
  initLiquidChrome({
    container: heroLiquidContainer,
    baseColor: [0.1, 0.1, 0.1],
    speed: 0.3,
    amplitude: 0.3,
    interactive: true
  });
}

const prefersReducedMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  new URLSearchParams(window.location.search).has("reduced-motion");

const hero = document.querySelector(".hero");
const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

if (hero && hasFinePointer && !prefersReducedMotion) {
  let heroBounds = null;
  let animationFrame = null;
  let pointerInside = false;

  const currentLight = { x: 50, y: 46, strength: 0.16 };
  const targetLight = { x: 50, y: 46, strength: 0.16 };

  const clamp = (value, minimum, maximum) =>
    Math.min(Math.max(value, minimum), maximum);

  const renderInkLight = () => {
    const easing = pointerInside ? 0.1 : 0.055;

    currentLight.x += (targetLight.x - currentLight.x) * easing;
    currentLight.y += (targetLight.y - currentLight.y) * easing;
    currentLight.strength +=
      (targetLight.strength - currentLight.strength) * easing;

    hero.style.setProperty("--ink-light-x", `${currentLight.x.toFixed(2)}%`);
    hero.style.setProperty("--ink-light-y", `${currentLight.y.toFixed(2)}%`);
    hero.style.setProperty(
      "--ink-light-strength",
      currentLight.strength.toFixed(3)
    );

    const isSettling =
      Math.abs(targetLight.x - currentLight.x) > 0.02 ||
      Math.abs(targetLight.y - currentLight.y) > 0.02 ||
      Math.abs(targetLight.strength - currentLight.strength) > 0.002;

    animationFrame = isSettling
      ? requestAnimationFrame(renderInkLight)
      : null;
  };

  const requestInkLightFrame = () => {
    if (animationFrame === null) {
      animationFrame = requestAnimationFrame(renderInkLight);
    }
  };

  const updateInkLightTarget = (event) => {
    if (!heroBounds) {
      heroBounds = hero.getBoundingClientRect();
    }

    const cursorX = clamp(
      (event.clientX - heroBounds.left) / heroBounds.width,
      0,
      1
    );
    const cursorY = clamp(
      (event.clientY - heroBounds.top) / heroBounds.height,
      0,
      1
    );

    /*
     * O intervalo é intencionalmente curto: a luz muda de ângulo,
     * mas não se comporta como um spotlight seguindo o cursor.
     */
    targetLight.x = 42 + cursorX * 16;
    targetLight.y = 40 + cursorY * 12;
    targetLight.strength = 0.34;
    requestInkLightFrame();
  };

  hero.addEventListener("pointerenter", (event) => {
    pointerInside = true;
    heroBounds = hero.getBoundingClientRect();
    updateInkLightTarget(event);
  });

  hero.addEventListener("pointermove", updateInkLightTarget, { passive: true });

  hero.addEventListener("pointerleave", () => {
    pointerInside = false;
    targetLight.x = 50;
    targetLight.y = 46;
    targetLight.strength = 0.12;
    requestInkLightFrame();
  });

  window.addEventListener(
    "resize",
    () => {
      heroBounds = pointerInside ? hero.getBoundingClientRect() : null;
    },
    { passive: true }
  );
}

if (!prefersReducedMotion) {
  const intro = gsap.timeline({
    defaults: {
      ease: "power3.out"
    }
  });

  intro
    .from(".navbar", {
      y: -30,
      opacity: 0,
      duration: 1
    })
    .from(
      ".hero-title h1",
      {
        y: 100,
        opacity: 0,
        duration: 1.2
      },
      "-=0.5"
    )
    .from(
      ".hero-description",
      {
        y: 40,
        opacity: 0,
        duration: 0.8
      },
      "-=0.8"
    )
    .from(
      ".work-card",
      {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8
      },
      "-=0.7"
    );

  gsap.from(".machine-stage--work", {
    y: 120,
    opacity: 0,
    scale: 0.92,
    duration: 1.3,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".work-section",
      start: "top 72%",
      toggleActions: "play none none reverse"
    }
  });

  gsap.from(".work-head > *", {
    y: 44,
    opacity: 0,
    stagger: 0.12,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".work-head",
      start: "top 78%",
      toggleActions: "play none none reverse"
    }
  });

  /*
   * Cada peça revela sozinha: a máscara abre de baixo
   * para cima enquanto o card sobe.
   */
  gsap.utils.toArray(".work-tile").forEach((tile) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: tile,
          start: "top 86%",
          toggleActions: "play none none reverse"
        }
      })
      .from(tile.querySelector(".work-tile-media"), {
        clipPath: "inset(100% 0% 0% 0%)",
        duration: 1.15,
        ease: "power3.out"
      })
      .from(
        tile.querySelector(".work-tile-caption"),
        {
          y: 24,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out"
        },
        0.35
      );
  });

  const revealFrom = (target, trigger, vars = {}) =>
    gsap.from(target, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      ...vars,
      scrollTrigger: {
        trigger,
        start: "top 82%",
        toggleActions: "play none none reverse"
      }
    });

  revealFrom(".artist-head > *", ".artist-head", { stagger: 0.12 });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".artist-intro",
        start: "top 78%",
        toggleActions: "play none none reverse"
      }
    })
    .from(".artist-portrait-media", {
      clipPath: "inset(100% 0% 0% 0%)",
      duration: 1.15,
      ease: "power3.out"
    })
    .from(
      ".artist-portrait figcaption, .artist-bio > *",
      {
        y: 32,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out"
      },
      0.3
    );

  revealFrom(".process-step", ".process-list", { stagger: 0.12 });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".artist-studio",
        start: "top 78%",
        toggleActions: "play none none reverse"
      }
    })
    .from(".studio-media", {
      clipPath: "inset(0% 0% 0% 100%)",
      duration: 1.15,
      ease: "power3.out"
    })
    .from(
      ".studio-info > *",
      {
        y: 32,
        opacity: 0,
        stagger: 0.09,
        duration: 0.8,
        ease: "power3.out"
      },
      0.25
    );

  revealFrom(".artist-social li", ".artist-social ul", {
    y: 28,
    stagger: 0.08
  });

  revealFrom(".contact-head > *", ".contact-head", { stagger: 0.12 });
  revealFrom(".contact-form > *", ".contact-form", { y: 30, stagger: 0.07 });
  revealFrom(".contact-note", ".contact-aside", { stagger: 0.14 });

  revealFrom(".footer-column", ".footer-columns", { y: 32, stagger: 0.1 });

  gsap.from(".footer-wordmark", {
    yPercent: 40,
    opacity: 0,
    duration: 1.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".footer-wordmark",
      start: "top 95%",
      toggleActions: "play none none reverse"
    }
  });

  gsap.to(".hero-title", {
    yPercent: -30,
    opacity: 0,
    scrollTrigger: {
      trigger: ".hero",
      start: "35% top",
      end: "bottom top",
      scrub: true
    }
  });

  const machineSection = document.querySelector(".work-section");
  const machineVisual = document.querySelector(".machine-visual");

  if (machineSection && machineVisual) {
    const compactViewport = window.matchMedia("(max-width: 620px)");
    const current = { x: 0, y: 0, rotation: 0 };
    const target = { x: 0, y: 0, rotation: 0 };
    let animationFrame = null;

    const renderMachineParallax = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      current.rotation += (target.rotation - current.rotation) * 0.08;

      machineVisual.style.setProperty("--machine-x", `${current.x.toFixed(2)}px`);
      machineVisual.style.setProperty("--machine-y", `${current.y.toFixed(2)}px`);
      machineVisual.style.setProperty(
        "--machine-rotation",
        `${current.rotation.toFixed(2)}deg`
      );

      const isMoving =
        Math.abs(target.x - current.x) > 0.02 ||
        Math.abs(target.y - current.y) > 0.02 ||
        Math.abs(target.rotation - current.rotation) > 0.01;

      animationFrame = isMoving
        ? requestAnimationFrame(renderMachineParallax)
        : null;
    };

    const requestParallaxFrame = () => {
      if (animationFrame === null) {
        animationFrame = requestAnimationFrame(renderMachineParallax);
      }
    };

    machineSection.addEventListener(
      "pointermove",
      (event) => {
        const bounds = machineSection.getBoundingClientRect();
        const horizontal = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        const vertical = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
        const movement = compactViewport.matches
          ? { x: 4, y: 3, rotation: 0.5 }
          : { x: 10, y: 7, rotation: 1.5 };

        target.x = horizontal * movement.x;
        target.y = vertical * movement.y;
        target.rotation =
          horizontal * movement.rotation * 0.8 +
          vertical * movement.rotation * 0.2;
        requestParallaxFrame();
      },
      { passive: true }
    );

    machineSection.addEventListener("pointerleave", () => {
      target.x = 0;
      target.y = 0;
      target.rotation = 0;
      requestParallaxFrame();
    });
  }
}
