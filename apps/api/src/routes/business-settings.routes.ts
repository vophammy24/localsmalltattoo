import { Router } from "express";
import { getPublicBusinessSettings } from "../controllers/business-settings.controller.js";
export const publicBusinessSettingsRouter = Router();
publicBusinessSettingsRouter.get("/", getPublicBusinessSettings);
