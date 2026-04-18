import readme from "./README.md?raw";
import previewUrl from "./preview.svg";

export const meta = {
  id: "ecg",
  title: "Synthetic ECG",
  description: "A scrolling heartbeat trace over an ECG-style grid with keyboard controls for speed and scale.",
  authors: [],
  status: "Open for collaboration",
  mode: "interactive",
  themes: ["signal", "data"],
  controls: [
    "Up and Down arrows change the waveform scale.",
    "Left and Right arrows change playback speed.",
    "Press R to regenerate a new heart rate.",
  ],
  previewUrl,
  readme,
};
