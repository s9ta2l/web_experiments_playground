// Include landscape phones without changing short desktop windows.
const MOBILE_CONTROLS_QUERY = "(max-width: 700px), (max-width: 1000px) and (max-height: 500px) and (pointer: coarse)";

export function setupExperimentControls({ shell, dialog, trigger, information, directControls = false }) {
  const mobile = window.matchMedia(MOBILE_CONTROLS_QUERY);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const anchor = document.createComment("Desktop experiment controls");
  shell.before(anchor);
  const infoTrigger = shell.querySelector("[data-info-toggle]");
  trigger.closest(".experiment-quick-actions").hidden = directControls;
  let entrance;

  const close = () => dialog.close();
  const baseLayout = () => {
    document.body.dataset.controlsLayout = directControls ? "toolbar" : mobile.matches ? "mobile" : "desktop";
  };
  const open = () => {
    if (!mobile.matches || dialog.open) return;
    // Direct toolbars stay on the canvas; only their Info view opens a phone dialog.
    if (directControls) {
      document.body.dataset.controlsLayout = "mobile";
      dialog.append(shell);
    }
    dialog.showModal();
    document.body.dataset.controlsState = "open";
    trigger.setAttribute("aria-expanded", "true");
    shell.querySelector(".experiment-controls-body").scrollTop = 0;
    shell.querySelector("[data-controls-close]").focus({ preventScroll: true });
    if (!reducedMotion.matches) {
      entrance = shell.animate([
        { opacity: 0, transform: "translateY(0.5rem)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 200, easing: "ease-out" });
    }
  };
  const setLayout = () => {
    const hadFocus = shell.contains(document.activeElement);
    if (dialog.open) close();
    baseLayout();
    // Move the existing DOM, keeping all slider values and sketch listeners intact.
    if (mobile.matches && !directControls) dialog.append(shell);
    else anchor.after(shell);
    if (directControls && mobile.matches && shell.dataset.infoState === "open") open();
    if (hadFocus && !dialog.open) (mobile.matches && !directControls ? trigger : infoTrigger).focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent("experiment-controls-layout"));
  };

  trigger.addEventListener("click", open);
  shell.addEventListener("experiment-info-change", (event) => {
    if (!directControls || !mobile.matches) return;
    if (event.detail.open) open();
    else if (dialog.open) close();
  });
  shell.querySelector("[data-controls-close]").addEventListener("click", close);
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    entrance?.cancel();
    if (directControls) {
      baseLayout();
      anchor.after(shell);
    }
    information.close({ restoreFocus: false, animate: false });
    document.body.dataset.controlsState = "closed";
    trigger.setAttribute("aria-expanded", "false");
    if (mobile.matches) (directControls ? infoTrigger : trigger).focus({ preventScroll: true });
  });
  dialog.addEventListener("keydown", (event) => {
    // Keep sketch shortcuts out of the modal. Escape backs out of Info first.
    event.stopPropagation();
    if (event.key === "Escape" && shell.dataset.infoState === "open") {
      event.preventDefault();
      information.close();
    }
  });
  document.body.dataset.controlsState = "closed";
  mobile.addEventListener("change", setLayout);
  setLayout();

  if (import.meta.hot) import.meta.hot.dispose(() => {
    mobile.removeEventListener("change", setLayout);
    entrance?.cancel();
    if (dialog.open) close();
  });
}
