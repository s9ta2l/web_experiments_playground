export function setupExperimentInfo({ trigger, panel, controls, shell }) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animation;

  const setOpen = (open, { restoreFocus = !open, animate = true } = {}) => {
    animation?.cancel();
    // Swap views without remounting the sketch's controls or losing their values.
    controls.hidden = open;
    controls.inert = open;
    panel.hidden = !open;
    shell.dataset.infoState = document.body.dataset.infoState = open ? "open" : "closed";
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute("aria-label", open ? "Back to experiment controls" : "Open experiment information");
    shell.scrollTop = 0;
    shell.querySelector(".experiment-controls-body").scrollTop = 0;
    if (restoreFocus) trigger.focus({ preventScroll: true });
    if (animate && !reducedMotion.matches) {
      animation = (open ? panel : controls).animate([
        { opacity: 0, transform: "translateY(0.5rem)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 200, easing: "ease-out" });
    }
    shell.dispatchEvent(new CustomEvent("experiment-info-change", { detail: { open } }));
  };

  trigger.addEventListener("click", () => setOpen(panel.hidden));
  panel.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden && !document.querySelector("#site-drawer").open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
  });

  panel.querySelectorAll("[data-info-disclosure]").forEach((button) => {
    const content = panel.querySelector(`#${button.getAttribute("aria-controls")}`);
    let expansion;
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      const height = content.getBoundingClientRect().height;
      expansion?.cancel();
      button.setAttribute("aria-expanded", String(open));
      content.hidden = false;
      content.inert = !open;
      if (reducedMotion.matches) {
        content.hidden = !open;
        return;
      }
      // Measure only on clicks so long Notes expand naturally without draw-loop work.
      const current = expansion = content.animate([
        { height: `${height}px`, opacity: open ? 0 : 1 },
        { height: `${open ? content.scrollHeight : 0}px`, opacity: open ? 1 : 0 },
      ], { duration: 200, easing: "ease-in-out" });
      current.finished.then(() => {
        if (expansion === current) {
          content.hidden = !open;
          expansion = null;
        }
      }).catch(() => {});
    });
  });

  return { close: (options) => setOpen(false, options) };
}
