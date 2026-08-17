/*
 * Botões de "arrastar para confirmar".
 *
 * Cada .button vira um controle que só dispara quando o ponteiro
 * arrasta da esquerda para a direita cobrindo boa parte da largura.
 * Uma faixa (.button-drag-fill, criada aqui) acompanha o arrasto.
 *
 * É um aprimoramento por cima de elementos que já funcionam sozinhos:
 * dois <a href> e o submit do formulário. Um clique simples, o Enter
 * pelo teclado e a navegação sem JS continuam funcionando como antes —
 * só quem usa ponteiro e arrasta é que vê o comportamento novo.
 */

// Fração da largura do botão que o arrasto precisa cobrir para confirmar.
const CONFIRM_AT = 0.72;

// Abaixo disso o movimento é tremor de mão, não arrasto, e o clique passa.
const CLICK_TOLERANCE = 6;

export function initDragButtons() {
  document.querySelectorAll(".button").forEach(setupDragButton);
}

function setupDragButton(button) {
  const fill = document.createElement("span");
  fill.className = "button-drag-fill";
  fill.setAttribute("aria-hidden", "true");
  button.prepend(fill);

  /*
   * Um <a href> é arrastável por padrão. Sem isto o Chrome inicia o
   * drag nativo do link logo no primeiro pointermove: dispara
   * pointercancel, o que aborta o gesto pela metade, e ainda desenha a
   * miniatura fantasma do link seguindo o cursor — que é o que se via
   * "atrás" do botão. Fica aqui em vez de draggable="false" no HTML
   * para valer também para qualquer .button adicionado depois.
   */
  button.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  let pointerId = null;
  let startX = 0;
  let travel = 0;
  let progress = 0;
  let dragged = false;

  const setProgress = (value) => {
    progress = value;
    fill.style.transform = `scaleX(${value})`;
  };

  button.addEventListener("pointerdown", (event) => {
    // Só botão principal do mouse; toque e caneta passam direto.
    if (event.pointerType === "mouse" && event.button !== 0) return;

    pointerId = event.pointerId;
    startX = event.clientX;
    travel = button.offsetWidth;
    dragged = false;

    button.classList.add("is-dragging");
    button.setPointerCapture(pointerId);
  });

  button.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId) return;

    const distance = event.clientX - startX;

    if (Math.abs(distance) > CLICK_TOLERANCE) {
      dragged = true;
    }

    setProgress(Math.min(Math.max(distance / travel, 0), 1));
  });

  const finishDrag = (event) => {
    if (event.pointerId !== pointerId) return;

    const confirmed = progress >= CONFIRM_AT;

    button.classList.remove("is-dragging");

    if (button.hasPointerCapture(pointerId)) {
      button.releasePointerCapture(pointerId);
    }

    pointerId = null;
    setProgress(0);

    if (confirmed) {
      activate(button);
    }
  };

  button.addEventListener("pointerup", finishDrag);
  button.addEventListener("pointercancel", finishDrag);

  /*
   * Um arrasto sempre cancela o clique que o navegador dispara em
   * seguida: se chegou ao fim, activate() já cuidou da ação, e deixar
   * passar navegaria duas vezes; se não chegou, a intenção era desistir.
   */
  button.addEventListener("click", (event) => {
    if (!dragged) return;

    event.preventDefault();
    dragged = false;
  });
}

function activate(button) {
  const href = button.getAttribute("href");

  // <button type="submit"> e afins: o clique sintético é o caminho certo,
  // e o handler acima não o bloqueia porque não veio de um arrasto.
  if (!href) {
    button.click();
    return;
  }

  /*
   * location.hash em vez de scrollIntoView: respeita o scroll-behavior
   * do CSS e registra a âncora na URL, igual a um clique no link. O
   * replaceState antes zera o hash para o caso de arrastar duas vezes
   * seguidas para o mesmo destino, que senão não rolaria na segunda.
   */
  if (href.startsWith("#") && document.querySelector(href)) {
    if (window.location.hash === href) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    window.location.hash = href;
    return;
  }

  window.location.href = href;
}
