import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderMarkdown } from "./markdown.js";

test("Kaleidoscope Notes render the authored emphasis, verification steps, and references", async () => {
  const readme = await readFile(new URL("../experiments/kaleidoscope/README.md", import.meta.url), "utf8");
  const html = renderMarkdown(readme);
  assert.match(html, /<strong>Classic<\/strong>/);
  assert.match(html, /<strong>Phone camera access requires trusted HTTPS\.<\/strong>/);
  const steps = html.match(/<ol>(.*?)<\/ol>/s)[1];
  assert.equal((steps.match(/<li>/g) || []).length, (readme.match(/^\d+\. /gm) || []).length);
  assert.equal((html.match(/<a href="https:/g) || []).length, 3);
  assert.match(html, /<code>http:\/\/&lt;computer-lan-ip&gt;:5173<\/code>/);
  assert.match(html, /<pre><code>npm run dev\nnpm test\nnpm run build<\/code><\/pre>/);
});

test("paragraphs, list types, non-one numbering, and headings retain their order", () => {
  assert.equal(renderMarkdown("Before\n3. Third\n4. Fourth\nAfter\n- First bullet\n* Second bullet\n## Heading"),
    '<p>Before</p><ol start="3"><li>Third</li><li>Fourth</li></ol><p>After</p><ul><li>First bullet</li><li>Second bullet</li></ul><h3>Heading</h3>');
  assert.equal(renderMarkdown("- Bullet\n1. Step\n# Title\n### Detail"),
    "<ul><li>Bullet</li></ul><ol><li>Step</li></ol><h2>Title</h2><h4>Detail</h4>");
});

test("inline and fenced code preserve Markdown and escape HTML", () => {
  assert.equal(renderMarkdown("`**bold** [link](https://example.com) <b>`"),
    "<p><code>**bold** [link](https://example.com) &lt;b&gt;</code></p>");
  assert.equal(renderMarkdown("**Keep `**literal**` safe**"),
    "<p><strong>Keep <code>**literal**</code> safe</strong></p>");
  assert.equal(renderMarkdown("```html\n<b>**bold** & text</b>\n[link](https://example.com)\n```\nAfter"),
    "<pre><code>&lt;b&gt;**bold** &amp; text&lt;/b&gt;\n[link](https://example.com)</code></pre><p>After</p>");
});

test("links support formatted labels, relative paths, and parentheses in URLs", () => {
  assert.equal(renderMarkdown("[**Guide** and `API`](./guide(v2).md#api)"),
    '<p><a href="./guide(v2).md#api"><strong>Guide</strong> and <code>API</code></a></p>');
  assert.equal(renderMarkdown("[Email](mailto:hello@example.com) [section](#notes)"),
    '<p><a href="mailto:hello@example.com">Email</a> <a href="#notes">section</a></p>');
});

test("raw HTML and unsafe link protocols remain inert text", () => {
  assert.equal(renderMarkdown('<img src=x onerror="alert(1)"> & text'),
    '<p>&lt;img src=x onerror="alert(1)"&gt; &amp; text</p>');
  for (const href of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<svg>", "vbscript:alert(1)", "java\tscript:alert(1)"]) {
    const html = renderMarkdown(`[Unsafe](${href})`);
    assert.ok(!html.includes("<a "));
    assert.ok(!html.includes("<svg>"));
  }
});

test("link destinations cannot introduce HTML attributes", () => {
  assert.equal(renderMarkdown(`[Query](https://example.com/?q="&name=')`),
    '<p><a href="https://example.com/?q=&quot;&amp;name=&#39;">Query</a></p>');
});

test("empty and unfinished code fences remain code blocks", () => {
  assert.equal(renderMarkdown("```\n```"), "<pre><code></code></pre>");
  assert.equal(renderMarkdown("```js\n**literal** <b>"),
    "<pre><code>**literal** &lt;b&gt;</code></pre>");
  assert.equal(renderMarkdown("  \n  "), "");
});
