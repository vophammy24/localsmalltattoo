import { Router } from "express";
import { getPublicArtist, listPublicArtists } from "../controllers/artist.controller.js";

export const publicArtistRouter = Router();
publicArtistRouter.get("/", listPublicArtists);
publicArtistRouter.get("/:slug", getPublicArtist);
