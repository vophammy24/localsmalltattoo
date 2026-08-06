import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required."),
  CLIENT_URL: z.string().min(1).default("http://localhost:5173"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required."),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required."),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required."),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must contain at least 32 characters."),
  JWT_EXPIRES_IN: z.string().min(1).default("1d"),
  COOKIE_NAME: z.string().min(1).default("local_small_admin"),
  ADMIN_NAME: z.string().min(1).optional(),
  ADMIN_EMAIL: z.email().optional(),
  ADMIN_PASSWORD: z.string().min(10).optional(),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  ALLOWED_ORIGINS: Array.from(
    new Set([
      "http://localhost:5173",
      "https://localsmalltattoo.com",
      "https://www.localsmalltattoo.com",
      ...parsedEnv.CLIENT_URL.split(",").map((origin) => origin.trim()),
    ]),
  ).filter(Boolean),
};
