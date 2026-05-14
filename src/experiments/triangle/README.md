# Bouncing Triangle

## What it is

A minimal motion study: outlined equilateral triangles drift across the viewport, spin at randomly seeded angular speeds, and bounce elastically off the walls and off each other.

## Controls

- `Size` — triangle radius (circumradius).
- `Speed` — translation speed in px/frame.
- `Count` — how many triangles share the canvas (1–6). New triangles spawn at random positions/headings.
- `Trails` — when on, the background is faded each frame instead of cleared, so every triangle leaves a softly decaying streak.

## How the bounces work

Edge bounces and triangle-on-triangle collisions both use the same idea: project the triangle's three vertices onto the relevant axis and use *that* maximum reach, not the circumradius. That way a triangle bounces exactly when a vertex actually touches the wall (or another triangle), regardless of rotation.

Pair-wise collisions exchange the normal velocity component along the center-to-center axis (equal-mass elastic exchange) and then renormalize each direction vector — the global `Speed` slider stays the single source of truth for how fast anything moves.

## Collaboration notes

- Good place to try color systems, impact sounds, or richer collision response (full SAT, mass-aware impulses).
- Keep it lightweight so it stays a simple first experiment for newcomers.
