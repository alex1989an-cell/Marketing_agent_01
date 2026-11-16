// Markdown report → Word (.docx) for COLLIMA reports.
// Usage: node tools/md2docx.js <input.md> <output.docx> [--landscape-from "## Heading"] [--landscape-to "## Heading"]
// Supports: # / ## / ### headings, paragraphs, - and 1. lists, > quotes, | tables |, **bold**, *italic*, `code`, [links](url), ---.
// Wide tables go to a landscape section when --landscape-from/--landscape-to are given.
const fs = require("fs");
let d;
try { d = require("docx"); } catch (e) { d = require("/opt/node22/lib/node_modules/docx"); }
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, AlignmentType, Footer, PageNumber, LevelFormat, ExternalHyperlink, PageOrientation, VerticalAlign,
} = d;

const [, , IN, OUT, ...rest] = process.argv;
const opt = (k) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : null; };
const LS_FROM = opt("--landscape-from"), LS_TO = opt("--landscape-to");
const FONT = "Arial", INK = "1F2A37", MUTED = "5A6676", ACCENT = "9A6A0C", LINE = "C9D1DB", FILL = "F3F5F8";
const PORTRAIT_W = 9638, LANDSCAPE_W = 14570; // A4 minus 2 cm margins

// inline markdown → runs
function inline(text, base = {}) {
  const out = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0, m;
  const push = (t, o = {}) => t && out.push(new TextRun({ text: t, font: FONT, ...base, ...o }));
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index));
    if (m[2]) push(m[2], { bold: true });
    else if (m[3]) push(m[3], { italics: true });
    else if (m[4]) push(m[4], { font: "Consolas", color: MUTED });
    else if (m[5]) {
      if (/^https?:\/\//.test(m[6])) out.push(new ExternalHyperlink({ link: m[6], children: [new TextRun({ text: m[5], font: FONT, color: "2F6FB3", underline: {}, ...base })] }));
      else push(m[5], { color: MUTED });
    }
    last = m.index + m[0].length;
  }
  push(text.slice(last));
  return out.length ? out : [new TextRun({ text: "", font: FONT })];
}

const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: border, bottom: border, left: border, right: border };
function table(rows, totalW) {
  const head = rows[0], body = rows.slice(1);
  const n = head.length;
  const strip = (s) => s.replace(/\*\*|\*|`/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  const weights = [...Array(n).keys()].map((c) => {
    const lens = rows.map((r) => strip(r[c] || "").length);
    const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
    return Math.max(3, Math.min(70, avg));
  });
  // a column is never narrower than its longest word (≈ 95 twips per char at 8.5 pt + cell padding)
  const minW = [...Array(n).keys()].map((c) => {
    const longest = Math.max(...rows.map((r) => Math.max(0, ...strip(r[c] || "").split(/\s+/).map((w) => w.length))));
    return Math.min(Math.round(totalW * 0.35), Math.max(420, longest * 95 + 240));
  });
  const minSum = minW.reduce((a, b) => a + b, 0);
  let widths;
  if (minSum >= totalW) widths = minW.map((w) => Math.round((w * totalW) / minSum));
  else {
    const extra = totalW - minSum;
    const wsum = weights.reduce((a, b) => a + b, 0);
    widths = minW.map((w, i) => w + Math.round((weights[i] / wsum) * extra));
  }
  widths[n - 1] += totalW - widths.reduce((a, b) => a + b, 0);
  const mk = (txt, w, isHead) => new TableCell({
    borders, width: { size: w, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 },
    verticalAlign: VerticalAlign.TOP,
    shading: isHead ? { fill: FILL, type: ShadingType.CLEAR, color: "auto" } : undefined,
    children: [new Paragraph({ spacing: { after: 0 }, children: inline(txt || "", { size: 17, bold: isHead || undefined }) })],
  });
  return new Table({
    width: { size: totalW, type: WidthType.DXA }, columnWidths: widths,
    rows: [new TableRow({ tableHeader: true, children: head.map((h, i) => mk(h, widths[i], true)) }),
      ...body.map((r) => new TableRow({ cantSplit: true, children: head.map((_, i) => mk(r[i] || "", widths[i], false)) }))],
  });
}

const lines = fs.readFileSync(IN, "utf8").split(/\r?\n/);
const sections = [{ landscape: false, children: [] }];
let cur = sections[0];
const startSection = (landscape) => { cur = { landscape, children: [] }; sections.push(cur); };
const width = () => (cur.landscape ? LANDSCAPE_W : PORTRAIT_W);

for (let i = 0; i < lines.length; i++) {
  let ln = lines[i];
  if (LS_FROM && ln.trim() === LS_FROM && !cur.landscape) startSection(true);
  if (LS_TO && ln.trim() === LS_TO && cur.landscape) startSection(false);
  if (!ln.trim()) continue;
  if (ln.startsWith("|")) {
    const rows = [];
    while (i < lines.length && lines[i].startsWith("|")) {
      const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
      i++;
    }
    i--;
    cur.children.push(table(rows, width()));
    cur.children.push(new Paragraph({ spacing: { after: 60 }, children: [] }));
    continue;
  }
  let m;
  if ((m = ln.match(/^(#{1,3})\s+(.*)/))) {
    const lvl = m[1].length;
    const heading = lvl === 1 ? HeadingLevel.TITLE : lvl === 2 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2;
    cur.children.push(new Paragraph({ heading, children: inline(m[2]) }));
  } else if (/^---+$/.test(ln.trim())) {
    cur.children.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LINE, space: 4 } }, children: [] }));
  } else if ((m = ln.match(/^(\s*)[-*]\s+(.*)/))) {
    cur.children.push(new Paragraph({ numbering: { reference: "bul", level: m[1].length >= 2 ? 1 : 0 }, spacing: { after: 40 }, children: inline(m[2]) }));
  } else if ((m = ln.match(/^(\s*)(\d+)\.\s+(.*)/))) {
    cur.children.push(new Paragraph({ indent: { left: 360 + (m[1].length >= 2 ? 360 : 0), hanging: 300 }, spacing: { after: 50 }, children: [new TextRun({ text: m[2] + ". ", font: FONT, bold: true, color: ACCENT }), ...inline(m[3])] }));
  } else if ((m = ln.match(/^>\s?(.*)/))) {
    cur.children.push(new Paragraph({ indent: { left: 360 }, border: { left: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 8 } }, children: inline(m[1], { italics: true }) }));
  } else {
    const isNote = /^\*[^*].*\*$/.test(ln.trim());
    cur.children.push(new Paragraph({ spacing: { after: 100 }, children: inline(ln.trim(), isNote ? { color: MUTED, size: 19 } : {}) }));
  }
}

const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "COLLIMA Engineering · штаб агентов · стр. ", font: FONT, size: 16, color: MUTED }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: MUTED })] })] });
const doc = new Document({
  creator: "COLLIMA · штаб агентов",
  styles: {
    default: { document: { run: { font: FONT, size: 20, color: INK } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", run: { font: FONT, size: 36, bold: true, color: INK }, paragraph: { spacing: { before: 0, after: 160 }, keepNext: true } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 28, bold: true, color: INK }, paragraph: { spacing: { before: 280, after: 140 }, keepNext: true, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 6 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 23, bold: true, color: INK }, paragraph: { spacing: { before: 220, after: 100 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [{ reference: "bul", levels: [
    { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } },
    { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 900, hanging: 270 } } } },
  ] }] },
  sections: sections.filter((s) => s.children.length).map((s) => ({
    properties: { page: { size: { width: 11906, height: 16838, orientation: s.landscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    footers: { default: footer },
    children: s.children,
  })),
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(OUT, b); console.log("written", OUT, b.length); });
