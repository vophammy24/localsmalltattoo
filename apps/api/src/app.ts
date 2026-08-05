import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { bookingRouter } from "./routes/booking.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { publicTattooStyleRouter } from "./routes/tattoo-style.routes.js";
import { publicArtistRouter } from "./routes/artist.routes.js";
import { publicGalleryRouter } from "./routes/gallery.routes.js";
import { publicPageRouter } from "./routes/page.routes.js";
import { publicBusinessSettingsRouter } from "./routes/business-settings.routes.js";
import mongoose from "mongoose";
import { isDatabaseConnected } from "./config/database.js";

export const app = express();
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        frameSrc: ["'self'", "https://www.google.com", "https://maps.google.com"],
      },
    },
  }),
);
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.get("/api/health", (_request, response) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  response.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    data: { database: databaseConnected ? "connected" : "unavailable" },
  });
});
app.use("/api/public/bookings", bookingRouter);
app.use("/api/public/tattoo-styles", publicTattooStyleRouter);
app.use("/api/public/artists", publicArtistRouter);
app.use("/api/public/gallery", publicGalleryRouter);
app.use("/api/public/pages", publicPageRouter);
app.use("/api/public/business-settings", publicBusinessSettingsRouter);
app.use("/api/admin", (request, response, next) => {
  if (!isDatabaseConnected()) {
    response.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please try again shortly.",
    });
    return;
  }
  next();
});
app.use("/api/admin", adminRouter);
app.use(errorHandler);
