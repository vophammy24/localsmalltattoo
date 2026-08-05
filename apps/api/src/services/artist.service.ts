import mongoose from "mongoose";
import { ArtistModel } from "../models/artist.model.js";
import { TattooStyleModel } from "../models/tattoo-style.model.js";
import { HttpError } from "../utils/http-error.js";
import type { ArtistFields } from "../validators/artist.validator.js";
import { deleteCloudinaryImages, uploadArtistImage } from "./image.service.js";

async function validateStyles(ids: string[]) {
  const count = await TattooStyleModel.countDocuments({
    _id: { $in: ids },
    status: { $ne: "ARCHIVED" },
  });
  if (count !== new Set(ids).size)
    throw new HttpError(400, "One or more tattoo styles do not exist.");
}

function image(file: { url: string; publicId: string }, alt: string) {
  return { ...file, alt };
}

export async function createArtist(
  fields: ArtistFields,
  files: { profileImage?: Express.Multer.File[]; coverImage?: Express.Multer.File[] },
) {
  await validateStyles(fields.tattooStyleIds);
  const uploaded: { url: string; publicId: string }[] = [];
  try {
    const profileFile = files.profileImage?.[0];
    const coverFile = files.coverImage?.[0];
    const profile = profileFile ? await uploadArtistImage(profileFile, fields.slug) : undefined;
    if (profile) uploaded.push(profile);
    const cover = coverFile ? await uploadArtistImage(coverFile, fields.slug) : undefined;
    if (cover) uploaded.push(cover);
    if (fields.isPublished && !profile)
      throw new HttpError(400, "A profile image is required before publishing.");
    return await ArtistModel.create({
      fullName: fields.fullName,
      displayName: fields.displayName || undefined,
      slug: fields.slug,
      role: fields.role,
      shortBio: fields.shortBio,
      biography: fields.biography,
      profileImage: profile
        ? image(
            profile,
            fields.profileAlt || `Tattoo artist ${fields.displayName || fields.fullName}`,
          )
        : undefined,
      coverImage: cover
        ? image(
            cover,
            fields.coverAlt || `${fields.displayName || fields.fullName} at Local Small Tattoo`,
          )
        : undefined,
      tattooStyleIds: fields.tattooStyleIds,
      yearsOfExperience: fields.yearsOfExperience,
      socialLinks: {
        instagram: fields.instagram,
        facebook: fields.facebook,
        tiktok: fields.tiktok,
      },
      isFeatured: fields.isFeatured,
      isPublished: fields.isPublished,
      status: fields.isPublished ? "PUBLISHED" : "DRAFT",
      displayOrder: fields.displayOrder,
    });
  } catch (error) {
    await deleteCloudinaryImages(uploaded.map((item) => item.publicId));
    if ((error as { code?: number }).code === 11000)
      throw new HttpError(409, "An artist with this slug already exists.");
    throw error;
  }
}

export async function updateArtist(
  id: string,
  fields: ArtistFields,
  files: { profileImage?: Express.Multer.File[]; coverImage?: Express.Multer.File[] },
) {
  const artist = await ArtistModel.findById(id);
  if (!artist) throw new HttpError(404, "Artist not found.");
  await validateStyles(fields.tattooStyleIds);
  const uploaded: { url: string; publicId: string }[] = [];
  try {
    const profileFile = files.profileImage?.[0];
    const coverFile = files.coverImage?.[0];
    const profileUpload = profileFile
      ? await uploadArtistImage(profileFile, fields.slug)
      : undefined;
    if (profileUpload) uploaded.push(profileUpload);
    const coverUpload = coverFile ? await uploadArtistImage(coverFile, fields.slug) : undefined;
    if (coverUpload) uploaded.push(coverUpload);
    const nextProfile = profileUpload
      ? image(
          profileUpload,
          fields.profileAlt || `Tattoo artist ${fields.displayName || fields.fullName}`,
        )
      : artist.profileImage;
    const nextCover = coverUpload
      ? image(
          coverUpload,
          fields.coverAlt || `${fields.displayName || fields.fullName} at Local Small Tattoo`,
        )
      : artist.coverImage;
    if (fields.isPublished && !nextProfile?.url)
      throw new HttpError(400, "A profile image is required before publishing.");
    const staleIds = [
      profileUpload ? artist.profileImage?.publicId : undefined,
      coverUpload ? artist.coverImage?.publicId : undefined,
    ].filter((value): value is string => Boolean(value));
    artist.set({
      fullName: fields.fullName,
      displayName: fields.displayName || undefined,
      slug: fields.slug,
      role: fields.role,
      shortBio: fields.shortBio,
      biography: fields.biography,
      profileImage: nextProfile,
      coverImage: nextCover,
      tattooStyleIds: fields.tattooStyleIds,
      yearsOfExperience: fields.yearsOfExperience,
      socialLinks: {
        instagram: fields.instagram,
        facebook: fields.facebook,
        tiktok: fields.tiktok,
      },
      isFeatured: fields.isFeatured,
      isPublished: fields.isPublished,
      status: fields.isPublished ? "PUBLISHED" : "DRAFT",
      displayOrder: fields.displayOrder,
      archivedAt: undefined,
    });
    await artist.save();
    await deleteCloudinaryImages(staleIds);
    return artist;
  } catch (error) {
    await deleteCloudinaryImages(uploaded.map((item) => item.publicId));
    if (
      error instanceof mongoose.Error.ValidationError ||
      (error as { code?: number }).code === 11000
    ) {
      throw new HttpError(409, "An artist with this slug already exists.");
    }
    throw error;
  }
}
