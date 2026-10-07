import p5 from "p5";
import { addSliderControl, createControlPanel } from "../shared/controlPanel.js";

export function startLineSpectrumExperiment({
  mountId = "app",
  controlsMountId = mountId,
} = {}) {
  new p5((p) => {
    // Tweakables
    let gridCount = 60;
    let bendMax = 0.95; // Bend of the rightmost column; 0 = straight.
    let segments = 24;
    let gap = 1;
    let pad = 28;
    const BG = 8;
    const STROKE_WEIGHT = 1;
    const MIN_LINE_HEIGHT = 1;
    const MAX_GAP = 6;
    const GAP_STEP = 0.1;
    let gapControl;

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight).parent(mountId);
      p.pixelDensity(1);
      p.noFill();
      p.stroke(230);
      p.strokeWeight(STROKE_WEIGHT);
      p.strokeCap(p.ROUND);
      p.strokeJoin(p.ROUND);

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
        updateGapRange();
        p.redraw();
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
        p.redraw();
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
        p.redraw();
      });

      gapControl = addSliderControl(p, panel, {
        label: "Gap",
        min: 0,
        max: MAX_GAP,
        value: gap,
        step: GAP_STEP,
        format: (value) => `${Number(value).toFixed(1)} px`,
      });
      gapControl.slider.input(() => {
        gap = Number(gapControl.slider.value());
        p.redraw();
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
        updateGapRange();
        p.redraw();
      });

      // Static study: render once, then only when a control or viewport changes.
      updateGapRange();
      p.noLoop();
    };

    p.draw = () => {
      p.background(BG);

      // Fit every row and reserve the stroke radius inside the padded border.
      const w = p.width - pad * 2 - STROKE_WEIGHT;
      const h = p.height - pad * 2 - STROKE_WEIGHT;
      if (w <= 0 || h <= 0) return;
      const origin = pad + STROKE_WEIGHT / 2;
      const cellH = (h - gap * (gridCount - 1)) / gridCount;
      // Keep the rightmost bend inside the border rather than clipping its bulge.
      const maxBend = Math.min(w, cellH * 0.5 * bendMax);
      const columnSpan = w - maxBend;

      for (let gy = 0; gy < gridCount; gy++) {
        const y0 = origin + gy * (cellH + gap);
        const y1 = y0 + cellH;
        for (let gx = 0; gx < gridCount; gx++) {
          const t = gx / (gridCount - 1);
          const x = origin + t * columnSpan;
          drawBentLine(x, y0, y1, maxBend * t);
        }
      }
    };

    p.windowResized = () => {
      // Update the allowed gap before drawing the new viewport.
      p.resizeCanvas(p.windowWidth, p.windowHeight, true);
      updateGapRange();
      p.redraw();
    };

    function updateGapRange() {
      if (!gapControl) return;
      const h = Math.max(0, p.height - pad * 2 - STROKE_WEIGHT);
      const minHeight = Math.min(MIN_LINE_HEIGHT, h / gridCount);
      const fitGap = Math.max(0, (h - gridCount * minHeight) / (gridCount - 1));
      const maxGap = Math.floor(Math.min(MAX_GAP, fitGap) / GAP_STEP) * GAP_STEP;
      // The native range clamps its value too, so its readout matches the drawing.
      gapControl.slider.attribute("max", maxGap.toFixed(1));
      gap = Number(gapControl.slider.value());
      gapControl.sync();
    }

    function drawBentLine(x, yTop, yBot, maxOffset) {
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
