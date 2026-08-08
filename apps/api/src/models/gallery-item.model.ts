import { Schema, model } from "mongoose";

export const GALLERY_TYPES = ["TATTOO_WORK", "CUSTOMER_PHOTO", "STUDIO_PHOTO"] as const;

const galleryImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    width: Number,
    height: Number,
    alt: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { _id: false },
);

const galleryItemSchema = new Schema(
  {
    title: { type: String, trim: true, maxlength: 160 },
    caption: { type: String, trim: true, maxlength: 500 },
    image: { type: galleryImageSchema, required: true },
    ownsCloudinaryAsset: { type: Boolean, default: true },
    sourceCollection: { type: String, enum: ["TattooStyle"] },
    sourceId: Schema.Types.ObjectId,
    thumbnail: { url: String, publicId: String },
    type: { type: String, enum: GALLERY_TYPES, required: true, index: true },
    tattooStyleIds: [{ type: Schema.Types.ObjectId, ref: "TattooStyle" }],
    isFeatured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: false, index: true },
    displayOrder: { type: Number, min: 0, default: 0, index: true },
    photographedAt: Date,
  },
  { timestamps: true },
);

galleryItemSchema.index({ isPublished: 1, type: 1, displayOrder: 1 });
galleryItemSchema.index({ tattooStyleIds: 1, isPublished: 1 });

export const GalleryItemModel = model("GalleryItem", galleryItemSchema);
