import type { RequestHandler } from "express";
import {
  authCookieOptions,
  authenticateAdmin,
  AUTH_COOKIE_NAME,
  publicAdmin,
  signAdminToken,
} from "../services/auth.service.js";
import { loginSchema } from "../validators/admin.validator.js";

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
export const me: RequestHandler = (request, response) =>
  response.json({
    success: true,
    data: { admin: { ...request.admin, id: String(request.admin?.id) } },
  });
