# Pendulum

## What it is

A lightweight, constraint-based triple pendulum that uses Verlet-style integration and repeated distance correction.

## Controls

- `Start / Random push` resets the masses and applies a new random impulse.

## Responsive view

The pendulum fits the larger free area beside or below the controls, respecting the display's safe areas. Its pivot is centered in that area and the drawing scales down to fit the full swing, including the masses. Rotating or resizing the screen updates the view without resetting the simulation or changing link lengths, gravity, or damping.

To verify, open the experiment in portrait and landscape, start a random push, and rotate the phone while it runs. All three masses should stay visible and clear of the controls. A resize should preserve the current motion.

## Collaboration notes

- Future directions: trails, energy readouts, damping controls, alternative integrators, or recording / replay.
- This experiment is ideal for contributors interested in simulation structure and debugging.
