import "./style.css";
import { setupDialog } from "./app/dialog.js";
import { setupExperimentInfo } from "./app/experimentInfo.js";
import { setupExperimentControls } from "./app/experimentControls.js";
import { renderMarkdown } from "./app/markdown.js";
import { experiments, experimentsById } from "./experiments/index.js";

const app = document.querySelector("#app");
const params = new URLSearchParams(window.location.search);
const requestedExperimentId = params.get("experiment") || params.get("sketch");
const requestedPage = params.get("page");
const activeExperiment = requestedExperimentId
  ? experimentsById[requestedExperimentId] || null
  : null;
const basePath = normalizeBasePath(import.meta.env.BASE_URL);
const githubRepoHref = "https://github.com/s9ta2l/web_experiments_playground";
const portfolioHref = "https://www.instagram.com/alexev_studio/";

render();

function render() {
  document.body.dataset.mode = activeExperiment
    ? "experiment"
    : requestedPage === "about"
      ? "about"
      : "showroom";
  document.body.dataset.menuState = "closed";
  document.body.dataset.infoState = "closed";

  if (activeExperiment) {
    renderExperimentView(activeExperiment);
    return;
  }

  if (requestedPage === "about") {
    renderAboutView();
    return;
  }

  renderShowroomView(requestedExperimentId);
}

function renderShowroomView(invalidExperimentId) {
  app.innerHTML = `
    <div class="site-page">
      ${renderTopbar()}
      ${renderDrawer("showroom")}

      <main class="landing-main">
        <section class="landing-hero">
          ${
            invalidExperimentId && !experimentsById[invalidExperimentId]
              ? `
                <p class="inline-note">
                  ${escapeHtml(invalidExperimentId)} is not registered yet. You are seeing the gallery instead.
                </p>
              `
              : ""
          }
          <p class="hero-copy">
            A playground of web experiments created by
            <a href="${portfolioHref}" target="_blank" rel="noreferrer">@alexev_studio</a>
            and friends. Made for everyone to play with and build on.
            See <a href="${createAboutHref()}">About</a> for more.
          </p>
        </section>

        <section class="showroom-section">
          <div class="experiments-grid" aria-label="Experiment list">
          ${experiments.map(renderExperimentLink).join("")}
          </div>
        </section>
      </main>

      ${renderFooter(false)}
    </div>
  `;

  setupMenuInteractions();
}

function renderAboutView() {
  app.innerHTML = `
    <div class="site-page">
      ${renderTopbar()}
      ${renderDrawer("about")}

      <main class="about-main">
        <h1>About</h1>
        <p class="about-lead">
          Web Experiments Playground is a collaborative gallery of browser-based visual experiments.
          It is meant to be easy to browse for visitors and easy to extend for new contributors.
        </p>

        <section class="about-section" id="browse">
          <h2>How to browse</h2>
          <p>
            The landing page is a minimal gallery. Each experiment opens on its own direct link.
            Use the menu to browse the gallery and the info icon beside the controls for instructions and notes.
          </p>
        </section>

        <section class="about-section" id="contribute">
          <h2>How to add a new experiment</h2>
          <ol class="about-list">
            <li>Copy <code>src/experiments/_template/</code> into a new experiment folder.</li>
            <li>Update <code>Experiment.js</code>, <code>meta.js</code>, <code>README.md</code>, and <code>preview.svg</code>.</li>
            <li>Register the experiment in <code>src/experiments/index.js</code>.</li>
            <li>Run <code>npm run dev</code> and verify the gallery entry and the direct link.</li>
          </ol>
        </section>

        <section class="about-section" id="collaborate">
          <h2>How to collaborate on one experiment</h2>
          <ul class="about-list">
            <li>Read that experiment’s local notes before changing the runtime.</li>
            <li>Keep the idea focused rather than layering unrelated effects.</li>
            <li>Update metadata, controls, and preview art when behavior changes.</li>
            <li>Use the experiment README to leave context for the next contributor.</li>
          </ul>
        </section>

        <section class="about-section">
          <h2>Experiment structure</h2>
          <pre><code>src/experiments/&lt;id&gt;/
  Experiment.js
  meta.js
  README.md
  preview.svg</code></pre>
          <p>
            Every experiment is registered through <code>src/experiments/index.js</code>, which powers the gallery,
            experiment titles, descriptions, controls, notes, and navigation.
          </p>
        </section>
      </main>

      ${renderFooter(true)}
    </div>
  `;

  setupMenuInteractions();
}

function renderExperimentView(experiment) {
  app.innerHTML = `
    <div class="experiment-page" data-chrome-theme="${experiment.chromeTheme || "dark"}">
      <div id="experiment-stage" class="experiment-stage" aria-hidden="true">
        <div class="experiment-artwork-viewport"></div>
      </div>
      ${renderTopbar()}
      ${renderDrawer("experiment", experiment.id)}
      <aside class="experiment-controls-shell" aria-label="Experiment controls">
        <div class="experiment-controls-header">
          <p class="mobile-controls-title" id="mobile-controls-title">
            <span class="controls-view-label">Controls</span><span class="info-view-label">Information</span>
          </p>
          <button class="experiment-info-toggle icon-button" type="button"
            aria-label="Open experiment information" aria-expanded="false"
            aria-controls="experiment-info" data-info-toggle>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <g class="info-toggle-symbol"><circle cx="12" cy="12" r="9" />
                <path d="M12 10.5v6" /><circle cx="12" cy="7.5" r="0.75" fill="currentColor" stroke="none" /></g>
              <path class="info-close-symbol" d="m6 6 12 12M18 6 6 18" />
              <path class="info-back-symbol" d="m14 6-6 6 6 6M8 12h12" />
            </svg>
          </button>
          <button class="experiment-controls-close icon-button" type="button" aria-label="Return to experiment" data-controls-close>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div class="experiment-controls-body">
          <div id="experiment-controls" class="experiment-controls"></div>
          ${renderExperimentInfo(experiment)}
        </div>
      </aside>
      <dialog class="mobile-controls-dialog" id="mobile-controls-dialog" aria-labelledby="mobile-controls-title"></dialog>
      <div class="experiment-quick-actions">
        <button class="experiment-controls-open" type="button" data-controls-open
          aria-label="Open experiment controls" aria-haspopup="dialog" aria-expanded="false" aria-controls="mobile-controls-dialog">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M4 7h6m4 0h6M4 17h10m4 0h2" /><circle cx="12" cy="7" r="2" /><circle cx="16" cy="17" r="2" />
          </svg>
          Controls
        </button>
      </div>
      <div id="experiment-content"></div>
    </div>
  `;

  setupMenuInteractions();
  const information = setupExperimentInfo({
    trigger: app.querySelector("[data-info-toggle]"),
    panel: app.querySelector("#experiment-info"),
    controls: app.querySelector("#experiment-controls"),
    shell: app.querySelector(".experiment-controls-shell"),
  });
  setupExperimentControls({
    shell: app.querySelector(".experiment-controls-shell"),
    dialog: app.querySelector("#mobile-controls-dialog"),
    trigger: app.querySelector("[data-controls-open]"),
    information,
    directControls: experiment.id === "kaleidoscope",
  });
  setupCopyLink(experiment);
  experiment.start({
    mountId: "experiment-stage",
    controlsMountId: "experiment-controls",
    contentMountId: "experiment-content",
  });
}

function renderTopbar() {
  return `
    <header class="site-topbar">
      <a class="site-home-link" href="${createHomeHref()}" aria-label="Back to the gallery">
        <img class="site-logo" src="${createAssetHref("favicon.svg")}" alt="" />
      </a>

      <button
        class="menu-button"
        type="button"
        aria-label="Open menu"
        aria-expanded="false"
        aria-controls="site-drawer"
        data-menu-toggle
      >
        <span class="menu-button-line" aria-hidden="true"></span>
        <span class="menu-button-line" aria-hidden="true"></span>
        <span class="menu-button-line" aria-hidden="true"></span>
      </button>
    </header>
  `;
}

function renderDrawer(currentView, activeExperimentId = null) {
  return `
    <dialog class="site-drawer" id="site-drawer" aria-label="Site navigation" data-menu-drawer>
      <div class="drawer-surface">
        <div class="drawer-body">
          ${renderDrawerNav(currentView)}
          ${renderExperimentsDirectory(activeExperimentId)}
        </div>
      </div>
    </dialog>
  `;
}

function renderDrawerNav(currentView) {
  return `
    <nav class="drawer-nav" aria-label="Primary">
      <a class="drawer-nav-link" href="${createHomeHref()}" ${currentView === "showroom" ? 'aria-current="page"' : ""}>Gallery</a>
      <a class="drawer-nav-link" href="${createAboutHref()}" ${currentView === "about" ? 'aria-current="page"' : ""}>About</a>
    </nav>
  `;
}

function renderExperimentsDirectory(activeExperimentId = null) {
  return `
      <nav class="drawer-experiments" aria-label="Experiments">
        ${experiments
          .map(
            (item) => `
              <a
                class="drawer-experiment-link"
                href="${createExperimentHref(item.id)}"
                ${item.id === activeExperimentId ? 'aria-current="page"' : ""}
              >
                ${escapeHtml(item.title)}
              </a>
            `
          )
          .join("")}
      </nav>
  `;
}

function renderExperimentInfo(experiment) {
  return `
    <section class="experiment-info" id="experiment-info" aria-labelledby="experiment-info-title" hidden>
      <h2 class="drawer-title" id="experiment-info-title">${escapeHtml(experiment.title)}</h2>
      <p class="drawer-copy">${escapeHtml(experiment.description)}</p>
      <div class="experiment-info-actions">
        ${experiment.authors.length ? `<p class="drawer-meta">${escapeHtml(formatAuthors(experiment.authors))}</p>` : ""}
        <button class="icon-button copy-link-button" type="button" data-copy-link aria-label="Copy experiment link" title="Copy link">
          <svg class="copy-link-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M13 17a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-1 1" transform="translate(1 -1) scale(.92)" />
          </svg>
          <svg class="copy-link-done" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
        </button>
        <span class="visually-hidden" role="status" data-copy-status></span>
      </div>
      <section class="info-section">
        ${renderInfoDisclosure("Instructions", "info-instructions", `<ul class="drawer-list">${experiment.controls.map((control) => `<li>${escapeHtml(control)}</li>`).join("")}</ul>`)}
      </section>
      <section class="info-section">
        ${renderInfoDisclosure("Notes", "info-notes", `<div class="markdown-body markdown-body--inverse">${renderMarkdown(experiment.readme)}</div>`)}
      </section>
    </section>
  `;
}

function renderInfoDisclosure(label, id, content) {
  return `
    <button class="info-disclosure-trigger" type="button" aria-expanded="false" aria-controls="${id}" data-info-disclosure>
      ${label}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    <div class="info-disclosure-content" id="${id}" hidden><div class="info-disclosure-inner">${content}</div></div>
  `;
}

function renderExperimentLink(experiment) {
  return `
    <a class="experiment-card" href="${createExperimentHref(experiment.id)}">
      <img class="experiment-card-preview" src="${experiment.previewUrl}" alt="" loading="lazy" />
      <h3 class="experiment-card-title">${escapeHtml(experiment.title)}</h3>
      <div class="experiment-card-details">
        <p class="experiment-card-copy">${escapeHtml(experiment.description)}</p>
      </div>
    </a>
  `;
}

function renderFooter(aboutActive) {
  return `
    <footer class="site-footer">
      <div class="footer-row">
        <p class="footer-credit">
          Created by
          <a
            class="footer-link footer-accent"
            href="${portfolioHref}"
            target="_blank"
            rel="noreferrer"
          >
            @alexev_studio
          </a>
          and friends
        </p>
        <a
          class="footer-link"
          href="${githubRepoHref}"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <a class="footer-link" href="${createContributeHref()}">Contribute</a>
        ${
          aboutActive
            ? `<span class="footer-current">About</span>`
            : `<a class="footer-link" href="${createAboutHref()}">About</a>`
        }
      </div>
    </footer>
  `;
}

function setupMenuInteractions() {
  const toggleButton = app.querySelector("[data-menu-toggle]");
  const drawer = app.querySelector("[data-menu-drawer]");

  if (!toggleButton || !drawer) {
    return;
  }

  // Move the same icon into the modal so it stays visible and keyboard-reachable.
  const menu = setupDialog({
    trigger: toggleButton,
    dialog: drawer,
    stateKey: "menuState",
    moveTrigger: true,
  });

  drawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => menu.close());
  });
}

function setupCopyLink(experiment) {
  const copyButton = app.querySelector("[data-copy-link]");
  const status = app.querySelector("[data-copy-status]");
  let resetTimer;

  copyButton?.addEventListener("click", async () => {
    const shareUrl = new URL(window.location.href);
    shareUrl.search = new URLSearchParams({ experiment: experiment.id }).toString();

    window.clearTimeout(resetTimer);
    try {
      await navigator.clipboard.writeText(shareUrl.toString());
      copyButton.dataset.copyState = "copied";
      status.textContent = "Link copied";
    } catch {
      copyButton.dataset.copyState = "failed";
      status.textContent = "Could not copy the link. Try again.";
    }
    copyButton.setAttribute("aria-label", status.textContent);
    copyButton.title = status.textContent;
    resetTimer = window.setTimeout(() => {
      delete copyButton.dataset.copyState;
      copyButton.setAttribute("aria-label", "Copy experiment link");
      copyButton.title = "Copy link";
      status.textContent = "";
    }, 1500);
  });
}

function createHomeHref() {
  return basePath;
}

function createAboutHref() {
  return `${basePath}?page=about`;
}

function createContributeHref() {
  return `${createAboutHref()}#contribute`;
}

function createExperimentHref(experimentId) {
  return `${basePath}?experiment=${encodeURIComponent(experimentId)}`;
}

function createAssetHref(assetPath) {
  return `${basePath}${assetPath.replace(/^\/+/, "")}`;
}

function formatAuthors(authors) {
  return `By ${authors.join(", ")}`;
}

function normalizeBasePath(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
