const FOCUSABLE_SELECTOR =
  'a[href]:not([aria-disabled="true"]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const trapFocusWithin = (container, event) => {
  if (event.key !== "Tab") return;

  const focusable = [...container.querySelectorAll(FOCUSABLE_SELECTOR)];
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
};

const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector("#mobile-menu");

if (menuButton && mobileMenu) {
  const setMenu = (open, { restoreFocus = true } = {}) => {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    mobileMenu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";

    if (open) {
      mobileMenu.querySelector(FOCUSABLE_SELECTOR)?.focus();
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

    trapFocusWithin(mobileMenu, event);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && !mobileMenu.hidden) {
      setMenu(false, { restoreFocus: false });
    }
  });
}

/*
 * O Vite só reescreve caminhos de assets que estão no HTML ou em
 * new URL(..., import.meta.url). Caminhos soltos em string quebrariam
 * no build publicado, que roda sob a base "/TattooSite/".
 */

/*
 * Detecção de suporte a WebP: um canvas 1x1 exportado como WebP.
 * Roda uma única vez, de forma síncrona, e o resultado é reaproveitado
 * em toda a sessão — não é reavaliado a cada clique no lightbox.
 * Suportado por todo navegador relevante desde ~2020; o fallback
 * (supportsWebp === false) garante que navegadores antigos continuem
 * recebendo o PNG original sem quebrar nada.
 */
const supportsWebp = (() => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
})();

const projectImage = (fileName) => {
  const finalName = supportsWebp
    ? fileName.replace(/\.png$/i, ".webp")
    : fileName;

  return new URL(`../assets/tattooIMG/${finalName}`, import.meta.url).href;
};

const tattooProjects = {
  "work-01": {
    index: "01",
    title: "Serpente ornamental",
    style: "Blackwork",
    year: "2025",
    area: "Antebraço",
    image: projectImage("SerpenteOrnamental.png"),
    alt: "Tatuagem blackwork de serpente ornamental no antebraço",
    description:
      "Composição ornamental construída ao redor de uma serpente, com curvas fluidas e áreas densas de preto acompanhando o formato do antebraço."
  },
  "work-02": {
    index: "02",
    title: "Mapa do peito",
    style: "Blackwork",
    year: "2025",
    area: "Peito e ombro",
    image: projectImage("MapaPeito.png"),
    alt: "Tatuagem blackwork ornamental cobrindo peito e ombro",
    description:
      "Projeto ornamental desenvolvido para acompanhar a anatomia do tórax, combinando mandala central, linhas geométricas e áreas de preto sólido."
  },
  "work-03": {
    index: "03",
    title: "Retrato em cinza",
    style: "Realismo",
    year: "2024",
    area: "Coxa",
    image: projectImage("RetratoCinza.png"),
    alt: "Tatuagem realista em preto e cinza com retrato feminino",
    description:
      "Retrato em preto e cinza trabalhado com transições suaves, contraste controlado e atenção aos detalhes para preservar profundidade e expressão."
  },
  "work-04": {
    index: "04",
    title: "Linhas de mão",
    style: "Fine line",
    year: "2025",
    area: "Mão e punho",
    image: projectImage("LinhasMao.png"),
    alt: "Tatuagem fine line delicada na mão e no punho",
    description:
      "Projeto minimalista de traço fino, desenhado para seguir de forma delicada a anatomia da mão e do punho."
  },
  "work-05": {
    index: "05",
    title: "Fluxo orgânico",
    style: "Blackwork",
    year: "2025",
    area: "Costelas / lateral do torso",
    image: projectImage("AsaFechada.png"),
    alt: "Tatuagem blackwork orgânica acompanhando a lateral do torso",
    description:
      "Blackwork orgânico desenvolvido para acompanhar as curvas naturais do torso, alternando massas de preto e espaços negativos."
  },
  "work-06": {
    index: "06",
    title: "Braço completo",
    style: "Projeto autoral",
    year: "2025",
    area: "Braço completo",
    image: projectImage("FechamentoBraco.png"),
    alt: "Tatuagem autoral cobrindo o braço completo",
    description:
      "Composição fechada de manga inteira, desenvolvida para criar continuidade visual entre ombro, braço e antebraço."
  }
};

const projectLightbox = document.querySelector("[data-project-lightbox]");

if (projectLightbox) {
  const gallery = document.querySelector(".work-gallery");
  const closeButton = projectLightbox.querySelector("[data-lightbox-close]");
  const backdrop = projectLightbox.querySelector("[data-lightbox-backdrop]");
  const media = projectLightbox.querySelector("[data-lightbox-media]");
  const image = projectLightbox.querySelector("[data-lightbox-image]");
  const fields = {
    index: projectLightbox.querySelector("[data-lightbox-index]"),
    title: projectLightbox.querySelector("[data-lightbox-title]"),
    style: projectLightbox.querySelector("[data-lightbox-style]"),
    year: projectLightbox.querySelector("[data-lightbox-year]"),
    area: projectLightbox.querySelector("[data-lightbox-area]"),
    description: projectLightbox.querySelector("[data-lightbox-description]")
  };

  let opener = null;
  let previousBodyOverflow = "";

  const setProjectZoom = (zoomed) => {
    media.classList.toggle("is-zoomed", zoomed);
    media.setAttribute("aria-pressed", String(zoomed));
    media.setAttribute(
      "aria-label",
      zoomed ? "Reduzir imagem" : "Ampliar imagem"
    );
  };

  const setZoomOrigin = (x, y) => {
    media.style.setProperty("--zoom-origin-x", `${x}%`);
    media.style.setProperty("--zoom-origin-y", `${y}%`);
  };

  const getPointerOrigin = (event) => {
    const bounds = media.getBoundingClientRect();
    const toPercentage = (position, start, size) =>
      Math.min(100, Math.max(0, ((position - start) / size) * 100));

    return [
      toPercentage(event.clientX, bounds.left, bounds.width),
      toPercentage(event.clientY, bounds.top, bounds.height)
    ];
  };

  const resetProjectZoom = () => {
    setProjectZoom(false);
    setZoomOrigin(50, 50);
  };

  const populateProjectLightbox = (project) => {
    image.src = project.image;
    image.alt = project.alt;
    fields.index.textContent = `${project.index} / 06`;
    fields.title.textContent = project.title;
    fields.style.textContent = project.style;
    fields.year.textContent = project.year;
    fields.area.textContent = project.area;
    fields.description.textContent = project.description;
  };

  const openProjectLightbox = (projectId, trigger) => {
    const project = tattooProjects[projectId];

    if (!project) return;

    populateProjectLightbox(project);
    resetProjectZoom();
    opener = trigger;
    previousBodyOverflow = document.body.style.overflow;
    projectLightbox.hidden = false;
    projectLightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closeButton.focus();
  };

  const closeProjectLightbox = () => {
    if (projectLightbox.hidden) return;

    projectLightbox.classList.remove("is-open");
    projectLightbox.hidden = true;
    document.body.style.overflow = previousBodyOverflow;
    resetProjectZoom();

    const focusTarget = opener;
    opener = null;
    focusTarget?.focus();
  };

  gallery?.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-project]");

    if (!trigger) return;

    event.preventDefault();

    /*
     * A foto do tile é alvo de clique só para o mouse. Quem recebe o foco
     * de volta ao fechar é sempre o botão do tile — o único focável — para
     * o Tab não recomeçar do topo da página.
     */
    const focusTarget = trigger.matches(FOCUSABLE_SELECTOR)
      ? trigger
      : trigger.closest(".work-tile")?.querySelector(FOCUSABLE_SELECTOR);

    openProjectLightbox(trigger.dataset.project, focusTarget ?? null);
  });

  closeButton.addEventListener("click", closeProjectLightbox);
  backdrop.addEventListener("click", closeProjectLightbox);

  media.addEventListener("click", (event) => {
    const zoomIn = !media.classList.contains("is-zoomed");

    /*
     * Amplia no ponto clicado (ou tocado). Ativação por teclado não traz
     * coordenadas — detail é 0 — e mantém o centro da imagem.
     */
    if (zoomIn && event.detail > 0) {
      setZoomOrigin(...getPointerOrigin(event));
    }

    setProjectZoom(zoomIn);
  });

  // O arrasto do dedo já é tratado pelo próprio toque: só o mouse navega assim.
  media.addEventListener(
    "pointermove",
    (event) => {
      if (
        !media.classList.contains("is-zoomed") ||
        event.pointerType === "touch"
      ) {
        return;
      }

      setZoomOrigin(...getPointerOrigin(event));
    },
    { passive: true }
  );

  projectLightbox.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeProjectLightbox();
      return;
    }

    trapFocusWithin(projectLightbox, event);
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

// Configure aqui o número que receberá os pedidos: país + DDD + telefone.
const WHATSAPP_NUMBER = "5524999618982";
const FORM_DRAFT_KEY = "tattooFormDraft";
const FORM_DRAFT_UPDATED_AT_KEY = "tattooFormDraftUpdatedAt";
const FORM_CLEAR_AT_KEY = "tattooFormClearAt";
const WHATSAPP_COOLDOWN_KEY = "tattooWhatsAppCooldownUntil";
const COVERAGE_PROJECT_TYPE = "Cobertura";
const SUBMIT_LOCK_DURATION = 1500;
const FORM_CLEAR_DELAY = 2 * 60 * 1000;
const FORM_DRAFT_TTL = 48 * 60 * 60 * 1000;
const MIN_FORM_FILL_TIME = 3000;
const WHATSAPP_COOLDOWN = 30 * 1000;
const FORM_FIELD_LIMITS = {
  nome: 80,
  contato: 120,
  regiao: 100,
  tamanho: 80,
  tempoTatuagem: 80,
  ideia: 1500
};
let whatsappCooldownUntilInMemory = null;
const DRAFT_FIELD_SELECTOR = [
  'input[type="text"][name]:not([data-honeypot])',
  'input[type="email"][name]:not([data-honeypot])',
  'input[type="tel"][name]:not([data-honeypot])',
  'input[type="checkbox"][name]:not([data-honeypot])',
  'input[type="radio"][name]:not([data-honeypot])',
  "select[name]",
  "textarea[name]"
].join(",");

const getLimitedFormValue = (formData, fieldName) =>
  String(formData.get(fieldName) ?? "")
    .trim()
    .slice(0, FORM_FIELD_LIMITS[fieldName] ?? 0);

const getFormData = (form) => {
  const formData = new FormData(form);

  return {
    nome: getLimitedFormValue(formData, "nome"),
    tipoProjeto: String(formData.get("tipoProjeto") ?? "").trim(),
    contato: getLimitedFormValue(formData, "contato"),
    estilo: String(formData.get("estilo") ?? "").trim(),
    regiao: getLimitedFormValue(formData, "regiao"),
    tamanho: getLimitedFormValue(formData, "tamanho"),
    tempoTatuagem: getLimitedFormValue(formData, "tempoTatuagem"),
    ideia: getLimitedFormValue(formData, "ideia"),
    maioridade: formData.has("maioridade")
  };
};

const isHoneypotTriggered = (form) =>
  Boolean(form.querySelector("[data-honeypot]")?.value.trim());

const hasMinimumFillTimePassed = (formStartedAt) =>
  formStartedAt !== null && Date.now() - formStartedAt >= MIN_FORM_FILL_TIME;

const getWhatsAppCooldownUntil = () => {
  if (
    whatsappCooldownUntilInMemory !== null &&
    Date.now() < whatsappCooldownUntilInMemory
  ) {
    return whatsappCooldownUntilInMemory;
  }

  whatsappCooldownUntilInMemory = null;

  try {
    const savedCooldown = window.localStorage.getItem(WHATSAPP_COOLDOWN_KEY);

    if (savedCooldown === null) return null;

    const cooldownUntil = Number(savedCooldown);

    if (Number.isFinite(cooldownUntil) && Date.now() < cooldownUntil) {
      return cooldownUntil;
    }

    window.localStorage.removeItem(WHATSAPP_COOLDOWN_KEY);
  } catch {
    // Sem localStorage, a trava temporária do botão ainda limita cliques repetidos.
  }

  return null;
};

const isWhatsAppCooldownActive = () => getWhatsAppCooldownUntil() !== null;

const startWhatsAppCooldown = () => {
  const cooldownUntil = Date.now() + WHATSAPP_COOLDOWN;
  whatsappCooldownUntilInMemory = cooldownUntil;

  try {
    window.localStorage.setItem(
      WHATSAPP_COOLDOWN_KEY,
      String(cooldownUntil)
    );
  } catch {
    // Falhas de armazenamento não devem impedir a abertura do WhatsApp.
  }
};

const updateConditionalFields = (form) => {
  const projectTypeField = form.elements.namedItem("tipoProjeto");
  const coverageDetails = form.querySelector("#coverage-details");
  const tattooAgeField = form.elements.namedItem("tempoTatuagem");
  const isCoverage = projectTypeField?.value === COVERAGE_PROJECT_TYPE;

  if (coverageDetails) {
    coverageDetails.hidden = !isCoverage;
  }

  if (tattooAgeField) {
    tattooAgeField.disabled = !isCoverage;
    tattooAgeField.required = isCoverage;

    if (!isCoverage) {
      tattooAgeField.setCustomValidity("");
    }
  }
};

const saveFormDraft = (form) => {
  const draft = {};

  form.querySelectorAll(DRAFT_FIELD_SELECTOR).forEach((field) => {
    if (field.type === "checkbox") {
      draft[field.name] = field.checked;
      return;
    }

    if (field.type === "radio") {
      if (!Object.hasOwn(draft, field.name)) {
        draft[field.name] = null;
      }

      if (field.checked) {
        draft[field.name] = field.value;
      }

      return;
    }

    draft[field.name] = field.value;
  });

  try {
    window.localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(draft));
    window.localStorage.setItem(FORM_DRAFT_UPDATED_AT_KEY, String(Date.now()));
  } catch {
    // O formulário continua funcional quando o armazenamento está indisponível.
  }
};

const isDraftExpired = () => {
  try {
    const savedTimestamp = window.localStorage.getItem(
      FORM_DRAFT_UPDATED_AT_KEY
    );

    if (savedTimestamp === null) return false;

    const updatedAt = Number(savedTimestamp);
    return !Number.isFinite(updatedAt) || Date.now() - updatedAt >= FORM_DRAFT_TTL;
  } catch {
    return false;
  }
};

const loadFormDraft = (form, { ignoreExpiration = false } = {}) => {
  let draft;

  if (!ignoreExpiration && isDraftExpired()) {
    clearFormDraft();
    return false;
  }

  try {
    draft = JSON.parse(window.localStorage.getItem(FORM_DRAFT_KEY) ?? "null");
  } catch {
    return false;
  }

  if (!draft || typeof draft !== "object" || Array.isArray(draft)) return false;

  form.querySelectorAll(DRAFT_FIELD_SELECTOR).forEach((field) => {
    if (!Object.hasOwn(draft, field.name)) return;

    const savedValue = draft[field.name];

    if (field.type === "checkbox") {
      field.checked = savedValue === true;
    } else if (field.type === "radio") {
      field.checked = savedValue === field.value;
    } else if (typeof savedValue === "string") {
      field.value = savedValue;
    }
  });

  try {
    if (window.localStorage.getItem(FORM_DRAFT_UPDATED_AT_KEY) === null) {
      window.localStorage.setItem(
        FORM_DRAFT_UPDATED_AT_KEY,
        String(Date.now())
      );
    }
  } catch {
    // Rascunhos criados antes do TTL continuam utilizáveis sem armazenamento.
  }

  return true;
};

const clearFormDraft = () => {
  try {
    window.localStorage.removeItem(FORM_DRAFT_KEY);
    window.localStorage.removeItem(FORM_DRAFT_UPDATED_AT_KEY);
  } catch {
    // Mantém a limpeza opcional segura quando o armazenamento está indisponível.
  }
};

const isValidContact = (contact) => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const phoneDigits = contact.replace(/\D/g, "");
  const isPhone =
    /^\+?[\d\s().-]+$/.test(contact) &&
    phoneDigits.length >= 10 &&
    phoneDigits.length <= 15;

  return isEmail || isPhone;
};

const getContactLabel = (contact) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
    ? "E-mail informado"
    : "Telefone informado";

const validateForm = (form, data) => {
  form
    .querySelectorAll(
      'input[type="text"][required], input[type="email"][required], input[type="tel"][required], textarea[required]'
    )
    .forEach((field) => {
      field.setCustomValidity(
        field.value.trim() ? "" : "Preencha este campo."
      );
    });

  const contactField = form.elements.namedItem("contato");
  const tattooAgeField = form.elements.namedItem("tempoTatuagem");
  const isCoverage = data.tipoProjeto === COVERAGE_PROJECT_TYPE;
  const coverageIncomplete = isCoverage && !data.tempoTatuagem;

  if (contactField && data.contato) {
    contactField.setCustomValidity(
      isValidContact(data.contato)
        ? ""
        : "Informe um WhatsApp ou e-mail válido."
    );
  }

  if (tattooAgeField) {
    tattooAgeField.setCustomValidity(
      coverageIncomplete
        ? "Informe há quanto tempo a tatuagem foi feita."
        : ""
    );
  }

  const hasRequiredData = Boolean(
    data.nome &&
      data.tipoProjeto &&
      data.contato &&
      data.estilo &&
      data.ideia &&
      data.maioridade &&
      (!isCoverage || data.tempoTatuagem)
  );
  const isValid = form.checkValidity() && hasRequiredData;

  if (!isValid) {
    form.reportValidity();
    return coverageIncomplete ? "coverage" : "required";
  }

  return "";
};

const buildWhatsAppMessage = (data) => {
  const briefingFields = [
    ["Nome", data.nome],
    ["Tipo de projeto", data.tipoProjeto],
    [getContactLabel(data.contato), data.contato],
    ["Estilo", data.estilo],
    ["Região do corpo", data.regiao],
    ["Tamanho aproximado", data.tamanho],
    ["Tempo da tatuagem atual", data.tempoTatuagem],
    ["Ideia", data.ideia],
    ["Maior de 18 anos", data.maioridade ? "Sim" : "Não"]
  ];

  const briefing = briefingFields
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}:\n${value}`)
    .join("\n\n");

  return [
    "Olá! Vim pelo site e gostaria de conversar sobre um projeto de tatuagem.",
    "— NOVO PROJETO —",
    briefing,
    "Referências:\nVou enviar as imagens nesta conversa."
  ].join("\n\n");
};

const buildWhatsAppUrl = (message) => {
  if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER) || !message.trim()) {
    throw new Error("Configuração do WhatsApp inválida.");
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
};

const openWhatsApp = (whatsappUrl) => {
  let whatsappWindow = null;

  try {
    whatsappWindow = window.open("", "_blank");

    if (!whatsappWindow) return false;

    whatsappWindow.opener = null;
    whatsappWindow.location.replace(whatsappUrl);
    return true;
  } catch {
    try {
      whatsappWindow?.close();
    } catch {
      // A cópia do briefing ainda será tentada se a janela não puder ser fechada.
    }

    return false;
  }
};

const copyWithTemporaryTextarea = (message) => {
  const temporaryTextarea = document.createElement("textarea");
  temporaryTextarea.value = message;
  temporaryTextarea.setAttribute("readonly", "");
  temporaryTextarea.setAttribute("aria-hidden", "true");
  temporaryTextarea.style.position = "fixed";
  temporaryTextarea.style.left = "-9999px";
  temporaryTextarea.style.opacity = "0";
  temporaryTextarea.style.pointerEvents = "none";

  document.body.appendChild(temporaryTextarea);
  temporaryTextarea.select();
  temporaryTextarea.setSelectionRange(0, message.length);

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    temporaryTextarea.remove();
  }
};

const copyBriefingToClipboard = async (message) => {
  if (!message.trim()) return false;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(message);
      return true;
    } catch {
      // Tenta o método compatível com navegadores sem permissão para Clipboard API.
    }
  }

  return copyWithTemporaryTextarea(message);
};

const trackWhatsAppConversion = () => {
  if (typeof window.gtag !== "function") return;

  try {
    window.gtag("event", "whatsapp_briefing_opened");
  } catch {
    // Analytics opcional nunca deve interromper o contato pelo WhatsApp.
  }
};

const setFormStatus = (status, message, state = "") => {
  if (!status) return;

  const messageTarget =
    status.querySelector("[data-form-status-message]") ?? status;

  if (message) {
    status.hidden = false;
  }

  messageTarget.textContent = message;

  if (!message) {
    status.hidden = true;
  }

  if (state) {
    status.dataset.state = state;
  } else {
    delete status.dataset.state;
  }
};

if (contactForm) {
  const status = contactForm.querySelector("[data-form-feedback]");
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const confirmSubmissionButton = contactForm.querySelector(
    "[data-confirm-submission]"
  );
  const cancelFormClearButton = contactForm.querySelector(
    "[data-cancel-form-clear]"
  );
  const clearFormButton = contactForm.querySelector("[data-clear-form]");
  let isOpeningWhatsApp = false;
  let scheduledFormClearTimer = null;
  let scheduledFormClearAt = null;
  let formStartedAt = null;

  const setSubmissionLocked = (locked) => {
    isOpeningWhatsApp = locked;

    if (submitButton) {
      submitButton.disabled = locked;
    }
  };

  const setConfirmationAction = (action = "") => {
    if (confirmSubmissionButton) {
      confirmSubmissionButton.hidden = action !== "confirm";
    }

    if (cancelFormClearButton) {
      cancelFormClearButton.hidden = action !== "cancel";
    }
  };

  const getScheduledFormClearAt = () => {
    try {
      const savedClearAt = window.localStorage.getItem(FORM_CLEAR_AT_KEY);

      if (savedClearAt === null) return null;

      const clearAt = Number(savedClearAt);

      if (Number.isFinite(clearAt) && clearAt > 0) {
        return clearAt;
      }

      window.localStorage.removeItem(FORM_CLEAR_AT_KEY);
    } catch {
      // Sem armazenamento, apenas timers criados nesta página podem continuar.
    }

    return null;
  };

  const removeScheduledFormClear = () => {
    try {
      window.localStorage.removeItem(FORM_CLEAR_AT_KEY);
    } catch {
      // O estado em memória ainda pode ser cancelado com segurança.
    }
  };

  const clearSubmittedForm = () => {
    if (scheduledFormClearTimer !== null) {
      window.clearTimeout(scheduledFormClearTimer);
    }

    scheduledFormClearTimer = null;
    scheduledFormClearAt = null;
    formStartedAt = null;
    contactForm.reset();

    contactForm
      .querySelectorAll("input, select, textarea")
      .forEach((field) => field.setCustomValidity?.(""));

    clearFormDraft();
    removeScheduledFormClear();
    updateConditionalFields(contactForm);
    setSubmissionLocked(false);
    setConfirmationAction();
    setFormStatus(status, "Formulário limpo.");
  };

  const startScheduledFormClearTimer = (clearAt) => {
    if (scheduledFormClearTimer !== null) {
      window.clearTimeout(scheduledFormClearTimer);
    }

    scheduledFormClearAt = clearAt;
    const remainingTime = clearAt - Date.now();

    if (remainingTime <= 0) {
      clearSubmittedForm();
      return;
    }

    scheduledFormClearTimer = window.setTimeout(
      clearSubmittedForm,
      remainingTime
    );
  };

  const scheduleFormClear = () => {
    const clearAt = Date.now() + FORM_CLEAR_DELAY;

    saveFormDraft(contactForm);

    try {
      window.localStorage.setItem(FORM_CLEAR_AT_KEY, String(clearAt));
    } catch {
      // O timer desta página continua funcionando mesmo sem persistência.
    }

    startScheduledFormClearTimer(clearAt);
    setConfirmationAction("cancel");
    setFormStatus(
      status,
      "Projeto marcado como enviado. Seus dados serão removidos em 2 minutos."
    );
  };

  const cancelScheduledFormClear = () => {
    if (scheduledFormClearTimer !== null) {
      window.clearTimeout(scheduledFormClearTimer);
    }

    scheduledFormClearTimer = null;
    scheduledFormClearAt = null;
    removeScheduledFormClear();
    saveFormDraft(contactForm);
    setConfirmationAction("confirm");
    setFormStatus(
      status,
      "Limpeza cancelada. Seu briefing continua salvo."
    );
  };

  const restoreScheduledFormClear = () => {
    const clearAt = getScheduledFormClearAt();

    if (clearAt === null) return false;

    if (Date.now() >= clearAt) {
      clearSubmittedForm();
      return true;
    }

    loadFormDraft(contactForm, { ignoreExpiration: true });
    updateConditionalFields(contactForm);
    startScheduledFormClearTimer(clearAt);
    setConfirmationAction("cancel");
    setFormStatus(
      status,
      "Projeto marcado como enviado. Seus dados serão removidos em 2 minutos."
    );
    return true;
  };

  if (!restoreScheduledFormClear()) {
    loadFormDraft(contactForm);
    updateConditionalFields(contactForm);
  }

  const handleDraftUpdate = (event) => {
    if (!event.target.matches?.(DRAFT_FIELD_SELECTOR)) return;

    if (event.target.name === "tipoProjeto") {
      updateConditionalFields(contactForm);
    }

    saveFormDraft(contactForm);
  };

  const markFormAsStarted = (event) => {
    if (
      formStartedAt === null &&
      event.target.matches?.(DRAFT_FIELD_SELECTOR)
    ) {
      formStartedAt = Date.now();
    }
  };

  contactForm.addEventListener("focusin", markFormAsStarted);
  contactForm.addEventListener("input", markFormAsStarted);
  contactForm.addEventListener("change", markFormAsStarted);
  contactForm.addEventListener("input", handleDraftUpdate);
  contactForm.addEventListener("change", handleDraftUpdate);

  confirmSubmissionButton?.addEventListener("click", scheduleFormClear);
  cancelFormClearButton?.addEventListener("click", cancelScheduledFormClear);
  clearFormButton?.addEventListener("click", clearSubmittedForm);

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isOpeningWhatsApp) return;

    if (isHoneypotTriggered(contactForm)) return;

    if (isWhatsAppCooldownActive()) {
      setFormStatus(
        status,
        "Aguarde alguns segundos antes de tentar novamente.",
        "error"
      );
      return;
    }

    if (!hasMinimumFillTimePassed(formStartedAt)) {
      if (formStartedAt === null) {
        formStartedAt = Date.now();
      }

      setFormStatus(
        status,
        "Aguarde alguns segundos antes de continuar.",
        "error"
      );
      return;
    }

    const formData = getFormData(contactForm);
    const validationError = validateForm(contactForm, formData);

    if (validationError) {
      setFormStatus(
        status,
        validationError === "coverage"
          ? "Complete as informações da cobertura antes de continuar."
          : "Preencha os campos obrigatórios antes de continuar.",
        "error"
      );
      return;
    }

    setSubmissionLocked(true);
    saveFormDraft(contactForm);

    try {
      const message = buildWhatsAppMessage(formData);
      const whatsappUrl = buildWhatsAppUrl(message);

      setFormStatus(status, "Briefing preparado. Abrindo o WhatsApp...");

      if (!openWhatsApp(whatsappUrl)) {
        const briefingCopied = await copyBriefingToClipboard(message);

        setSubmissionLocked(false);
        setFormStatus(
          status,
          briefingCopied
            ? "Não foi possível abrir o WhatsApp. O briefing foi copiado para você."
            : "Não foi possível abrir o WhatsApp. Tente novamente.",
          "error"
        );
        return;
      }

      startWhatsAppCooldown();
      trackWhatsAppConversion();

      if (scheduledFormClearAt !== null) {
        setConfirmationAction("cancel");
        setFormStatus(
          status,
          "Projeto marcado como enviado. Seus dados serão removidos em 2 minutos."
        );
      } else {
        setConfirmationAction("confirm");
      }

      window.setTimeout(() => {
        setSubmissionLocked(false);
      }, SUBMIT_LOCK_DURATION);
    } catch {
      setSubmissionLocked(false);

      setFormStatus(
        status,
        "Não foi possível abrir o WhatsApp. Tente novamente.",
        "error"
      );
    }
  });
}
