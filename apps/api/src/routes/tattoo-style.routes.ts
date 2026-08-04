import { Router } from "express";
import { getPublicStyle, listPublicStyles } from "../controllers/tattoo-style.controller.js";

export const publicTattooStyleRouter = Router();
publicTattooStyleRouter.get("/", listPublicStyles);
publicTattooStyleRouter.get("/:slug", getPublicStyle);
