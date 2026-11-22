"use strict";
// Pure functions on flat arrays (row-major), so they run in Node and in a browser canvas pipeline.
function grayscale(rgba, n) {
  const g = new Float32Array(n);
  for (let i = 0; i < n; i++) g[i] = 0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2];
  return g;
}

function boxBlur(g, w, h, r) {
  if (r <= 0) return g;
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0, c = 0;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      s += g[yy * w + xx]; c++;
    }
    out[y * w + x] = s / c;
  }
  return out;
}

// Returns Uint8Array: 0 = line, 1 = background. Higher threshold keeps only strong edges.
function sobelEdges(g, w, h, threshold) {
  const bin = new Uint8Array(w * h).fill(1);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const gx = -g[i - w - 1] - 2 * g[i - 1] - g[i + w - 1] + g[i - w + 1] + 2 * g[i + 1] + g[i + w + 1];
    const gy = -g[i - w - 1] - 2 * g[i - w] - g[i - w + 1] + g[i + w - 1] + 2 * g[i + w] + g[i + w + 1];
    bin[i] = Math.sqrt(gx * gx + gy * gy) > threshold ? 0 : 1;
  }
  return bin;
}

// Thicken lines: a background pixel next to a line pixel (4-neighbourhood) becomes a line.
function dilate(bin, w, h, iterations) {
  for (let k = 0; k < iterations; k++) {
    const out = bin.slice();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (bin[y * w + x] === 0) continue;
      if ((x > 0 && bin[y * w + x - 1] === 0) || (x < w - 1 && bin[y * w + x + 1] === 0) ||
          (y > 0 && bin[(y - 1) * w + x] === 0) || (y < h - 1 && bin[(y + 1) * w + x] === 0)) out[y * w + x] = 0;
    }
    bin = out;
  }
  return bin;
}

function stencil(g, w, h, { blur = 1, threshold = 60, thickness = 0 } = {}) {
  return dilate(sobelEdges(boxBlur(g, w, h, blur), w, h, threshold), w, h, thickness);
}

// ASCII PBM (P1): 1 = black, so invert our 0/1 convention.
function toPBM(bin, w, h) {
  const rows = [];
  for (let y = 0; y < h; y++) rows.push(Array.from(bin.subarray(y * w, (y + 1) * w), (v) => (v === 0 ? 1 : 0)).join(" "));
  return `P1\n${w} ${h}\n${rows.join("\n")}\n`;
}

module.exports = { grayscale, boxBlur, sobelEdges, dilate, stencil, toPBM };
