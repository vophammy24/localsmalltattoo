import { Schema, model } from "mongoose";

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, required: true, trim: true },
    displayOrder: { type: Number, min: 0, default: 0 },
  },
  { _id: true },
);

const tattooStyleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    coverImage: {
      url: String,
      publicId: String,
      alt: String,
    },
    galleryImages: { type: [imageSchema], default: [] },
    isFeatured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
      index: true,
    },
    displayOrder: { type: Number, min: 0, default: 0, index: true },
    archivedAt: Date,
  },
  { timestamps: true },
);

export const TattooStyleModel = model("TattooStyle", tattooStyleSchema);
