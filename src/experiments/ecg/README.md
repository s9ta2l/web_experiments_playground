# ECG

## What it is

A synthetic electrocardiogram display generated from simple Gaussian components and drawn over a paper-like grid.

## Controls

- `Up / Down` changes vertical scale.
- `Left / Right` changes scroll speed.
- `R` randomizes the heart rate and regenerates the buffer.

Shortcuts work while viewing the experiment with the menu closed. Focused sliders keep their native arrow-key behavior; text fields and browser shortcuts are also left alone.

To verify, click the canvas and press Up: Scale should increase by 10 and the trace should grow taller. Down reverses it. Right increases Playback speed by 1; Left reverses it. Scale stays between 20 and 260, and speed between 1 and 10. Tab to a slider and press an arrow: only that slider should change by its normal step of 1. Press R from the canvas to generate a new heart rate.

## Collaboration notes

- Natural extensions: noise models, arrhythmia presets, recorded data, or audio-reactive overlays.
- This experiment is a good place for contributors interested in data visualization rather than pure geometry.
