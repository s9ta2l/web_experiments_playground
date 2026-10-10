import readme from "./README.md?raw";
import previewUrl from "./preview.svg";

export const meta = {
  id: "spiral",
  chromeTheme: "light",
  title: "Archimedean Spiral",
  description: "An Archimedean spiral study with controls for turn count, spacing, spin, orbit offset, and trails.",
  authors: [],
  mode: "interactive",
  themes: ["geometry", "orbit"],
  controls: [
    "Use the control panel to adjust spacing, turns, angular speed, orbit radius, and offsets.",
    "Toggle trails or pause the animation from the panel.",
  ],
  previewUrl,
  readme,
};
