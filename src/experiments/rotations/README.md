# Rotation Matrices in 3D

## What it is

A side-by-side comparison of the three axis-aligned 3D rotation matrices. Each wireframe cube rotates only via its own matrix — X around X, Y around Y, Z around Z. The matrix is shown live beside its cube so the cos / sin entries make sense as the cube turns.

## Controls

- `Timeline` — drag to scrub through the rotation. Pause first to hold a frame steady.
- `Play` / `Pause` — start or stop the animation.
- `Reset` — return to θ = 0 (the identity matrix).
- `ω_x` / `ω_y` / `ω_z` — angular speed per axis. Set one to 0 to freeze that axis and study another in isolation.
- On smaller screens, swipe the matrix row to compare all three axes. Cards keep a readable minimum width instead of squeezing their values together.

On short screens, the control panel scrolls within its available space. Portrait layouts keep the cubes between the controls and matrices; short landscape layouts put the matrices beside the controls and fit the cubes into the larger remaining area. Layout measurements update on resize and panel-size changes, outside the animation loop.

## Collaboration notes

- Natural extensions: a fourth cube showing the composed rotation `R_z · R_y · R_x` on a single cube; a matrix-vector demo tracing a vertex's path; animating between two saved matrix states.
- Out of scope for v1: mouse-orbit camera, quaternions, Euler-angle gimbal-lock demo.
