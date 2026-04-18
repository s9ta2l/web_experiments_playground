# Web Experiments Playground

A collaborative gallery of browser-based p5.js experiments.

Visitors land in a showroom, open an experiment, and navigate between pieces without guessing URLs. Contributors get one clear place to add a new experiment, document it, and register it in the gallery.

## Local setup

Install dependencies:

```sh
npm install
```

Run the local dev server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

## GitHub Pages

Production builds default to the GitHub Pages-friendly base path for this repo:

```txt
/web_experiments_playground/
```

That value is derived from `package.json` in `vite.config.js`, so if the repo slug changes, the default build path changes with it.

If you host under a different repo name or a custom domain, override the base path when building:

```sh
BASE_PATH=/your-repo-name/ npm run build
```

For a custom domain at the site root:

```sh
BASE_PATH=/ npm run build
```

### Publish this repo

1. Push the project to a GitHub repository.
2. In GitHub, open `Settings -> Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push to `main` or `master`.
5. Wait for the `Deploy to GitHub Pages` workflow to finish in the `Actions` tab.

The workflow lives at `.github/workflows/deploy.yml` and builds the Vite app before publishing `dist/`.

For a project site, the default published URL will be:

```txt
https://s9ta2l.github.io/web_experiments_playground/
```

If your repository name changes, update `package.json` or set `BASE_PATH` during the build so the deployed asset paths still match the repo slug.

## How the gallery works

- The showroom is the default landing page.
- Each experiment opens with `/?experiment=<id>`.
- Legacy `?sketch=<id>` links still resolve, but `experiment` is the preferred query parameter now.

Current experiment ids:

- `triangle`
- `ecg`
- `lines`
- `pendulum`
- `spiral`

## Project structure

```txt
src/
  app/
    markdown.js
  experiments/
    index.js
    _template/
    <id>/
      Experiment.js
      meta.js
      README.md
      preview.svg
  main.js
  style.css
```

## Add a new experiment

1. Copy `src/experiments/_template/` into a new folder under `src/experiments/`.
2. Replace the placeholder metadata, readme, preview, and runtime code.
3. Register the experiment in `src/experiments/index.js`.
4. Run `npm run dev` and confirm:
   - the experiment appears in the showroom
   - the direct link `/?experiment=<id>` opens correctly
   - the notes and preview still match the actual output

For the full contributor workflow, see [CONTRIBUTING.md](./CONTRIBUTING.md).
