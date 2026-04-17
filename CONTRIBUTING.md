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
