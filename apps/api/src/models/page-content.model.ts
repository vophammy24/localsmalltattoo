import { Schema, model } from "mongoose";

const sectionImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { _id: false },
);
const valueSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    displayOrder: { type: Number, min: 0, default: 0 },
  },
  { _id: true },
);

const aboutFields = {
  home: {
    hero: {
      isVisible: { type: Boolean, default: true },
      headingLines: [{ type: String, required: true, trim: true, maxlength: 80 }],
      subtitle: { type: String, trim: true, maxlength: 150 },
      buttonLabel: { type: String, trim: true, maxlength: 80 },
      buttonUrl: { type: String, trim: true, maxlength: 500 },
      image: sectionImageSchema,
    },
    location: {
      isVisible: { type: Boolean, default: true },
      heading: { type: String, required: true, trim: true, maxlength: 150 },
      description: { type: String, trim: true, maxlength: 2000 },
      image: sectionImageSchema,
    },
  },
  hero: {
    isVisible: { type: Boolean, default: true },
    heading: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 1500 },
    image: sectionImageSchema,
    primaryCtaLabel: { type: String, trim: true, maxlength: 80 },
    primaryCtaUrl: { type: String, trim: true, maxlength: 500 },
  },
  story: {
    isVisible: { type: Boolean, default: true },
    label: { type: String, trim: true, maxlength: 100 },
    heading: { type: String, required: true, trim: true, maxlength: 150 },
    paragraphs: [{ type: String, trim: true, maxlength: 5000 }],
    signature: { type: String, trim: true, maxlength: 150 },
    primaryImage: sectionImageSchema,
    secondaryImage: sectionImageSchema,
  },
  mission: {
    isVisible: { type: Boolean, default: true },
    heading: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    values: { type: [valueSchema], default: [] },
    image: sectionImageSchema,
  },
  studioSpace: {
    isVisible: { type: Boolean, default: true },
    heading: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 2000 },
    images: { type: [sectionImageSchema], default: [] },
  },
  founderSection: {
    isVisible: { type: Boolean, default: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, trim: true, maxlength: 120 },
    heading: { type: String, required: true, trim: true, maxlength: 150 },
    paragraphs: [{ type: String, required: true, trim: true, maxlength: 5000 }],
    signature: { type: String, trim: true, maxlength: 150 },
    image: sectionImageSchema,
  },
  finalCta: {
    isVisible: { type: Boolean, default: true },
    heading: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1500 },
    buttonLabel: { type: String, required: true, trim: true, maxlength: 80 },
    buttonUrl: { type: String, required: true, trim: true, maxlength: 500 },
    image: sectionImageSchema,
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
