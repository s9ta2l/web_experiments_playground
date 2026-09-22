import readme from "./README.md?raw";
import previewUrl from "./preview.svg";

export const meta = {
  id: "art-code-wake",
  title: "Art / Code Wake",
  description: "Move through a pale blue-white canvas to reveal a fading water-like mesh, with optional binary and brush marks beside the cursor.",
  authors: [],
  status: "Open for collaboration",
  mode: "interactive",
  themes: ["art", "code", "cursor"],
  controls: [
    "Move a mouse or finger to reveal the two fading traces: binary on the left, paint on the right.",
    "Trace density changes how many marks follow each movement.",
    "Trace radius changes the size of both circular regions equally.",
    "Side distance moves both circular regions equally away from the cursor.",
    "Fade time changes how long marks remain visible.",
    "Blue-white background toggles the soft backdrop; Background opacity sets its strength.",
    "Water + mesh adjusts the subtle ripple and square-grid layer.",
    "Binary numbers and Paint strokes can be toggled independently to isolate the water effect.",
    "Paint triplet selects one of three colour palettes.",
    "Show hint reveals an optional line of text; Clear removes all marks.",
  ],
  previewUrl,
  readme,
};
