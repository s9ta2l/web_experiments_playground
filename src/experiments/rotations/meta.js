import readme from "./README.md?raw";
import previewUrl from "./preview.svg";

export const meta = {
  id: "rotations",
  chromeTheme: "light",
  title: "Rotation Matrices",
  description:
    "Three wireframe cubes — one per axis — rotating via their own 3×3 matrix, with the matrix shown live beside each.",
  authors: [],
  mode: "interactive",
  themes: ["math", "3d", "education"],
  controls: [
    "Timeline — drag to scrub within the current cycle. Pause to hold a frame steady.",
    "Play / Pause to start or stop the animation.",
    "Reset the timeline and all axes to θ = 0 (the identity matrix).",
    "ω_x, ω_y, ω_z — angular speed per axis. Changing speed preserves the pose; 0 freezes it.",
    "On smaller screens, swipe the matrix row to compare all three axes.",
    "For screen readers, pause and browse the Rotation matrices region to read each axis.",
  ],
  previewUrl,
  readme,
};
