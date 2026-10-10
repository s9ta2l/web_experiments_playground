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

The menu is a modal dialog. Its hamburger stays visible and focused inside the open panel while the background is inert. Tab and Shift+Tab cycle through Gallery, About, and the experiment titles. Escape, the hamburger, and the backdrop close the panel and return focus to the menu button; the closed menu is fully hidden.

To verify, Tab around a page with the menu closed: no offscreen menu controls should receive focus. Open the menu with Enter, cycle forward and backward through it, then press Escape. Focus should return to Open menu, and the page controls should work again. Repeat on Gallery, About, and light/dark experiment pages, and check both hamburger and backdrop clicks.

The menu button keeps three vertically stacked bars in both states. The surface slides in its matching light or dark theme while the burger stays fixed. Check desktop and phone widths, including with a larger browser font size and reduced motion enabled.

## Experiment information

The shared info button sits outside the experiment’s controls mount. It switches between controls and information in the same shell without remounting the controls. Instructions and Notes are independent, initially collapsed disclosures with accessible expanded state and chevrons. The copy-link icon below the description has a tooltip and announces its result. On desktop, information is not modal, so the canvas remains available; its close icon and Escape restore the controls and focus.

To verify, change a slider, open information, expand and collapse both sections, copy the link, then return to the controls: the slider value should remain unchanged. Repeat with Camera Kaleidoscope’s bottom toolbar. The animations should be immediate with reduced motion enabled.

## Phone controls

`src/app/experimentControls.js` moves the existing controls shell into a native modal dialog on narrow screens and landscape phones. The closed dialog leaves the artwork unobstructed; Controls opens a full-screen glass surface. Its header stays visible while the body scrolls. Info switches within the panel, with a back arrow to controls and a separate close button returning to the artwork. Escape backs out of information first, then closes the panel. Closing returns focus to Controls; reopening starts with controls and preserves their values. Widening to desktop restores the same shell to its original position.

Kaleidoscope sets `directControls` on the shared controller: all its controls stay in a responsive bottom toolbar without a Controls opener. Narrow screens use three equally sized pattern choices above equally sized Flip camera and Capture photo buttons. Info opens the phone dialog directly; closing or going back restores the toolbar with its selected pattern intact. Desktop keeps the in-place information switch. Pendulum and Rotation Matrices fit their artwork within the remaining space around navigation, quick actions, and matrices. These bounds are measured on layout changes, outside draw loops.

To verify, open every experiment at 320×568, 390×844, and 844×390 with touch enabled. Check that settings panels start closed, the artwork is visible, sliders and buttons respond to taps, long controls and Notes scroll without losing the close button, and settings survive Info, closing, and rotation. For Kaleidoscope, check that all toolbar buttons are directly available with no Controls opener, their widths fit, and pattern selection, camera flip, Info, capture, and retake work. Check Tab focus and Escape inside the modal, reduced motion, and a resize back to desktop. Home, About, and the right menu should fit these widths too.

## Experiment Notes

Notes render the README's headings (levels 1–3), paragraphs, bullet and numbered lists, bold text, inline code, fenced code, and inline links. Web, mail, and relative links are supported; raw HTML is shown as text. This is a small renderer for these features rather than a full Markdown implementation.

To verify, open Camera Kaleidoscope's information and expand Notes. Pattern names should be bold, verification steps should be a ten-item numbered list, reference links should be slightly bold without underlines and reachable with Tab, and code should stay literal. Run `npm test` for the Markdown renderer checks.

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
