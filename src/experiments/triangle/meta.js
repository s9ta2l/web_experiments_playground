import readme from "./README.md?raw";
import previewUrl from "./preview.svg";

export const meta = {
  id: "triangle",
  title: "Bouncing Triangle",
  description: "Outlined triangles spinning and bouncing across the viewport — with optional trails and pair-wise collisions when more than one is on screen.",
  authors: [],
  status: "Open for collaboration",
  mode: "interactive",
  themes: ["geometry", "motion"],
  controls: [
    "Use the Size slider to change the triangle radius.",
    "Use the Speed slider to change how quickly it crosses the screen.",
    "Use the Count slider (1–6) to spawn more triangles; they collide with each other.",
    "Toggle Trails to leave fading streaks behind every triangle.",
  ],
  previewUrl,
  readme,
};
