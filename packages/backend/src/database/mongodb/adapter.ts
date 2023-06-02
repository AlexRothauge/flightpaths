import type { IndexSpecification } from "mongodb";
import { ObjectId, type Db } from "mongodb";
import type { GeoCoordinate, Image, ImageFields, ImageMetadata, ImageStatus, Timespan } from "../../core/models";
import { type Airport, type FlightData } from "../../core/models";
import { withConnection, type DbAction } from "./connector";

export const AIRPORT = "airports";
export const FLIGHT_DATA = "flightData";
export const IMAGES = "images";

interface GeoPointJSON {
  type: "Point";
  coordinates: [number, number];
}

interface AirportDocument {
  icao: string;
  name: string;
  location: GeoPointJSON;
}

function fromAirportModel(airport: Airport): AirportDocument {
  return {
    icao: airport.icao,
    name: airport.name,
    location: {
      type: "Point",
      coordinates: [airport.location.longitude, airport.location.latitude],
    },
  };
}

function toAirportModel(airportDocument: AirportDocument): Airport {
  return {
    icao: airportDocument.icao,
    name: airportDocument.name,
    location: {
      latitude: airportDocument.location.coordinates[1],
      longitude: airportDocument.location.coordinates[0],
    },
  };
}

function deleteDb(): DbAction<boolean> {
  return async (db: Db) => {
    return await db.dropDatabase();
  };
}

const FLIGHTDATA_INDEX_SPEC: IndexSpecification = { position: "2dsphere" };

function createFlightDataPositionIndex(): DbAction<string> {
  return async (db) => {
    return db.collection(FLIGHT_DATA).createIndex(FLIGHTDATA_INDEX_SPEC);
  };
}

const AIRPORT_INDEX_SPEC: IndexSpecification = { location: "2dsphere" };

function createAirportLocationIndex(): DbAction<string> {
  return async (db) => {
    return db.collection(AIRPORT).createIndex(AIRPORT_INDEX_SPEC);
  };
}

const CREATED_AT_INDEX_SPEC: IndexSpecification = { createdAt: 1 };

function createExpirationIndex(): DbAction<string> {
  return async (db) => {
    return db.collection(AIRPORT).createIndex(CREATED_AT_INDEX_SPEC, { expireAfterSeconds: 2678400 }); // 31 days in seconds
  };
}

function combineActions(...steps: Array<DbAction<unknown>>): DbAction<void> {
  return async (db) => {
    await Promise.all(steps.map((step) => step(db)));
  };
}

export async function createIndices(): Promise<void> {
  await withConnection(
    combineActions(createAirportLocationIndex(), createFlightDataPositionIndex(), createExpirationIndex())
  );
}

export async function dropDb(): Promise<void> {
  await withConnection(combineActions(deleteDb()));
}

function dropCollection(collection: string): DbAction<boolean> {
  return async (db) => {
    return await db.dropCollection(collection);
  };
}

function dropDbCollections(collections: string[]): DbAction<boolean[]> {
  return async (db) => {
    const drops = collections.map((collection) => dropCollection(collection)(db));
    return Promise.all(drops);
  };
}

export async function dropCollections(collections: string[]): Promise<boolean[]> {
  return await withConnection(dropDbCollections(collections));
}

function addAirportDocs(airports: AirportDocument[]): DbAction<ObjectId[]> {
  return async (db) => {
    const inserted = await db.collection(AIRPORT).insertMany(airports);
    return Object.values(inserted.insertedIds);
  };
}

function getAirportDocument(icao: string): DbAction<AirportDocument> {
  return async (db) => {
    const airportCollection = db.collection<AirportDocument>(AIRPORT);
    const airport = await airportCollection.findOne({ icao });
    if (!airport) {
      throw new Error("Unknown ICAO string provided");
    }
    return airport;
  };
}

function getAirportDocuments(icaoList: string[]): DbAction<AirportDocument[]> {
  return async (db) => {
    const airportCollection = db.collection<AirportDocument>(AIRPORT);
    return await airportCollection.find({ ...(icaoList.length > 0 && { icao: { $in: icaoList } }) }).toArray();
  };
}

function getAllAirportsDocuments(): DbAction<AirportDocument[]> {
  return async (db) => {
    const airportCollection = db.collection<AirportDocument>(AIRPORT);
    return await airportCollection.find().toArray();
  };
}

export async function addAirports(airports: Airport[]): Promise<string[]> {
  const airportDocuments = airports.map(fromAirportModel);
  const objectIds = await withConnection(addAirportDocs(airportDocuments));
  return objectIds.map((oid) => oid.toString());
}

export async function getAirports(icaoList: string[]): Promise<Airport[]> {
  const airportDocuments = await withConnection(getAirportDocuments(icaoList));
  return airportDocuments.map(toAirportModel);
}

export async function getAirportByICAO(icao: string): Promise<Airport> {
  const airportDocument = await withConnection(getAirportDocument(icao));
  return toAirportModel(airportDocument);
}

export async function getAllAirports(): Promise<Airport[]> {
  const airportDocuments = await withConnection(getAllAirportsDocuments());
  return airportDocuments.map(toAirportModel);
}

interface FlightDataDocument {
  icao: string;
  time: number;
  position: GeoPointJSON;
}

function fromFlightDataModel(f: FlightData): FlightDataDocument {
  return {
    icao: f.ICAO,
    time: f.time,
    position: {
      type: "Point",
      coordinates: [f.position.longitude, f.position.latitude],
    },
  };
}

function createFlightDataDocuments(flightDataDocuments: FlightDataDocument[]): DbAction<ObjectId[]> {
  return async (db) => {
    const inserted = await db.collection(FLIGHT_DATA).insertMany(flightDataDocuments);
    return Object.values(inserted.insertedIds);
  };
}

export async function addFlightData(flightData: FlightData[]): Promise<string[]> {
  const flightDataDocuments = flightData.map(fromFlightDataModel);
  return (await withConnection(createFlightDataDocuments(flightDataDocuments))).map((id) => id.toString());
}

export interface RangeCoordinates {
  minCoordinate: GeoCoordinate;
  maxCoordinate: GeoCoordinate;
}

export interface FilterOption {
  range: RangeCoordinates;
  timespan?: Timespan;
}

interface FlightPathDocument {
  _id: string;
  positions: GeoCoordinate[];
}

function toFlightPathModel(flightPath: FlightPathDocument): GeoCoordinate[] {
  return flightPath.positions;
}

function getFlightDataDocuments({ range, timespan }: FilterOption): DbAction<FlightPathDocument[]> {
  return async (db) => {
    return await db
      .collection(FLIGHT_DATA)
      .aggregate<FlightPathDocument>([
        {
          $match: {
            position: {
              $geoWithin: {
                $box: [
                  [range.minCoordinate.longitude, range.minCoordinate.latitude],
                  [range.maxCoordinate.longitude, range.maxCoordinate.latitude],
                ],
              },
            },
          },
        },
        ...(timespan
          ? [
              {
                $match: {
                  time: {
                    $gte: timespan.from,
                    $lte: timespan.until,
                  },
                },
              },
            ]
          : []),
        {
          $sort: {
            time: 1,
          },
        },
        {
          $group: {
            _id: "$icao",
            positions: {
              $push: {
                latitude: { $arrayElemAt: ["$position.coordinates", 1] },
                longitude: { $arrayElemAt: ["$position.coordinates", 0] },
              },
            },
          },
        },
      ])
      .toArray();
  };
}

export async function getFlightData(option: FilterOption): Promise<GeoCoordinate[][]> {
  const docs = await withConnection(getFlightDataDocuments(option));
  return docs.map(toFlightPathModel);
}

interface ImageDocument {
  _id: ObjectId;
  metadata: ImageMetadata;
  status: ImageStatus;
}

type ImageDocumentFields = Omit<ImageDocument, "_id">;

function toImageModel(imageDocument: ImageDocument): Image {
  return {
    id: imageDocument._id.toString(),
    metadata: imageDocument.metadata,
    status: imageDocument.status,
  };
}

function addImageDocument(image: Partial<ImageDocumentFields>): DbAction<ObjectId> {
  return async (db) => {
    const r = await db.collection(IMAGES).insertOne({ ...image });
    return r.insertedId;
  };
}

export async function addImage(image: Partial<ImageFields>): Promise<string> {
  const id = await withConnection(addImageDocument(image));
  return id.toString();
}

function getImageDocument(imageId: ObjectId): DbAction<ImageDocument> {
  return async (db) => {
    const image = await db.collection<ImageDocument>(IMAGES).findOne({ _id: imageId });
    if (!image) {
      throw new Error(`Image: ${imageId.toString()} not found`);
    }
    return image;
  };
}

export async function getImage(imageId: string): Promise<Image> {
  const imageDocument = await withConnection(getImageDocument(ObjectId.createFromHexString(imageId)));
  return toImageModel(imageDocument);
}

function updateImageDocument(id: ObjectId, imageFields: Partial<ImageFields>): DbAction<void> {
  return async (db) => {
    await db.collection(IMAGES).updateOne({ _id: id }, { $set: { ...imageFields } });
  };
}

export async function updateImage(imageId: string, imageFields: Partial<ImageFields>): Promise<void> {
  await withConnection(updateImageDocument(ObjectId.createFromHexString(imageId), imageFields));
}
