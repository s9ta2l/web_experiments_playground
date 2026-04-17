import p5 from "p5";

export function startTemplateExperiment({ mountId = "app" } = {}) {
  new p5((p) => {
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight).parent(mountId);
      p.pixelDensity(1);
    };

    p.draw = () => {
      p.background("#101820");

      p.noFill();
      p.stroke("#f8fafc");
      p.strokeWeight(3);
      p.circle(p.width * 0.5, p.height * 0.5, 180);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  });
}
