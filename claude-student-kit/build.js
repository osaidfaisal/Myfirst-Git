// Builds the PDFs for the kit.
//   node build.js
// Produces:
//   site/cheatsheet.pdf         (free lead magnet, from site/cheatsheet.html)
//   premium/playbook.html       (paid product, from premium/playbook.md)
//   premium/playbook.pdf        (upload this file to Gumroad / your store)
// Requires Playwright: npm i playwright && npx playwright install chromium

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = __dirname;

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.+?)\*/g, "<i>$1</i>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

// Minimal Markdown → HTML for the subset playbook.md uses.
function mdToHtml(md) {
  const lines = md.split("\n");
  const out = [];
  const toc = [];
  let i = 0, promptNo = 0, partNo = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
      i++;
      const body = esc(buf.join("\n")).replace(/\[([^\]]+)\]/g, '<span class="fill">[$1]</span>');
      out.push(`<pre class="prompt">${body}</pre></div>`);
      continue;
    }
    if (line.startsWith("### ")) {
      promptNo++;
      out.push(`<div class="p"><h3><span class="no">${String(promptNo).padStart(3, "0")}</span>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      const title = line.slice(3);
      const id = "s" + (++partNo);
      toc.push({ id, title });
      out.push(`<h2 id="${id}">${inline(title)}</h2>`);
    } else if (line.startsWith("# ")) {
      // title handled by the cover
    } else if (line.startsWith("> ")) {
      // subtitle handled by the cover
    } else if (line.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
      const cells = (r) => r.split("|").slice(1, -1).map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      out.push(`<table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join("")}</tr></thead><tbody>` +
        body.map((r) => `<tr>${r.map((c) => `<td>${inline(c) || "&nbsp;"}</td>`).join("")}</tr>`).join("") +
        `</tbody></table>`);
      continue;
    } else if (line.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].startsWith("- ")) items.push(lines[i++].slice(2));
      out.push(`<ul>${items.map((x) => `<li>${inline(x)}</li>`).join("")}</ul>`);
      continue;
    } else if (line.trim()) {
      out.push(`<p>${inline(line)}</p>`);
    }
    i++;
  }
  return { html: out.join("\n"), toc, promptNo };
}

function playbookPage(md) {
  const title = (md.match(/^# (.+)$/m) || [])[1];
  const subtitle = (md.match(/^> (.+)$/m) || [])[1] || "";
  const { html, toc, promptNo } = mdToHtml(md);
  const css = fs.readFileSync(path.join(ROOT, "premium", "playbook.css"), "utf8");
  return {
    promptNo,
    page: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Claude Student Playbook</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<style>${css}</style></head><body>
<section class="cover">
  <div class="kicker">Premium edition · For Pakistani students at UC Davis</div>
  <h1>${inline(title)}</h1>
  <p class="sub">${inline(subtitle)}</p>
  <div class="stats"><div><b>${promptNo}</b>copy-paste prompts</div><div><b>10</b>week quarter plan</div><div><b>10</b>life & career toolkits</div></div>
  <div class="toc"><h4>Inside</h4><ol>${toc.map((t) => `<li><a href="#${t.id}">${inline(t.title)}</a></li>`).join("")}</ol></div>
</section>
<main>${html}</main>
</body></html>`,
  };
}

(async () => {
  const md = fs.readFileSync(path.join(ROOT, "premium", "playbook.md"), "utf8");
  const { page, promptNo } = playbookPage(md);
  fs.writeFileSync(path.join(ROOT, "premium", "playbook.html"), page);
  console.log(`playbook.html written (${promptNo} prompts)`);

  const browser = await chromium.launch();
  const tab = await browser.newPage();

  await tab.goto("file://" + path.join(ROOT, "site", "cheatsheet.html"), { waitUntil: "networkidle" });
  await tab.pdf({ path: path.join(ROOT, "site", "cheatsheet.pdf"), format: "Letter", printBackground: true, preferCSSPageSize: true });
  console.log("cheatsheet.pdf written");

  await tab.goto("file://" + path.join(ROOT, "premium", "playbook.html"), { waitUntil: "networkidle" });
  await tab.pdf({
    path: path.join(ROOT, "premium", "playbook.pdf"), format: "Letter", printBackground: true,
    margin: { top: "0.6in", bottom: "0.7in", left: "0.65in", right: "0.65in" },
    displayHeaderFooter: true, headerTemplate: "<div></div>",
    footerTemplate: '<div style="width:100%;font:9px Inter,Arial;color:#5b6862;padding:0 0.65in;display:flex;justify-content:space-between"><span>The Claude Playbook for Pakistani Students</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  });
  console.log("playbook.pdf written");
  await browser.close();
})();
