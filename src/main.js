import "./style.css";
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
      ${renderDrawer({
        title: "Menu",
        body: `
          ${renderDrawerNav("showroom")}
          ${renderExperimentsDirectory()}
        `,
      })}

      <main class="landing-main">
        <section class="landing-hero">
          ${
            invalidExperimentId && !experimentsById[invalidExperimentId]
              ? `
                <p class="inline-note">
                  ${escapeHtml(invalidExperimentId)} is not registered yet. You are seeing the showroom instead.
                </p>
              `
              : ""
          }
          <h1>Open the showroom, remix an idea, add your own page.</h1>
          <p class="hero-copy">
            This gallery hosts p5.js browser experiments designed to be explored by visitors and extended by friends. Click any experiment below to open it.
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
      ${renderDrawer({
        title: "Menu",
        body: `
          ${renderDrawerNav("about")}
          ${renderExperimentsDirectory()}
        `,
      })}

      <main class="about-main">
        <h1>About</h1>
        <p class="about-lead">
          Web Experiments Playground is a collaborative gallery of browser-based visual experiments.
          It is meant to be easy to browse for visitors and easy to extend for new contributors.
        </p>

        <section class="about-section" id="browse">
          <h2>How to browse</h2>
          <p>
            The landing page is a minimal showroom. Each experiment opens on its own direct link, while the
            menu collects the full experiment notes, controls, and the rest of the gallery in one place.
          </p>
        </section>

        <section class="about-section" id="contribute">
          <h2>How to add a new experiment</h2>
          <ol class="about-list">
            <li>Copy <code>src/experiments/_template/</code> into a new experiment folder.</li>
            <li>Update <code>Experiment.js</code>, <code>meta.js</code>, <code>README.md</code>, and <code>preview.svg</code>.</li>
            <li>Register the experiment in <code>src/experiments/index.js</code>.</li>
            <li>Run <code>npm run dev</code> and verify the showroom entry and the direct link.</li>
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
            Every experiment is registered through <code>src/experiments/index.js</code>, which powers the showroom,
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
    <div class="experiment-page">
      <div id="experiment-stage" class="experiment-stage" aria-hidden="true"></div>
      ${renderTopbar()}
      ${renderDrawer({
        title: "Experiment menu",
        body: `
          ${renderDrawerNav("experiment")}

          <section class="drawer-section">
            <p class="drawer-label">Experiment</p>
            <h2 class="drawer-title">${escapeHtml(experiment.title)}</h2>
            <p class="drawer-copy">${escapeHtml(experiment.description)}</p>
            <p class="drawer-meta">${escapeHtml(formatAuthors(experiment.authors))}</p>
            <p class="drawer-meta">${escapeHtml(experiment.status)}</p>
          </section>

          <section class="drawer-section">
            <h3>Instructions</h3>
            <ul class="drawer-list">
              ${experiment.controls.map((control) => `<li>${escapeHtml(control)}</li>`).join("")}
            </ul>
          </section>

          <details class="drawer-section drawer-details">
            <summary>Notes</summary>
            <div class="markdown-body markdown-body--inverse">${renderMarkdown(experiment.readme)}</div>
          </details>

          <section class="drawer-section drawer-actions">
            <button class="drawer-button" type="button" data-copy-link>Copy link</button>
          </section>

          ${renderExperimentsDirectory(experiment.id)}
        `,
      })}
      <aside class="experiment-controls-shell" aria-label="Experiment controls">
        <div id="experiment-controls" class="experiment-controls"></div>
      </aside>
    </div>
  `;

  setupMenuInteractions();
  setupCopyLink(experiment);
  experiment.start({
    mountId: "experiment-stage",
    controlsMountId: "experiment-controls",
  });
}

function renderTopbar() {
  return `
    <header class="site-topbar">
      <a class="site-home-link" href="${createHomeHref()}" aria-label="Back to the showroom">
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
        <span class="menu-button-line"></span>
        <span class="menu-button-line"></span>
        <span class="menu-button-line"></span>
      </button>
    </header>
  `;
}

function renderDrawer({ title, body }) {
  return `
    <div class="menu-scrim" data-menu-close data-menu-scrim></div>

    <aside class="site-drawer" id="site-drawer" aria-hidden="true" data-menu-drawer>
      <div class="drawer-header">
        <p class="drawer-heading">${escapeHtml(title)}</p>
        <button class="drawer-close" type="button" data-menu-close aria-label="Close menu">Close</button>
      </div>

      <div class="drawer-body">
        ${body}
      </div>
    </aside>
  `;
}

function renderDrawerNav(currentView) {
  return `
    <nav class="drawer-nav" aria-label="Primary">
      ${
        currentView === "showroom"
          ? `<span class="drawer-nav-current">Showroom</span>`
          : `<a class="drawer-nav-link" href="${createHomeHref()}">Showroom</a>`
      }
      ${
        currentView === "about"
          ? `<span class="drawer-nav-current">About</span>`
          : `<a class="drawer-nav-link" href="${createAboutHref()}">About</a>`
      }
    </nav>
  `;
}

function renderExperimentsDirectory(activeExperimentId = null) {
  return `
    <section class="drawer-section">
      <h3>Experiments</h3>
      <nav class="drawer-experiments" aria-label="Experiments">
        ${experiments
          .map(
            (item) => `
              <a
                class="drawer-experiment-link ${item.id === activeExperimentId ? "is-active" : ""}"
                href="${createExperimentHref(item.id)}"
              >
                <span class="drawer-experiment-title">${escapeHtml(item.title)}</span>
                <span class="drawer-experiment-copy">${escapeHtml(item.description)}</span>
              </a>
            `
          )
          .join("")}
      </nav>
    </section>
  `;
}

function renderExperimentLink(experiment) {
  const cardTags = [experiment.mode, ...(experiment.themes || []).slice(0, 2)];

  return `
    <a class="experiment-card" href="${createExperimentHref(experiment.id)}">
      <h3 class="experiment-card-title">${escapeHtml(experiment.title)}</h3>
      <p class="experiment-card-copy">${escapeHtml(experiment.description)}</p>
      <div class="experiment-card-tags" aria-label="Experiment tags">
        ${cardTags
          .map((tag) => `<span class="experiment-tag">${escapeHtml(tag)}</span>`)
          .join("")}
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

  const setMenuState = (isOpen) => {
    document.body.dataset.menuState = isOpen ? "open" : "closed";
    toggleButton.setAttribute("aria-expanded", String(isOpen));
    drawer.setAttribute("aria-hidden", String(!isOpen));
  };

  toggleButton.addEventListener("click", () => {
    setMenuState(document.body.dataset.menuState !== "open");
  });

  app.querySelectorAll("[data-menu-close]").forEach((element) => {
    element.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  drawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });
}

function setupCopyLink(experiment) {
  const copyButton = app.querySelector("[data-copy-link]");

  copyButton?.addEventListener("click", async () => {
    const shareUrl = new URL(window.location.href);
    shareUrl.search = new URLSearchParams({ experiment: experiment.id }).toString();

    try {
      await navigator.clipboard.writeText(shareUrl.toString());
      copyButton.textContent = "Link copied";
      window.setTimeout(() => {
        copyButton.textContent = "Copy link";
      }, 1500);
    } catch {
      copyButton.textContent = "Copy failed";
      window.setTimeout(() => {
        copyButton.textContent = "Copy link";
      }, 1500);
    }
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
  return authors.length ? `By ${authors.join(", ")}` : "Open for contributors";
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
