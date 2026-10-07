function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function linkHref(value) {
  // Notes support web/mail links and relative URLs, while keeping HTML inert.
  if (/[\s\u0000-\u001f\u007f]/.test(value)) return null;
  try {
    const url = new URL(value, "https://notes.invalid/");
    if (!["http:", "https:", "mailto:"].includes(url.protocol)) return null;
  } catch {
    return null;
  }
  return escapeHtml(value).replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function formatInline(value, allowLinks = true) {
  // Tokenize before escaping so code stays literal and generated tags aren't reparsed.
  const tokens = /`([^`]+)`|\*\*((?:`[^`]*`|[^`])+?)\*\*|\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;
  const chunks = [];
  let offset = 0;
  for (const match of value.matchAll(tokens)) {
    chunks.push(escapeHtml(value.slice(offset, match.index)));
    const [token, code, strong, label, href] = match;
    if (code !== undefined) {
      chunks.push(`<code>${escapeHtml(code)}</code>`);
    } else if (strong !== undefined) {
      chunks.push(`<strong>${formatInline(strong, allowLinks)}</strong>`);
    } else {
      const safeHref = allowLinks ? linkHref(href) : null;
      chunks.push(safeHref === null
        ? escapeHtml(token)
        : `<a href="${safeHref}">${formatInline(label, false)}</a>`);
    }
    offset = match.index + token.length;
  }
  chunks.push(escapeHtml(value.slice(offset)));
  return chunks.join("");
}

export function renderMarkdown(markdown) {
  const lines = markdown.trim().split(/\r?\n/);
  const chunks = [];
  let paragraph = [];
  let list = [];
  let listType = null;
  let listStart = 1;
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
    const start = listType === "ol" && listStart !== 1 ? ` start="${listStart}"` : "";
    chunks.push(`<${listType}${start}>${items}</${listType}>`);
    list = [];
    listType = null;
  }

  function flushCode() {
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

    const listItem = /^(?:([-*]) |(\d+)[.)] )(.+)$/.exec(trimmed);
    if (listItem) {
      flushParagraph();
      const type = listItem[1] ? "ul" : "ol";
      if (listType && listType !== type) flushList();
      if (!listType) {
        listType = type;
        listStart = type === "ol" ? Number(listItem[2]) : 1;
      }
      list.push(listItem[3]);
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  if (inCode) flushCode();

  return chunks.join("");
}
