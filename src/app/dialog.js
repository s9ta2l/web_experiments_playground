// Native modal dialogs also keep UI appended later by an experiment inert.
export function setupDialog({ trigger, dialog, stateKey, moveTrigger = false }) {
  const originalParent = trigger.parentElement;
  const originalNextSibling = trigger.nextSibling;
  const openLabel = trigger.getAttribute("aria-label");
  const surface = dialog.querySelector(".drawer-surface");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animation;
  let closing = false;

  // Animate the surface, leaving the hamburger fixed in the modal's top layer.
  const animateSurface = (opening) => {
    animation?.cancel();
    if (!surface || reducedMotion.matches) return null;
    const frames = [{ transform: "translateX(100%)" }, { transform: "translateX(0)" }];
    animation = surface.animate(opening ? frames : frames.toReversed(), {
      duration: 240,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    });
    return animation;
  };
  const close = async () => {
    if (!dialog.open || closing) return;
    closing = true;
    dialog.dataset.phase = "closing";
    const exit = animateSurface(false);
    if (exit) await exit.finished.catch(() => {});
    dialog.close();
  };

  trigger.addEventListener("click", () => {
    if (dialog.open) {
      close();
      return;
    }

    if (moveTrigger) dialog.prepend(trigger);
    dialog.showModal();
    dialog.dataset.phase = "open";
    animateSurface(true);
    document.body.dataset[stateKey] = "open";
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-label", moveTrigger ? "Close menu" : "Experiment information");
    dialog.scrollTop = 0;
    (moveTrigger ? trigger : dialog.querySelector("[data-dialog-close]")).focus({ preventScroll: true });
  });

  dialog.addEventListener("close", () => {
    animation?.cancel();
    closing = false;
    delete dialog.dataset.phase;
    if (moveTrigger) originalParent.insertBefore(trigger, originalNextSibling);
    document.body.dataset[stateKey] = "closed";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", openLabel);
    trigger.focus({ preventScroll: true });
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });

  // Clicks on the backdrop dismiss the panel; padding inside it does not.
  let backdropPress = false;
  const outside = (event) => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener("pointerdown", (event) => {
    backdropPress = event.target === dialog && outside(event);
  });
  dialog.addEventListener("click", (event) => {
    if (backdropPress && event.target === dialog && outside(event)) close();
    backdropPress = false;
  });
  dialog.querySelectorAll("[data-dialog-close]").forEach((button) => {
    button.addEventListener("click", close);
  });

  dialog.addEventListener("keydown", (event) => {
    // Keep sketch keyboard shortcuts out of menu and information interactions.
    event.stopPropagation();
    if (event.key !== "Tab") return;
    const controls = Array.from(dialog.querySelectorAll(
      "a[href], button, input, select, textarea, summary, [tabindex]"
    )).filter((element) => element.tabIndex >= 0 && !element.disabled &&
      element.getClientRects().length > 0);
    const first = controls[0] || dialog;
    const last = controls[controls.length - 1] || dialog;
    if (event.shiftKey ? document.activeElement === first : document.activeElement === last) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  });

  return { close };
}
