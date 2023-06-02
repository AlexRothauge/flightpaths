import { expect } from "chai";
import rewire from "rewire";
import { calcMinAndMaxCoordinatesFromRadius, normalizeData, projectionStrategy } from "../../core/normalizeFlightData";

import type { GeoCoordinate, IPixel, IResolution } from "../../core/models";

type Projection = (coordinate: GeoCoordinate) => IPixel;
type Transformer = (input: number) => number;

const normalizeFlightDataModule = rewire("../../core/normalizeFlightData");
const transformWithMercatorProjection: (coordinate: GeoCoordinate) => IPixel = normalizeFlightDataModule.__get__(
  "transformWithMercatorProjection"
);
const createTransformation: (
  startInput: number,
  endInput: number,
  startOutput: number,
  endOutput: number
) => Transformer = normalizeFlightDataModule.__get__("createTransformation");
const createLinearProjection: (
  minCoordinate: GeoCoordinate,
  maxCoordinate: GeoCoordinate,
  resolution: IResolution
) => Projection = normalizeFlightDataModule.__get__("createLinearProjection");
const createMercatorProjection: (
  minCoordinate: GeoCoordinate,
  maxCoordinate: GeoCoordinate,
  resolution: IResolution
) => Projection = normalizeFlightDataModule.__get__("createMercatorProjection");

describe("Normalize lat/long to cartesian coordinate", function () {
  describe("calculate min latitude/longitude and max latitude/longitude", function () {
    [
      // 111.320 km => 1 degree lon at the equator
      {
        given: { radius: 111.32, center: { latitude: 0, longitude: 0 } },
        expected: {
          maxCoordinate: {
            latitude: 1,
            longitude: 1,
          },
          minCoordinate: {
            latitude: -1,
            longitude: -1,
          },
        },
      },
    ].forEach(({ given: { radius, center }, expected }) => {
      it("should calculate min/max latitude and longitude from given radius", function () {
        const { maxCoordinate, minCoordinate } = calcMinAndMaxCoordinatesFromRadius(radius, center);
        expect(maxCoordinate.latitude).to.be.approximately(expected.maxCoordinate.latitude, 0.002);
        expect(maxCoordinate.longitude).to.be.approximately(expected.maxCoordinate.longitude, 0.002);

        expect(minCoordinate.latitude).to.be.approximately(expected.minCoordinate.latitude, 0.002);
        expect(minCoordinate.longitude).to.be.approximately(expected.minCoordinate.longitude, 0.002);
      });
    });
  });

  describe("transformation function", function () {
    [
      {
        given: { startInput: 0, endInput: 5, startOutput: -5, endOutput: 5, input: 2 },
        expected: -1,
      },
      {
        given: { startInput: 5, endInput: -5, startOutput: 10, endOutput: 15, input: -4 },
        expected: 14.5,
      },
      {
        given: { startInput: -10, endInput: -15, startOutput: -5, endOutput: -15, input: -12 },
        expected: -9,
      },
    ].forEach(({ given: { startInput, endInput, startOutput, endOutput, input }, expected }) => {
      it(`should transform the value ${input} from range [${startInput}, ${endInput}] to [${startOutput}, ${endOutput}]`, function () {
        const transform = createTransformation(startInput, endInput, startOutput, endOutput);
        expect(transform(input)).to.equal(expected);
      });
    });
  });

  describe("mercator projection", function () {
    [
      {
        given: { latitude: 80, longitude: 170 },
        expected: { x: 0.972222, y: 0.112259 },
      },
      {
        given: { latitude: -89.99, longitude: 180 },
        expected: { x: 1, y: 1.987549 },
      },
      {
        given: { latitude: 20, longitude: -30 },
        expected: { x: 0.416667, y: 0.443281 },
      },
    ].forEach(({ given: coordinate, expected }) => {
      it(`should calculate a projected pixel for given coordinate in mercator: { latitude: ${coordinate.latitude}, longitude: ${coordinate.longitude} }`, function () {
        const val = transformWithMercatorProjection(coordinate);
        expect(val.x).to.be.approximately(expected.x, 0.000001);
        expect(val.y).to.be.approximately(expected.y, 0.000001);
      });
    });

    describe("project coordinates on pixel", function () {
      const resolution: IResolution = { width: 10, height: 10 };
      const minCoordinate: GeoCoordinate = { latitude: -10, longitude: -10 };
      const maxCoordinate: GeoCoordinate = { latitude: 10, longitude: 10 };
      [
        { given: { longitude: 0, latitude: 0 }, expected: { x: 5, y: 5 } },
        { given: { longitude: 10, latitude: -10 }, expected: { x: 10, y: 10 } },
        { given: { longitude: -10, latitude: 10 }, expected: { x: 0, y: 0 } },
        { given: { longitude: -2, latitude: -2 }, expected: { x: 4, y: 6 } },
        { given: { longitude: 2, latitude: 2 }, expected: { x: 6, y: 4 } },
        { given: { longitude: 11, latitude: -11 }, expected: { x: 10.5, y: 10.5 } },
        { given: { longitude: -11, latitude: 11 }, expected: { x: -0.5, y: -0.5 } },
      ].forEach(({ given: coordinate, expected }) => {
        it(`should calculate a projected pixel for given coordinate in mercator: { latitude: ${coordinate.latitude}, longitude: ${coordinate.longitude} }`, function () {
          const mercatorProjection = createMercatorProjection(minCoordinate, maxCoordinate, resolution);
          const pixel = mercatorProjection(coordinate);
          expect(pixel.x).to.be.approximately(expected.x, 0.000000001);
          expect(pixel.y).to.be.approximately(expected.y, 0.01);
        });
      });
    });

    it("should throw if latitude is equal to -90", function () {
      expect(() =>
        createMercatorProjection(
          { latitude: -90, longitude: -10 },
          { latitude: 0, longitude: 10 },
          {
            width: 10,
            height: 10,
          }
        )
      ).to.throw("The latitude shall not be equal to -90.");
      expect(() =>
        createMercatorProjection(
          { latitude: 0, longitude: -10 },
          { latitude: -90, longitude: 10 },
          {
            width: 10,
            height: 10,
          }
        )
      ).to.throw("The latitude shall not be equal to -90.");
    });

    it("should check if a array of coordinates are correctly calculated in mercator projection", function () {
      const flightData: GeoCoordinate[][] = [
        [{ latitude: 10, longitude: -10 }],
        [{ latitude: 5, longitude: -10 }],
        [{ latitude: 5, longitude: -5 }],
        [{ latitude: 0, longitude: -5 }],
        [{ latitude: 0, longitude: 0 }],
        [{ latitude: -5, longitude: 0 }],
        [{ latitude: -5, longitude: 5 }],
        [{ latitude: -10, longitude: 5 }],
        [{ latitude: -10, longitude: 10 }],
      ];

      const expectedPixels: IPixel[][] = [
        [{ y: 0, x: 0 }],
        [{ y: 250, x: 0 }],
        [{ y: 250, x: 250 }],
        [{ y: 500, x: 250 }],
        [{ y: 500, x: 500 }],
        [{ y: 750, x: 500 }],
        [{ y: 750, x: 750 }],
        [{ y: 1000, x: 750 }],
        [{ y: 1000, x: 1000 }],
      ];

      const minCoordinate: GeoCoordinate = { latitude: -10, longitude: -10 };
      const maxCoordinate: GeoCoordinate = { latitude: 10, longitude: 10 };
      const projection = projectionStrategy("MERCATOR", minCoordinate, maxCoordinate, { width: 1000, height: 1000 });
      const pixels = normalizeData(flightData, projection);

      expect(pixels.length).to.be.equal(expectedPixels.length);

      for (let i = 0; i < pixels.length; i++) {
        const innerPixels = pixels[i];
        const innerExpectedPixels = expectedPixels[i];

        // eslint-disable-next-line no-unused-expressions
        expect(innerPixels).not.to.be.undefined;
        // eslint-disable-next-line no-unused-expressions
        expect(innerExpectedPixels).not.to.be.undefined;

        if (innerPixels && innerExpectedPixels) {
          expect(innerPixels.length).to.be.equal(innerExpectedPixels.length);

          for (let j = 0; j < innerPixels.length; j++) {
            const pixel = innerPixels[j];
            const expectedPixel = innerExpectedPixels[j];

            // eslint-disable-next-line no-unused-expressions
            expect(pixel).not.to.be.undefined;
            // eslint-disable-next-line no-unused-expressions
            expect(expectedPixel).not.to.be.undefined;

            if (pixel && expectedPixel) {
              expect(pixel.x).to.be.approximately(expectedPixel.x, 0.000000001);
              expect(pixel.y).to.be.approximately(expectedPixel.y, 1);
            }
          }
        }
      }
    });
  });

  describe("linear projection", function () {
    describe("project coordinates on pixel", function () {
      const resolution: IResolution = { width: 10, height: 10 };
      const minCoordinate: GeoCoordinate = { latitude: -10, longitude: -10 };
      const maxCoordinate: GeoCoordinate = { latitude: 10, longitude: 10 };

      [
        { given: { longitude: 0, latitude: 0 }, expected: { x: 5, y: 5 } },
        { given: { longitude: 10, latitude: -10 }, expected: { x: 10, y: 10 } },
        { given: { longitude: -10, latitude: 10 }, expected: { x: 0, y: 0 } },
        { given: { longitude: -2, latitude: -2 }, expected: { x: 4, y: 6 } },
        { given: { longitude: 2, latitude: 2 }, expected: { x: 6, y: 4 } },
        { given: { longitude: 11, latitude: -11 }, expected: { x: 10.5, y: 10.5 } },
        { given: { longitude: -11, latitude: 11 }, expected: { x: -0.5, y: -0.5 } },
      ].forEach(({ given: coordinate, expected: pixel }) => {
        it(`should calculate a projected pixel [${pixel.x}, ${pixel.y}] for given input coordinates: [${coordinate.longitude}, ${coordinate.latitude}]`, function () {
          const linearProjection = createLinearProjection(minCoordinate, maxCoordinate, resolution);
          expect(linearProjection(coordinate)).to.be.deep.equal(pixel);
        });
      });
    });

    it("should check if a array of coordinates are correctly calculated in linear projection", function () {
      const flightData: GeoCoordinate[][] = [
        [{ latitude: 10, longitude: -10 }],
        [{ latitude: 5, longitude: -10 }],
        [{ latitude: 5, longitude: -5 }],
        [{ latitude: 0, longitude: -5 }],
        [{ latitude: 0, longitude: 0 }],
        [{ latitude: -5, longitude: 0 }],
        [{ latitude: -5, longitude: 5 }],
        [{ latitude: -10, longitude: 5 }],
        [{ latitude: -10, longitude: 10 }],
      ];

      const expectedPixel = [
        [{ y: 0, x: 0 }],
        [{ y: 250, x: 0 }],
        [{ y: 250, x: 250 }],
        [{ y: 500, x: 250 }],
        [{ y: 500, x: 500 }],
        [{ y: 750, x: 500 }],
        [{ y: 750, x: 750 }],
        [{ y: 1000, x: 750 }],
        [{ y: 1000, x: 1000 }],
      ];

      const minCoordinate: GeoCoordinate = { latitude: -10, longitude: -10 };
      const maxCoordinate: GeoCoordinate = { latitude: 10, longitude: 10 };
      const projection = projectionStrategy("LINEAR", minCoordinate, maxCoordinate, { width: 1000, height: 1000 });
      const pixel = normalizeData(flightData, projection);

      expect(pixel).to.eql(expectedPixel);
    });
  });
});
