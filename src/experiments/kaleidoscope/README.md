# Camera Kaleidoscope

A live camera experiment inspired by the fixed mirrors and turning object chamber of a traditional kaleidoscope. The world seen by the camera supplies the imagery, as it does in a teleidoscope.

## Experience

- Opens its own gallery page at `?experiment=kaleidoscope`.
- Requests camera access on entry, preferring the rear camera. No microphone is requested.
- Fills the available browser viewport in portrait and landscape.
- Drag horizontally to turn the camera imagery inside fixed mirrors. There is no automatic rotation or inertia.
- Select **Classic** (60–60–60), **Square** (45–45–90), or **Intricate** (30–60–90).
- Flip between front and rear cameras. The front camera is mirrored for a familiar selfie view.
- Camera frames stay on the device; nothing is recorded or uploaded.
- Backgrounding the page releases the camera. Return and tap **Resume camera** to restart it.

## Runtime

`Experiment.js` owns the camera lifecycle, controls, touch/keyboard input, and p5 WebGL canvas. `shaders.js` reflects each screen coordinate into a triangular mirror cell, rotates the source around that cell's centroid, and samples the video texture. Reflections repeat across the entire view rather than ending at a circular border.

The source crop fits every rotation inside the camera image. Camera aspect ratio is corrected before sampling; objects keep their proportions. Source colors are unchanged.

Tweak the constants at the top of `Experiment.js`:

- `FRAME_RATE`: camera preference and rendering target, initially 30 fps.
- `CAMERA_WIDTH` / `CAMERA_HEIGHT`: preferred capture size; the browser can choose another size.
- `MAX_RENDER_PIXELS`: caps canvas backing resolution independently of CSS size and device pixel density.
- `MIRROR_SCALE`: number of mirror cells across the view. Keep it within the shader's bounded fold range; larger values need more folds.
- `SOURCE_CROP`: how much of the source camera image fits into a mirror cell, with padding for rotation.
- `TURN_PER_SCREEN`: radians turned by a horizontal drag spanning the screen's shorter side.

Viewport and source uniforms update on resize, metadata changes, pattern selection, or input. The draw loop uses one video texture and one plane, with no JavaScript pixel processing.

Pending permission requests are invalidated when the page is hidden, unloaded, or replaced during development. Late streams are immediately stopped. Switching cameras stops the previous tracks first. Permission failures, missing cameras, playback requiring a tap, and graphics interruptions show recovery instructions.

## Run and verify

```sh
npm run dev
npm run build
```

Open `http://localhost:5173/?experiment=kaleidoscope` on the development computer. **Phone camera access requires trusted HTTPS.** Opening `http://<computer-lan-ip>:5173` from a phone does not qualify as a secure context. Use the deployed GitHub Pages HTTPS URL or a trusted HTTPS development setup. The project does not add a certificate or tunnel dependency.

Check on iPhone Safari and Android Chrome:

1. Open the direct link. Accept permission: the rear camera should fill the page with repeating reflections.
2. Point at something colorful. The image should update live, retain natural colors, and have matching edges at the mirror boundaries.
3. Drag left/right: shapes should reform within fixed mirrors. Release: rotation stops while camera motion continues.
4. Choose all three patterns. Each should change the reflection geometry without another permission request.
5. Flip the camera twice. Only the selected camera should remain active.
6. Rotate the phone and expand/collapse browser toolbars. There should be no scrolling, image stretching, or blank viewport borders; controls stay clear of safe areas.
7. Deny permission, then enable it in site settings and retry. Check the error message also on an HTTP phone URL.
8. Switch apps or lock the phone. The camera should stop; returning should offer **Resume camera**.
9. Navigate back to the showroom and return. Camera resources should be released, including when browser navigation uses the back/forward cache.
10. On desktop, tab to the canvas and turn with arrow keys. WebGL unavailable/context lost should show an actionable message rather than request a camera for an unusable view.

## Optical references

- [Brewster Kaleidoscope Society: the kaleidoscopic image](https://brewstersociety.com/kaleidoscope-university/kaleidoscopic-image/)
- [University of Colorado: three mirrors at 60 degrees](https://physicslabs.colorado.edu/demos/optics/geometrical-optics/reflection-from-flat-surfaces/kaleidoscope/)
- [Brewster Kaleidoscope Society: 30–60–90 and 45–45–90 mirror systems](https://brewstersociety.com/kaleidoscope-convention/2024-kaleidoscope-expo/classes/)
