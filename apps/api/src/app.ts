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

export const app = express();
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.get("/api/health", (_request, response) => response.json({ success: true }));
app.use("/api/public/bookings", bookingRouter);
app.use("/api/public/tattoo-styles", publicTattooStyleRouter);
app.use("/api/admin", adminRouter);
app.use(errorHandler);
