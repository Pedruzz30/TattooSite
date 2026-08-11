const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector("#mobile-menu");

if (menuButton && mobileMenu) {
  const focusableSelector =
    'a[href]:not([aria-disabled="true"]), button:not([disabled])';

  const setMenu = (open, { restoreFocus = true } = {}) => {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    mobileMenu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";

    if (open) {
      mobileMenu.querySelector(focusableSelector)?.focus();
    } else if (restoreFocus) {
      menuButton.focus();
    }
  };

  menuButton.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  mobileMenu.addEventListener("click", (event) => {
    if (event.target.closest("a, .mobile-menu-close")) {
      setMenu(false, { restoreFocus: false });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (mobileMenu.hidden) return;

    if (event.key === "Escape") {
      setMenu(false);
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = [...mobileMenu.querySelectorAll(focusableSelector)];
    const first = focusable[0];
    const last = focusable.at(-1);

    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && !mobileMenu.hidden) {
      setMenu(false, { restoreFocus: false });
    }
  });
}

const sectionLinks = [
  ...document.querySelectorAll(
    '.nav-links a[href^="#"], .mobile-menu nav a[href^="#"]'
  )
];

const setActiveSection = (sectionId) => {
  sectionLinks.forEach((link) => {
    const active = link.hash === `#${sectionId}`;
    link.classList.toggle("active", active);

    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const observedSections = ["home", "work", "artist", "contact"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

if ("IntersectionObserver" in window && observedSections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (current) {
        setActiveSection(current.target.id);
      }
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: [0, 0.1, 0.25, 0.5]
    }
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll('a[href="#"]').forEach((link) => {
  link.setAttribute("aria-disabled", "true");
  link.addEventListener("click", (event) => event.preventDefault());
});

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  const status = contactForm.querySelector(".form-status");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      if (status) {
        status.dataset.state = "error";
        status.textContent = "Preencha os campos obrigatórios antes de enviar.";
      }

      contactForm.reportValidity();
      return;
    }

    if (status) {
      delete status.dataset.state;
      status.textContent =
        "Formulário validado — configure o canal de atendimento para concluir o envio.";
    }
  });
}
