import { expect } from "chai";
import rewire from "rewire";
import type { GeoCoordinate, Timespan } from "../../core/models";
import type { FilterOption } from "../../database/mongodb/adapter";

const generateImageModule = rewire("../../core/generateImage");
const rangeWithOffset =
  generateImageModule.__get__<
    (
      minCoordinate: GeoCoordinate,
      maxCoordinate: GeoCoordinate
    ) => { minCoordinate: GeoCoordinate; maxCoordinate: GeoCoordinate }
  >("rangeWithOffset");

const toFilterOptions =
  generateImageModule.__get__<
    (minCoordinate: GeoCoordinate, maxCoordinate: GeoCoordinate, timespan: Timespan) => { filterOptions: FilterOption }
  >("toFilterOptions");

describe("Generate image", function () {
  [
    {
      given: {
        minCoordinate: { latitude: 49, longitude: 7 },
        maxCoordinate: { latitude: 51.5, longitude: 10 },
      },
      expected: {
        // offsetLatitude: 0.25, offsetLongitude: 0.3
        minCoordinate: { latitude: 48.75, longitude: 6.7 },
        maxCoordinate: { latitude: 51.75, longitude: 10.3 },
      },
    },
    {
      given: {
        minCoordinate: { latitude: 0, longitude: 10 },
        maxCoordinate: { latitude: 0, longitude: 7 },
      },
      expected: {
        // offsetLatitude: 0, offsetLongitude: -0.3
        minCoordinate: { latitude: 0, longitude: 10.3 },
        maxCoordinate: { latitude: 0, longitude: 6.7 },
      },
    },
    {
      given: {
        minCoordinate: { latitude: 50, longitude: 10 },
        maxCoordinate: { latitude: 30, longitude: 10 },
      },
      expected: {
        // offsetLatitude: -2, offsetLongitude: 0
        minCoordinate: { latitude: 52, longitude: 10 },
        maxCoordinate: { latitude: 28, longitude: 10 },
      },
    },
    {
      given: {
        minCoordinate: { latitude: 0, longitude: 0 },
        maxCoordinate: { latitude: 0, longitude: 0 },
      },
      expected: {
        // offsetLatitude: 0, offsetLongitude: 0
        minCoordinate: { latitude: 0, longitude: 0 },
        maxCoordinate: { latitude: 0, longitude: 0 },
      },
    },
  ].forEach(
    ({
      given: { minCoordinate, maxCoordinate },
      expected: { minCoordinate: expectedMinCoordinate, maxCoordinate: expectedMaxCoordinate },
    }) => {
      it("should calculate offset value for different range Coordinates (lonMin, lonMax)", () => {
        const result = rangeWithOffset(minCoordinate, maxCoordinate);

        expect(result.minCoordinate.longitude).to.be.approximately(expectedMinCoordinate.longitude, 0.00001);
        expect(result.minCoordinate.latitude).to.be.approximately(expectedMinCoordinate.latitude, 0.00001);

        expect(result.maxCoordinate.longitude).to.be.approximately(expectedMaxCoordinate.longitude, 0.00001);
        expect(result.maxCoordinate.latitude).to.be.approximately(expectedMaxCoordinate.latitude, 0.00001);
      });
    }
  );

  it("should transform input data to filter options", () => {
    const input = {
      minCoordinate: {
        latitude: -50,
        longitude: -50,
      },
      maxCoordinate: {
        latitude: 50,
        longitude: 50,
      },
      timespan: {
        from: 0,
        until: 50,
      },
    };

    const expected = {
      range: {
        minCoordinate: {
          latitude: -60,
          longitude: -60,
        },
        maxCoordinate: {
          latitude: 60,
          longitude: 60,
        },
      },
      timespan: {
        from: 0,
        until: 50,
      },
    };
    const result = toFilterOptions(input.minCoordinate, input.maxCoordinate, input.timespan);

    expect(result).to.eql(expected);
  });
});
