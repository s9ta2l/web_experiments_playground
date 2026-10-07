import readme from "./README.md?raw";
import previewUrl from "./preview.svg";

export const meta = {
  id: "lines",
  title: "Bent Line Field",
  description: "A dense grid of vertical strokes that gradually bend into smooth arcs from left to right.",
  authors: [],
  status: "Open for collaboration",
  mode: "static",
  themes: ["pattern", "field"],
  controls: [
    "Use Grid density to change the number of rows and columns.",
    "Use Bend to change how far each line curves.",
    "Use Segments to adjust curve smoothness.",
    "Gap sets vertical spacing in pixels. Its range adapts to the screen and density.",
    "Padding sets a clear border around the field, including the curved strokes.",
  ],
  previewUrl,
  readme,
};
