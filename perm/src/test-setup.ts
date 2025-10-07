import "reflect-metadata";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { ParsedEnvDto } from "./dtos/parsed-env.dto";

let mongodbMemoryServer: MongoMemoryServer;

beforeAll(async () => {
  mongodbMemoryServer = await MongoMemoryServer.create({});
  await mongoose.connect(mongodbMemoryServer.getUri(), {});

  const envs = new ParsedEnvDto({
    APP_PORT: 3000,
    MONGODB_URI: mongodbMemoryServer.getUri(),
    RABBITMQ_URI: "",
    REDIS_HOSTNAME: "",
    REDIS_PORT: 0,
  });
  process.env = { ...process.env, ...(envs as any) };
});

beforeEach(async () => {
  const collections = await mongoose.connection.db?.collections();
  if (collections?.length) {
    for (const collection of collections) {
      await collection.deleteMany();
    }
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongodbMemoryServer) await mongodbMemoryServer.stop();
});
