import p5 from "p5";
import {
  addButton,
  addButtonRow,
  addCheckboxControl,
  addDivider,
  addSliderControl,
  createControlPanel,
} from "../shared/controlPanel.js";

export function startSpiralOrbitExperiment({
  mountId = "app",
  controlsMountId = mountId,
} = {}) {
  new p5((p) => {
    // Tweakables
    const BG = 255;
    const FADE_ALPHA = 18;
    const STROKE_COLOR = 10;
    const STROKE_WEIGHT = 1.25;
    const defaults = {
      a: 0,
      spacing: 24,
      turns: 18,
      step: 0.03,
      omega: 1.5,
      phi: 0,
      orbitR: 0,
      orbitOmega: 0.6,
      orbitOffsetX: 0,
      orbitOffsetY: 0,
      trails: true,
    };

    let aSlider;
    let spacingSlider;
    let turnsSlider;
    let stepSlider;
    let omegaSlider;
    let phiSlider;
    let cxOrbitSlider;
    let cyOrbitSlider;
    let orbitRSlider;
    let orbitOmegaSlider;
    let trailCheckbox;
    let clearBtn;
    let pauseBtn;

    let paused = false;
    let t = 0;

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight).parent(mountId);
      p.pixelDensity(1);
      p.angleMode(p.RADIANS);

      const panel = createControlPanel(p, controlsMountId);

      aSlider = addSliderControl(p, panel, {
        label: "Start radius",
        min: 0,
        max: 300,
        value: defaults.a,
        step: 1,
      }).slider;

      spacingSlider = addSliderControl(p, panel, {
        label: "Loop spacing",
        min: 2,
        max: 120,
        value: defaults.spacing,
        step: 1,
      }).slider;

      turnsSlider = addSliderControl(p, panel, {
        label: "Turns",
        min: 1,
        max: 60,
        value: defaults.turns,
        step: 1,
      }).slider;

      stepSlider = addSliderControl(p, panel, {
        label: "Resolution",
        min: 0.005,
        max: 0.25,
        value: defaults.step,
        step: 0.005,
        format: (value) => Number(value).toFixed(3),
      }).slider;

      omegaSlider = addSliderControl(p, panel, {
        label: "Spin speed",
        min: -8,
        max: 8,
        value: defaults.omega,
        step: 0.05,
        format: (value) => Number(value).toFixed(2),
      }).slider;

      phiSlider = addSliderControl(p, panel, {
        label: "Phase",
        min: -p.PI,
        max: p.PI,
        value: defaults.phi,
        step: 0.01,
        format: (value) => Number(value).toFixed(2),
      }).slider;

      addDivider(p, panel);

      orbitRSlider = addSliderControl(p, panel, {
        label: "Orbit radius",
        min: 0,
        max: 500,
        value: defaults.orbitR,
        step: 1,
      }).slider;

      orbitOmegaSlider = addSliderControl(p, panel, {
        label: "Orbit speed",
        min: -6,
        max: 6,
        value: defaults.orbitOmega,
        step: 0.05,
        format: (value) => Number(value).toFixed(2),
      }).slider;

      cxOrbitSlider = addSliderControl(p, panel, {
        label: "Orbit offset X",
        min: -400,
        max: 400,
        value: defaults.orbitOffsetX,
        step: 1,
      }).slider;

      cyOrbitSlider = addSliderControl(p, panel, {
        label: "Orbit offset Y",
        min: -400,
        max: 400,
        value: defaults.orbitOffsetY,
        step: 1,
      }).slider;

      addDivider(p, panel);

      trailCheckbox = addCheckboxControl(p, panel, {
        label: "Trails",
        checked: defaults.trails,
      });

      const btnRow = addButtonRow(p, panel);

      clearBtn = addButton(p, btnRow, "Clear", () => {
        p.background(BG);
      });

      pauseBtn = addButton(p, btnRow, "Pause", () => {
        paused = !paused;
        pauseBtn.html(paused ? "Play" : "Pause");
      });

      p.background(BG);
    };

    p.draw = () => {
      const dt = p.deltaTime / 1000;
      if (!paused) t += dt;

      if (!trailCheckbox.checked()) {
        p.background(BG);
      } else {
        p.noStroke();
        p.fill(BG, FADE_ALPHA);
        p.rect(0, 0, p.width, p.height);
      }

      const a = aSlider.value();
      const spacing = spacingSlider.value();
      const b = spacing / p.TWO_PI;
      const nTurns = turnsSlider.value();
      const dTheta = stepSlider.value();
      const omega = omegaSlider.value();
      const phi = phiSlider.value();

      const orbitR = orbitRSlider.value();
      const orbitOmega = orbitOmegaSlider.value();
      const orbitX = cxOrbitSlider.value();
      const orbitY = cyOrbitSlider.value();

      const baseCx = p.width * 0.5;
      const baseCy = p.height * 0.5;

      const cx = baseCx + orbitX + orbitR * Math.cos(orbitOmega * t);
      const cy = baseCy + orbitY + orbitR * Math.sin(orbitOmega * t);

      p.stroke(STROKE_COLOR);
      p.strokeWeight(STROKE_WEIGHT);
      p.noFill();

      p.beginShape();
      const thetaMax = p.TWO_PI * nTurns;

      for (let theta = 0; theta <= thetaMax; theta += dTheta) {
        const r = a + b * theta;
        const ang = theta + omega * t + phi;
        const x = cx + r * Math.cos(ang);
        const y = cy + r * Math.sin(ang);
        p.vertex(x, y);
      }
      p.endShape();
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      p.background(BG);
    };
  });
}
