import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

async function startServer() {
  app.listen(env.PORT, () => console.info(`API listening on http://localhost:${env.PORT}`));

  while (true) {
    try {
      await connectDatabase();
      console.info("MongoDB connected.");
      return;
    } catch (error) {
      console.error(
        "MongoDB unavailable; retrying in 10 seconds.",
        error instanceof Error ? error.message : error,
      );
      await new Promise((resolve) => setTimeout(resolve, 10_000));
    }
  }
}

startServer().catch((error) => {
  console.error("Unable to start API process.", error);
});
