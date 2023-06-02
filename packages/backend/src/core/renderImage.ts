import type { CanvasRenderingContext2D } from "canvas";
import { createCanvas, type Canvas } from "canvas";
import { createWriteStream } from "fs";
import type { IPixel, IResolution } from "./models";

function drawFlightPath(ctx: CanvasRenderingContext2D, coordinates: IPixel[]): void {
  if (coordinates.length < 2) {
    return;
  }
  ctx.beginPath();

  /**
   * TODO: explain 0.5
   */

  for (const coordinate of coordinates) {
    ctx.lineTo(coordinate.x + 0.5, coordinate.y + 0.5);
  }

  ctx.stroke();
}

function drawFlightPaths(ctx: CanvasRenderingContext2D, paths: IPixel[][]): void {
  for (const path of paths) {
    drawFlightPath(ctx, path);
  }
}

export interface RenderImageOptions {
  background?: string | ((canvas: Canvas) => Promise<void>);
  foregroundColor?: string;
  lineWidth?: number;
  renderEllipse?: boolean;
}

/* istanbul ignore next */
function writePNG(canvas: Canvas, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas
      .createPNGStream()
      .pipe(createWriteStream(outputPath))
      .once("finish", () => resolve())
      .once("error", (err) => reject(err));
  });
}

export async function renderImage(
  flightPaths: IPixel[][],
  canvasSize: IResolution,
  outputPath: string,
  { background = "#FFFFFF", foregroundColor = "#000000", lineWidth = 1, renderEllipse = true }: RenderImageOptions = {}
): Promise<void> {
  const canvas = createCanvas(canvasSize.width, canvasSize.height);
  const ctx = canvas.getContext("2d");

  /* istanbul ignore else */
  if (typeof background === "string") {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    await background(canvas);
  }

  if (renderEllipse) {
    ctx.ellipse(
      canvasSize.width / 2,
      canvasSize.height / 2,
      canvasSize.width / 2,
      canvasSize.height / 2,
      0,
      0,
      2 * Math.PI
    );
    ctx.clip();
  }

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = foregroundColor;
  drawFlightPaths(ctx, flightPaths);

  await writePNG(canvas, outputPath);
}
