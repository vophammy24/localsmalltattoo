import type { RequestHandler } from "express";
import { ArtistModel } from "../models/artist.model.js";
import { GalleryItemModel } from "../models/gallery-item.model.js";
import { PageContentModel } from "../models/page-content.model.js";
import { HttpError } from "../utils/http-error.js";
import { aboutContentSchema, type AboutContentFields } from "../validators/about.validator.js";

const DEFAULT_ABOUT: Omit<AboutContentFields, "version"> = {
  hero: {
    isVisible: true,
    heading: "Precision & Permanence.",
    description:
      "A private tattoo studio focused on personal stories, careful craftsmanship and timeless design.",
    imageId: "",
    primaryCtaLabel: "Book an appointment",
    primaryCtaUrl: "/booking",
  },
  story: {
    isVisible: true,
    label: "Our story",
    heading: "Built around considered work.",
    paragraphs: [
      "Local Small Tattoo was created as a focused, appointment-led space for personal and enduring tattoo work.",
      "Every piece begins with conversation and develops through careful drawing, placement and execution.",
    ],
    primaryImageId: "",
    secondaryImageId: "",
  },
  mission: {
    isVisible: true,
    heading: "The Architecture of Skin.",
    description:
      "We make personal work with precision, care and respect for the body it will live on.",
    values: [
      {
        title: "Personal",
        description: "Every design begins with the individual story behind it.",
        displayOrder: 0,
      },
      {
        title: "Precise",
        description: "Each line, proportion and placement is considered.",
        displayOrder: 1,
      },
      {
        title: "Safe",
        description: "Hygiene, clarity and client comfort guide every session.",
        displayOrder: 2,
      },
      {
        title: "Timeless",
        description: "We design for a life beyond passing visual trends.",
        displayOrder: 3,
      },
    ],
    imageId: "",
  },
  studioSpace: {
    isVisible: true,
    heading: "A Sanctuary of Creative Calm.",
    description: "A private environment designed for unhurried consultation and focused work.",
    galleryItemIds: [],
  },
  artistSection: {
    isVisible: true,
    heading: "Artists of Precision.",
    description: "Meet the artists behind the practice.",
    artistIds: [],
  },
  finalCta: {
    isVisible: true,
    heading: "Your Skin, Our Canvas.",
    description: "Begin your next piece with a considered conversation.",
    buttonLabel: "Book an Appointment",
    buttonUrl: "/booking",
    imageId: "",
  },
};

async function validateReferences(content: AboutContentFields) {
  const imageIds = [
    content.hero.imageId,
    content.story.primaryImageId,
    content.story.secondaryImageId,
    content.mission.imageId,
    content.finalCta.imageId,
    ...content.studioSpace.galleryItemIds,
  ].filter(Boolean) as string[];
  const [images, artists] = await Promise.all([
    GalleryItemModel.find({ _id: { $in: imageIds } })
      .select("_id type")
      .lean(),
    ArtistModel.find({ _id: { $in: content.artistSection.artistIds } })
      .select("_id")
      .lean(),
  ]);
  if (images.length !== new Set(imageIds).size)
    throw new HttpError(400, "One or more selected gallery images do not exist.");
  const studioIds = new Set(content.studioSpace.galleryItemIds);
  if (images.some((image) => studioIds.has(String(image._id)) && image.type !== "STUDIO_PHOTO"))
    throw new HttpError(400, "Studio Space only accepts STUDIO_PHOTO images.");
  if (artists.length !== new Set(content.artistSection.artistIds).size)
    throw new HttpError(400, "One or more selected artists do not exist.");
}

async function resolvePublic(snapshot: AboutContentFields) {
  const imageIds = [
    snapshot.hero.imageId,
    snapshot.story.primaryImageId,
    snapshot.story.secondaryImageId,
    snapshot.mission.imageId,
    snapshot.finalCta.imageId,
    ...snapshot.studioSpace.galleryItemIds,
  ].filter(Boolean);
  const [images, artists] = await Promise.all([
    GalleryItemModel.find({ _id: { $in: imageIds }, isPublished: true }).lean(),
    ArtistModel.find({
      _id: { $in: snapshot.artistSection.artistIds },
      isPublished: true,
      status: "PUBLISHED",
    })
      .populate({ path: "tattooStyleIds", select: "name slug" })
      .lean(),
  ]);
  const imageMap = new Map(images.map((image) => [String(image._id), image]));
  const artistMap = new Map(artists.map((artist) => [String(artist._id), artist]));
  return {
    ...snapshot,
    hero: {
      ...snapshot.hero,
      image: snapshot.hero.imageId ? imageMap.get(snapshot.hero.imageId) : undefined,
    },
    story: {
      ...snapshot.story,
      primaryImage: snapshot.story.primaryImageId
        ? imageMap.get(snapshot.story.primaryImageId)
        : undefined,
      secondaryImage: snapshot.story.secondaryImageId
        ? imageMap.get(snapshot.story.secondaryImageId)
        : undefined,
    },
    mission: {
      ...snapshot.mission,
      image: snapshot.mission.imageId ? imageMap.get(snapshot.mission.imageId) : undefined,
    },
    studioSpace: {
      ...snapshot.studioSpace,
      images: snapshot.studioSpace.galleryItemIds.map((id) => imageMap.get(id)).filter(Boolean),
    },
    artistSection: {
      ...snapshot.artistSection,
      artists: snapshot.artistSection.artistIds.map((id) => artistMap.get(id)).filter(Boolean),
    },
    finalCta: {
      ...snapshot.finalCta,
      image: snapshot.finalCta.imageId ? imageMap.get(snapshot.finalCta.imageId) : undefined,
    },
  };
}

export const getPublicAbout: RequestHandler = async (_request, response, next) => {
  try {
    const page = await PageContentModel.findOne({ pageKey: "about", isPublished: true }).lean();
    if (!page?.publishedSnapshot) throw new HttpError(404, "About page is not published.");
    response.json({
      success: true,
      data: { content: await resolvePublic(page.publishedSnapshot as AboutContentFields) },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminAbout: RequestHandler = async (_request, response, next) => {
  try {
    const page = await PageContentModel.findOne({ pageKey: "about" }).lean();
    response.json({
      success: true,
      data: {
        content: page
          ? { ...page, pageKey: undefined, publishedSnapshot: undefined }
          : { ...DEFAULT_ABOUT, version: 1, isPublished: false },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminAbout: RequestHandler = async (request, response, next) => {
  try {
    const content = aboutContentSchema.parse(request.body);
    await validateReferences(content);
    const existing = await PageContentModel.findOne({ pageKey: "about" });
    if (existing && content.version !== existing.version)
      throw new HttpError(409, "This page was updated by another admin. Reload before saving.");
    const fields = { ...content };
    delete fields.version;
    const page = existing ?? new PageContentModel({ pageKey: "about" });
    page.set(fields);
    page.version = existing ? existing.version + 1 : 1;
    page.updatedBy = request.admin?.id;
    await page.save();
    response.json({ success: true, data: { content: page.toObject() } });
  } catch (error) {
    next(error);
  }
};

export const publishAdminAbout: RequestHandler = async (request, response, next) => {
  try {
    const page = await PageContentModel.findOne({ pageKey: "about" });
    if (!page) throw new HttpError(400, "Save the About page before publishing.");
    // Mongoose returns populated references as ObjectId instances; the API schema
    // intentionally validates their serialized representation.
    const serializedPage = JSON.parse(JSON.stringify(page.toObject())) as unknown;
    const content = aboutContentSchema.parse(serializedPage);
    await validateReferences(content);
    page.publishedSnapshot = content;
    page.isPublished = true;
    page.publishedAt = new Date();
    page.updatedBy = request.admin?.id;
    await page.save();
    response.json({ success: true, data: { content: page.toObject() } });
  } catch (error) {
    next(error);
  }
};
