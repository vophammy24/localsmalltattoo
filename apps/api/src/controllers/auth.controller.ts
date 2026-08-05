import type { RequestHandler } from "express";
import {
  authCookieOptions,
  authenticateAdmin,
  AUTH_COOKIE_NAME,
  publicAdmin,
  signAdminToken,
} from "../services/auth.service.js";
import { loginSchema } from "../validators/admin.validator.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AdminModel } from "../models/admin.model.js";

export const login: RequestHandler = async (request, response, next) => {
  try {
    const input = loginSchema.parse(request.body);
    const admin = await authenticateAdmin(input.email, input.password);
    response.cookie(
      AUTH_COOKIE_NAME,
      signAdminToken(String(admin._id), input.rememberMe),
      authCookieOptions(input.rememberMe),
    );
    response.json({ success: true, data: { admin: publicAdmin(admin) } });
  } catch (error) {
    next(error);
  }
};
export const logout: RequestHandler = (_request, response) => {
  response.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
  response.json({ success: true });
};
export const me: RequestHandler = async (request, response) => {
  const token = request.cookies?.[AUTH_COOKIE_NAME] as string | undefined;
  if (!token) {
    response.json({ success: true, data: { admin: null } });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    const admin = await AdminModel.findById(payload.sub);
    response.json({
      success: true,
      data: { admin: admin?.isActive ? publicAdmin(admin) : null },
    });
  } catch {
    response.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
    response.json({ success: true, data: { admin: null } });
  }
};
