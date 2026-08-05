import type { RequestHandler } from "express";
import { ArtistModel } from "../models/artist.model.js";
import { TattooStyleModel } from "../models/tattoo-style.model.js";
import { createArtist, updateArtist } from "../services/artist.service.js";
import { HttpError } from "../utils/http-error.js";
import {
  adminArtistQuerySchema,
  artistFieldsSchema,
  publishArtistSchema,
  reorderArtistsSchema,
} from "../validators/artist.validator.js";

const populateStyles = { path: "tattooStyleIds", select: "name slug displayOrder" };

export const listPublicArtists: RequestHandler = async (request, response, next) => {
  try {
    const filter: Record<string, unknown> = { isPublished: true, status: "PUBLISHED" };
    if (request.query.featured === "true") filter.isFeatured = true;
    if (typeof request.query.style === "string") {
      const style = await TattooStyleModel.findOne({ slug: request.query.style, isPublished: true })
        .select("_id")
        .lean();
      if (!style) return response.json({ success: true, data: { items: [] } });
      filter.tattooStyleIds = style._id;
    }
    const items = await ArtistModel.find(filter)
      .sort({ displayOrder: 1, fullName: 1 })
      .populate(populateStyles)
      .lean();
    response.json({ success: true, data: { items } });
  } catch (error) {
    next(error);
  }
};

export const getPublicArtist: RequestHandler = async (request, response, next) => {
  try {
    const artist = await ArtistModel.findOne({
      slug: request.params.slug,
      isPublished: true,
      status: "PUBLISHED",
    })
      .populate(populateStyles)
      .lean();
    if (!artist) throw new HttpError(404, "Artist not found.");
    response.json({ success: true, data: { artist } });
  } catch (error) {
    next(error);
  }
};

export const listAdminArtists: RequestHandler = async (request, response, next) => {
  try {
    const query = adminArtistQuerySchema.parse(request.query);
    const filter: Record<string, unknown> = {};
    if (query.search)
      filter.$or = [
        { fullName: { $regex: query.search, $options: "i" } },
        { displayName: { $regex: query.search, $options: "i" } },
      ];
    if (query.publication === "published") filter.isPublished = true;
    if (query.publication === "draft") {
      filter.isPublished = false;
      filter.status = { $ne: "ARCHIVED" };
    }
    if (query.publication === "archived") filter.status = "ARCHIVED";
    if (query.styleId) filter.tattooStyleIds = query.styleId;
    const items = await ArtistModel.find(filter)
      .sort({ displayOrder: 1, fullName: 1 })
      .populate(populateStyles)
      .lean();
    response.json({ success: true, data: { items } });
  } catch (error) {
    next(error);
  }
};

export const getAdminArtist: RequestHandler = async (request, response, next) => {
  try {
    const artist = await ArtistModel.findById(request.params.artistId)
      .populate(populateStyles)
      .lean();
    if (!artist) throw new HttpError(404, "Artist not found.");
    response.json({ success: true, data: { artist } });
  } catch (error) {
    next(error);
  }
};

export const createAdminArtist: RequestHandler = async (request, response, next) => {
  try {
    const artist = await createArtist(
      artistFieldsSchema.parse(request.body),
      (request.files as Parameters<typeof createArtist>[1]) ?? {},
    );
    response.status(201).json({ success: true, data: { artist } });
  } catch (error) {
    next(error);
  }
};

export const updateAdminArtist: RequestHandler = async (request, response, next) => {
  try {
    const artist = await updateArtist(
      String(request.params.artistId),
      artistFieldsSchema.parse(request.body),
      (request.files as Parameters<typeof updateArtist>[2]) ?? {},
    );
    response.json({ success: true, data: { artist } });
  } catch (error) {
    next(error);
  }
};

export const archiveAdminArtist: RequestHandler = async (request, response, next) => {
  try {
    const artist = await ArtistModel.findByIdAndUpdate(
      request.params.artistId,
      { isPublished: false, status: "ARCHIVED", archivedAt: new Date() },
      { new: true },
    );
    if (!artist) throw new HttpError(404, "Artist not found.");
    response.json({ success: true, data: { artist } });
  } catch (error) {
    next(error);
  }
};

export const publishAdminArtist: RequestHandler = async (request, response, next) => {
  try {
    const { isPublished } = publishArtistSchema.parse(request.body);
    const artist = await ArtistModel.findById(request.params.artistId);
    if (!artist) throw new HttpError(404, "Artist not found.");
    if (isPublished && !artist.profileImage?.url)
      throw new HttpError(400, "A profile image is required before publishing.");
    artist.isPublished = isPublished;
    artist.status = isPublished ? "PUBLISHED" : "DRAFT";
    artist.archivedAt = undefined;
    await artist.save();
    response.json({ success: true, data: { artist } });
  } catch (error) {
    next(error);
  }
};

export const reorderAdminArtists: RequestHandler = async (request, response, next) => {
  try {
    const { items } = reorderArtistsSchema.parse(request.body);
    await ArtistModel.bulkWrite(
      items.map((item) => ({
        updateOne: { filter: { _id: item.id }, update: { displayOrder: item.displayOrder } },
      })),
    );
    response.json({ success: true, data: { updated: items.length } });
  } catch (error) {
    next(error);
  }
};
