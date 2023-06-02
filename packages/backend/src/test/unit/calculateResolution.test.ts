import { expect } from "chai";
import { calculateResolution } from "../../core/calculateResolution";

describe("calculate resolution", function () {
  [
    {
      given: {
        minCoordinate: {
          latitude: 0,
          longitude: 0,
        },
        maxCoordinate: {
          latitude: 9,
          longitude: 4.5,
        },
      },
      expected: {
        width: 1000,
        height: 2000,
      },
    },
    {
      given: {
        minCoordinate: {
          latitude: 0,
          longitude: 9,
        },
        maxCoordinate: {
          latitude: 9,
          longitude: 0,
        },
      },
      expected: {
        width: 2000,
        height: 2000,
      },
    },
    {
      given: {
        minCoordinate: {
          latitude: 0,
          longitude: 18,
        },
        maxCoordinate: {
          latitude: 9,
          longitude: 0,
        },
      },
      expected: {
        width: 2000,
        height: 1000,
      },
    },
    {
      given: {
        minCoordinate: {
          latitude: -1,
          longitude: 18,
        },
        maxCoordinate: {
          latitude: 8,
          longitude: 0,
        },
      },
      expected: {
        width: 2000,
        height: 1000,
      },
    },
    {
      given: {
        minCoordinate: {
          latitude: 1,
          longitude: 18,
        },
        maxCoordinate: {
          latitude: -8,
          longitude: 0,
        },
      },
      expected: {
        width: 2000,
        height: 1000,
      },
    },
  ].forEach(({ given: { minCoordinate, maxCoordinate }, expected: { width, height } }) => {
    it("should test the calculate resolution function", function () {
      const result = calculateResolution(2000, minCoordinate, maxCoordinate);
      expect(result.width).to.eql(width);
      expect(result.height).to.eql(height);
    });
  });
});
