import { Schema, model } from "mongoose";

const googleReviewSchema = new Schema(
  {
    googleReviewId: { type: String, required: true, unique: true, index: true },
    resourceName: String,
    reviewer: { displayName: String, profilePhotoUrl: String, isAnonymous: Boolean },
    starRating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
    reviewCreatedAt: Date,
    googleUpdatedAt: Date,
    ownerReply: { comment: String, updatedAt: Date },
    googleStatus: { type: String, enum: ["ACTIVE", "REMOVED"], default: "ACTIVE", index: true },
    moderation: {
      isPublic: { type: Boolean, default: false, index: true },
      isFeatured: { type: Boolean, default: false, index: true },
      displayOrder: { type: Number, default: 0 },
      adminNote: String,
      reviewedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
      reviewedAt: Date,
    },
    lastSyncedAt: Date,
  },
  { timestamps: true },
);
googleReviewSchema.index({
  googleStatus: 1,
  "moderation.isPublic": 1,
  "moderation.displayOrder": 1,
});
export const GoogleReviewModel = model("GoogleReview", googleReviewSchema);
