import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { bookingRouter } from "./routes/booking.routes.js";

export const app = express();
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "100kb" }));
app.get("/api/health", (_request, response) => response.json({ success: true }));
app.use("/api/public/bookings", bookingRouter);
app.use(errorHandler);

