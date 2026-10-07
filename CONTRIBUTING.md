# Contributing

## Welcome

This project is a collaborative gallery of browser-based visual experiments.

You can contribute in two ways:

- add a brand-new experiment
- improve an existing experiment with a focused change

The goal is to keep the structure approachable so a new contributor can get from clone to first experiment without guessing where things go.

## Local setup

```sh
npm install
npm run dev
```

Open the local URL shown by Vite. The showroom is the default landing page.

## Project shape

Each experiment lives in its own folder under `src/experiments/`:

```txt
src/experiments/<id>/
  Experiment.js
  meta.js
  README.md
  preview.svg
```

The shared experiment registry lives in:

```txt
src/experiments/index.js
```

That registry powers the showroom cards, experiment navigation, descriptions, credits, and readme support.

Direct links accept only registered IDs. To verify the fallback, open `/?experiment=constructor`, `/?experiment=__proto__`, or an unknown ID: each should show the showroom and a not-registered message. The legacy `?sketch=<id>` links follow the same rule.

Experiment runtimes receive `mountId` for the drawing stage, `controlsMountId` for controls, and `contentMountId` for readable overlays. Put text such as matrix values in the content mount so it remains available to assistive technology. The drawing stage is decorative by default; experiments with an interactive canvas, such as Kaleidoscope, explicitly expose it.

## Add a new experiment

1. Copy `src/experiments/_template/` into a new folder named after your experiment id.
2. Rename placeholders in `Experiment.js`, `meta.js`, `README.md`, and `preview.svg`.
3. Register the new experiment in `src/experiments/index.js`.
4. Run `npm run dev` and open `/?experiment=<your-id>`.
5. Confirm the experiment appears in the showroom and opens correctly from its card.

## Collaborate on an existing experiment

- Start by reading that experiment’s `README.md`.
- Keep the experiment focused on one strong idea.
- If you change controls or behavior, update both `meta.js` and the experiment `README.md`.
- If the preview is no longer representative, update `preview.svg`.

## Shared experiment controls

Use the helpers in [controlPanel.js](./src/experiments/shared/controlPanel.js) for experiment panels. `addButton` handles native click activation from mouse, touch, Enter, and Space.

`addSliderControl` connects a native label to each slider with a unique ID. Screen readers announce the visible caption along with the range value. To verify, click a slider caption: that slider should receive focus. Its arrow keys should adjust its value normally. Inspect the browser accessibility tree or use a screen reader to check that every slider has its caption as its name.

To verify buttons, open Rotations and Tab to Pause. Enter should change its label to Play and stop the cubes; Space should resume them. Pause again, Tab to Reset, and activate it to return all three matrices to the identity. Check Clear, Randomize BPM, and Start in their experiments with both keys, then check mouse clicks and phone taps.

## Menu accessibility

The menu is a modal dialog. Opening it moves focus to Close and makes the background inert. Tab and Shift+Tab cycle through the visible drawer controls, including expanded Notes. Escape, Close, and the backdrop return focus to the menu button; the closed drawer is inert and fully hidden.

To verify, Tab around a page with the menu closed: no offscreen menu controls should receive focus. Open the menu with Enter, cycle forward and backward through it, then press Escape. Focus should return to Open menu, and the page controls should work again. Repeat on the showroom, About, and an experiment page, and check both Close and backdrop clicks.

The menu button shows three vertically stacked bars when closed and a centered cross when open. Check both states on desktop and phone widths, including with a larger browser font size.

## Naming conventions

- `id`: stable URL slug, lower camel case or short kebab-style equivalent already used by the project.
- `title`: human-readable experiment name shown in the showroom.
- `Experiment.js`: the runtime code that mounts the p5 experience.
- `meta.js`: experiment metadata and contributor-facing context.

## Checklist before opening a PR

- The experiment opens from the showroom.
- The direct link `/?experiment=<id>` works.
- The metadata title, description, and controls are accurate.
- `README.md` explains the experiment clearly.
- `preview.svg` still matches what visitors will see.
- `npm run build` passes.
