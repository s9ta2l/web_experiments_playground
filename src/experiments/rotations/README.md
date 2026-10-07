# Rotation Matrices in 3D

## What it is

A side-by-side comparison of the three axis-aligned 3D rotation matrices. Each wireframe cube rotates only via its own matrix — X around X, Y around Y, Z around Z. The matrix is shown live beside its cube so the cos / sin entries make sense as the cube turns.

## Controls

- `Timeline` — drag to move forward or backward within the current animation cycle. Pause first to hold a frame steady.
- `Play` / `Pause` — start or stop the animation.
- `Reset` — return the timeline and all three axes to θ = 0 (the identity matrix).
- `ω_x` / `ω_y` / `ω_z` — angular speed per axis in radians per second. Changing speed preserves the current pose. Set one to 0 to freeze that axis and study another in isolation.
- On smaller screens, swipe the matrix row to compare all three axes. Cards keep a readable minimum width instead of squeezing their values together.

On short screens, the control panel scrolls within its available space. Portrait layouts keep the cubes between the controls and matrices; short landscape layouts put the matrices beside the controls and fit the cubes into the larger remaining area. Layout measurements update on resize and panel-size changes, outside the animation loop.

Each axis accumulates its own angle, so fractional and negative speeds remain continuous when the timeline loops. Scrubbing moves from the current pose at the selected speeds, including after earlier cycles; a frozen axis stays frozen. Reset returns every axis to the identity regardless of its speed.

To verify, set X speed to 0.5 and Y speed to −0.75, then watch the timeline pass from its end back to 0. Both cubes should keep turning smoothly. Pause and change a speed: the pose should stay still until playback or scrubbing resumes. Set a speed to 0 to hold that cube, and press Reset while paused to see all three identity matrices.

## Screen-reader access

The matrix cards are in a named Rotation matrices region outside the decorative canvas stage. Each axis has its own named group with the angle, nine numeric entries, and nine formula entries. Both grids read in row order. Values are not a live announcement stream; pause the animation to inspect a stable matrix, then use the Timeline or speed sliders to explore another pose.

To verify, pause and use a screen reader or the browser accessibility tree to find the Rotation matrices region and its X, Y, and Z groups. Each should expose its angle and all numeric and formula entries. Opening the menu makes this background content inert; closing it restores access. The cards should keep the same positions and swipe behavior in portrait and landscape.

## Collaboration notes

- Natural extensions: a fourth cube showing the composed rotation `R_z · R_y · R_x` on a single cube; a matrix-vector demo tracing a vertex's path; animating between two saved matrix states.
- Out of scope for v1: mouse-orbit camera, quaternions, Euler-angle gimbal-lock demo.
