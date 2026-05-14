import p5 from "p5";
import {
  createControlPanel,
  addSliderControl,
  addCheckboxControl,
} from "../shared/controlPanel.js";

export function startTriangleExperiment({
  mountId = "app",
  controlsMountId = mountId,
} = {}) {
  new p5((p) => {
    // Tweakables
    const SIZE_MIN = 20;
    const SIZE_MAX = 180;
    const SPEED_MIN = 0.5;
    const SPEED_MAX = 6.0;
    const ANGVEL_MIN = 0.005;
    const ANGVEL_MAX = 0.02;
    const COUNT_MIN = 1;
    const COUNT_MAX = 6;
    const TRAIL_FADE_ALPHA = 16;
    const BG = 12;
    const VERTEX_STEP = (Math.PI * 2) / 3;

    let speed = 2.0;
    let radius = 60;
    const triangles = [];

    let sizeControl;
    let speedControl;
    let countControl;
    let trailsCheckbox;

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight).parent(mountId);
      p.pixelDensity(1);
      p.background(BG);

      setCount(1);

      const panel = createControlPanel(p, controlsMountId);

      sizeControl = addSliderControl(p, panel, {
        label: "Size",
        min: SIZE_MIN,
        max: SIZE_MAX,
        value: radius,
        step: 1,
        format: (value) => `${Math.round(value)}px`,
      });

      speedControl = addSliderControl(p, panel, {
        label: "Speed",
        min: SPEED_MIN,
        max: SPEED_MAX,
        value: speed,
        step: 0.1,
        format: (value) => Number(value).toFixed(1),
      });

      countControl = addSliderControl(p, panel, {
        label: "Count",
        min: COUNT_MIN,
        max: COUNT_MAX,
        value: triangles.length,
        step: 1,
        format: (value) => String(Math.round(value)),
      });

      trailsCheckbox = addCheckboxControl(p, panel, {
        label: "Trails",
        checked: false,
      });

      sizeControl.slider.input(() => {
        radius = sizeControl.slider.value();
        sizeControl.valueEl.html(`${Math.round(radius)}px`);
      });

      speedControl.slider.input(() => {
        speed = speedControl.slider.value();
        speedControl.valueEl.html(Number(speed).toFixed(1));
      });

      countControl.slider.input(() => {
        const n = Math.round(countControl.slider.value());
        countControl.valueEl.html(String(n));
        setCount(n);
      });

      trailsCheckbox.changed(() => {
        // Turning trails off: wipe the lingering ghost so the next frame starts clean.
        if (!trailsCheckbox.checked()) p.background(BG);
      });
    };

    p.draw = () => {
      if (trailsCheckbox && trailsCheckbox.checked()) {
        p.noStroke();
        p.fill(BG, TRAIL_FADE_ALPHA);
        p.rect(0, 0, p.width, p.height);
      } else {
        p.background(BG);
      }

      for (const t of triangles) {
        t.x += t.dirX * speed;
        t.y += t.dirY * speed;
        t.angle += t.angVel;

        const ext = triangleExtents(t.angle, radius);
        if (t.x + ext.minX < 0) {
          t.x = -ext.minX;
          t.dirX = Math.abs(t.dirX);
        } else if (t.x + ext.maxX > p.width) {
          t.x = p.width - ext.maxX;
          t.dirX = -Math.abs(t.dirX);
        }
        if (t.y + ext.minY < 0) {
          t.y = -ext.minY;
          t.dirY = Math.abs(t.dirY);
        } else if (t.y + ext.maxY > p.height) {
          t.y = p.height - ext.maxY;
          t.dirY = -Math.abs(t.dirY);
        }
      }

      for (let i = 0; i < triangles.length; i++) {
        for (let j = i + 1; j < triangles.length; j++) {
          resolveCollision(triangles[i], triangles[j]);
        }
      }

      p.noFill();
      p.stroke(240);
      p.strokeWeight(2);
      for (const t of triangles) drawTriangle(t);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      for (const t of triangles) {
        t.x = p.constrain(t.x, radius, Math.max(p.width - radius, radius));
        t.y = p.constrain(t.y, radius, Math.max(p.height - radius, radius));
      }
      p.background(BG);
    };

    function setCount(n) {
      while (triangles.length < n) triangles.push(spawn());
      while (triangles.length > n) triangles.pop();
    }

    function spawn() {
      const theta = p.random(p.TWO_PI);
      const xHi = Math.max(p.width - radius, radius + 1);
      const yHi = Math.max(p.height - radius, radius + 1);
      return {
        x: p.random(radius, xHi),
        y: p.random(radius, yHi),
        dirX: Math.cos(theta),
        dirY: Math.sin(theta),
        angle: p.random(p.TWO_PI),
        angVel:
          p.random(ANGVEL_MIN, ANGVEL_MAX) * (p.random() < 0.5 ? -1 : 1),
      };
    }

    // Axis-aligned reach of the rotated triangle from its center.
    // Used for edge bouncing — bounces fire exactly when a vertex touches the wall.
    function triangleExtents(angle, r) {
      const c0 = Math.cos(angle);
      const c1 = Math.cos(angle + VERTEX_STEP);
      const c2 = Math.cos(angle + VERTEX_STEP * 2);
      const s0 = Math.sin(angle);
      const s1 = Math.sin(angle + VERTEX_STEP);
      const s2 = Math.sin(angle + VERTEX_STEP * 2);
      return {
        minX: Math.min(c0, c1, c2) * r,
        maxX: Math.max(c0, c1, c2) * r,
        minY: Math.min(s0, s1, s2) * r,
        maxY: Math.max(s0, s1, s2) * r,
      };
    }

    // Furthest vertex of the rotated triangle in direction (nx, ny), expressed
    // as a fraction of `radius`. Lets pair-wise collisions fire when actual
    // vertices touch along the center-to-center axis, not when bounding circles do.
    function maxProjection(angle, nx, ny) {
      const a0 = angle;
      const a1 = angle + VERTEX_STEP;
      const a2 = angle + VERTEX_STEP * 2;
      const p0 = Math.cos(a0) * nx + Math.sin(a0) * ny;
      const p1 = Math.cos(a1) * nx + Math.sin(a1) * ny;
      const p2 = Math.cos(a2) * nx + Math.sin(a2) * ny;
      return Math.max(p0, p1, p2);
    }

    function resolveCollision(a, b) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      if (dist === 0) return;

      const nx = dx / dist;
      const ny = dy / dist;
      const aReach = maxProjection(a.angle, nx, ny) * radius;
      const bReach = maxProjection(b.angle, -nx, -ny) * radius;
      const minDist = aReach + bReach;
      if (dist >= minDist) return;

      const overlap = (minDist - dist) / 2;
      a.x -= nx * overlap;
      a.y -= ny * overlap;
      b.x += nx * overlap;
      b.y += ny * overlap;

      // Equal-mass elastic exchange of the normal velocity component; tangential
      // components are preserved. We then renormalize so the global Speed slider
      // stays the single source of truth for how fast triangles move.
      const va = a.dirX * nx + a.dirY * ny;
      const vb = b.dirX * nx + b.dirY * ny;
      const delta = vb - va;
      a.dirX += delta * nx;
      a.dirY += delta * ny;
      b.dirX -= delta * nx;
      b.dirY -= delta * ny;

      normalize(a);
      normalize(b);
    }

    function normalize(t) {
      const m = Math.hypot(t.dirX, t.dirY);
      if (m > 1e-9) {
        t.dirX /= m;
        t.dirY /= m;
      } else {
        // Degenerate case (e.g. perpendicular T-bone fully transfers momentum) —
        // pick a fresh random direction so the triangle keeps moving.
        const theta = p.random(p.TWO_PI);
        t.dirX = Math.cos(theta);
        t.dirY = Math.sin(theta);
      }
    }

    function drawTriangle(t) {
      p.push();
      p.translate(t.x, t.y);
      p.rotate(t.angle);
      p.beginShape();
      p.vertex(Math.cos(0) * radius, Math.sin(0) * radius);
      p.vertex(Math.cos(VERTEX_STEP) * radius, Math.sin(VERTEX_STEP) * radius);
      p.vertex(
        Math.cos(VERTEX_STEP * 2) * radius,
        Math.sin(VERTEX_STEP * 2) * radius,
      );
      p.endShape(p.CLOSE);
      p.pop();
    }
  });
}
