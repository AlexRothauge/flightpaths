import { expect } from "chai";
import request from "supertest";
import setupApp from "../../../api/routes";
import type {
  AirportOptionsResponse,
  GenerateImageRequest,
  ImageGenerationResponse,
  ImageStatusResponse,
  ProjectionOptionsResponse,
} from "../../../api/routes/appController";
import { addAirports, addImage, dropDb } from "../../../database/mongodb/adapter";
import { airports } from "../../airportsFixture";

describe("app controller tests", function () {
  before(async () => {
    await dropDb();
    await addAirports(airports.slice(0, 3));
  });
  const app = setupApp();
  it("GET /api/airports/options", async function () {
    const res = await request(app).get("/api/airports/options").expect(200);

    const body = res.body as AirportOptionsResponse;
    expect(body.airports).to.have.lengthOf(3);
    const [airport] = body.airports;
    expect(airport).to.eql({
      icao: "00AA",
      location: {
        latitude: 38.704022,
        longitude: -101.473911,
      },
      name: "Aero B Ranch Airport",
    });
  });

  it("GET /api/projections/options", async function () {
    const res = await request(app).get("/api/projections/options").expect(200);

    const body = res.body as ProjectionOptionsResponse;
    expect(body.projections).to.eql(["LINEAR", "MERCATOR"]);
  });

  describe("POST /api/image", function () {
    const requests = new Map<string, GenerateImageRequest>([
      [
        "colors",
        {
          schema: { background: "#000000", foreground: "#FFFFFF", useMapbox: false },
          cutout: {
            discriminator: "radius",
            location: { latitude: 0, longitude: 0 },
            radius: 0,
          },
          projection: "LINEAR",
          resolution: 200,
          timespan: { from: 0, until: 0 },
        },
      ],
      [
        "mapbox",
        {
          schema: { foreground: "#FFFFFF", useMapbox: true, mapboxStyle: "dark-v11" },
          cutout: {
            discriminator: "radius",
            location: { latitude: 0, longitude: 0 },
            radius: 0,
          },
          projection: "LINEAR",
          resolution: 200,
          timespan: { from: 0, until: 0 },
        },
      ],
    ]);

    requests.forEach((req, key) => {
      it(key, async function () {
        const res = await request(app).post("/api/image").send(req).expect(201);
        const body = res.body as ImageGenerationResponse;
        expect(body.id).to.lengthOf(24);
      });
    });
  });

  it("GET /api/image/{imageId}/status", async function () {
    const imageId = await addImage({ status: "CREATED" });

    const res = await request(app).get(`/api/image/${imageId}/status`).expect(200);

    const body = res.body as ImageStatusResponse;
    expect(body.status).to.eql("CREATED");
  });
});
