import "./style.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { initInkEffect } from "./ink";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  new URLSearchParams(window.location.search).has("reduced-motion");

if (!prefersReducedMotion) {
  initInkEffect();

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
      ".machine-stage",
      {
        y: 100,
        opacity: 0,
        scale: 0.9,
        duration: 1.3
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

  gsap.to(".machine-stage", {
    yPercent: 12,
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
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
}
