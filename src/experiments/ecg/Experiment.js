import p5 from "p5";
import { generateECG } from "../shared/ecgData.js";
import {
  addButton,
  addButtonRow,
  addSliderControl,
  addStatControl,
  createControlPanel,
} from "../shared/controlPanel.js";

export function startECGExperiment({
  mountId = "app",
  controlsMountId = mountId,
} = {}) {
  new p5((p) => {
    const ECG_LENGTH = 4000;
    const SAMPLE_RATE = 250;

    let ecg = [];
    let index = 0;

    let scaleY = 120;
    let speed = 2;
    let bpm = 72;
    let scaleControl;
    let speedControl;
    let bpmControl;

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight).parent(mountId);
      p.pixelDensity(1);

      // ---- ECG buffer (this is the “sketch setup” part) ----
      ecg = generateECG({
        length: ECG_LENGTH,     // how many samples we store
        bpm,
        sampleRate: SAMPLE_RATE,  // typical ECG sample rate
      });

      const panel = createControlPanel(p, controlsMountId);

      scaleControl = addSliderControl(p, panel, {
        label: "Scale",
        min: 20,
        max: 260,
        value: scaleY,
        step: 1,
      });

      speedControl = addSliderControl(p, panel, {
        label: "Playback speed",
        min: 1,
        max: 10,
        value: speed,
        step: 1,
      });

      bpmControl = addStatControl(p, panel, {
        label: "Heart rate",
        value: `${bpm} bpm`,
      });

      const buttonRow = addButtonRow(p, panel);
      addButton(p, buttonRow, "Randomize BPM", regenerateBpm);

      scaleControl.slider.input(() => {
        scaleY = Number(scaleControl.slider.value());
        scaleControl.valueEl.html(String(scaleY));
      });

      speedControl.slider.input(() => {
        speed = Number(speedControl.slider.value());
        speedControl.valueEl.html(String(speed));
      });

      p.background(0);
    };

    p.draw = () => {
      p.background(10);

      const margin = p.width < 520 ? 18 : 40;
      const grid = p.width < 520 ? 16 : 20;

      drawGrid(p, margin, grid);

      const midY = p.height / 2;

      p.noFill();
      p.stroke(0, 255, 80);
      p.strokeWeight(2);

      // ---- simulate incoming ECG samples ----
      for (let k = 0; k < speed; k++) {
        index = (index + 1) % ecg.length;
      }

      p.beginShape();
      const visibleWidth = Math.floor(p.width - margin * 2);

      for (let x = 0; x < visibleWidth; x++) {
        const i = (index + x) % ecg.length;
        const y = midY - ecg[i] * scaleY;
        p.vertex(margin + x, y);
      }
      p.endShape();

      // Small overlay text
      p.noStroke();
      p.fill(180);
      p.textSize(p.width < 520 ? 12 : 14);
      const overlay = `ECG demo  |  bpm=${bpm}  |  speed=${speed}  |  scale=${scaleY}`;
      const textX = Math.max(margin, p.width - margin - p.textWidth(overlay));
      p.text(overlay, textX, margin + 24);
    };

    p.keyPressed = () => {
      if (p.keyCode === p.UP_ARROW) scaleY = Math.min(260, scaleY + 10);
      if (p.keyCode === p.DOWN_ARROW) scaleY = Math.max(20, scaleY - 10);

      if (p.keyCode === p.RIGHT_ARROW) speed = Math.min(10, speed + 1);
      if (p.keyCode === p.LEFT_ARROW) speed = Math.max(1, speed - 1);

      if (p.key === 'r' || p.key === 'R') {
        regenerateBpm();
      }

      syncControlUi();
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    function regenerateBpm() {
      bpm = Math.floor(50 + Math.random() * 40);
      ecg = generateECG({ length: ECG_LENGTH, bpm, sampleRate: SAMPLE_RATE });
      index = 0;
      syncControlUi();
    }

    function syncControlUi() {
      if (scaleControl) {
        scaleControl.slider.value(scaleY);
        scaleControl.valueEl.html(String(scaleY));
      }

      if (speedControl) {
        speedControl.slider.value(speed);
        speedControl.valueEl.html(String(speed));
      }

      if (bpmControl) {
        bpmControl.valueEl.html(`${bpm} bpm`);
      }
    }
  });
}

function drawGrid(p, margin, grid) {
  p.stroke(35);
  p.strokeWeight(1);

  for (let x = margin; x <= p.width - margin; x += grid) {
    p.line(x, margin, x, p.height - margin);
  }
  for (let y = margin; y <= p.height - margin; y += grid) {
    p.line(margin, y, p.width - margin, y);
  }

  // heavier lines every 5 cells (ECG-paper vibe)
  p.stroke(55);
  for (let x = margin; x <= p.width - margin; x += grid * 5) {
    p.line(x, margin, x, p.height - margin);
  }
  for (let y = margin; y <= p.height - margin; y += grid * 5) {
    p.line(margin, y, p.width - margin, y);
  }
}
