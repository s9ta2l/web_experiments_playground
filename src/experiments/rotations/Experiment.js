import p5 from "p5";
import {
  addButton,
  addButtonRow,
  addDivider,
  addSliderControl,
  createControlPanel,
} from "../shared/controlPanel.js";

const T_MAX = Math.PI * 2;
const BG = [246, 240, 230];
const CUBE_STROKE = [16, 16, 16];
const AXIS_LINE_WEIGHT = 2.4;
const CUBE_LINE_WEIGHT = 1.4;
const VIEW_TILT_X = -Math.PI / 7;
const VIEW_TILT_Y = Math.PI / 6;
const AXIS_COLORS = {
  x: "#dc2626",
  y: "#16a34a",
  z: "#2563eb",
};

const FORMULA_LABELS = {
  x: ["1", "0", "0", "0", "cosθ", "−sinθ", "0", "sinθ", "cosθ"],
  y: ["cosθ", "0", "sinθ", "0", "1", "0", "−sinθ", "0", "cosθ"],
  z: ["cosθ", "−sinθ", "0", "sinθ", "cosθ", "0", "0", "0", "1"],
};

const CONSTANT_MASK = {
  x: [true, true, true, true, false, false, true, false, false],
  y: [false, true, false, true, true, true, false, true, false],
  z: [false, false, true, false, false, true, true, true, true],
};

export function startRotationsExperiment({
  mountId = "app",
  controlsMountId = mountId,
} = {}) {
  new p5((p) => {
    let t = 0;
    let paused = false;
    let omegaX = 1.0;
    let omegaY = 1.0;
    let omegaZ = 1.0;
    let boxSize = 140;
    let axisLen = 130;

    let timelineControl;
    let playPauseButton;
    let resetButton;
    let cards;

    p.setup = () => {
      const canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      canvas.parent(mountId);
      p.pixelDensity(1);
      computeSizes();

      const panel = createControlPanel(p, controlsMountId);

      timelineControl = addSliderControl(p, panel, {
        label: "Timeline",
        min: 0,
        max: T_MAX,
        value: 0,
        step: 0.01,
        format: (v) => `t = ${Number(v).toFixed(2)}`,
      });
      timelineControl.slider.input(() => {
        t = Number(timelineControl.slider.value());
      });

      const buttons = addButtonRow(p, panel);
      playPauseButton = addButton(p, buttons, "Pause", () => {
        paused = !paused;
        playPauseButton.html(paused ? "Play" : "Pause");
      });
      resetButton = addButton(p, buttons, "Reset", () => {
        t = 0;
        timelineControl.slider.value(0);
        timelineControl.valueEl.html("t = 0.00");
      });

      addDivider(p, panel);

      const omegaXControl = addOmegaSlider(panel, "ω_x  (X-axis speed)", omegaX, (v) => {
        omegaX = v;
      });
      const omegaYControl = addOmegaSlider(panel, "ω_y  (Y-axis speed)", omegaY, (v) => {
        omegaY = v;
      });
      const omegaZControl = addOmegaSlider(panel, "ω_z  (Z-axis speed)", omegaZ, (v) => {
        omegaZ = v;
      });
      // suppress unused warnings — references retained for clarity
      void omegaXControl;
      void omegaYControl;
      void omegaZControl;

      buildMatrixCards();
    };

    p.draw = () => {
      if (!paused) {
        t += p.deltaTime / 1000;
        if (t > T_MAX) t -= T_MAX;
        timelineControl.slider.value(t);
        timelineControl.valueEl.html(`t = ${t.toFixed(2)}`);
      }

      const thetaX = omegaX * t;
      const thetaY = omegaY * t;
      const thetaZ = omegaZ * t;

      p.background(BG[0], BG[1], BG[2]);

      const stripOffset = p.width / 3;
      drawStrip("x", thetaX, -stripOffset);
      drawStrip("y", thetaY, 0);
      drawStrip("z", thetaZ, stripOffset);

      updateCard(cards.x, "x", thetaX);
      updateCard(cards.y, "y", thetaY);
      updateCard(cards.z, "z", thetaZ);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      computeSizes();
    };

    function addOmegaSlider(panel, label, initialValue, onChange) {
      const control = addSliderControl(p, panel, {
        label,
        min: -3,
        max: 3,
        value: initialValue,
        step: 0.05,
        format: (v) => Number(v).toFixed(2),
      });
      control.slider.input(() => {
        onChange(Number(control.slider.value()));
      });
      return control;
    }

    function drawStrip(axis, theta, xOffset) {
      p.push();
      p.translate(xOffset, 0, 0);
      p.rotateX(VIEW_TILT_X);
      p.rotateY(VIEW_TILT_Y);

      // Rotation axis stays put — draw it before applying the per-axis rotation.
      p.stroke(AXIS_COLORS[axis]);
      p.strokeWeight(AXIS_LINE_WEIGHT);
      p.noFill();
      if (axis === "x") {
        p.line(-axisLen, 0, 0, axisLen, 0, 0);
      } else if (axis === "y") {
        p.line(0, -axisLen, 0, 0, axisLen, 0);
      } else {
        p.line(0, 0, -axisLen, 0, 0, axisLen);
      }

      // Apply only this axis's rotation, then draw the wireframe cube.
      if (axis === "x") p.rotateX(theta);
      else if (axis === "y") p.rotateY(theta);
      else p.rotateZ(theta);

      p.stroke(CUBE_STROKE[0], CUBE_STROKE[1], CUBE_STROKE[2]);
      p.strokeWeight(CUBE_LINE_WEIGHT);
      p.noFill();
      p.box(boxSize);

      p.pop();
    }

    function computeSizes() {
      const stripWidth = p.width / 3;
      const target = Math.min(stripWidth, p.height) * 0.42;
      boxSize = Math.max(70, Math.min(190, target));
      axisLen = boxSize * 0.95;
    }

    function buildMatrixCards() {
      const container = p.createDiv();
      container.parent(mountId);
      Object.assign(container.elt.style, {
        position: "fixed",
        left: "16px",
        right: "16px",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
        display: "flex",
        gap: "12px",
        justifyContent: "space-between",
        zIndex: "5",
        pointerEvents: "none",
      });

      cards = {
        x: buildCard(container, "x"),
        y: buildCard(container, "y"),
        z: buildCard(container, "z"),
      };
    }

    function buildCard(container, axis) {
      const card = p.createDiv();
      card.parent(container);
      Object.assign(card.elt.style, {
        flex: "1 1 0",
        minWidth: "0",
        maxWidth: "420px",
        padding: "0.7rem 0.9rem 0.85rem",
        background: "rgba(255, 251, 244, 0.86)",
        border: "1px solid rgba(16, 16, 16, 0.16)",
        color: "#101010",
        backdropFilter: "blur(8px)",
        boxSizing: "border-box",
      });

      const titleRow = p.createDiv();
      titleRow.parent(card);
      Object.assign(titleRow.elt.style, {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: "0.6rem",
      });

      const titleEl = p.createDiv(`R<sub>${axis}</sub>(θ)`);
      titleEl.parent(titleRow);
      Object.assign(titleEl.elt.style, {
        fontFamily: '"Iowan Old Style", Palatino, Georgia, serif',
        fontSize: "1.1rem",
        lineHeight: "1",
      });
      // accent dot in the axis color so the card pairs with its cube at a glance
      const swatch = p.createDiv("");
      swatch.parent(titleRow);
      Object.assign(swatch.elt.style, {
        width: "0.55rem",
        height: "0.55rem",
        borderRadius: "999px",
        background: AXIS_COLORS[axis],
        flexShrink: "0",
      });

      const thetaEl = p.createDiv("θ = 0.00 rad   (0.0°)");
      thetaEl.parent(card);
      Object.assign(thetaEl.elt.style, {
        marginTop: "0.25rem",
        fontFamily: "SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: "0.78rem",
        color: "rgba(16, 16, 16, 0.66)",
      });

      const grid = p.createDiv();
      grid.parent(card);
      Object.assign(grid.elt.style, {
        marginTop: "0.55rem",
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        rowGap: "0.12rem",
        columnGap: "0.7rem",
        fontFamily: "SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: "0.98rem",
      });

      const cells = [];
      for (let i = 0; i < 9; i++) {
        const cell = p.createDiv("0");
        cell.parent(grid);
        Object.assign(cell.elt.style, {
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        });
        cells.push(cell);
      }

      const captionGrid = p.createDiv();
      captionGrid.parent(card);
      Object.assign(captionGrid.elt.style, {
        marginTop: "0.35rem",
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        rowGap: "0.05rem",
        columnGap: "0.7rem",
        fontFamily: "SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: "0.7rem",
        color: "rgba(16, 16, 16, 0.5)",
      });

      FORMULA_LABELS[axis].forEach((label) => {
        const cap = p.createDiv(label);
        cap.parent(captionGrid);
        Object.assign(cap.elt.style, { textAlign: "right" });
      });

      return { card, thetaEl, cells };
    }

    function updateCard(card, axis, theta) {
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const deg = (theta * 180) / Math.PI;
      const normDeg = ((deg % 360) + 360) % 360;
      card.thetaEl.html(
        `θ = ${theta.toFixed(2)} rad   (${normDeg.toFixed(1)}°)`
      );

      const values = matrixValues(axis, c, s);
      const constMask = CONSTANT_MASK[axis];
      for (let i = 0; i < 9; i++) {
        const v = values[i];
        card.cells[i].html(formatMatrixCell(v));
        Object.assign(card.cells[i].elt.style, {
          color: constMask[i]
            ? "rgba(16, 16, 16, 0.42)"
            : "#101010",
          fontWeight: constMask[i] ? "400" : "600",
        });
      }
    }

    function matrixValues(axis, c, s) {
      if (axis === "x") {
        return [1, 0, 0, 0, c, -s, 0, s, c];
      }
      if (axis === "y") {
        return [c, 0, s, 0, 1, 0, -s, 0, c];
      }
      return [c, -s, 0, s, c, 0, 0, 0, 1];
    }

    function formatMatrixCell(value) {
      if (value === 0) return "0";
      if (value === 1) return "1";
      if (Math.abs(value) < 0.005) return "0.00";
      const sign = value < 0 ? "−" : "";
      return `${sign}${Math.abs(value).toFixed(2)}`;
    }
  });
}
