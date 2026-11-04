import type { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { TestimonialModel } from "../models/testimonial.model.js";
import { BusinessSettingsModel } from "../models/business-settings.model.js";
import { DEFAULT_SETTINGS } from "./business-settings.controller.js";
import {
  createTestimonialSchema,
  patchTestimonialSchema,
  reviewQuerySchema,
  googleReviewSummarySchema,
} from "../validators/testimonial.validator.js";
import { HttpError } from "../utils/http-error.js";

const emptyGoogleSummary = {
  enabled: false,
  averageRating: null,
  totalReviews: 0,
  updatedAt: null,
};
export const getAdminGoogleReviewSummary: RequestHandler = async (_req, res, next) => {
  try {
    const settings = await BusinessSettingsModel.findOne({ settingsKey: "business" })
      .select("googleReviewSummary")
      .lean();
    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      data: { summary: settings?.googleReviewSummary ?? emptyGoogleSummary },
    });
  } catch (error) {
    next(error);
  }
};
export const updateAdminGoogleReviewSummary: RequestHandler = async (req, res, next) => {
  try {
    const fields = googleReviewSummarySchema.parse(req.body);
    const settings = await BusinessSettingsModel.findOneAndUpdate(
      { settingsKey: "business" },
      {
        $set: {
          googleReviewSummary: { ...fields, updatedAt: new Date() },
          updatedBy: req.admin!.id,
        },
        $setOnInsert: DEFAULT_SETTINGS,
      },
      { upsert: true, new: true, runValidators: true },
    )
      .select("googleReviewSummary")
      .lean();
    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      message: "Google Maps rating summary saved.",
      data: { summary: settings!.googleReviewSummary },
    });
  } catch (error) {
    next(error);
  }
};

export function publicReviewFilter(now = new Date()) {
  return {
    isPublic: true,
    permissionConfirmed: true,
    $and: [
      { $or: [{ publishFrom: null }, { publishFrom: { $lte: now } }] },
      { $or: [{ publishUntil: null }, { publishUntil: { $gt: now } }] },
    ],
  };
}
function statusFilter(status: string, now: Date): Record<string, unknown> {
  if (status === "published") return publicReviewFilter(now);
  if (status === "draft") return { $or: [{ isPublic: false }, { permissionConfirmed: false }] };
  if (status === "scheduled")
    return { isPublic: true, permissionConfirmed: true, publishFrom: { $gt: now } };
  if (status === "expired")
    return { isPublic: true, permissionConfirmed: true, publishUntil: { $lte: now, $ne: null } };
  if (status === "featured") return { isFeatured: true };
  return {};
}
export const listPublicReviews: RequestHandler = async (req, res, next) => {
  try {
    const query = reviewQuerySchema.parse(req.query);
    const eligible = publicReviewFilter();
    const filter = {
      ...eligible,
      ...(query.featured ? { isFeatured: query.featured === "true" } : {}),
    };
    const [items, total, summary, settings] = await Promise.all([
      TestimonialModel.find(filter)
        .select(
          "customerName rating content reviewDate sourceUrl sourceType isFeatured displayOrder",
        )
        .sort({ isFeatured: -1, displayOrder: 1, reviewDate: -1, _id: 1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      TestimonialModel.countDocuments(filter),
      TestimonialModel.aggregate([
        { $match: eligible },
        { $group: { _id: null, averageRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
        { $project: { _id: 0, averageRating: 1, totalReviews: 1 } },
      ]),
      BusinessSettingsModel.findOne({ settingsKey: "business" })
        .select("googleReviewSummary")
        .lean(),
    ]);
    const google = settings?.googleReviewSummary;
    const googleMapsSummary =
      google?.enabled &&
      google.averageRating != null &&
      google.averageRating >= 1 &&
      google.averageRating <= 5 &&
      Number.isInteger(google.totalReviews) &&
      google.totalReviews > 0
        ? {
            averageRating: google.averageRating,
            totalReviews: google.totalReviews,
            updatedAt: google.updatedAt ?? null,
          }
        : null;
    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      data: {
        items,
        summary: summary[0] ?? { averageRating: null, totalReviews: 0 },
        googleMapsSummary,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / query.limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
export const listAdminReviews: RequestHandler = async (req, res, next) => {
  try {
    const query = reviewQuerySchema.parse(req.query);
    const now = new Date();
    const filter: Record<string, unknown> = statusFilter(query.status, now);
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Keep status $or independent of the search $or.
      filter.$and = [
        ...((filter.$and as unknown[]) ?? []),
        {
          $or: [
            { customerName: { $regex: escaped, $options: "i" } },
            { content: { $regex: escaped, $options: "i" } },
          ],
        },
      ];
    }
    const sort: Record<string, 1 | -1> =
      query.sort === "date"
        ? { reviewDate: -1, _id: 1 }
        : query.sort === "name"
          ? { customerName: 1, _id: 1 }
          : { displayOrder: 1, reviewDate: -1, _id: 1 };
    const [items, total, all, published, draft, scheduled, expired] = await Promise.all([
      TestimonialModel.find(filter)
        .sort(sort)
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      TestimonialModel.countDocuments(filter),
      TestimonialModel.countDocuments(),
      ...["published", "draft", "scheduled", "expired"].map((status) =>
        TestimonialModel.countDocuments(statusFilter(status, now)),
      ),
    ]);
    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      data: {
        items,
        counts: { total: all, published, draft, scheduled, expired },
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / query.limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
async function findReview(id: string) {
  if (!isValidObjectId(id)) throw new HttpError(400, "Invalid testimonial ID.");
  const review = await TestimonialModel.findById(id);
  if (!review) throw new HttpError(404, "Testimonial not found.");
  return review;
}
export const getAdminReview: RequestHandler = async (req, res, next) => {
  try {
    res.json({ success: true, data: { item: await findReview(String(req.params.id)) } });
  } catch (error) {
    next(error);
  }
};
export const createAdminReview: RequestHandler = async (req, res, next) => {
  try {
    const fields = createTestimonialSchema.parse(req.body);
    if (!fields.isPublic) fields.isFeatured = false;
    const item = await TestimonialModel.create({
      ...fields,
      createdBy: req.admin!.id,
      updatedBy: req.admin!.id,
    });
    res.status(201).json({ success: true, message: "Testimonial created.", data: { item } });
  } catch (error) {
    next(error);
  }
};
export const updateAdminReview: RequestHandler = async (req, res, next) => {
  try {
    patchTestimonialSchema.parse(req.body);
    const item = await findReview(String(req.params.id));
    const existing = JSON.parse(JSON.stringify(item.toObject())) as Record<string, unknown>;
    const merged = Object.fromEntries(
      Object.keys(createTestimonialSchema.shape).map((key) => [key, existing[key]]),
    );
    // Validate transport values rather than the Date objects produced by the partial schema.
    Object.assign(merged, req.body);
    if (req.body.permissionConfirmed === false) {
      merged.isPublic = false;
      merged.isFeatured = false;
    }
    const fields = createTestimonialSchema.parse(merged);
    if (!fields.isPublic) fields.isFeatured = false;
    item.set({ ...fields, updatedBy: req.admin!.id });
    await item.save();
    res.json({ success: true, message: "Testimonial saved.", data: { item } });
  } catch (error) {
    next(error);
  }
};
export const deleteAdminReview: RequestHandler = async (req, res, next) => {
  try {
    const item = await findReview(String(req.params.id));
    await item.deleteOne();
    res.json({ success: true, message: "Testimonial deleted.", data: { deleted: true } });
  } catch (error) {
    next(error);
  }
};
