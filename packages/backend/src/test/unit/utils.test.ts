import { expect } from "chai";
import type { RadiusCutout, RectangleCutout } from "../../core/models";
import { calcCoordinate, calcDistance, cutoutMinMaxStrategy, splitCoordinatesIfDistancesBetween } from "../../utils";

describe("distance calculation", function () {
  [
    {
      coordinate1: {
        latitude: 0.0,
        longitude: 0.0,
      },
      coordinate2: {
        latitude: 9.0,
        longitude: 0.0,
      },
    },
    {
      coordinate1: {
        latitude: 9.0,
        longitude: 0.0,
      },
      coordinate2: {
        latitude: 0.0,
        longitude: 0.0,
      },
    },
    {
      coordinate1: {
        latitude: -4.5,
        longitude: 0.0,
      },
      coordinate2: {
        latitude: 4.5,
        longitude: 0.0,
      },
    },
    {
      coordinate1: {
        latitude: 0.0,
        longitude: 0.0,
      },
      coordinate2: {
        latitude: 0.0,
        longitude: 9.0,
      },
    },
    {
      coordinate1: {
        latitude: 0.0,
        longitude: 9.0,
      },
      coordinate2: {
        latitude: 0.0,
        longitude: 0.0,
      },
    },
  ].forEach(({ coordinate1, coordinate2 }) => {
    it("should test the calculate distance function", function () {
      const distance = calcDistance(coordinate1, coordinate2);
      expect(distance).to.be.closeTo(1000, 1.0);
    });
  });
});
describe("coordinates calculation", () => {
  [
    {
      given: {
        coordinate1: {
          latitude: 0.0,
          longitude: 0.0,
        },
        distance: 1000,
        bearing: 0, // north
      },
      expected: {
        coordinate2: {
          latitude: 9.0,
          longitude: 0.0,
        },
      },
    },
    {
      given: {
        coordinate1: {
          latitude: 9.0,
          longitude: 0.0,
        },
        distance: 1000,
        bearing: 180, // south
      },
      expected: {
        coordinate2: {
          latitude: 0.0,
          longitude: 0.0,
        },
      },
    },
    {
      given: {
        coordinate1: {
          latitude: -4.5,
          longitude: 0.0,
        },
        distance: 1000,
        bearing: 0, // north
      },
      expected: {
        coordinate2: {
          latitude: 4.5,
          longitude: 0.0,
        },
      },
    },
    {
      given: {
        coordinate1: {
          latitude: 0.0,
          longitude: 0.0,
        },
        distance: 1000,
        bearing: 90, // East
      },
      expected: {
        coordinate2: {
          latitude: 0.0,
          longitude: 9.0,
        },
      },
    },
    {
      given: {
        coordinate1: {
          latitude: 0.0,
          longitude: 9.0,
        },
        distance: 1000,
        bearing: 270, // west
      },
      expected: {
        coordinate2: {
          latitude: 0.0,
          longitude: 0.0,
        },
      },
    },
  ].forEach(({ given: { coordinate1, distance, bearing }, expected: { coordinate2 } }) => {
    it("should calculate the other GeoCoordinate by knowing the distance and one GeoCoordinate", function () {
      const result = calcCoordinate(coordinate1, distance, bearing);
      expect(result.latitude).to.be.approximately(coordinate2.latitude, 0.1);
      expect(result.longitude).to.be.approximately(coordinate2.longitude, 0.1);
    });
  });
});

describe("exclude distances between coordinates", function () {
  [
    {
      coordinates: [
        {
          latitude: 0.0,
          longitude: 0.0,
        },
        {
          latitude: 0.25,
          longitude: 0.0,
        },
        {
          latitude: 0.5,
          longitude: 0.0,
        },
        {
          latitude: 2.0,
          longitude: 2.0,
        },
        {
          latitude: 2.25,
          longitude: 2.0,
        },
        {
          latitude: 85.5,
          longitude: 84.5,
        },
        {
          latitude: 50.0,
          longitude: 0.0,
        },
        {
          latitude: 50.25,
          longitude: 0.0,
        },
        {
          latitude: 50.5,
          longitude: 0.0,
        },
        {
          latitude: 85.5,
          longitude: 84.5,
        },
      ],
    },
  ].forEach(({ coordinates }) => {
    it("should test if the distance between 2 coordinates < 50 km ", function () {
      const result = splitCoordinatesIfDistancesBetween(coordinates);
      expect(result).to.have.lengthOf(5);
    });
  });

  it("should return the rectangle cutout from the rectangle cutout", function () {
    const input: RectangleCutout = {
      discriminator: "rectangle",
      minCoordinate: {
        latitude: 5,
        longitude: 5,
      },
      maxCoordinate: {
        latitude: 10,
        longitude: 10,
      },
    };

    const expected = {
      discriminator: "rectangle",
      minCoordinate: {
        latitude: 5,
        longitude: 5,
      },
      maxCoordinate: {
        latitude: 10,
        longitude: 10,
      },
    };

    const result = cutoutMinMaxStrategy(input);
    expect(result).to.eql(expected);
  });

  it("should return the rectangle cutout from the radius cutout", function () {
    const input: RadiusCutout = {
      discriminator: "radius",
      location: {
        latitude: 5,
        longitude: 5,
      },
      radius: 50,
    };

    const expected = {
      discriminator: "radius",
      minCoordinate: {
        latitude: 4.55,
        longitude: 4.55,
      },
      maxCoordinate: {
        latitude: 5.45,
        longitude: 5.45,
      },
    };

    const result = cutoutMinMaxStrategy(input);
    expect(result.minCoordinate.latitude).to.be.approximately(expected.minCoordinate.latitude, 0.01);
    expect(result.minCoordinate.longitude).to.be.approximately(expected.minCoordinate.longitude, 0.01);
    expect(result.maxCoordinate.latitude).to.be.approximately(expected.maxCoordinate.latitude, 0.01);
    expect(result.maxCoordinate.longitude).to.be.approximately(expected.maxCoordinate.longitude, 0.01);
  });
});
