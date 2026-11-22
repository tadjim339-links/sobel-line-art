# sobel-line-art

A small, dependency-free pipeline that turns a grayscale pixel array into black line art: box blur, Sobel edge detection, a threshold, and optional dilation to thicken the lines. All functions work on flat row-major arrays, so the same code runs in Node (for tests) and on canvas `ImageData` in a browser, where nothing needs to leave the device.

## Steps

1. `grayscale(rgba, n)` uses the weights 0.299 R + 0.587 G + 0.114 B.
2. `boxBlur(g, w, h, r)` smooths noise; a bigger radius removes more speckle and also detail.
3. `sobelEdges(g, w, h, threshold)` computes the gradient magnitude; pixels above the threshold become line pixels (`0`), the rest background (`1`). A higher threshold keeps only strong outlines.
4. `dilate(bin, w, h, n)` thickens lines so they survive printing.
5. `toPBM(bin, w, h)` writes a plain-text PBM image you can open anywhere.

```js
const s = require("./index");
const bin = s.stencil(gray, width, height, { blur: 1, threshold: 60, thickness: 1 });
```

`npm test` runs the pipeline on a synthetic square and checks that only its outline is detected.

## Where it is used

The same approach drives the in-browser [photo to tattoo stencil maker](https://tattoostencilmakeronline.com/?utm_source=github&utm_medium=readme): the sliders map to blur, threshold and thickness, and the image is processed locally. High-contrast source images with clear outlines give the cleanest result.

License: MIT
