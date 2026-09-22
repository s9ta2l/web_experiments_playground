# Art / Code Wake

## What it is

A cursor-responsive canvas about the overlap between art and technology. The default pale blue-white background can be switched off for a plain white canvas. Movement places rising `0` and `1` marks in a circular area on the left of the pointer. Brush strokes begin inside a matching circle on the right and point outward, sometimes stacking or overlapping as the cursor moves. Both circles stay the same distance from the pointer. A water-like wash and small grid-aligned squares respond underneath them. All movement-triggered marks fade away when the pointer rests.

The visual motion takes inspiration from the pointer-reactive atmosphere of the DeepSeek Harness website, while keeping this experiment's light canvas and its own art/code language.

## Controls

- Move a mouse or finger across the canvas to draw both sides.
- Trace density adjusts how often marks are placed along the path.
- Trace radius adjusts the size of both circular regions equally.
- Side distance moves both circular regions equally away from the cursor.
- Fade time adjusts how long the marks, water, and squares remain.
- Blue-white background turns the soft backdrop on or off; Background opacity adjusts its strength from plain white to the full pale-blue treatment.
- Water + mesh adjusts the strength of the pale wash and square layer; zero hides both.
- Binary numbers and Paint strokes can be turned off independently. Turn both off to explore the pointer-responsive water and squares alone.
- Paint triplet selects Studio (blue, coral, gold), Garden (green, violet, peach), or Signal (cyan, pink, lime).
- Show hint reveals the optional line “between intuition and logic.” It is off by default.
- Clear removes the current marks.

## Collaboration notes

The first pass uses a bounded number of marks and stops drawing when they have faded. Key visual parameters and the three palettes are near the top of `Experiment.js`. Good next iterations include tuning the brush character, refining the water motion, and deciding whether the optional hint belongs on a future portfolio page.
