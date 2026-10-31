// A small Markdown reader for notes. It covers what notes use and nothing more:
//
//   ## and ### headings, paragraphs, - and 1. lists, > quotes, ``` code blocks,
//   **bold**, *italic*, `code`, [links](https://…), ![images](src) and --- rules.
//
// A line that starts with :: is a live figure instead of text, for example
//   ::moon date=2026-11-17 relief=0 caption="First quarter, without relief"
// It becomes { type: "widget", name: "moon", props: { date, relief, caption } }.

export type Block = { type: "html"; html: string } | { type: "widget"; name: string; props: Record<string, string> };

export type Parsed = { meta: Record<string, string>; blocks: Block[] };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// paths that start with / get the site's base path (/home on GitHub Pages, nothing on a custom domain)
const withBase = (url: string) => (url.startsWith("/") ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + url : url);

function inline(text: string): string {
  // pull code spans out first so nothing inside them is formatted
  const codes: string[] = [];
  let s = text.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(esc(c)) - 1}\u0000`);
  s = esc(s);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${withBase(src)}" alt="${alt}" loading="lazy">`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const external = /^https?:/.test(href);
    return `<a href="${withBase(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, "$1<em>$2</em>");
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
}

function parseProps(rest: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const m of rest.matchAll(/([\w-]+)=(?:"([^"]*)"|(\S+))/g)) props[m[1]] = m[2] ?? m[3];
  return props;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseMarkdown(source: string): Parsed {
  const meta: Record<string, string> = {};
  let text = source.replace(/\r\n?/g, "\n");
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (fm) {
    for (const line of fm[1].split("\n")) {
      const m = line.match(/^(\w+):\s*(.*)$/);
      if (m) meta[m[1]] = m[2].trim();
    }
    text = text.slice(fm[0].length);
  }

  const lines = text.split("\n");
  const blocks: Block[] = [];
  let html = "";
  const flush = () => {
    if (html) blocks.push({ type: "html", html });
    html = "";
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // live figure
    const w = line.match(/^::(\w+)\s*(.*)$/);
    if (w) {
      flush();
      blocks.push({ type: "widget", name: w[1], props: parseProps(w[2]) });
      i++;
      continue;
    }

    // code block
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) body.push(lines[i++]);
      i++;
      const lang = fence[1] ? ` data-lang="${fence[1]}"` : "";
      html += `<pre${lang}><code>${esc(body.join("\n"))}</code></pre>`;
      continue;
    }

    // heading (the title comes from the front matter, so # is treated like ##)
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const level = Math.max(2, h[1].length);
      html += `<h${level} id="${slugify(h[2])}">${inline(h[2])}</h${level}>`;
      i++;
      continue;
    }

    if (/^-{3,}\s*$/.test(line)) {
      html += "<hr>";
      i++;
      continue;
    }

    // quote
    if (line.startsWith(">")) {
      const body: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) body.push(lines[i++].replace(/^>\s?/, ""));
      html += `<blockquote><p>${inline(body.join(" "))}</p></blockquote>`;
      continue;
    }

    // lists
    const ordered = /^\d+\.\s/.test(line);
    if (ordered || /^[-*]\s/.test(line)) {
      const marker = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;
      const items: string[] = [];
      while (i < lines.length && marker.test(lines[i])) {
        let item = lines[i++].replace(marker, "");
        // indented continuation lines belong to the same item
        while (i < lines.length && /^\s{2,}\S/.test(lines[i])) item += " " + lines[i++].trim();
        items.push(`<li>${inline(item)}</li>`);
      }
      const tag = ordered ? "ol" : "ul";
      html += `<${tag}>${items.join("")}</${tag}>`;
      continue;
    }

    // paragraph: runs until a blank line or another kind of block
    const body: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(::\w|```|#{1,3}\s|>|[-*]\s|\d+\.\s|-{3,}\s*$)/.test(lines[i])) {
      body.push(lines[i++].trim());
    }
    if (!body.length) body.push(lines[i++].trim()); // never stall on a line no rule took
    html += `<p>${inline(body.join(" "))}</p>`;
  }
  flush();
  return { meta, blocks };
}
