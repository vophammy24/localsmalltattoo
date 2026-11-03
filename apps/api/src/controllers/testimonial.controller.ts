import type { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { TestimonialModel } from "../models/testimonial.model.js";
import {
  createTestimonialSchema,
  patchTestimonialSchema,
  reviewQuerySchema,
} from "../validators/testimonial.validator.js";
import { HttpError } from "../utils/http-error.js";

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
    const filter = {
      ...publicReviewFilter(),
      ...(query.featured ? { isFeatured: query.featured === "true" } : {}),
    };
    const [items, total] = await Promise.all([
      TestimonialModel.find(filter)
        .select(
          "customerName rating content reviewDate sourceUrl sourceType isFeatured displayOrder",
        )
        .sort({ isFeatured: -1, displayOrder: 1, reviewDate: -1, _id: 1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      TestimonialModel.countDocuments(filter),
    ]);
    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      data: {
        items,
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
