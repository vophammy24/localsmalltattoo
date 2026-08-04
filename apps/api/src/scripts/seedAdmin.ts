import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/database.js";
import { env } from "../config/env.js";
import { AdminModel } from "../models/admin.model.js";

async function seedAdmin() {
  if (!env.ADMIN_NAME || !env.ADMIN_EMAIL || !env.ADMIN_PASSWORD)
    throw new Error("ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required.");
  await connectDatabase();
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  await AdminModel.findOneAndUpdate(
    { email: env.ADMIN_EMAIL.toLowerCase() },
    {
      fullName: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      passwordHash,
      role: "OWNER",
      isActive: true,
    },
    { upsert: true },
  );
  console.info(`Admin ready: ${env.ADMIN_EMAIL}`);
  process.exit(0);
}
seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
