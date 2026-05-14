import readme from "./README.md?raw";
import previewUrl from "./preview.svg";

export const meta = {
  id: "rotations",
  title: "Rotation Matrices in 3D",
  description:
    "Three wireframe cubes — one per axis — rotating via their own 3×3 matrix, with the matrix shown live beside each.",
  authors: [],
  status: "Open for collaboration",
  mode: "interactive",
  themes: ["math", "3d", "education"],
  controls: [
    "Timeline — drag to scrub through the rotation.",
    "Play / Pause to start or stop the animation.",
    "Reset to return to θ = 0 (the identity matrix).",
    "ω_x, ω_y, ω_z — angular speed per axis. Set one to 0 to freeze that axis.",
  ],
  previewUrl,
  readme,
};
