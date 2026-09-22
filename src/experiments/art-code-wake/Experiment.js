import p5 from "p5";
import {
  addButton,
  addButtonRow,
  addCheckboxControl,
  addDivider,
  addSliderControl,
  createControlPanel,
} from "../shared/controlPanel.js";

// Tweakables for the initial art / code balance.
const MAX_TRACE_RADIUS = 34;
const MIN_TRACE_DISTANCE = MAX_TRACE_RADIUS + 10;
const MAX_TRACE_DISTANCE = 160;
const MESH_STEP = 16;
const MAX_BINARY = 260;
const MAX_BRUSH = 260;
const MAX_SQUARES = 440;
const MAX_RIPPLES = 26;
const HINT = "between intuition and logic";

const PALETTES = [
  {
    name: "Studio",
    colors: [[29, 78, 216], [239, 103, 75], [230, 181, 62]],
  },
  {
    name: "Garden",
    colors: [[31, 138, 112], [151, 104, 191], [242, 153, 142]],
  },
  {
    name: "Signal",
    colors: [[0, 166, 190], [222, 69, 155], [187, 201, 50]],
  },
];

export function startArtCodeWakeExperiment({
  mountId = "app",
  controlsMountId = mountId,
} = {}) {
  new p5((p) => {
    const binary = [];
    const brushes = [];
    const squares = [];
    const ripples = [];

    let density = 3;
    let traceRadius = 22;
    let traceDistance = 68;
    let fadeSeconds = 2.6;
    let atmosphere = 0.6;
    let backdropOpacity = 0.7;
    let paletteIndex = 0;
    let backdropToggle;
    let binaryToggle;
    let paintToggle;
    let showHint;
    let lastPointer = null;
    let lastPointerId = null;
    let wash;
    let canvas;

    p.setup = () => {
      canvas = p.createCanvas(p.windowWidth, p.windowHeight);
      canvas.parent(mountId);
      canvas.elt.style.touchAction = "none";
      canvas.elt.addEventListener("pointerdown", handlePointerDown, { passive: true });
      canvas.elt.addEventListener("pointermove", handlePointerMove, { passive: true });
      canvas.elt.addEventListener("pointerup", resetPointer, { passive: true });
      canvas.elt.addEventListener("pointercancel", resetPointer, { passive: true });
      canvas.elt.addEventListener("pointerleave", resetPointer, { passive: true });

      p.pixelDensity(1);
      p.strokeCap(p.ROUND);
      wash = createWash();

      const panel = createControlPanel(p, controlsMountId);
      const densityControl = addSliderControl(p, panel, {
        label: "Trace density",
        min: 1,
        max: 5,
        value: density,
        step: 1,
      });
      densityControl.slider.input(() => {
        density = Number(densityControl.slider.value());
      });

      const radiusControl = addSliderControl(p, panel, {
        label: "Trace radius",
        min: 4,
        max: MAX_TRACE_RADIUS,
        value: traceRadius,
        step: 1,
        format: (value) => `${Math.round(value)}px`,
      });
      radiusControl.slider.input(() => {
        traceRadius = Number(radiusControl.slider.value());
      });

      const distanceControl = addSliderControl(p, panel, {
        label: "Side distance",
        min: MIN_TRACE_DISTANCE,
        max: MAX_TRACE_DISTANCE,
        value: traceDistance,
        step: 1,
        format: (value) => `${Math.round(value)}px`,
      });
      distanceControl.slider.input(() => {
        traceDistance = Number(distanceControl.slider.value());
      });

      const fadeControl = addSliderControl(p, panel, {
        label: "Fade time",
        min: 0.8,
        max: 5,
        value: fadeSeconds,
        step: 0.1,
        format: (value) => `${Number(value).toFixed(1)}s`,
      });
      fadeControl.slider.input(() => {
        fadeSeconds = Number(fadeControl.slider.value());
        p.loop();
      });

      addDivider(p, panel);

      backdropToggle = addCheckboxControl(p, panel, {
        label: "Blue-white background",
        checked: true,
      });
      backdropToggle.changed(updateBackdrop);

      const backdropControl = addSliderControl(p, panel, {
        label: "Background opacity",
        min: 0,
        max: 1,
        value: backdropOpacity,
        step: 0.05,
        format: (value) => `${Math.round(Number(value) * 100)}%`,
      });
      backdropControl.slider.input(() => {
        backdropOpacity = Number(backdropControl.slider.value());
        updateBackdrop();
      });

      const atmosphereControl = addSliderControl(p, panel, {
        label: "Water + mesh",
        min: 0,
        max: 1,
        value: atmosphere,
        step: 0.05,
        format: (value) => `${Math.round(Number(value) * 100)}%`,
      });
      atmosphereControl.slider.input(() => {
        atmosphere = Number(atmosphereControl.slider.value());
        p.loop();
      });

      addDivider(p, panel);

      binaryToggle = addCheckboxControl(p, panel, {
        label: "Binary numbers",
        checked: true,
      });
      binaryToggle.changed(() => {
        if (!binaryToggle.checked()) binary.length = 0;
        p.redraw();
      });

      paintToggle = addCheckboxControl(p, panel, {
        label: "Paint strokes",
        checked: true,
      });
      paintToggle.changed(() => {
        if (!paintToggle.checked()) brushes.length = 0;
        p.redraw();
      });

      const paletteControl = addSliderControl(p, panel, {
        label: "Paint triplet",
        min: 0,
        max: PALETTES.length - 1,
        value: paletteIndex,
        step: 1,
        format: (value) => PALETTES[Math.round(value)].name,
      });
      paletteControl.slider.input(() => {
        paletteIndex = Math.round(paletteControl.slider.value());
        p.loop();
      });

      showHint = addCheckboxControl(p, panel, {
        label: "Show hint",
        checked: false,
      });
      showHint.changed(() => p.redraw());

      const buttons = addButtonRow(p, panel);
      addButton(p, buttons, "Clear", () => {
        binary.length = 0;
        brushes.length = 0;
        squares.length = 0;
        ripples.length = 0;
        p.redraw();
      });

      updateBackdrop();
      p.clear();
    };

    p.draw = () => {
      const dt = Math.min(p.deltaTime / 1000, 0.05);
      p.clear();

      drawRipples(dt);
      drawSquares(dt);
      drawBrushes(dt);
      drawBinary(dt);

      if (showHint.checked()) {
        p.noStroke();
        p.fill(55, 70, 77, 145);
        p.textFont("Iowan Old Style, Palatino, Georgia, serif");
        p.textSize(16);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(HINT, p.width * 0.5, p.height - 32);
      }

      // The canvas is static between pointer visits, so it need not consume frames.
      if (!binary.length && !brushes.length && !squares.length && !ripples.length) {
        p.noLoop();
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      lastPointer = null;
      lastPointerId = null;
    };

    function handlePointerDown(event) {
      lastPointerId = event.pointerId;
      lastPointer = pointFromEvent(event);
    }

    function handlePointerMove(event) {
      if (lastPointerId !== event.pointerId) {
        lastPointerId = event.pointerId;
        lastPointer = pointFromEvent(event);
        return;
      }

      const point = pointFromEvent(event);
      const dx = point.x - lastPointer.x;
      const dy = point.y - lastPointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 2) return;

      const spacing = 33 - density * 4;
      const steps = Math.min(20, Math.ceil(distance / spacing));
      for (let i = 1; i <= steps; i++) {
        const fraction = i / steps;
        emitAt(lastPointer.x + dx * fraction, lastPointer.y + dy * fraction);
      }

      lastPointer = point;
      p.loop();
    }

    function resetPointer(event) {
      if (event.pointerId === lastPointerId) {
        lastPointer = null;
        lastPointerId = null;
      }
    }

    function pointFromEvent(event) {
      const bounds = canvas.elt.getBoundingClientRect();
      return {
        x: ((event.clientX - bounds.left) / bounds.width) * p.width,
        y: ((event.clientY - bounds.top) / bounds.height) * p.height,
      };
    }

    function emitAt(x, y) {
      // One disk sample, mirrored around the cursor, keeps the two zones symmetric.
      const angle = p.random(p.TWO_PI);
      const radiusOffset = Math.sqrt(p.random()) * traceRadius;
      const spreadX = Math.cos(angle) * radiusOffset;
      const spreadY = Math.sin(angle) * radiusOffset;

      if (binaryToggle.checked()) {
        pushBounded(binary, {
          x: x - traceDistance - spreadX,
          y: y + spreadY,
          digit: p.random() < 0.5 ? "0" : "1",
          rise: p.random(19, 38),
          phase: p.random(p.TWO_PI),
          age: 0,
        }, MAX_BINARY);
      }

      if (paintToggle.checked()) {
        const startX = x + traceDistance + spreadX;
        const startY = y + spreadY;
        const strokeAngle = p.random(-p.PI * 0.35, p.PI * 0.35);
        const strokeLength = p.random(13, 28);
        pushBounded(brushes, {
          startX,
          startY,
          endX: startX + Math.cos(strokeAngle) * strokeLength,
          endY: startY + Math.sin(strokeAngle) * strokeLength,
          width: p.random(2.7, 6.5),
          curve: p.random(-8, 8),
          colorIndex: Math.floor(p.random(3)),
          age: 0,
        }, MAX_BRUSH);
      }

      if (atmosphere <= 0) return;

      for (let i = 0; i < 3; i++) {
        pushBounded(squares, {
          x: Math.round((x + p.random(-62, 62)) / MESH_STEP) * MESH_STEP,
          y: Math.round((y + p.random(-62, 62)) / MESH_STEP) * MESH_STEP,
          size: p.random(2.5, 5.5),
          age: 0,
        }, MAX_SQUARES);
      }

      if (p.random() < 0.34) {
        pushBounded(ripples, {
          x,
          y,
          radius: p.random(20, 34),
          stretch: p.random(0.75, 1.35),
          age: 0,
        }, MAX_RIPPLES);
      }
    }

    function drawRipples(dt) {
      const life = fadeSeconds * 0.8;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const mark = ripples[i];
        mark.age += dt;
        if (mark.age >= life || atmosphere <= 0) {
          removeAt(ripples, i);
          continue;
        }

        const fade = 1 - mark.age / life;
        const radius = mark.radius + mark.age * 46;
        const width = radius * 2 * mark.stretch;
        const height = radius * 2 / mark.stretch;
        p.drawingContext.globalAlpha = fade * atmosphere;
        p.image(wash, mark.x - width * 0.5, mark.y - height * 0.5, width, height);
        p.drawingContext.globalAlpha = 1;
        p.noFill();
        p.stroke(72, 146, 161, 52 * fade * atmosphere);
        p.strokeWeight(1);
        p.ellipse(mark.x, mark.y, width * 0.68, height * 0.68);
      }
    }

    function drawSquares(dt) {
      const life = fadeSeconds * 0.85;
      p.noStroke();
      for (let i = squares.length - 1; i >= 0; i--) {
        const mark = squares[i];
        mark.age += dt;
        if (mark.age >= life || atmosphere <= 0) {
          removeAt(squares, i);
          continue;
        }

        const fade = 1 - mark.age / life;
        p.fill(61, 113, 131, 88 * fade * fade * atmosphere);
        p.rect(mark.x, mark.y, mark.size, mark.size);
      }
    }

    function drawBrushes(dt) {
      const life = fadeSeconds * 1.05;
      const palette = PALETTES[paletteIndex].colors;
      p.noFill();
      for (let i = brushes.length - 1; i >= 0; i--) {
        const mark = brushes[i];
        mark.age += dt;
        if (mark.age >= life) {
          removeAt(brushes, i);
          continue;
        }

        const fade = 1 - mark.age / life;
        const [red, green, blue] = palette[mark.colorIndex];
        const dx = mark.endX - mark.startX;
        const dy = mark.endY - mark.startY;
        const distance = Math.hypot(dx, dy);
        const acrossX = -dy / distance;
        const acrossY = dx / distance;

        p.stroke(red, green, blue, 190 * fade);
        p.strokeWeight(mark.width * (0.55 + fade * 0.45));
        p.bezier(
          mark.startX, mark.startY,
          mark.startX + dx * 0.3 + acrossX * mark.curve,
          mark.startY + dy * 0.3 + acrossY * mark.curve,
          mark.startX + dx * 0.7 + acrossX * mark.curve * 0.5,
          mark.startY + dy * 0.7 + acrossY * mark.curve * 0.5,
          mark.endX, mark.endY
        );
        p.stroke(red, green, blue, 95 * fade);
        p.strokeWeight(Math.max(0.7, mark.width * 0.24));
        p.line(
          mark.startX + dx * 0.25 + acrossX * mark.width * 0.65,
          mark.startY + dy * 0.25 + acrossY * mark.width * 0.65,
          mark.endX + acrossX * mark.width * 0.65,
          mark.endY + acrossY * mark.width * 0.65
        );
      }
    }

    function drawBinary(dt) {
      const life = fadeSeconds;
      p.noStroke();
      p.textFont("SFMono-Regular, Menlo, Consolas, monospace");
      p.textSize(14);
      p.textAlign(p.CENTER, p.CENTER);
      for (let i = binary.length - 1; i >= 0; i--) {
        const mark = binary[i];
        mark.age += dt;
        if (mark.age >= life) {
          removeAt(binary, i);
          continue;
        }

        const fade = 1 - mark.age / life;
        p.fill(30, 52, 66, 195 * fade * fade);
        p.text(
          mark.digit,
          mark.x + Math.sin(mark.phase + mark.age * 3) * 3,
          mark.y - mark.age * mark.rise
        );
      }
    }

    function createWash() {
      const texture = p.createGraphics(128, 128);
      texture.pixelDensity(1);
      const context = texture.drawingContext;
      const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 64);
      gradient.addColorStop(0, "rgba(77, 149, 161, 0.18)");
      gradient.addColorStop(0.48, "rgba(130, 193, 205, 0.10)");
      gradient.addColorStop(1, "rgba(130, 193, 205, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 128, 128);
      return texture;
    }

    function updateBackdrop() {
      // Keep the backdrop behind the transparent canvas so toggling it repaints reliably.
      const backdrop = canvas.elt.parentElement;
      backdrop.style.backgroundColor = "#fff";
      if (!backdropToggle.checked() || backdropOpacity === 0) {
        backdrop.style.backgroundImage = "none";
        return;
      }

      const alpha = (value) => (value * backdropOpacity).toFixed(3);
      backdrop.style.backgroundImage = [
        `radial-gradient(ellipse 40% 17% at 25% 19%, rgba(255, 255, 255, ${alpha(0.9)}), transparent 85%)`,
        `radial-gradient(ellipse 39% 19% at 79% 22%, rgba(255, 255, 255, ${alpha(0.85)}), transparent 85%)`,
        `radial-gradient(ellipse 56% 47% at 17% 34%, rgba(80, 139, 187, ${alpha(0.5)}), transparent 78%)`,
        `radial-gradient(ellipse 50% 42% at 82% 42%, rgba(98, 155, 198, ${alpha(0.5)}), transparent 78%)`,
        `radial-gradient(ellipse 72% 52% at 52% 105%, rgba(65, 122, 178, ${alpha(0.32)}), transparent 82%)`,
      ].join(", ");
    }

    function pushBounded(items, item, limit) {
      if (items.length >= limit) items.shift();
      items.push(item);
    }

    function removeAt(items, index) {
      items[index] = items[items.length - 1];
      items.pop();
    }
  });
}
