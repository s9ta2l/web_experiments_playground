import p5 from "p5";
import { vertexShader, fragmentShader } from "./shaders.js";
import { captureStoryPhoto, getStoryCrop } from "./photoCapture.js";
import { createPhotoPreview } from "./photoPreview.js";

// Keep the camera and single shader modest enough for mobile GPUs.
const FRAME_RATE = 30;
const CAMERA_WIDTH = 1280;
const CAMERA_HEIGHT = 720;
const MAX_RENDER_PIXELS = 1_000_000;
const MIRROR_SCALE = 4.6;
const SOURCE_CROP = 0.9;
const TURN_PER_SCREEN = Math.PI;

const PATTERNS = [
  { label: "Classic", center: [0.5, Math.sqrt(3) / 6], radius: 1 / Math.sqrt(3), scale: 1 },
  { label: "Square", center: [1 / 3, 1 / 3], radius: Math.sqrt(5) / 3, scale: 1 },
  { label: "Intricate", center: [1 / 3, Math.sqrt(3) / 3], radius: Math.sqrt(13) / 3, scale: 1.4 },
];

export function startKaleidoscopeExperiment({
  mountId = "app",
  controlsMountId = mountId,
} = {}) {
  const stage = document.getElementById(mountId);
  const controls = document.getElementById(controlsMountId);
  const page = stage.closest(".experiment-page") || stage;
  const events = new AbortController();
  document.body.dataset.experiment = "kaleidoscope";
  // This experiment has keyboard interaction; its canvas must be accessible.
  stage.removeAttribute("aria-hidden");

  controls.innerHTML = `
    <div class="kaleidoscope-toolbar" hidden>
      <div class="kaleidoscope-patterns" role="group" aria-label="Mirror pattern">
        ${PATTERNS.map((pattern, index) => `
          <button type="button" data-pattern="${index}" aria-pressed="${index === 0}">${pattern.label}</button>
        `).join("")}
      </div>
      <button class="kaleidoscope-flip" type="button" aria-label="Use front camera">Flip camera</button>
      <button class="kaleidoscope-capture" type="button">Capture photo</button>
    </div>
  `;
  const toolbar = controls.querySelector(".kaleidoscope-toolbar");
  const flipButton = controls.querySelector(".kaleidoscope-flip");
  const captureButton = controls.querySelector(".kaleidoscope-capture");
  const patternButtons = [...controls.querySelectorAll("[data-pattern]")];

  const gate = document.createElement("section");
  gate.className = "kaleidoscope-gate";
  gate.setAttribute("aria-label", "Camera access");
  gate.innerHTML = `
    <p class="kaleidoscope-eyebrow">Camera kaleidoscope</p>
    <h1 class="kaleidoscope-title"></h1>
    <p class="kaleidoscope-message" role="status" aria-live="polite"></p>
    <button class="kaleidoscope-start" type="button">Start camera</button>
    <p class="kaleidoscope-privacy">Live on your device. Photos are created only when you capture them. Nothing is uploaded.</p>
  `;
  page.append(gate);
  const title = gate.querySelector(".kaleidoscope-title");
  const message = gate.querySelector(".kaleidoscope-message");
  const startButton = gate.querySelector(".kaleidoscope-start");

  const hint = document.createElement("p");
  hint.className = "kaleidoscope-hint";
  hint.textContent = "Drag left or right to turn";
  hint.hidden = true;
  page.append(hint);

  const frameGuide = document.createElement("div");
  frameGuide.className = "kaleidoscope-frame";
  frameGuide.setAttribute("aria-hidden", "true");
  frameGuide.hidden = true;
  frameGuide.innerHTML = "<span>Story frame</span>";
  stage.append(frameGuide);

  let sketch;
  let video;
  let mirrorShader;
  let stream = null;
  let state = "idle";
  let facing = "environment";
  let patternIndex = 0;
  let turn = 0;
  let requestId = 0;
  let disposed = false;
  let hasTurned = false;
  let needsReload = false;
  let dragPointer = null;
  let dragX = 0;
  const viewport = [1, 1];
  const sourceScale = [1, 1];
  const rotation = [1, 0];
  const photoPreview = createPhotoPreview({
    parent: page,
    capture: () => {
      if (state !== "live" || video.elt.readyState < 2) throw new Error("The camera is not ready.");
      return captureStoryPhoto(sketch, mirrorShader, viewport[0], viewport[1]);
    },
    onOpen: () => { dragPointer = null; sketch.noLoop(); },
    onClose: () => {
      if (disposed) return;
      if (state === "live" && !document.hidden) {
        sketch.loop();
        captureButton.focus({ preventScroll: true });
      } else if (!document.hidden) startButton.focus({ preventScroll: true });
    },
  });

  function showGate(nextState, heading, detail, action = "Try again") {
    state = nextState;
    sketch?.noLoop();
    gate.hidden = false;
    toolbar.hidden = true;
    hint.hidden = true;
    frameGuide.hidden = true;
    title.textContent = heading;
    message.textContent = detail;
    startButton.textContent = action;
    startButton.disabled = nextState === "requesting";
    startButton.hidden = nextState === "unsupported";
    dragPointer = null;
  }

  function releaseCamera() {
    // Invalidate pending permission/playback promises as well as live tracks.
    requestId += 1;
    const previous = stream;
    stream = null;
    if (video) {
      video.elt.pause();
      video.elt.srcObject = null;
    }
    previous?.getTracks().forEach((track) => track.stop());
    sketch?.noLoop();
  }

  function updateSourceScale() {
    if (!mirrorShader || !video?.elt.videoWidth) return;
    const { videoWidth, videoHeight } = video.elt;
    const pattern = PATTERNS[patternIndex];
    // Fit the cell's circumcircle inside the camera at every rotation.
    // Correct for the video aspect ratio so faces/objects aren't stretched.
    const crop = SOURCE_CROP / (2 * pattern.radius);
    sourceScale[0] = crop * Math.min(1, videoHeight / videoWidth);
    sourceScale[1] = crop * Math.min(1, videoWidth / videoHeight);
    mirrorShader.setUniform("uSourceScale", sourceScale);
  }

  function selectPattern(index) {
    patternIndex = index;
    const pattern = PATTERNS[index];
    patternButtons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
    mirrorShader.setUniform("uPattern", index);
    mirrorShader.setUniform("uCellCenter", pattern.center);
    mirrorShader.setUniform("uCellScale", MIRROR_SCALE * pattern.scale);
    updateSourceScale();
  }

  function turnBy(amount) {
    turn = (turn + amount) % (Math.PI * 2);
    rotation[0] = Math.cos(turn);
    rotation[1] = Math.sin(turn);
    mirrorShader.setUniform("uTurn", rotation);
    hasTurned = true;
    hint.hidden = true;
  }

  async function playCamera(id) {
    try {
      // Call play explicitly: hidden camera video still needs playsinline on iOS.
      await video.elt.play();
      if (disposed || id !== requestId || !stream) return;
      updateSourceScale();
      mirrorShader.setUniform("uFrontCamera", facing === "user" ? 1 : 0);
      state = "live";
      gate.hidden = true;
      toolbar.hidden = false;
      hint.hidden = hasTurned;
      frameGuide.hidden = false;
      flipButton.setAttribute("aria-label", facing === "user" ? "Use rear camera" : "Use front camera");
      if (!photoPreview.isOpen) sketch.loop();
    } catch {
      if (disposed || id !== requestId) return;
      showGate("paused", "Your camera is ready", "Tap below to start the live kaleidoscope.", "Start camera");
    }
  }

  async function startCamera(nextFacing = facing) {
    if (disposed || state === "requesting") return;
    if (!window.isSecureContext) {
      showGate("unsupported", "A secure connection is needed", "Open the HTTPS version of this page to use your camera.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      showGate("unsupported", "Camera access is unavailable", "Open this link directly in Safari or Chrome on your phone.");
      return;
    }

    showGate("requesting", "Let the world become a pattern", "Allow camera access in your browser to begin.", "Waiting for permission…");
    releaseCamera();
    const id = requestId;
    try {
      let nextStream;
      try {
        nextStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: nextFacing },
            width: { ideal: CAMERA_WIDTH },
            height: { ideal: CAMERA_HEIGHT },
            frameRate: { ideal: FRAME_RATE },
          },
        });
      } catch (error) {
        // A basic camera can still work when preferred constraints cannot.
        if (disposed || id !== requestId) return;
        if (!["OverconstrainedError", "NotFoundError"].includes(error.name)) throw error;
        nextStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      if (disposed || id !== requestId || document.hidden) {
        nextStream.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = nextStream;
      facing = stream.getVideoTracks()[0].getSettings().facingMode || nextFacing;
      for (const track of stream.getVideoTracks()) {
        const onInterrupted = () => {
          if (stream !== nextStream || disposed) return;
          showGate("paused", "The camera was interrupted", "Tap below to reconnect your camera.", "Resume camera");
          releaseCamera();
        };
        track.addEventListener("ended", onInterrupted, { signal: events.signal });
        track.addEventListener("mute", onInterrupted, { signal: events.signal });
      }
      video.elt.srcObject = stream;
      await playCamera(id);
    } catch (error) {
      if (disposed || id !== requestId) return;
      const denied = ["NotAllowedError", "SecurityError"].includes(error.name);
      const missing = error.name === "NotFoundError";
      showGate("error",
        denied ? "Camera access is turned off" : missing ? "No camera was found" : "The camera couldn’t start",
        denied ? "Allow camera access in your browser’s site settings, then try again."
          : missing ? "Try opening this page on a phone or a device with a camera."
            : "Another app may be using the camera. Close it and try again.");
      releaseCamera();
    }
  }

  startButton.addEventListener("click", () => {
    if (needsReload) window.location.reload();
    else if (stream?.getVideoTracks().some((track) => track.readyState === "live")) playCamera(requestId);
    else startCamera();
  }, { signal: events.signal });
  flipButton.addEventListener("click", () => startCamera(facing === "user" ? "environment" : "user"), { signal: events.signal });
  patternButtons.forEach((button, index) => {
    button.addEventListener("click", () => selectPattern(index), { signal: events.signal });
  });
  captureButton.addEventListener("click", () => {
    if (state === "live" && video.elt.readyState >= 2) photoPreview.open();
  }, { signal: events.signal });

  const resizeObserver = new ResizeObserver((entries) => {
    if (entries.some((entry) => entry.target === stage)) resizeCanvas();
    // Keep the turning hint above the toolbar as buttons wrap on narrow phones.
    hint.style.bottom = `calc(env(safe-area-inset-bottom, 0px) + ${toolbar.offsetHeight}px + 1.45rem)`;
  });
  function resizeCanvas() {
    if (!sketch?._renderer || disposed) return;
    const width = Math.max(1, stage.clientWidth);
    const height = Math.max(1, stage.clientHeight);
    const scale = Math.min(1, Math.sqrt(MAX_RENDER_PIXELS / (width * height)));
    sketch.resizeCanvas(Math.max(1, Math.floor(width * scale)), Math.max(1, Math.floor(height * scale)), true);
    sketch.canvas.style.width = `${width}px`;
    sketch.canvas.style.height = `${height}px`;
    viewport[0] = width;
    viewport[1] = height;
    mirrorShader?.setUniform("uScreenSize", viewport);
    mirrorShader?.setUniform("uFrameSize", viewport);
    const crop = getStoryCrop(width, height);
    Object.assign(frameGuide.style, {
      width: `${crop.width}px`, height: `${crop.height}px`,
      left: `${crop.left}px`, top: `${crop.top}px`,
    });
  }

  sketch = new p5((p) => {
    p.setup = () => {
      try {
        const canvas = p.createCanvas(1, 1, p.WEBGL);
        // Set density on the new renderer; p5 2.x initializes it from the device.
        p.pixelDensity(1);
        canvas.parent(mountId);
        canvas.addClass("kaleidoscope-canvas");
        canvas.elt.tabIndex = 0;
        canvas.elt.setAttribute("role", "img");
        canvas.elt.setAttribute("aria-label", "Live camera kaleidoscope. Drag or use left and right arrow keys to turn. Capture photo saves the centered portrait Story frame.");
        p.noStroke();
        p.frameRate(FRAME_RATE);
        p.noLoop();
        mirrorShader = p.createShader(vertexShader, fragmentShader);
        video = p.createVideo([]);
        video.hide();
        video.elt.muted = true;
        video.elt.autoplay = true;
        video.elt.playsInline = true;
        video.elt.setAttribute("playsinline", "");
        video.elt.setAttribute("aria-hidden", "true");
        mirrorShader.setUniform("uCamera", video);
        mirrorShader.setUniform("uTurn", rotation);
        selectPattern(0);
        resizeCanvas();
        resizeObserver.observe(stage);
        resizeObserver.observe(toolbar);
        video.elt.addEventListener("loadedmetadata", updateSourceScale, { signal: events.signal });
        video.elt.addEventListener("resize", updateSourceScale, { signal: events.signal });
        video.elt.addEventListener("pause", () => {
          if (state === "live" && stream) {
            showGate("paused", "The live view is paused", "Tap below to continue.", "Resume camera");
          }
        }, { signal: events.signal });
        canvas.elt.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          needsReload = true;
          showGate("error", "The view was interrupted", "Reload to restart the kaleidoscope.", "Reload page");
          releaseCamera();
        }, { signal: events.signal });
        canvas.elt.addEventListener("pointerdown", (event) => {
          if (state !== "live" || !event.isPrimary || event.button !== 0) return;
          dragPointer = event.pointerId;
          dragX = event.clientX;
          canvas.elt.setPointerCapture(dragPointer);
        }, { signal: events.signal });
        canvas.elt.addEventListener("pointermove", (event) => {
          if (state !== "live" || event.pointerId !== dragPointer) return;
          const delta = event.clientX - dragX;
          dragX = event.clientX;
          if (delta) turnBy(delta / Math.min(viewport[0], viewport[1]) * TURN_PER_SCREEN);
        }, { signal: events.signal });
        const endDrag = () => { dragPointer = null; };
        for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
          canvas.elt.addEventListener(type, endDrag, { signal: events.signal });
        }
        canvas.elt.addEventListener("keydown", (event) => {
          if (state !== "live" || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
          event.preventDefault();
          turnBy(event.key === "ArrowLeft" ? -Math.PI / 36 : Math.PI / 36);
        }, { signal: events.signal });
        if (document.hidden) showGate("paused", "Your kaleidoscope is ready", "Tap below to open your camera.", "Start camera");
        else startCamera();
      } catch (error) {
        if (import.meta.env.DEV) console.error("Kaleidoscope graphics setup failed:", error);
        showGate("unsupported", "Graphics are unavailable", "Try opening this page in another browser with graphics acceleration enabled.");
        releaseCamera();
      }
    };

    p.draw = () => {
      if (state !== "live" || video.elt.readyState < 2 || photoPreview.isOpen) return;
      // One video texture and one plane; no per-pixel JavaScript or frame buffers.
      p.shader(mirrorShader);
      p.plane(p.width, p.height);
    };
  }, stage);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden || disposed || state === "unsupported" || needsReload) return;
    showGate("paused", "Your kaleidoscope is paused", "Tap below to open the camera again.", "Resume camera");
    releaseCamera();
  }, { signal: events.signal });
  window.addEventListener("pagehide", () => {
    if (disposed) return;
    if (state !== "unsupported" && !needsReload) {
      showGate("paused", "Your kaleidoscope is paused", "Tap below to open the camera again.", "Resume camera");
    }
    releaseCamera();
  }, { signal: events.signal });

  function destroy() {
    if (disposed) return;
    disposed = true;
    events.abort();
    resizeObserver.disconnect();
    photoPreview.destroy();
    releaseCamera();
    sketch.remove();
    gate.remove();
    hint.remove();
    frameGuide.remove();
    controls.replaceChildren();
  }
  if (import.meta.hot) import.meta.hot.dispose(destroy);
  return { destroy };
}
