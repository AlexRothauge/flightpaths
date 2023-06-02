import { expect } from "chai";
import { getCoordinate } from "../../core/airport";
import { addAirports, dropDb } from "../../database/mongodb/adapter";
import { airports as ICAOAirports, first } from "../airportsFixture";

describe("airport database", function () {
  before(async () => {
    await dropDb();
    await addAirports(ICAOAirports);
  });

  it("should return coordinates", async function () {
    expect(await getCoordinate(first.icao)).to.eql(first.location);
  });
});
