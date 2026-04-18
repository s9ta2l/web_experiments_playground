import readme from "./README.md?raw";
import previewUrl from "./preview.svg";

export const meta = {
  id: "pendulum",
  title: "Triple Pendulum",
  description: "A constraint-based triple pendulum that starts from a random push and settles into chaotic motion.",
  authors: [],
  status: "Open for collaboration",
  mode: "interactive",
  themes: ["physics", "chaos"],
  controls: [
    "Use the Start / Random push button to reset the pendulum with a new kick.",
  ],
  previewUrl,
  readme,
};
