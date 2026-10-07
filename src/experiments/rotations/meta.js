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
    "Timeline — drag to scrub within the current cycle. Pause to hold a frame steady.",
    "Play / Pause to start or stop the animation.",
    "Reset the timeline and all axes to θ = 0 (the identity matrix).",
    "ω_x, ω_y, ω_z — angular speed per axis. Changing speed preserves the pose; 0 freezes it.",
    "On smaller screens, swipe the matrix row to compare all three axes.",
  ],
  previewUrl,
  readme,
};
