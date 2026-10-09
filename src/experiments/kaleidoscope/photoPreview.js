import { STORY_WIDTH, STORY_HEIGHT } from "./photoCapture.js";

export function createPhotoPreview({ parent, capture, onOpen, onClose }) {
  const events = new AbortController();
  const dialog = document.createElement("dialog");
  dialog.className = "kaleidoscope-photo";
  dialog.setAttribute("aria-labelledby", "kaleidoscope-photo-title");
  dialog.innerHTML = `
    <div class="kaleidoscope-photo-layout">
      <img class="kaleidoscope-photo-image" alt="Your captured kaleidoscope Story photo" width="${STORY_WIDTH}" height="${STORY_HEIGHT}" hidden />
      <div class="kaleidoscope-photo-copy">
        <h2 id="kaleidoscope-photo-title">Your Story photo</h2>
        <p>Save this portrait photo or take another.</p>
        <p class="kaleidoscope-photo-status" role="status" aria-live="polite"></p>
        <div class="kaleidoscope-photo-actions">
          <a class="kaleidoscope-photo-button" data-photo-download hidden>Download JPG</a>
          <button class="kaleidoscope-photo-button" type="button" data-photo-share hidden>Share photo</button>
          <button class="kaleidoscope-photo-button" type="button" data-photo-retake autofocus>Retake</button>
        </div>
      </div>
    </div>
  `;
  parent.append(dialog);
  const image = dialog.querySelector("img");
  const status = dialog.querySelector("[role=status]");
  const download = dialog.querySelector("[data-photo-download]");
  const share = dialog.querySelector("[data-photo-share]");
  const retake = dialog.querySelector("[data-photo-retake]");
  const delayedURLs = new Map();
  let file = null;
  let imageURL = null;
  let downloaded = false;
  let operation = 0;
  let disposed = false;

  function reset() {
    operation += 1;
    image.removeAttribute("src");
    image.hidden = true;
    download.hidden = true;
    download.removeAttribute("href");
    share.hidden = true;
    share.disabled = false;
    dialog.removeAttribute("aria-busy");
    if (imageURL) {
      if (downloaded) {
        // Let the browser consume an initiated download before revoking its URL.
        const url = imageURL;
        delayedURLs.set(url, setTimeout(() => {
          URL.revokeObjectURL(url);
          delayedURLs.delete(url);
        }, 30_000));
      } else URL.revokeObjectURL(imageURL);
    }
    imageURL = null;
    file = null;
    downloaded = false;
  }

  async function open() {
    if (disposed || dialog.open) return;
    reset();
    const currentOperation = operation;
    status.textContent = "Preparing your photo…";
    dialog.setAttribute("aria-busy", "true");
    dialog.showModal();
    onOpen();
    try {
      const blob = await capture();
      // Retake, Escape, navigation, and development cleanup invalidate late results.
      if (disposed || !dialog.open || operation !== currentOperation) return;
      const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
      file = new File([blob], `kaleidoscope-story-${timestamp}.jpg`, { type: blob.type });
      imageURL = URL.createObjectURL(file);
      image.src = imageURL;
      image.hidden = false;
      download.href = imageURL;
      download.download = file.name;
      download.hidden = false;
      // A separate Share click retains the user gesture after asynchronous encoding.
      let canShare = false;
      try {
        canShare = Boolean(navigator.share && navigator.canShare?.({ files: [file] }));
      } catch { /* Keep download available if the browser rejects file sharing. */ }
      share.hidden = !canShare;
      status.textContent = `${STORY_WIDTH} × ${STORY_HEIGHT} · JPG`;
      dialog.removeAttribute("aria-busy");
      download.focus({ preventScroll: true });
    } catch {
      if (disposed || !dialog.open || operation !== currentOperation) return;
      dialog.removeAttribute("aria-busy");
      status.textContent = "Couldn’t prepare this photo. Choose Retake and try again.";
      retake.focus({ preventScroll: true });
    }
  }

  download.addEventListener("click", () => { downloaded = true; }, { signal: events.signal });
  share.addEventListener("click", async () => {
    if (!file || share.disabled) return;
    const currentOperation = operation;
    share.disabled = true;
    try {
      await navigator.share({ files: [file], title: "Kaleidoscope Story photo" });
      if (operation === currentOperation && !disposed) status.textContent = "Photo passed to your share sheet.";
    } catch (error) {
      if (operation === currentOperation && !disposed) {
        status.textContent = error.name === "AbortError"
          ? `${STORY_WIDTH} × ${STORY_HEIGHT} · JPG`
          : "Sharing is unavailable. Use Download JPG to save this photo.";
      }
    } finally {
      if (operation === currentOperation && !disposed) share.disabled = false;
    }
  }, { signal: events.signal });
  retake.addEventListener("click", () => dialog.close(), { signal: events.signal });
  dialog.addEventListener("close", () => {
    // Native close events are queued: a rapid new capture may already be open.
    if (dialog.open) return;
    reset();
    onClose();
  }, { signal: events.signal });

  return {
    open,
    get isOpen() { return dialog.open; },
    destroy() {
      disposed = true;
      events.abort();
      dialog.close();
      reset();
      for (const [url, timer] of delayedURLs) {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
      }
      delayedURLs.clear();
      dialog.remove();
    },
  };
}
