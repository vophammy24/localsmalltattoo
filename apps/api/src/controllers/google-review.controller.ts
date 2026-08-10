import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { GoogleBusinessConnectionModel } from "../models/google-business-connection.model.js";
import { GoogleReviewModel } from "../models/google-review.model.js";
import {
  connectFromCode,
  getGoogleAuthorizationUrl,
  googleIsConfigured,
  syncGoogleReviews,
} from "../services/google-business.service.js";

export const connectGoogleBusiness: RequestHandler = (req, res, next) => {
  try {
    const state = randomUUID();
    res.cookie("google_business_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 600_000,
    });
    const url = getGoogleAuthorizationUrl(state);
    if (req.accepts("json")) {
      res.json({ success: true, data: { url } });
      return;
    }
    res.redirect(url);
  } catch (error) {
    next(error);
  }
};
export const googleBusinessCallback: RequestHandler = async (req, res, next) => {
  try {
    if (typeof req.query.error === "string")
      throw new Error(`Google authorization was declined: ${req.query.error}`);
    if (
      typeof req.query.code !== "string" ||
      req.query.state !== req.cookies.google_business_oauth_state
    )
      throw new Error("Invalid Google OAuth callback state.");
    await connectFromCode(req.query.code, req.admin!.id.toString());
    res.clearCookie("google_business_oauth_state");
    res.redirect(
      `${process.env.CLIENT_URL?.split(",")[0] ?? "http://localhost:5173"}/admin/reviews?connected=1`,
    );
  } catch (error) {
    next(error);
  }
};
export const googleBusinessStatus: RequestHandler = async (_req, res, next) => {
  try {
    const connection = await GoogleBusinessConnectionModel.findOne({ isConnected: true }).lean();
    res.json({ success: true, data: { configured: googleIsConfigured(), connection } });
  } catch (error) {
    next(error);
  }
};
export const disconnectGoogleBusiness: RequestHandler = async (_req, res, next) => {
  try {
    await GoogleBusinessConnectionModel.updateMany(
      { isConnected: true },
      { $set: { isConnected: false } },
    );
    res.json({ success: true, message: "Google Business Profile disconnected.", data: {} });
  } catch (error) {
    next(error);
  }
};
export const syncReviews: RequestHandler = async (_req, res, next) => {
  try {
    const result = await syncGoogleReviews();
    res.json({
      success: true,
      message: `Synced ${result.created} new reviews and updated ${result.updated}.`,
      data: result,
    });
  } catch (error) {
    await GoogleBusinessConnectionModel.updateMany(
      { isConnected: true },
      {
        $set: {
          lastSyncStatus: "FAILED",
          lastSyncError: error instanceof Error ? error.message : "Sync failed.",
        },
      },
    );
    next(error);
  }
};
export const listAdminGoogleReviews: RequestHandler = async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.visibility === "public") filter["moderation.isPublic"] = true;
    if (req.query.visibility === "hidden") filter["moderation.isPublic"] = false;
    if (req.query.featured === "true") filter["moderation.isFeatured"] = true;
    const rating = Number(req.query.rating);
    if (rating >= 1 && rating <= 5) filter.starRating = rating;
    const reviews = await GoogleReviewModel.find(filter)
      .sort({ "moderation.displayOrder": 1, reviewCreatedAt: -1 })
      .lean();
    res.json({ success: true, data: { reviews } });
  } catch (error) {
    next(error);
  }
};
export const moderateGoogleReview: RequestHandler = async (req, res, next) => {
  try {
    const input = req.body as {
      isPublic?: boolean;
      isFeatured?: boolean;
      displayOrder?: number;
      adminNote?: string;
    };
    const review = await GoogleReviewModel.findById(req.params.id);
    if (!review) {
      res.status(404).json({ success: false, message: "Review not found." });
      return;
    }
    const moderation = review.moderation ?? { isPublic: false, isFeatured: false, displayOrder: 0 };
    if (typeof input.isPublic === "boolean") moderation.isPublic = input.isPublic;
    moderation.isFeatured = moderation.isPublic && Boolean(input.isFeatured);
    if (typeof input.displayOrder === "number") moderation.displayOrder = input.displayOrder;
    if (typeof input.adminNote === "string") moderation.adminNote = input.adminNote;
    moderation.reviewedBy = req.admin!.id;
    moderation.reviewedAt = new Date();
    review.set("moderation", moderation);
    await review.save();
    res.json({ success: true, message: "Review moderation saved.", data: { review } });
  } catch (error) {
    next(error);
  }
};
export const listPublicGoogleReviews: RequestHandler = async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = { googleStatus: "ACTIVE", "moderation.isPublic": true };
    if (req.query.featured === "true") filter["moderation.isFeatured"] = true;
    const [reviews, connection] = await Promise.all([
      GoogleReviewModel.find(filter)
        .sort({ "moderation.displayOrder": 1, reviewCreatedAt: -1 })
        .lean(),
      GoogleBusinessConnectionModel.findOne({ isConnected: true }).lean(),
    ]);
    res.json({
      success: true,
      data: {
        reviews,
        summary: connection?.reviewSummary ?? null,
        lastSyncedAt: connection?.lastSyncedAt ?? null,
      },
    });
  } catch (error) {
    next(error);
  }
};
