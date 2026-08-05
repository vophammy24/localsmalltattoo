import { Schema, model } from "mongoose";

const artistImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const artistSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    displayName: { type: String, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    role: { type: String, required: true, trim: true, maxlength: 100 },
    shortBio: { type: String, required: true, trim: true, maxlength: 250 },
    biography: { type: String, required: true, trim: true, maxlength: 5000 },
    profileImage: artistImageSchema,
    coverImage: artistImageSchema,
    tattooStyleIds: [{ type: Schema.Types.ObjectId, ref: "TattooStyle", required: true }],
    yearsOfExperience: { type: Number, min: 0 },
    socialLinks: {
      instagram: String,
      facebook: String,
      tiktok: String,
    },
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

artistSchema.index({ tattooStyleIds: 1, isPublished: 1 });

export const ArtistModel = model("Artist", artistSchema);
