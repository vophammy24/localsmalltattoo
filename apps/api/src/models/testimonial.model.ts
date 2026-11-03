import { Schema, model } from "mongoose";

const testimonialSchema = new Schema(
  {
    customerName: { type: String, required: true, trim: true, maxlength: 120 },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    reviewDate: { type: Date, required: true },
    sourceType: {
      type: String,
      enum: ["DIRECT_CUSTOMER", "CUSTOMER_AUTHORIZED"],
      default: "DIRECT_CUSTOMER",
    },
    sourceUrl: { type: String, default: "" },
    isPublic: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0, min: 0 },
    publishFrom: { type: Date, default: null },
    publishUntil: { type: Date, default: null },
    permissionConfirmed: { type: Boolean, default: false },
    adminNote: { type: String, default: "", maxlength: 5000 },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true },
);
testimonialSchema.index({
  isPublic: 1,
  permissionConfirmed: 1,
  isFeatured: -1,
  displayOrder: 1,
  reviewDate: -1,
  _id: 1,
});
testimonialSchema.index({ publishFrom: 1, publishUntil: 1 });
export const TestimonialModel = model("Testimonial", testimonialSchema);
