import type { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { GalleryItemModel } from "../models/gallery-item.model.js";
import { TattooStyleModel } from "../models/tattoo-style.model.js";
import {
  deleteCloudinaryImage,
  deleteCloudinaryImages,
  uploadGalleryImage,
} from "../services/image.service.js";
import { HttpError } from "../utils/http-error.js";
import {
  galleryBulkActionSchema,
  galleryFieldsSchema,
  galleryListQuerySchema,
  galleryReorderSchema,
  galleryToggleSchema,
} from "../validators/gallery.validator.js";

const populate = [{ path: "tattooStyleIds", select: "name slug" }];

async function resolveFilter(
  query: ReturnType<typeof galleryListQuerySchema.parse>,
  admin = false,
) {
  const filter: Record<string, unknown> = admin ? {} : { isPublished: true };
  if (query.type) filter.type = query.type;
  if (query.featured) filter.isFeatured = query.featured === "true";
  if (admin && query.publication !== "all") filter.isPublished = query.publication === "published";
  if (query.search) {
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { caption: { $regex: escaped, $options: "i" } },
    ];
  }
  if (query.styleId) filter.tattooStyleIds = query.styleId;
  if (query.style) {
    const style = await TattooStyleModel.findOne({
      slug: query.style,
      ...(admin ? {} : { isPublished: true }),
    })
      .select("_id")
      .lean();
    filter.tattooStyleIds = style?._id ?? null;
  }
  return filter;
}

async function validateReferences(fields: ReturnType<typeof galleryFieldsSchema.parse>) {
  if (fields.tattooStyleIds.some((id) => !isValidObjectId(id)))
    throw new HttpError(400, "Invalid tattoo style.");
  const styleCount = await (fields.tattooStyleIds.length
    ? TattooStyleModel.countDocuments({
        _id: { $in: fields.tattooStyleIds },
        status: { $ne: "ARCHIVED" },
      })
    : Promise.resolve(0));
  if (styleCount !== fields.tattooStyleIds.length)
    throw new HttpError(400, "One or more tattoo styles do not exist.");
  if (fields.isPublished && !fields.alt)
    throw new HttpError(400, "Alt text is required before publishing.");
  if (fields.isPublished && fields.type === "TATTOO_WORK" && !fields.tattooStyleIds.length) {
    throw new HttpError(400, "Published tattoo work requires at least one style.");
  }
}

async function list(
  request: Parameters<RequestHandler>[0],
  response: Parameters<RequestHandler>[1],
  admin: boolean,
) {
  const query = galleryListQuerySchema.parse(request.query);
  const filter = await resolveFilter(query, admin);
  const [items, total] = await Promise.all([
    GalleryItemModel.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .populate(populate)
      .lean(),
    GalleryItemModel.countDocuments(filter),
  ]);
  response.json({
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
}

export const listPublicGallery: RequestHandler = async (req, res, next) => {
  try {
    await list(req, res, false);
  } catch (error) {
    next(error);
  }
};
export const listAdminGallery: RequestHandler = async (req, res, next) => {
  try {
    await list(req, res, true);
  } catch (error) {
    next(error);
  }
};

export const getPublicGalleryItem: RequestHandler = async (request, response, next) => {
  try {
    const item = await GalleryItemModel.findOne({
      _id: request.params.galleryItemId,
      isPublished: true,
    })
      .populate(populate)
      .lean();
    if (!item) throw new HttpError(404, "Gallery item not found.");
    response.json({ success: true, data: { item } });
  } catch (error) {
    next(error);
  }
};

export const getAdminGalleryItem: RequestHandler = async (request, response, next) => {
  try {
    const item = await GalleryItemModel.findById(request.params.galleryItemId)
      .populate(populate)
      .lean();
    if (!item) throw new HttpError(404, "Gallery item not found.");
    response.json({ success: true, data: { item } });
  } catch (error) {
    next(error);
  }
};

export const getAdminGalleryMediaLibrary: RequestHandler = async (_request, response, next) => {
  try {
    const [styles, used] = await Promise.all([
      TattooStyleModel.find({ status: { $ne: "ARCHIVED" } })
        .select("name coverImage galleryImages")
        .lean(),
      GalleryItemModel.find().select("image.publicId").lean(),
    ]);
    const usedIds = new Set(used.map((item) => item.image.publicId));
    const items = [
      ...styles.flatMap((style) =>
        [style.coverImage, ...(style.galleryImages ?? [])]
          .filter((image) => image?.url && image.publicId)
          .map((image) => ({
            image: {
              url: image!.url!,
              publicId: image!.publicId!,
              alt: image!.alt || `${style.name} tattoo`,
            },
            sourceCollection: "TattooStyle",
            sourceId: style._id,
            sourceLabel: style.name,
            tattooStyleIds: [style._id],
            alreadyLinked: usedIds.has(image!.publicId!),
          })),
      ),
    ];
    response.json({ success: true, data: { items } });
  } catch (error) {
    next(error);
  }
};

export const linkAdminGalleryMedia: RequestHandler = async (request, response, next) => {
  try {
    type MediaEntry = {
      image?: { url?: string; publicId?: string; alt?: string };
      sourceCollection?: "TattooStyle";
      sourceId?: string;
      tattooStyleIds?: string[];
    };
    const entries: MediaEntry[] = Array.isArray(request.body.items) ? request.body.items : [];
    if (!entries.length || entries.length > 50)
      throw new HttpError(400, "Select between 1 and 50 images.");
    const existing = new Set(
      (
        await GalleryItemModel.find({
          "image.publicId": { $in: entries.map((entry) => entry.image?.publicId) },
        })
          .select("image.publicId")
          .lean()
      ).map((item) => item.image.publicId),
    );
    const items = await GalleryItemModel.insertMany(
      entries
        .filter(
          (entry) =>
            entry.image?.url && entry.image?.publicId && !existing.has(entry.image.publicId),
        )
        .map((entry, index) => ({
          image: entry.image,
          type: "TATTOO_WORK",
          tattooStyleIds: entry.tattooStyleIds ?? [],
          ownsCloudinaryAsset: false,
          sourceCollection: entry.sourceCollection,
          sourceId: entry.sourceId,
          displayOrder: index,
          isPublished: false,
        })),
    );
    response.status(201).json({ success: true, data: { items } });
  } catch (error) {
    next(error);
  }
};

export const createAdminGalleryItem: RequestHandler = async (request, response, next) => {
  try {
    if (!request.file) throw new HttpError(400, "An image is required.");
    const fields = galleryFieldsSchema.parse(request.body);
    await validateReferences(fields);
    const uploaded = await uploadGalleryImage(request.file, fields.type.toLowerCase());
    try {
      const item = await GalleryItemModel.create({
        ...fields,
        photographedAt: fields.photographedAt || undefined,
        image: { ...uploaded, alt: fields.alt },
      });
      response.status(201).json({ success: true, data: { item } });
    } catch (error) {
      await deleteCloudinaryImages([uploaded.publicId]);
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const createAdminGalleryBulk: RequestHandler = async (request, response, next) => {
  try {
    const files = (request.files as Express.Multer.File[]) ?? [];
    if (!files.length) throw new HttpError(400, "Select at least one image.");
    const fields = galleryFieldsSchema.parse(request.body);
    await validateReferences(fields);
    const altValues = Array.isArray(request.body.alts)
      ? request.body.alts
      : request.body.alts
        ? [request.body.alts]
        : [];
    if (
      fields.isPublished &&
      files.some((_, index) => !String(altValues[index] ?? fields.alt).trim())
    )
      throw new HttpError(400, "Every published image requires alt text.");
    const uploaded = [];
    try {
      for (const file of files)
        uploaded.push(await uploadGalleryImage(file, fields.type.toLowerCase()));
      const startOrder = await GalleryItemModel.countDocuments();
      const items = await GalleryItemModel.insertMany(
        uploaded.map((image, index) => ({
          ...fields,
          photographedAt: fields.photographedAt || undefined,
          displayOrder: fields.displayOrder + startOrder + index,
          image: { ...image, alt: String(altValues[index] ?? fields.alt).trim() },
        })),
      );
      response.status(201).json({ success: true, data: { items } });
    } catch (error) {
      await deleteCloudinaryImages(uploaded.map((item) => item.publicId));
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const updateAdminGalleryItem: RequestHandler = async (request, response, next) => {
  try {
    const fields = galleryFieldsSchema.parse(request.body);
    await validateReferences(fields);
    const item = await GalleryItemModel.findByIdAndUpdate(
      request.params.galleryItemId,
      {
        ...fields,
        photographedAt: fields.photographedAt || null,
        "image.alt": fields.alt,
      },
      { new: true },
    ).populate(populate);
    if (!item) throw new HttpError(404, "Gallery item not found.");
    response.json({ success: true, data: { item } });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminGalleryItem: RequestHandler = async (request, response, next) => {
  try {
    const item = await GalleryItemModel.findById(request.params.galleryItemId);
    if (!item) throw new HttpError(404, "Gallery item not found.");
    if (item.ownsCloudinaryAsset) await deleteCloudinaryImage(item.image.publicId);
    await item.deleteOne();
    response.json({ success: true, data: { deleted: true } });
  } catch (error) {
    next(error);
  }
};

export const publishAdminGalleryItem: RequestHandler = async (request, response, next) => {
  try {
    const { value } = galleryToggleSchema.parse(request.body);
    const item = await GalleryItemModel.findById(request.params.galleryItemId);
    if (!item) throw new HttpError(404, "Gallery item not found.");
    if (value)
      await validateReferences(
        galleryFieldsSchema.parse({
          ...item.toObject(),
          alt: item.image.alt,
          tattooStyleIds: item.tattooStyleIds.map(String),
          isPublished: true,
        }),
      );
    item.isPublished = value;
    await item.save();
    response.json({ success: true, data: { item } });
  } catch (error) {
    next(error);
  }
};

export const featureAdminGalleryItem: RequestHandler = async (request, response, next) => {
  try {
    const { value } = galleryToggleSchema.parse(request.body);
    const item = await GalleryItemModel.findByIdAndUpdate(
      request.params.galleryItemId,
      { isFeatured: value },
      { new: true },
    );
    if (!item) throw new HttpError(404, "Gallery item not found.");
    response.json({ success: true, data: { item } });
  } catch (error) {
    next(error);
  }
};

export const reorderAdminGallery: RequestHandler = async (request, response, next) => {
  try {
    const { items } = galleryReorderSchema.parse(request.body);
    await GalleryItemModel.bulkWrite(
      items.map((item) => ({
        updateOne: { filter: { _id: item.id }, update: { displayOrder: item.displayOrder } },
      })),
    );
    response.json({ success: true, data: { updated: items.length } });
  } catch (error) {
    next(error);
  }
};

export const bulkAdminGallery: RequestHandler = async (request, response, next) => {
  try {
    const { ids, action, value } = galleryBulkActionSchema.parse(request.body);
    if (action === "DELETE") {
      const items = await GalleryItemModel.find({ _id: { $in: ids } });
      for (const item of items)
        if (item.ownsCloudinaryAsset) await deleteCloudinaryImage(item.image.publicId);
      await GalleryItemModel.deleteMany({ _id: { $in: ids } });
    } else {
      if (action === "PUBLISH") {
        const items = await GalleryItemModel.find({ _id: { $in: ids } });
        const invalid = items.find(
          (item) =>
            !item.image.alt.trim() || (item.type === "TATTOO_WORK" && !item.tattooStyleIds.length),
        );
        if (invalid) {
          throw new HttpError(
            400,
            "Every published image needs alt text; tattoo work also needs a style.",
          );
        }
      }
      const updates: Record<string, unknown> = {};
      if (action === "PUBLISH" || action === "UNPUBLISH")
        updates.isPublished = action === "PUBLISH";
      if (action === "FEATURE" || action === "UNFEATURE") updates.isFeatured = action === "FEATURE";
      if (action === "SET_TYPE") updates.type = value;
      if (action === "ADD_STYLE") updates.$addToSet = { tattooStyleIds: value };
      await GalleryItemModel.updateMany({ _id: { $in: ids } }, updates);
    }
    response.json({ success: true, data: { updated: ids.length } });
  } catch (error) {
    next(error);
  }
};
