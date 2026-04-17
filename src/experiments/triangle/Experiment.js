import p5 from "p5";
import { createControlPanel, addSliderControl } from "../shared/controlPanel.js";

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
    const RESTITUTION = 1.0;
    const BG = 12;

    let x = 0;
    let y = 0;
    let dirX = 0;
    let dirY = 0;
    let speed = 2.0;
    let radius = 60;
    let angle = 0;
    let angVel = 0;

    let sizeControl;
    let speedControl;

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight).parent(mountId);
      p.pixelDensity(1);

      x = p.random(radius, p.width - radius);
      y = p.random(radius, p.height - radius);

      const dir = randomDirection();
      dirX = dir.x;
      dirY = dir.y;
      angle = p.random(p.TWO_PI);
      angVel = p.random(ANGVEL_MIN, ANGVEL_MAX) * (p.random() < 0.5 ? -1 : 1);

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

      sizeControl.slider.input(() => {
        radius = sizeControl.slider.value();
        sizeControl.valueEl.html(`${Math.round(radius)}px`);
      });

      speedControl.slider.input(() => {
        speed = speedControl.slider.value();
        speedControl.valueEl.html(Number(speed).toFixed(1));
      });
    };

    p.draw = () => {
      p.background(BG);

      x += dirX * speed;
      y += dirY * speed;
      angle += angVel;

      // Bounce on edges with elastic response
      if (x < radius) {
        x = radius;
        dirX = Math.abs(dirX) * RESTITUTION;
      } else if (x > p.width - radius) {
        x = p.width - radius;
        dirX = -Math.abs(dirX) * RESTITUTION;
      }

      if (y < radius) {
        y = radius;
        dirY = Math.abs(dirY) * RESTITUTION;
      } else if (y > p.height - radius) {
        y = p.height - radius;
        dirY = -Math.abs(dirY) * RESTITUTION;
      }

      p.push();
      p.translate(x, y);
      p.rotate(angle);

      p.noFill();
      p.stroke(240);
      p.strokeWeight(2);

      p.beginShape();
      const step = p.TWO_PI / 3;
      p.vertex(Math.cos(0) * radius, Math.sin(0) * radius);
      p.vertex(Math.cos(step) * radius, Math.sin(step) * radius);
      p.vertex(Math.cos(step * 2) * radius, Math.sin(step * 2) * radius);
      p.endShape(p.CLOSE);
      p.pop();
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      x = p.constrain(x, radius, p.width - radius);
      y = p.constrain(y, radius, p.height - radius);
    };

    function randomDirection() {
      const theta = p.random(p.TWO_PI);
      return { x: Math.cos(theta), y: Math.sin(theta) };
    }
  });
}
