import { Router } from "express";
import { getPublicAbout } from "../controllers/about.controller.js";

export const publicPageRouter = Router();
publicPageRouter.get("/about", getPublicAbout);
