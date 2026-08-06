import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { AdminModel } from "../models/admin.model.js";
import { HttpError } from "../utils/http-error.js";

export const AUTH_COOKIE_NAME = env.COOKIE_NAME;

export function publicAdmin(admin: {
  _id: unknown;
  fullName: string;
  email: string;
  role: string;
}) {
  return { id: String(admin._id), fullName: admin.fullName, email: admin.email, role: admin.role };
}

export async function authenticateAdmin(email: string, password: string) {
  const admin = await AdminModel.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!admin || !admin.isActive || !(await bcrypt.compare(password, admin.passwordHash))) {
    throw new HttpError(401, "Invalid email or password.");
  }
  admin.lastLoginAt = new Date();
  await admin.save();
  return admin;
}

export function signAdminToken(adminId: string, rememberMe: boolean) {
  const expiresIn = (rememberMe ? "7d" : env.JWT_EXPIRES_IN) as SignOptions["expiresIn"];
  return jwt.sign({ sub: adminId }, env.JWT_SECRET, { expiresIn });
}

export function authCookieOptions(rememberMe: boolean) {
  const sameSite = env.COOKIE_SAME_SITE ?? (env.NODE_ENV === "production" ? "none" : "lax");
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite,
    maxAge: (rememberMe ? 7 : 1) * 24 * 60 * 60 * 1000,
    path: "/",
  };
}
