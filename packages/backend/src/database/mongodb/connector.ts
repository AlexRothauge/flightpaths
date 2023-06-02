import type { Db } from "mongodb";
import { MongoClient } from "mongodb";
import { Env } from "../../env";

export type DbAction<T> = (db: Db) => Promise<T>;

export async function withConnection<T>(fn: DbAction<T>): Promise<T> {
  const url = `mongodb://${Env.dbUser}:${Env.dbPW}@${Env.dbHost}:${Env.dbPort}/?authSource=admin`;

  const mongoClient = new MongoClient(url);
  await mongoClient.connect();
  const db = mongoClient.db(Env.dbName);
  try {
    return await fn(db);
  } finally {
    await mongoClient.close();
  }
}
