import font from "../font.json" assert { type: "json" };

const MAX_WIDTH = 165;
const glyphMap = font.glyphs || {};

const fallbackGlyph = [
  "##########","#        #","#        #","#        #","#        #",
  "#        #","#        #","#        #","#        #","#        #","##########"
];

// --- utilities ---
function getGlyph(ch) {
  const g = glyphMap[ch] || glyphMap[ch.toUpperCase()] || fallbackGlyph;
  if (Array.isArray(g)) return g;
  if (g?.lines) return g.lines;
  return fallbackGlyph;
}

function renderText(text) {
  const chars = text.split("");
  const glyphs = chars.map(c => c === "+" ? getGlyph(" ") : getGlyph(c));

  const maxH = Math.max(...glyphs.map(g => g.length));
  const widths = glyphs.map(g => g[0]?.length ?? 0);

  const lines = [];

  for (let r = 0; r < maxH; r++) {
    let line = "";
    for (let j = 0; j < glyphs.length; j++) {
      const g = glyphs[j];
      const w = widths[j];
      line += (r < g.length) ? g[r] : " ".repeat(w);
    }
    lines.push(line.replace(/\s+$/, ""));
  }

  return lines;
}

function mergeNumAndDest(numLines, destLines) {
  const height = Math.max(numLines.length, destLines.length);

  while (numLines.length < height) numLines.push(" ".repeat(numLines[0].length));
  while (destLines.length < height) destLines.push(" ".repeat(destLines[0].length));

  const numW = numLines[0].length;
  const destW = destLines[0].length;

  if (numW + destW > MAX_WIDTH) return ["ERROR: text too long"];

  const remainingSpace = MAX_WIDTH - numW;
  const padLeft = Math.floor((remainingSpace - destW) / 2);
  if (padLeft < 0) return ["ERROR: text too long"];

  const rows = [];

  for (let i = 0; i < height; i++) {
    const leftPad = "#".repeat(padLeft);
    let line = numLines[i] + leftPad + destLines[i];
    rows.push(line.padEnd(MAX_WIDTH, "#"));
  }

  return rows;
}

function buildAscii(num, dest) {
  if (!num && !dest) return [];
  return mergeNumAndDest(renderText(num), renderText(dest));
}

// --- Worker handler ---
export async function onRequest({ request }) {
  const url = new URL(request.url);
  const num = url.searchParams.get("num") || "";
  const dest = url.searchParams.get("dest") || "";
  const pretty = url.searchParams.get("pretty") === "true";

  const asciiLines = buildAscii(num, dest);
  const asciiString = asciiLines.join("\n");

  const json = pretty
    ? { ascii: asciiLines }   // array mode
    : { ascii: asciiString }; // block string mode

  return new Response(JSON.stringify(json, null, pretty ? 2 : 0), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
