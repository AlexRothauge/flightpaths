import { expect } from "chai";
import { deserializeFlightData, isValidCSVFlightData, sortFileNameByDate } from "../../processCSV";

describe("Validate CSV Data", function () {
  [
    {
      given: {
        icao24: "EDDF",
        time: "1668193225",
        lat: "45.86192321777344",
        lon: "-112.20403903868137",
      },
      expected: {
        isValid: true,
      },
    },
    {
      given: {
        icao24: "EDDF",
        time: "1668193225",
        lat: "",
        lon: "-112.20403903868137",
      },
      expected: {
        isValid: true,
      },
    },
    {
      given: {
        icao24: "EDDF",
        time: "1668193225",
        lon: "-112.20403903868137",
      },
      expected: {
        isValid: false,
      },
    },
    {
      given: {
        icao24: "EDDF",
        time: "1668193225",
        lat: "45.86192321777344",
        lon: "",
      },
      expected: {
        isValid: true,
      },
    },
    {
      given: {
        icao24: "EDDF",
        time: "1668193225",
        lat: "45.86192321777344",
      },
      expected: {
        isValid: false,
      },
    },
  ].forEach(({ given, expected }) => {
    it("should validate data from CSV", function () {
      const isValid = isValidCSVFlightData(given);
      expect(isValid).to.eq(expected.isValid);
    });
  });
});

describe("processing files of directory", function () {
  [
    ["states_2022-06-27-08", "states_2022-06-27-09", "states_2022-06-27-10"],
    ["states_2022-06-27-08", "states_2022-06-27-10", "states_2022-06-27-09"],
    ["states_2022-06-27-00", "states_2022-06-27-01", "states_2022-06-27-10"],
    ["states_2022-01-27-00", "states_2022-06-27-00", "states_2022-12-27-00"],
    ["states_1999-01-01-00", "states_2000-01-01-00", "states_2001-01-01-00"],
  ].forEach((names: string[]) => {
    it("should sort files by date in file name", function () {
      const sorted = names.sort(sortFileNameByDate);
      expect(sorted).to.eq(names);
    });
  });
});

describe("Proccessing of CSV", function () {
  [
    {
      given: {
        icao24: "EDDF",
        time: "1668193225",
        lat: "45.86192321777344",
        lon: "-112.20403903868137",
      },
      expected: {
        ICAO: "EDDF",
        time: 1668193225,
        position: {
          latitude: 45.86192321777344,
          longitude: -112.20403903868137,
        },
      },
    },
    {
      given: {
        icao24: "EDDF",
        time: "1668193225",
        lat: "",
        lon: "-112.20403903868137",
      },
      expected: null,
    },
    {
      given: {
        icao24: "EDDF",
        time: "1668193225",
        lat: "45.86192321777344",
        lon: "",
      },
      expected: null,
    },
    {
      given: {
        icao24: "EDDF",
        time: "",
        lat: "45.86192321777344",
        lon: "-112.20403903868137",
      },
      expected: null,
    },
    {
      given: {
        icao24: "",
        time: "1668193225",
        lat: "45.86192321777344",
        lon: "-112.20403903868137",
      },
      expected: null,
    },
    {
      given: {
        icao24: "EDDF",
        time: "1668193225",
        lat: "45.86192321777344",
        lon: "abc",
      },
      expected: null,
    },
  ].forEach(({ given, expected }) => {
    it("should create flight data object from json", function () {
      const flightData = deserializeFlightData(given);
      expect(flightData).to.be.deep.equal(expected);
    });
  });
});
