# Bent Line Field

## What it is

A static field study of vertical strokes where each column bends a little more than the previous one.

## Controls

- Grid density changes the number of rows and columns.
- Bend changes how far each line curves.
- Use Segments to adjust curve smoothness.
- Gap sets the vertical space between strokes in pixels. Its maximum adjusts to the screen height, density, and padding so every row stays visible. If a smaller screen cannot fit the current gap, the slider and its displayed value adjust together.
- Padding sets the clear outer border, including the width of the stroke and the rightmost bend.

## Responsive spacing

The grid fits all rows inside the padded canvas. Columns reserve room for the widest bend, so the final row and rightmost curves remain inside the border. Gap uses its displayed pixel value directly. The field redraws only when a control or viewport changes.

To verify, use a portrait phone with the default density and padding, then compare Gap 3 and Gap 6: the space between rows should visibly increase and the strokes should shorten. Set density to 20, Padding to 8, and Bend to 1: the bottom row and rightmost curves should stay inside the border. Repeat in landscape at density 90; Gap's maximum and readout should adjust if needed, and no strokes should run offscreen.

## Collaboration notes

- Easy areas to explore: animation, mouse interaction, color ramps, printing/export, or responsive density.
- This is a strong candidate for collaborators who want to add a single, focused feature.
