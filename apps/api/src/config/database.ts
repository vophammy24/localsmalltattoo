import mongoose from "mongoose";
import { env } from "./env.js";

let listenersRegistered = false;

export async function connectDatabase() {
  if (!listenersRegistered) {
    mongoose.connection.on("disconnected", () => console.warn("MongoDB connection lost."));
    mongoose.connection.on("reconnected", () => console.info("MongoDB connection restored."));
    mongoose.connection.on("error", (error) => console.error("MongoDB connection error.", error));
    listenersRegistered = true;
  }

  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) return;

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8_000,
    connectTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    maxPoolSize: 10,
  });
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
