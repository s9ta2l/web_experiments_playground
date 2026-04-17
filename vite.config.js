import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
);

// Default to the repo/package slug for GitHub Pages project sites.
// Override BASE_PATH when the repo name or hosting setup differs.
const defaultBase = `/${pkg.name}/`;

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : process.env.BASE_PATH || defaultBase,
}));
