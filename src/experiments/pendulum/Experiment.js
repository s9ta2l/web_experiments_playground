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
  new p5((p) => {
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

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight).parent(mountId);
      p.pixelDensity(1);

      const panel = createControlPanel(p, controlsMountId);
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
    };

    p.draw = () => {
      p.background(BG);
      p.translate(p.width * 0.5, p.height * 0.25);

      if (running) {
        stepSimulation();
      }

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
    };

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
}
