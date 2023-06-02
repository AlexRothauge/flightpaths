import type { CanvasRenderingContext2D } from "canvas";
import { createCanvas, loadImage } from "canvas";
import { expect } from "chai";
import * as fs from "fs/promises";
import { afterEach, describe, it } from "mocha";
import path from "path";
import rewire from "rewire";
import type { IPixel, IResolution } from "../../core/models";
import { renderImage } from "../../core/renderImage";

const renderImageModule = rewire("../../core/renderImage");
const drawFlightPath =
  renderImageModule.__get__<(ctx: CanvasRenderingContext2D, coordinates: IPixel[]) => void>("drawFlightPath");
const drawFlightPaths =
  renderImageModule.__get__<(ctx: CanvasRenderingContext2D, paths: IPixel[][]) => void>("drawFlightPaths");

function createTestCanvasContext(width = 3, height = 3): CanvasRenderingContext2D {
  const canvas = createCanvas(width, height);
  return canvas.getContext("2d");
}

const lengthSmall = 3;
const lengthMedium = 5;

describe("Test renderImage", function () {
  const imageFilePath = path.resolve("testImage.png");

  afterEach(async function () {
    await fs.unlink(imageFilePath);
  });

  it("should render an Image with two flight paths and load it onto canvas", async function () {
    const canvasSize: IResolution = { width: lengthMedium, height: lengthMedium };

    const paths: IPixel[][] = [
      [
        { x: 1, y: 2 },
        { x: 4, y: 2 },
      ],
      [
        { x: 2, y: 1 },
        { x: 2, y: 4 },
      ],
    ];

    await renderImage(paths, canvasSize, imageFilePath, {
      background: "#ffffff",
      foregroundColor: "#000000",
      lineWidth: 1,
      renderEllipse: true,
    });

    const ctx = createTestCanvasContext(lengthMedium, lengthMedium);

    const img = await loadImage(imageFilePath);
    ctx.drawImage(img, 0, 0);
    const imageBackground = ctx.getImageData(0, 0, 1, 1).data;
    const imageForeground = ctx.getImageData(2, 2, 1, 1).data;
    expect(imageBackground).to.be.deep.equal(new Uint8ClampedArray([255, 255, 255, 255]));
    expect(imageForeground).to.be.deep.equal(new Uint8ClampedArray([0, 0, 0, 255]));
  });

  it("should render an Image with two flight paths and load it onto canvas WITHOUT CIRCLE", async function () {
    const canvasSize: IResolution = { width: lengthMedium, height: lengthMedium };

    const paths: IPixel[][] = [
      [
        { x: 1, y: 2 },
        { x: 4, y: 2 },
      ],
      [
        { x: 2, y: 1 },
        { x: 2, y: 4 },
      ],
    ];

    await renderImage(paths, canvasSize, imageFilePath, {
      background: "#ffffff",
      foregroundColor: "#000000",
      lineWidth: 1,
      renderEllipse: false,
    });

    const ctx = createTestCanvasContext(lengthMedium, lengthMedium);

    const img = await loadImage(imageFilePath);
    ctx.drawImage(img, 0, 0);
    const imageBackground = ctx.getImageData(0, 0, 1, 1).data;
    const imageForeground = ctx.getImageData(2, 2, 1, 1).data;
    expect(imageBackground).to.be.deep.equal(new Uint8ClampedArray([255, 255, 255, 255]));
    expect(imageForeground).to.be.deep.equal(new Uint8ClampedArray([0, 0, 0, 255]));
  });

  it("should render an Image with two flight paths and load it onto canvas WITHOUT RenderImageOptions", async function () {
    const canvasSize: IResolution = { width: lengthMedium, height: lengthMedium };

    const paths: IPixel[][] = [
      [
        { x: 1, y: 2 },
        { x: 4, y: 2 },
      ],
      [
        { x: 2, y: 1 },
        { x: 2, y: 4 },
      ],
    ];

    await renderImage(paths, canvasSize, imageFilePath, {}); // <- !!!

    const ctx = createTestCanvasContext(lengthMedium, lengthMedium);

    const img = await loadImage(imageFilePath);
    ctx.drawImage(img, 0, 0);
    const imageBackground = ctx.getImageData(0, 0, 1, 1).data;
    const imageForeground = ctx.getImageData(2, 2, 1, 1).data;
    expect(imageBackground).to.be.deep.equal(new Uint8ClampedArray([255, 255, 255, 255]));
    expect(imageForeground).to.be.deep.equal(new Uint8ClampedArray([0, 0, 0, 255]));
  });
});

describe("Test drawFlightPath", function () {
  it("should not generate an image with invalid single-coordinate flight path", function () {
    const ctx = createTestCanvasContext(lengthSmall, lengthSmall);

    drawFlightPath(ctx, [
      { x: 0, y: 0 }, // <- Single coordinate means no flight path can be rendered
    ]);
    const imageData = ctx.getImageData(0, 0, lengthSmall, lengthSmall);

    expect(imageData.data).to.be.deep.equal(
      // prettier-ignore
      new Uint8ClampedArray([
        0, 0, 0, 0,   // 0,0
        0, 0, 0, 0,   // 1,0
        0, 0, 0, 0,   // 2,0
        0, 0, 0, 0,   // 0,1
        0, 0, 0, 0,   // 1,1
        0, 0, 0, 0,   // 2,1
        0, 0, 0, 0,   // 0,2
        0, 0, 0, 0,   // 1,2
        0, 0, 0, 0   // 2,2
      ])
    );
  });

  it("should generate an image with one flight path from north to south to east", function () {
    const ctx = createTestCanvasContext(lengthSmall, lengthSmall);

    drawFlightPath(ctx, [
      { x: 0, y: 0 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ]);
    const imageData = ctx.getImageData(0, 0, lengthSmall, lengthSmall);

    expect(imageData.data).to.be.deep.equal(
      // prettier-ignore
      new Uint8ClampedArray([
        0, 0, 0, 128, // 0,0
        0, 0, 0, 0,   // 1,0
        0, 0, 0, 0,   // 2,0
        0, 0, 0, 255, // 0,1
        0, 0, 0, 0,   // 1,1
        0, 0, 0, 0,   // 2,1
        0, 0, 0, 255, // 0,2
        0, 0, 0, 128, // 1,2
        0, 0, 0, 0   // 2,2
      ])
    );
  });

  it("should ignore coordinates out of bound", function () {
    const ctx = createTestCanvasContext(lengthSmall, lengthSmall);

    drawFlightPath(ctx, [
      { x: 0, y: 0 },
      { x: 0, y: 500 },
      { x: 2, y: 500 },
      { x: 2, y: 0 },
    ]);

    const imageData = ctx.getImageData(0, 0, lengthSmall, lengthSmall);

    expect(imageData.data).to.be.deep.equal(
      // prettier-ignore
      new Uint8ClampedArray([
        0, 0, 0, 128, // 0,0
        0, 0, 0, 0,   // 1,0
        0, 0, 0, 128, // 2,0
        0, 0, 0, 255, // 0,1
        0, 0, 0, 0,   // 1,1
        0, 0, 0, 255, // 2,1
        0, 0, 0, 255, // 0,2
        0, 0, 0, 0,   // 1,2
        0, 0, 0, 255 // 2,2
      ])
    );
  });
});

describe("Test drawFlightPaths", function () {
  it("should draw multiple paths on same canvas", function () {
    const ctx = createTestCanvasContext(lengthMedium, lengthMedium);

    drawFlightPaths(ctx, [
      [
        { x: 1, y: 1 },
        { x: 1, y: 3 },
      ],
      [
        { x: 3, y: 1 },
        { x: 3, y: 3 },
      ],
    ]);

    const imageData = ctx.getImageData(0, 0, lengthMedium, lengthMedium);

    expect(imageData.data).to.be.deep.equal(
      // prettier-ignore
      new Uint8ClampedArray([
        0, 0, 0, 0,   // 0,0
        0, 0, 0, 0,   // 1,0
        0, 0, 0, 0,   // 2,0
        0, 0, 0, 0,   // 3,0
        0, 0, 0, 0,   // 4,0
        0, 0, 0, 0,   // 0,1
        0, 0, 0, 128, // 1,1
        0, 0, 0, 0,   // 2,1
        0, 0, 0, 128, // 3,1
        0, 0, 0, 0,   // 4,1
        0, 0, 0, 0,   // 0,2
        0, 0, 0, 255, // 1,2
        0, 0, 0, 0,   // 2,2
        0, 0, 0, 255, // 3,2
        0, 0, 0, 0,   // 4,2
        0, 0, 0, 0,   // 0,3
        0, 0, 0, 128, // 1,3
        0, 0, 0, 0,   // 2,3
        0, 0, 0, 128, // 3,3
        0, 0, 0, 0,   // 4,3
        0, 0, 0, 0,   // 0,4
        0, 0, 0, 0,   // 1,4
        0, 0, 0, 0,   // 2,4
        0, 0, 0, 0,   // 3,4
        0, 0, 0, 0   // 4,4
      ])
    );
  });
});
