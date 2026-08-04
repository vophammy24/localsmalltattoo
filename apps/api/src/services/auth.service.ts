import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AdminModel } from "../models/admin.model.js";
import { HttpError } from "../utils/http-error.js";

export const AUTH_COOKIE_NAME = "lst_admin_session";

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
  return jwt.sign({ sub: adminId }, env.JWT_SECRET, { expiresIn: rememberMe ? "7d" : "1d" });
}

export function authCookieOptions(rememberMe: boolean) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
    maxAge: (rememberMe ? 7 : 1) * 24 * 60 * 60 * 1000,
    path: "/",
  };
}
