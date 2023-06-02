import type { Canvas, CanvasRenderingContext2D, Image } from "canvas";
import { createCanvas, loadImage } from "canvas";
import type { GeoCoordinate, IResolution } from "../core/models";
import { Env } from "../env";
import { isNonNullable } from "../utils";
import { TileMath } from "./TileMath";

export interface IMapboxTile {
  tileX: number;
  tileY: number;
  zoom: number;
}

// 512 px is the maximum resolution of mapbox tiles which can provided by the api
const maxMapboxTileResolution = 512;

/* istanbul ignore next */
function getMapboxTileUrl(tile: IMapboxTile, style: string): string {
  return `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/${maxMapboxTileResolution}/${tile.zoom}/${tile.tileX}/${tile.tileY}?access_token=${Env.mapBoxToken}`;
}

function calculateTiles(
  canvasSize: IResolution,
  minCoordinate: GeoCoordinate,
  maxCoordinate: GeoCoordinate
): IMapboxTile[] {
  const tiles: IMapboxTile[] = [];

  const res = TileMath.BestMapView(
    [minCoordinate.longitude, minCoordinate.latitude, maxCoordinate.longitude, maxCoordinate.latitude],
    canvasSize.width,
    canvasSize.height,
    0,
    maxMapboxTileResolution
  );

  /* istanbul ignore if */
  if (!isNonNullable(res.center[1]) || !isNonNullable(res.center[0]) || !isNonNullable(res.zoom)) {
    throw new Error("Could not calculate the best map view (center, zoom) for a bounding box on a map.");
  }
  const quadkeys = TileMath.GetQuadkeysInView(
    [res.center[0], res.center[1]],
    Math.floor(res.zoom),
    canvasSize.width,
    canvasSize.height,
    maxMapboxTileResolution
  );
  quadkeys.forEach((quadkey) => {
    tiles.push(TileMath.QuadKeyToTileXY(quadkey));
  });
  return tiles;
}

function calculateProjection(
  boundingBoxForeground: { minCoordinate: GeoCoordinate; maxCoordinate: GeoCoordinate },
  canvasBackground: { width: number; height: number },
  boundinBoxBackground: { minCoordinate: GeoCoordinate; maxCoordinate: GeoCoordinate }
): { paddingX: number; paddingY: number; cutoutWidth: number; cutoutHeight: number } {
  // Calculate the pixel per longitude degree in background image
  const resolutionLongitude =
    (boundinBoxBackground.maxCoordinate.longitude - boundinBoxBackground.minCoordinate.longitude) /
    canvasBackground.width;

  // Calculate pixel difference between background minCoordinate longitude
  // coordinate and actual canvas minCoordinate longitude (SX)
  const paddingX =
    (boundingBoxForeground.minCoordinate.longitude - boundinBoxBackground.minCoordinate.longitude) /
    resolutionLongitude;
  // Calculate the pixel per latitude degree in background image
  const resolutionLatitude =
    (boundinBoxBackground.maxCoordinate.latitude - boundinBoxBackground.minCoordinate.latitude) /
    canvasBackground.height;
  // Calculate pixel difference between background minCoordinate latitude
  // coordinate and actual canvas maxCoordinate latitude (SY)
  const paddingY =
    (boundinBoxBackground.maxCoordinate.latitude - boundingBoxForeground.maxCoordinate.latitude) / resolutionLatitude;

  // Cutout from background image - the area that will be used in the final image
  const cutoutWidth =
    (boundingBoxForeground.maxCoordinate.longitude - boundingBoxForeground.minCoordinate.longitude) /
    resolutionLongitude;
  const cutoutHeight =
    (boundingBoxForeground.maxCoordinate.latitude - boundingBoxForeground.minCoordinate.latitude) / resolutionLatitude;

  return { paddingX, paddingY, cutoutWidth, cutoutHeight };
}

function findBoundingBoxOfBackground(
  minTileX: number,
  minTileY: number,
  maxTileX: number,
  maxTileY: number,
  zoom: number
): { minCoordinate: GeoCoordinate; maxCoordinate: GeoCoordinate } {
  const NorthWest = TileMath.TileXYToBoundingBox(minTileX, minTileY, zoom, maxMapboxTileResolution);
  const SouthEast = TileMath.TileXYToBoundingBox(maxTileX, maxTileY, zoom, maxMapboxTileResolution);
  /* istanbul ignore if */
  if (
    !isNonNullable(NorthWest[0]) ||
    !isNonNullable(NorthWest[3]) ||
    !isNonNullable(SouthEast[1]) ||
    !isNonNullable(SouthEast[2])
  ) {
    throw new Error("Could not find bounding box of background");
  }
  return {
    minCoordinate: { latitude: SouthEast[1], longitude: NorthWest[0] },
    maxCoordinate: { latitude: NorthWest[3], longitude: SouthEast[2] },
  };
}

function calculateMinMaxTiles(tiles: IMapboxTile[]): {
  minTileX: number;
  minTileY: number;
  maxTileX: number;
  maxTileY: number;
  maxZoom: number;
} {
  const minTileX = Math.min(...tiles.map((tile) => tile.tileX));
  const minTileY = Math.min(...tiles.map((tile) => tile.tileY));
  const maxTileX = Math.max(...tiles.map((tile) => tile.tileX));
  const maxTileY = Math.max(...tiles.map((tile) => tile.tileY));
  const maxZoom = Math.max(...tiles.map((tile) => tile.zoom));
  return { minTileX, minTileY, maxTileX, maxTileY, maxZoom };
}

function calculateDiffBetweenTiles(
  minTileX: number,
  minTileY: number,
  maxTileX: number,
  maxTileY: number
): { diffX: number; diffY: number } {
  const diffX = maxTileX + 1 - minTileX;
  const diffY = maxTileY + 1 - minTileY;
  return { diffX, diffY };
}

/* istanbul ignore next */
function drawTilesOnCanvas(context: CanvasRenderingContext2D, images: Image[], diff: { x: number; y: number }): void {
  for (let x = 0; x < diff.x; x++) {
    for (let y = 0; y < diff.y; y++) {
      const tile = images[y + diff.y * x];
      if (typeof tile !== "undefined") {
        context.drawImage(tile, x * maxMapboxTileResolution, y * maxMapboxTileResolution);
      }
    }
  }
}

/* istanbul ignore next */
function drawOnCanvas(
  canvasToDrawOn: Canvas,
  canvasBackground: Canvas,
  projectionData: { paddingX: number; paddingY: number; cutoutWidth: number; cutoutHeight: number }
): void {
  const context = canvasToDrawOn.getContext("2d");
  context.drawImage(
    canvasBackground,
    projectionData.paddingX,
    projectionData.paddingY,
    projectionData.cutoutWidth,
    projectionData.cutoutHeight,
    0,
    0,
    canvasToDrawOn.width,
    canvasToDrawOn.height
  );
}

async function loadingImages(tiles: IMapboxTile[], style: string): Promise<Image[]> {
  const urlTiles = tiles.map((tile) => getMapboxTileUrl(tile, style));
  return Promise.all(urlTiles.map((url) => loadImage(url)));
}

/* istanbul ignore next */
export function drawBackground(
  minCoordinate: GeoCoordinate,
  maxCoordinate: GeoCoordinate,
  style: string
): (canvas: Canvas) => Promise<void> {
  return async (canvas) => {
    const tiles = calculateTiles({ height: canvas.height, width: canvas.width }, minCoordinate, maxCoordinate);
    const { minTileX, minTileY, maxTileX, maxTileY, maxZoom } = calculateMinMaxTiles(tiles);
    const boundingBoxBackground = findBoundingBoxOfBackground(minTileX, minTileY, maxTileX, maxTileY, maxZoom);
    const { diffX, diffY } = calculateDiffBetweenTiles(minTileX, minTileY, maxTileX, maxTileY);
    const canvasBackground = createCanvas(diffX * maxMapboxTileResolution, diffY * maxMapboxTileResolution);
    const projectionData = calculateProjection(
      { minCoordinate, maxCoordinate },
      canvasBackground,
      boundingBoxBackground
    );
    const backgroundContext = canvasBackground.getContext("2d");
    const images = await loadingImages(tiles, style);
    drawTilesOnCanvas(backgroundContext, images, { x: diffX, y: diffY });
    drawOnCanvas(canvas, canvasBackground, projectionData);
  };
}
