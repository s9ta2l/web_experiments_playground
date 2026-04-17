import p5 from "p5";
import { addSliderControl, createControlPanel } from "../shared/controlPanel.js";

export function startLineSpectrumExperiment({
  mountId = "app",
  controlsMountId = mountId,
} = {}) {
  new p5((p) => {
    // Tweakables
    let gridCount = 60;
    let bendMax = 0.95; // 1.0 = perfect half-circle
    let segments = 24;
    let gap = 1;
    let pad = 28;
    const BG = 8;

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight).parent(mountId);
      p.pixelDensity(1);
      p.noFill();
      p.stroke(230);
      p.strokeWeight(1);

      const panel = createControlPanel(p, controlsMountId);

      const gridControl = addSliderControl(p, panel, {
        label: "Grid density",
        min: 20,
        max: 90,
        value: gridCount,
        step: 1,
      });
      gridControl.slider.input(() => {
        gridCount = Number(gridControl.slider.value());
      });

      const bendControl = addSliderControl(p, panel, {
        label: "Bend",
        min: 0,
        max: 1,
        value: bendMax,
        step: 0.01,
        format: (value) => Number(value).toFixed(2),
      });
      bendControl.slider.input(() => {
        bendMax = Number(bendControl.slider.value());
      });

      const segmentControl = addSliderControl(p, panel, {
        label: "Segments",
        min: 8,
        max: 48,
        value: segments,
        step: 1,
      });
      segmentControl.slider.input(() => {
        segments = Number(segmentControl.slider.value());
      });

      const gapControl = addSliderControl(p, panel, {
        label: "Gap",
        min: 0,
        max: 6,
        value: gap,
        step: 0.1,
        format: (value) => Number(value).toFixed(1),
      });
      gapControl.slider.input(() => {
        gap = Number(gapControl.slider.value());
      });

      const padControl = addSliderControl(p, panel, {
        label: "Padding",
        min: 8,
        max: 60,
        value: pad,
        step: 1,
      });
      padControl.slider.input(() => {
        pad = Number(padControl.slider.value());
      });
    };

    p.draw = () => {
      p.background(BG);

      const w = p.width - pad * 2;
      const h = p.height - pad * 2;
      const gapX = Math.min(gap, (w / (gridCount - 1)) * 0.2);
      const gapY = Math.min(gap, (h / (gridCount - 1)) * 0.2);
      const cellW = (w - gapX * (gridCount - 1)) / (gridCount - 1);
      const cellH = (h - gapY * (gridCount - 1)) / (gridCount - 1);

      for (let gy = 0; gy < gridCount; gy++) {
        const y0 = pad + gy * (cellH + gapY);
        const y1 = y0 + cellH;
        for (let gx = 0; gx < gridCount; gx++) {
          const x = pad + gx * (cellW + gapX);
          const t = gx / (gridCount - 1);
          const curve = bendMax * t;
          drawBentLine(x, y0, y1, curve);
        }
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    function drawBentLine(x, yTop, yBot, curve) {
      const maxOffset = (yBot - yTop) * 0.5 * curve;
      const a = 1.0;
      const b = 1.0;
      const peakT = a / (a + b);
      const peak = Math.pow(peakT, a) * Math.pow(1 - peakT, b);

      p.beginShape();
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = yTop + (yBot - yTop) * t;
        const shape = (Math.pow(t, a) * Math.pow(1 - t, b)) / peak;
        const xOff = maxOffset * shape;
        p.vertex(x + xOff, y);
      }
      p.endShape();
    }
  });
}
