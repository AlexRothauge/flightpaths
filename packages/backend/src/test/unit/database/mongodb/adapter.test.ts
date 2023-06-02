import { expect } from "chai";
import { airports as ICAOAirports } from "../../../airportsFixture";

import type { ImageMetadata, ImageStatus } from "../../../../core/models";
import { type FlightData } from "../../../../core/models";
import {
  addAirports,
  addFlightData,
  addImage,
  AIRPORT,
  createIndices,
  dropCollections,
  dropDb,
  FLIGHT_DATA,
  getAirportByICAO,
  getAirports,
  getAllAirports,
  getFlightData,
  getImage,
  IMAGES,
  updateImage,
} from "../../../../database/mongodb/adapter";
import { withConnection } from "../../../../database/mongodb/connector";
import { assertAsyncError } from "../../../helper";

let testImageId = "yet_unset";
const testImagePayload: { status: ImageStatus; metadata: ImageMetadata } = {
  status: "CREATING",
  metadata: {
    resolution: {
      width: 1500,
      height: 2000,
    },
    schema: { background: "#FFFFFF", foreground: "#000000", useMapbox: false },
    cutout: {
      discriminator: "rectangle",
      maxCoordinate: {
        longitude: 0,
        latitude: 0,
      },
      minCoordinate: {
        longitude: 10,
        latitude: 10,
      },
    },
    projection: "LINEAR",
    timespan: { from: 0, until: 10 },
  },
};

describe("mongodb read tests", function () {
  beforeEach(async () => {
    await dropDb();
    await createIndices();
    await addAirports(ICAOAirports);
    testImageId = await addImage(testImagePayload);
  });

  describe("get airport", function () {
    ICAOAirports.forEach((a) => {
      it(`it should get airport with ICAO ${a.icao}`, async function () {
        const airport = await getAirportByICAO(a.icao);
        expect(airport).to.deep.equal(a);
      });
    });
  });

  describe("get all airports", function () {
    it("should return 20 entries", async function () {
      const airports = await getAllAirports();
      expect(airports).lengthOf(20);
    });
  });

  it("should get multiple Airports by icao", async function () {
    const airports = await getAirports(ICAOAirports.map((a) => a.icao));
    expect(airports).to.eql(ICAOAirports);
  });

  it("should throw error for unknown icao", async () => {
    await assertAsyncError(() => getAirportByICAO("asdf"), { type: Error, message: "Unknown ICAO string provided" });
  });

  describe("mongodb delete tests", function () {
    beforeEach(async () => {
      await addAirports(ICAOAirports);
    });

    it("should delete collections", async function () {
      await dropCollections([AIRPORT, FLIGHT_DATA, IMAGES]);
      const colls = await withConnection((db) => db.collections());
      expect(colls).to.have.lengthOf(0);
    });
  });

  describe("flightData read tests", function () {
    it("should get filtered flightData by given coordinates", async function () {
      const inCoordinates = [
        { ICAO: "AAAA", position: { latitude: 0, longitude: 0 }, time: 1234 },
        { ICAO: "AAAA", position: { latitude: 1, longitude: -1 }, time: 1234 },
        { ICAO: "AAAA", position: { latitude: 2, longitude: -2 }, time: 1234 },
        { ICAO: "BBBB", position: { latitude: -1, longitude: 1 }, time: 1234 },
        { ICAO: "BBBB", position: { latitude: -2, longitude: 2 }, time: 1234 },
      ];
      const outCoordinates = [
        { ICAO: "AAAA", position: { latitude: 0, longitude: 4 }, time: 1234 },
        { ICAO: "AAAA", position: { latitude: 1, longitude: -6 }, time: 1234 },
        { ICAO: "BBBB", position: { latitude: -7, longitude: 7 }, time: 1234 },
        { ICAO: "BBBB", position: { latitude: -8, longitude: -8 }, time: 1234 },
      ];
      const persisted = [...inCoordinates, ...outCoordinates];
      await addFlightData(persisted);

      const expected = [
        [
          { latitude: 0, longitude: 0 },
          { latitude: 1, longitude: -1 },
          { latitude: 2, longitude: -2 },
        ],
        [
          { latitude: -1, longitude: 1 },
          { latitude: -2, longitude: 2 },
        ],
      ];
      const result = await getFlightData({
        range: {
          minCoordinate: {
            latitude: -3,
            longitude: -3,
          },
          maxCoordinate: {
            latitude: 3,
            longitude: 3,
          },
        },
      });
      // expect(result.flat().sort(sorter)).to.eql(expected.flat().sort(sorter));
      expect(result).to.have.lengthOf(expected.length);
    });

    it("should get filteredFlightData in timespan", async function () {
      const inCoordinates = [
        { ICAO: "AAAA", position: { latitude: 1, longitude: -1 }, time: 1 },
        { ICAO: "AAAA", position: { latitude: 2, longitude: -2 }, time: 2 },
        { ICAO: "BBBB", position: { latitude: -1, longitude: 1 }, time: 3 },
      ];
      const outCoordinates = [
        { ICAO: "AAAA", position: { latitude: 0, longitude: 4 }, time: 0 },
        { ICAO: "AAAA", position: { latitude: 1, longitude: -6 }, time: 4 },
      ];
      const persisted = [...inCoordinates, ...outCoordinates];
      await addFlightData(persisted);

      const expected = [
        [
          { latitude: 1, longitude: -1 },
          { latitude: 2, longitude: -2 },
        ],
        [{ latitude: -1, longitude: 1 }],
      ];
      const result = await getFlightData({
        range: {
          minCoordinate: { latitude: -90, longitude: -180 },
          maxCoordinate: { latitude: 90, longitude: 180 },
        },
        timespan: { from: 1, until: 3 },
      });

      expect(result).to.have.deep.members(expected);
    });
  });

  describe("image read tests", function () {
    it("should get whole image", async function () {
      const image = await getImage(testImageId);
      expect(image.id).to.eq(testImageId);
      expect({ status: image.status, metadata: { ...image.metadata } }).to.eql(testImagePayload);
    });

    it("should throw error in case of invalid id", async function () {
      await assertAsyncError(() => getImage("000000000000000000000000"), {
        message: "Image: 000000000000000000000000 not found",
      });
    });
  });
});

describe("mongodb write test", function () {
  beforeEach(async () => {
    await dropDb();
  });

  it("should add flightData objects", async function () {
    const flightDataObjects: FlightData[] = [
      {
        ICAO: "EDDF",
        time: 1000,
        position: {
          latitude: 0,
          longitude: 0,
        },
      },
    ];

    const result = await addFlightData(flightDataObjects);
    expect(result).to.have.lengthOf(1);
    expect(result).to.be.an("array");
    result.forEach((r) => {
      expect(r).to.be.a("string");
    });
  });

  describe("add image", function () {
    it("should add image objects", async function () {
      const image = {};
      const id = await addImage(image);
      expect(id).lengthOf(24);
      expect(image).to.eql({});
    });
  });

  describe("update image", function () {
    it("should update image", async function () {
      const testImageId = await addImage(testImagePayload);

      const imageFields: { status: ImageStatus; metadata: ImageMetadata } = {
        status: "CREATED",
        metadata: { ...testImagePayload.metadata, projection: "MERCATOR" },
      };
      await updateImage(testImageId, imageFields);

      const image = await getImage(testImageId);
      expect(image).eql({
        id: testImageId,
        ...testImagePayload,
        ...imageFields,
      });
    });
  });
});
