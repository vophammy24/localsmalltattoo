import { Schema, model } from "mongoose";

const imageReference = {
  type: Schema.Types.ObjectId,
  ref: "GalleryItem",
  set: (value: unknown) => (value === "" || value == null ? undefined : value),
};
const valueSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    displayOrder: { type: Number, min: 0, default: 0 },
  },
  { _id: true },
);

const aboutFields = {
  hero: {
    isVisible: { type: Boolean, default: true },
    heading: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 1500 },
    imageId: imageReference,
    primaryCtaLabel: { type: String, trim: true, maxlength: 80 },
    primaryCtaUrl: { type: String, trim: true, maxlength: 500 },
  },
  story: {
    isVisible: { type: Boolean, default: true },
    label: { type: String, trim: true, maxlength: 100 },
    heading: { type: String, required: true, trim: true, maxlength: 150 },
    paragraphs: [{ type: String, trim: true, maxlength: 5000 }],
    primaryImageId: imageReference,
    secondaryImageId: imageReference,
  },
  mission: {
    isVisible: { type: Boolean, default: true },
    heading: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    values: { type: [valueSchema], default: [] },
    imageId: imageReference,
  },
  studioSpace: {
    isVisible: { type: Boolean, default: true },
    heading: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 2000 },
    galleryItemIds: [{ type: Schema.Types.ObjectId, ref: "GalleryItem" }],
  },
  artistSection: {
    isVisible: { type: Boolean, default: true },
    heading: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 2000 },
    artistIds: [{ type: Schema.Types.ObjectId, ref: "Artist" }],
  },
  finalCta: {
    isVisible: { type: Boolean, default: true },
    heading: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1500 },
    buttonLabel: { type: String, required: true, trim: true, maxlength: 80 },
    buttonUrl: { type: String, required: true, trim: true, maxlength: 500 },
    imageId: imageReference,
  },
};

const pageContentSchema = new Schema(
  {
    pageKey: { type: String, required: true, unique: true, index: true, enum: ["about"] },
    ...aboutFields,
    publishedSnapshot: Schema.Types.Mixed,
    isPublished: { type: Boolean, default: false },
    version: { type: Number, min: 1, default: 1 },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    publishedAt: Date,
  },
  { timestamps: true },
);

export const PageContentModel = model("PageContent", pageContentSchema);
