function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatInline(value) {
  return escapeHtml(value).replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function renderMarkdown(markdown) {
  const lines = markdown.trim().split(/\r?\n/);
  const chunks = [];
  let paragraph = [];
  let list = [];
  let code = [];
  let inCode = false;

  function flushParagraph() {
    if (!paragraph.length) return;
    chunks.push(`<p>${formatInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (!list.length) return;
    const items = list.map((item) => `<li>${formatInline(item)}</li>`).join("");
    chunks.push(`<ul>${items}</ul>`);
    list = [];
  }

  function flushCode() {
    if (!code.length) return;
    chunks.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
    code = [];
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      flushParagraph();
      flushList();

      if (inCode) {
        flushCode();
      }

      inCode = !inCode;
      continue;
    }

    if (inCode) {
      code.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      chunks.push(`<h4>${formatInline(trimmed.slice(4))}</h4>`);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      chunks.push(`<h3>${formatInline(trimmed.slice(3))}</h3>`);
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      chunks.push(`<h2>${formatInline(trimmed.slice(2))}</h2>`);
      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      list.push(trimmed.slice(2));
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushCode();

  return chunks.join("");
}
