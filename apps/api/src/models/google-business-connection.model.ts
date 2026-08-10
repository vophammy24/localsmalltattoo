import { Schema, model } from "mongoose";

const googleBusinessConnectionSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    accountId: { type: String, required: true },
    accountName: { type: String, default: "" },
    locationId: { type: String, required: true },
    locationName: { type: String, default: "" },
    locationResourceName: { type: String, required: true },
    encryptedRefreshToken: { type: String, required: true, select: false },
    isConnected: { type: Boolean, default: true },
    lastSyncedAt: Date,
    lastSyncStatus: { type: String, enum: ["SUCCESS", "FAILED"], default: "SUCCESS" },
    lastSyncError: String,
    reviewSummary: { averageRating: Number, totalReviewCount: Number },
  },
  { timestamps: true },
);

googleBusinessConnectionSchema.index({ isConnected: 1 });
export const GoogleBusinessConnectionModel = model(
  "GoogleBusinessConnection",
  googleBusinessConnectionSchema,
);
