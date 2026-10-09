import readme from "./README.md?raw";
import previewUrl from "./preview.svg";

export const meta = {
  id: "kaleidoscope",
  title: "Camera Kaleidoscope",
  description: "Turn the world around you into a live field of mirrors. Explore three classic patterns and capture a portrait photo ready for your Story.",
  authors: [],
  status: "Open for collaboration",
  mode: "interactive",
  themes: ["camera", "mirrors", "geometry"],
  controls: [
    "Allow camera access when the page opens. Use an HTTPS link on your phone.",
    "Point the rear camera at colorful objects, plants, or anything around you.",
    "Drag left or right to turn the imagery inside the mirrors. Rotation stops when you let go.",
    "Choose Classic, Square, or Intricate at the bottom. Flip camera switches between rear and front.",
    "Capture photo saves the outlined portrait frame as a 1080 × 1920 JPG. Preview, download or share where supported, or choose Retake.",
    "On a keyboard, focus the canvas and use the left and right arrow keys to turn.",
    "After switching apps or locking your phone, tap Resume camera to continue.",
  ],
  previewUrl,
  readme,
};
