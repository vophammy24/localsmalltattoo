import type { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      admin?: { id: Types.ObjectId; fullName: string; email: string; role: "OWNER" | "STAFF" };
    }
  }
}

export {};
