import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AdminModel } from "../models/admin.model.js";
import { readAdminToken } from "../services/auth.service.js";

export const requireAdmin: RequestHandler = async (request, response, next) => {
  try {
    const token = readAdminToken(request);
    if (!token) {
      response.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    const admin = await AdminModel.findById(payload.sub);
    if (!admin?.isActive) {
      response.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    request.admin = {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
    };
    next();
  } catch {
    response.status(401).json({ success: false, message: "Session expired." });
  }
};
