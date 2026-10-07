import p5 from "p5";
import {
  addButton,
  addButtonRow,
  addStatControl,
  createControlPanel,
} from "../shared/controlPanel.js";

export function startChaosPendulumExperiment({
  mountId = "app",
  controlsMountId = mountId,
} = {}) {
  let layoutObserver;
  const sketch = new p5((p) => {
    // Tweakables
    const L1 = 200;
    const L2 = 120;
    const L3 = 60;
    const M1 = 1.2;
    const M2 = 0.9;
    const M3 = 0.6;
    const G = 0.6;
    const DAMP = 0.995;
    const ITER = 6;
    const BG = 10;
    const VIEW_GAP = 16;
    const VIEW_REACH = L1 + L2 + L3 + 12;

    const p0 = { x: 0, y: 0 };
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 0, y: 0 };
    const p3 = { x: 0, y: 0 };
    const p1Prev = { x: 0, y: 0 };
    const p2Prev = { x: 0, y: 0 };
    const p3Prev = { x: 0, y: 0 };
    let running = false;

    let startButton;
    let stateControl;
    let viewport;
    let controlsShell;
    let pivotX = 0;
    let pivotY = 0;
    let viewRadius = 0;

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight).parent(mountId);
      p.pixelDensity(1);

      const panel = createControlPanel(p, controlsMountId);
      controlsShell = panel.elt.closest(".experiment-controls-shell");
      stateControl = addStatControl(p, panel, {
        label: "State",
        value: "Waiting",
      });

      const buttonRow = addButtonRow(p, panel);
      startButton = addButton(p, buttonRow, "Start / Random push", () => {
        resetWithRandomPush();
        running = true;
        stateControl.valueEl.html("Running");
      });

      resetWithRandomPush();
      running = false;
      stateControl.valueEl.html("Ready");

      // Measure safe-area bounds only on resize; this empty frame never paints.
      viewport = p.createDiv();
      viewport.parent(mountId);
      viewport.addClass("pendulum-viewport");
      Object.assign(viewport.elt.style, {
        position: "fixed",
        top: `calc(env(safe-area-inset-top, 0px) + ${VIEW_GAP}px)`,
        right: `calc(env(safe-area-inset-right, 0px) + ${VIEW_GAP}px)`,
        bottom: `calc(env(safe-area-inset-bottom, 0px) + ${VIEW_GAP}px)`,
        left: `calc(env(safe-area-inset-left, 0px) + ${VIEW_GAP}px)`,
        visibility: "hidden",
        pointerEvents: "none",
      });
      updateLayout();
      layoutObserver = new ResizeObserver(updateLayout);
      layoutObserver.observe(viewport.elt);
      if (controlsShell) layoutObserver.observe(controlsShell);
    };

    p.draw = () => {
      p.background(BG);

      if (running) {
        stepSimulation();
      }

      // Fit the whole swing, including brief solver stretch, without changing physics.
      const reach = Math.max(VIEW_REACH,
        Math.hypot(p1.x, p1.y) + 6,
        Math.hypot(p2.x, p2.y) + 5,
        Math.hypot(p3.x, p3.y) + 4);
      p.translate(pivotX, pivotY);
      p.scale(Math.min(1, viewRadius / reach));

      p.stroke(220);
      p.strokeWeight(2);
      p.line(p0.x, p0.y, p1.x, p1.y);
      p.line(p1.x, p1.y, p2.x, p2.y);
      p.line(p2.x, p2.y, p3.x, p3.y);

      p.fill(240);
      p.noStroke();
      p.circle(p1.x, p1.y, 12);
      p.circle(p2.x, p2.y, 10);
      p.circle(p3.x, p3.y, 8);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      updateLayout();
    };

    function updateLayout() {
      if (!viewport) return;
      const bounds = viewport.elt.getBoundingClientRect();
      let left = bounds.left;
      let top = bounds.top;
      let width = bounds.width;
      let height = bounds.height;
      if (controlsShell) {
        const controls = controlsShell.getBoundingClientRect();
        const besideLeft = Math.max(bounds.left, controls.right + VIEW_GAP);
        const belowTop = Math.max(bounds.top, controls.bottom + VIEW_GAP);
        const besideWidth = Math.max(0, bounds.right - besideLeft);
        const belowHeight = Math.max(0, bounds.bottom - belowTop);
        if (Math.min(besideWidth, height) > Math.min(width, belowHeight)) {
          left = besideLeft;
          width = besideWidth;
        } else {
          top = belowTop;
          height = belowHeight;
        }
      }
      pivotX = left + width / 2;
      pivotY = top + height / 2;
      viewRadius = Math.max(0, Math.min(width, height) / 2);
    }

    function resetWithRandomPush() {
      const a1 = p.random(-p.HALF_PI, p.HALF_PI);
      const a2 = p.random(-p.HALF_PI, p.HALF_PI);
      const a3 = p.random(-p.HALF_PI, p.HALF_PI);

      p1.x = L1 * Math.sin(a1);
      p1.y = L1 * Math.cos(a1);
      p2.x = p1.x + L2 * Math.sin(a2);
      p2.y = p1.y + L2 * Math.cos(a2);
      p3.x = p2.x + L3 * Math.sin(a3);
      p3.y = p2.y + L3 * Math.cos(a3);

      applyRandomKick(p1Prev, p1, 6);
      applyRandomKick(p2Prev, p2, 5);
      applyRandomKick(p3Prev, p3, 4);
    }

    function applyRandomKick(prev, pos, maxKick) {
      const vx = p.random(-maxKick, maxKick);
      const vy = p.random(-maxKick, maxKick);
      prev.x = pos.x - vx;
      prev.y = pos.y - vy;
    }

    function stepSimulation() {
      integrate(p1, p1Prev);
      integrate(p2, p2Prev);
      integrate(p3, p3Prev);

      for (let i = 0; i < ITER; i++) {
        constrainToFixed(p1, p0, L1);
        constrainPair(p1, p2, L2, M1, M2);
        constrainPair(p2, p3, L3, M2, M3);
      }
    }

    function integrate(pos, prev) {
      const vx = (pos.x - prev.x) * DAMP;
      const vy = (pos.y - prev.y) * DAMP + G;
      prev.x = pos.x;
      prev.y = pos.y;
      pos.x += vx;
      pos.y += vy;
    }

    function constrainToFixed(pos, anchor, len) {
      const dx = pos.x - anchor.x;
      const dy = pos.y - anchor.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const diff = (dist - len) / dist;
      pos.x -= dx * diff;
      pos.y -= dy * diff;
    }

    function constrainPair(a, b, len, massA, massB) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const diff = (dist - len) / dist;
      const wA = 1 / massA;
      const wB = 1 / massB;
      const wSum = wA + wB;
      const rA = wA / wSum;
      const rB = wB / wSum;
      a.x += dx * diff * rA;
      a.y += dy * diff * rA;
      b.x -= dx * diff * rB;
      b.y -= dy * diff * rB;
    }
  });
  if (import.meta.hot) import.meta.hot.dispose(() => {
    layoutObserver?.disconnect();
    sketch.remove();
  });
}
