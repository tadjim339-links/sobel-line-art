const assert = require("assert");
const s = require("./index");
const w = 12, h = 12;
// white image with a dark 6x6 square in the middle
const g = new Float32Array(w * h).fill(255);
for (let y = 3; y < 9; y++) for (let x = 3; x < 9; x++) g[y * w + x] = 0;
const bin = s.stencil(g, w, h, { blur: 0, threshold: 60 });
const lines = [...bin].filter((v) => v === 0).length;
assert.ok(lines > 0);
// flat areas (centre of the square, corners of the image) stay background
assert.strictEqual(bin[6 * w + 6], 1);
assert.strictEqual(bin[1 * w + 1], 1);
// the square's outline pixels are detected
assert.strictEqual(bin[3 * w + 5], 0);
// thicker lines only ever add line pixels
const thick = s.stencil(g, w, h, { blur: 0, threshold: 60, thickness: 1 });
assert.ok([...thick].filter((v) => v === 0).length > lines);
// a very high threshold keeps nothing
assert.strictEqual([...s.stencil(g, w, h, { blur: 0, threshold: 5000 })].filter((v) => v === 0).length, 0);
// grayscale weights
const px = new Uint8ClampedArray([255, 0, 0, 255]);
assert.ok(Math.abs(s.grayscale(px, 1)[0] - 76.245) < 1e-3);
assert.ok(s.toPBM(bin, w, h).startsWith("P1\n12 12\n"));
console.log("ok");
