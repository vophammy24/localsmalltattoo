import type { RequestHandler } from "express";
import { env } from "../config/env.js";

// CORS controls reading responses; this guard also rejects cross-site writes.
// Cookie writes require a trusted browser Origin. Origin-less API clients use Bearer auth.
export const protectCookieWrites: RequestHandler = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (origin && !env.ALLOWED_ORIGINS.includes(origin)) {
    res.status(403).json({ success: false, message: "Untrusted request origin." });
    return;
  }
  if (
    req.cookies?.[env.COOKIE_NAME] &&
    !origin &&
    !req.get("authorization")?.startsWith("Bearer ")
  ) {
    res.status(403).json({
      success: false,
      message: "A trusted Origin is required for cookie-authenticated writes.",
    });
    return;
  }
  next();
};
