import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "booknook";

if (!uri) {
  throw new Error("MONGODB_URI is missing from environment variables.");
}

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
};

export const client = globalForMongo.mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = client;
}

export const db = client.db(dbName);

export async function connectMongoDB() {
  await client.connect();
  await db.command({ ping: 1 });

  console.log(`MongoDB connected successfully: ${dbName}`);
}
