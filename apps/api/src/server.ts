import { createServer } from "node:http";
import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const host = "0.0.0.0";

async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    console.info("MongoDB connected.");

    const server = createServer(app);
    server.listen(env.PORT, host, () => {
      console.info(`API is running on ${host}:${env.PORT}`);
    });
  } catch (error) {
    console.error("Unable to start API:", error);
    process.exit(1);
  }
}

void startServer();
