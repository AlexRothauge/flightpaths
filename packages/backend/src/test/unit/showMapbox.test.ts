import type { Canvas } from "canvas";
import { createCanvas } from "canvas";
import { expect } from "chai";
import { describe, it } from "mocha";
import rewire from "rewire";
import type { GeoCoordinate, IResolution } from "../../core/models";
import type { IMapboxTile } from "../../mapbox/showMapbox";
import { drawBackground } from "../../mapbox/showMapbox";

const generateImageModule = rewire("../../mapbox/showMapbox");

const calculateTiles: (
  canvasSize: IResolution,
  minCoordinate: GeoCoordinate,
  maxCoordinate: GeoCoordinate
) => IMapboxTile[] = generateImageModule.__get__("calculateTiles");

const calculateDiffBetweenTiles: (
  minTileX: number,
  minTileY: number,
  maxTileX: number,
  maxTileY: number
) => { diffX: number; diffY: number } = generateImageModule.__get__("calculateDiffBetweenTiles");

const calculateMinMaxTiles: (tiles: IMapboxTile[]) => {
  minTileX: number;
  minTileY: number;
  maxTileX: number;
  maxTileY: number;
  maxZoom: number;
} = generateImageModule.__get__("calculateMinMaxTiles");

const calculateProjection: (
  boundingBoxForeground: { minCoordinate: GeoCoordinate; maxCoordinate: GeoCoordinate },
  canvasBackground: { width: number; height: number },
  backgroundBoundingBox: { minCoordinate: GeoCoordinate; maxCoordinate: GeoCoordinate }
) => { paddingX: number; paddingY: number; cutoutWidth: number; cutoutHeight: number } =
  generateImageModule.__get__("calculateProjection");

const findBoundingBoxOfBackground: (
  minTileX: number,
  minTileY: number,
  maxTileX: number,
  maxTileY: number,
  zoom: number
) => { minCoordinate: GeoCoordinate; maxCoordinate: GeoCoordinate } =
  generateImageModule.__get__("findBoundingBoxOfBackground");

describe("Generate background image with tiles from mapbox", function () {
  [
    {
      given: {
        canvasSize: { width: 512, height: 512 },
        minCoordinate: { latitude: -85, longitude: -180 },
        maxCoordinate: { latitude: 85, longitude: 180 },
      },
      expected: {
        tiles: [{ tileX: 0, tileY: 0, zoom: 0 }],
      },
    },
  ].forEach(({ given: { canvasSize, minCoordinate, maxCoordinate }, expected }) => {
    it("it should calculate a tile for the whole world when giving canvas size of 200 x 200", function () {
      const tiles = calculateTiles(canvasSize, minCoordinate, maxCoordinate);
      expect(tiles).to.be.deep.equal(expected.tiles);
    });
  });
  [
    {
      given: {
        canvasSize: { width: 1050, height: 1050 },
        minCoordinate: { latitude: -85, longitude: -180 },
        maxCoordinate: { latitude: 85, longitude: 180 },
      },
      expected: {
        tiles: [
          { tileX: 0, tileY: 0, zoom: 1 },
          { tileX: 0, tileY: 1, zoom: 1 },
          { tileX: 1, tileY: 0, zoom: 1 },
          { tileX: 1, tileY: 1, zoom: 1 },
        ],
      },
    },
  ].forEach(({ given: { canvasSize, minCoordinate, maxCoordinate }, expected }) => {
    it("it should calculate 4 tiles for the whole world in a given canvas size of 1050x1050", function () {
      const tiles = calculateTiles(canvasSize, minCoordinate, maxCoordinate);
      expect(tiles).to.be.deep.equal(expected.tiles);
    });
  });

  [
    {
      given: {
        boundingBoxForeground: {
          minCoordinate: { latitude: -1, longitude: -1 },
          maxCoordinate: { latitude: 1, longitude: 1 },
        },
        boundingBoxBackground: {
          minCoordinate: { latitude: -2, longitude: -2 },
          maxCoordinate: { latitude: 2, longitude: 2 },
        },
        canvasSizeBackground: { width: 2048, height: 2048 },
      },
      expected: {
        tiles: {
          paddingX: 512,
          paddingY: 512,
          cutoutWidth: 1024,
          cutoutHeight: 1024,
        },
      },
    },
  ].forEach(({ given: { canvasSizeBackground, boundingBoxBackground, boundingBoxForeground }, expected }) => {
    it("it should calculate 4 tiles for the whole world in a given canvas size of 1050x1050", function () {
      const { paddingX, paddingY, cutoutWidth, cutoutHeight } = calculateProjection(
        boundingBoxForeground,
        canvasSizeBackground,
        boundingBoxBackground
      );
      expect({ paddingX, paddingY, cutoutWidth, cutoutHeight }).to.be.deep.equal(expected.tiles);
    });
  });

  [
    {
      given: {
        minTileX: 537,
        maxTileX: 537,
        minTileY: 346,
        maxTileY: 346,
        zoom: 10,
      },
      // approx. Values from https://tools.geofabrik.de/map/#10/50.2914/9.1478&type=Geofabrik_Standard&grid=1&mlat=50.29054&mlon=9.13886
      expected: {
        minCoordinate: {
          latitude: 50.06539,
          longitude: 8.78867,
        },
        maxCoordinate: {
          latitude: 50.28966,
          longitude: 9.14092,
        },
      },
    },
  ].forEach(({ given: { minTileX, minTileY, maxTileX, maxTileY, zoom }, expected }) => {
    it("it should calculate the bounding box min/max lat/lon for a given tile and zoom", function () {
      const boundingBox: { minCoordinate: GeoCoordinate; maxCoordinate: GeoCoordinate } = findBoundingBoxOfBackground(
        minTileX,
        minTileY,
        maxTileX,
        maxTileY,
        zoom
      );
      expect(boundingBox.minCoordinate.longitude).to.be.approximately(expected.minCoordinate.longitude, 0.002);
      expect(boundingBox.minCoordinate.latitude).to.be.approximately(expected.minCoordinate.latitude, 0.002);
      expect(boundingBox.maxCoordinate.longitude).to.be.approximately(expected.maxCoordinate.longitude, 0.002);
      expect(boundingBox.maxCoordinate.latitude).to.be.approximately(expected.maxCoordinate.latitude, 0.002);
    });
  });
});

describe("Calculate difference between Tiles", function () {
  [
    {
      given: {
        minTileX: 1,
        minTileY: 2,
        maxTileX: 2,
        maxTileY: 3,
      },
      expected: {
        diffX: 2,
        diffY: 2,
      },
    },
    {
      given: {
        minTileX: 2,
        minTileY: 2,
        maxTileX: 2,
        maxTileY: 2,
      },
      expected: {
        diffX: 1,
        diffY: 1,
      },
    },
    {
      given: {
        minTileX: 0,
        minTileY: 0,
        maxTileX: 0,
        maxTileY: 0,
      },
      expected: {
        diffX: 1,
        diffY: 1,
      },
    },
  ].forEach(({ given: { minTileX, minTileY, maxTileX, maxTileY }, expected: { diffX, diffY } }) => {
    it("should calculate the difference between tiles and return x, y coordinate", () => {
      const result = calculateDiffBetweenTiles(minTileX, minTileY, maxTileX, maxTileY);
      expect(result).to.be.deep.equal({ diffX, diffY });
    });
  });
});

describe("Calculate Min/Max Tiles", function () {
  it("should calculate min/max tiles", function () {
    const tiles = [
      {
        tileX: 4,
        tileY: 5,
        zoom: 6,
      },
      {
        tileX: 1,
        tileY: 6,
        zoom: 2,
      },
      {
        tileX: 3,
        tileY: 2,
        zoom: 1,
      },
    ];
    const result = {
      minTileX: 1,
      minTileY: 2,
      maxTileX: 4,
      maxTileY: 6,
      maxZoom: 6,
    };
    const calcTiles = calculateMinMaxTiles(tiles);
    expect(result).to.be.deep.equal(calcTiles);
  });
});

describe("Draw background", function () {
  it.skip("should draw background on canvas", async function () {
    const canvasSize = 2500;
    const canvas = createCanvas(canvasSize, canvasSize);

    function isCanvasBlank(canvas: Canvas): boolean {
      const context = canvas.getContext("2d");

      const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer);

      return pixelBuffer.every((color) => color === 0);
    }

    let canvasBlank = isCanvasBlank(canvas);
    /* eslint-disable no-unused-expressions */
    expect(canvasBlank).to.be.true; // Check if the canvas is empty

    await drawBackground({ latitude: 49, longitude: 7 }, { latitude: 51.5, longitude: 10 }, "streets-v11")(canvas);
    canvasBlank = isCanvasBlank(canvas);
    /* eslint-disable no-unused-expressions */
    expect(canvasBlank).to.be.false; // Check if the canvas is not empty anymore
  });
});
