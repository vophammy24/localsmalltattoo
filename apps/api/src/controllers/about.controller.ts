import type { RequestHandler } from "express";
import { PageContentModel } from "../models/page-content.model.js";
import { HttpError } from "../utils/http-error.js";
import { aboutContentSchema, type AboutContentFields } from "../validators/about.validator.js";
import { deleteCloudinaryImage, uploadPageSectionImage } from "../services/image.service.js";

const DEFAULT_ABOUT: Omit<AboutContentFields, "version"> = {
  home: {
    hero: {
      isVisible: true,
      headingLines: ["Local.", "Small."],
      subtitle: "Ink Our Story",
      buttonLabel: "Book an appointment",
      buttonUrl: "/booking",
    },
    location: {
      isVisible: true,
      heading: "Da Nang.",
      description: "A private, appointment-led studio designed for focused consultation.",
    },
  },
  hero: {
    isVisible: true,
    heading: "Precision & Permanence.",
    description:
      "A private tattoo studio focused on personal stories, careful craftsmanship and timeless design.",
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
    signature: "Inking Our Story.",
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
  },
  studioSpace: {
    isVisible: true,
    heading: "A Sanctuary of Creative Calm.",
    description: "A private environment designed for unhurried consultation and focused work.",
    images: [],
  },
  founderSection: {
    isVisible: true,
    name: "Local Small Tattoo Founder",
    role: "Founder · Fine Line Specialist",
    heading: "Meet Our Founder",
    paragraphs: [
      "With 6 years of experience in tattooing, our founder has always believed that a tattoo studio should be more than just a place to get inked.",
      "Known for being easygoing, friendly, and always up for a good conversation — even if his English isn’t exactly his strongest skill. 😄 But don’t worry, his sense of humor works perfectly well in every language.",
      "He wanted to create a space where people could feel comfortable being themselves — without the intimidating atmosphere that tattoo studios are sometimes known for.",
      "At Local Small Tattoo, he hopes every client can come in, relax, talk, share their stories, laugh a little, and leave with a tattoo they genuinely love.",
      "As a Fine Line specialist, he pays close attention to every detail, focusing on clean lines, delicate work, and tattoos that feel personal to the person wearing them.",
      "For him, a great tattoo is not only about how it looks, but also about how you feel while getting it.",
      "So come as you are, bring your story, and let’s make something meaningful together.",
    ],
    signature: "Inking Our Story.",
  },
  finalCta: {
    isVisible: true,
    heading: "Your Skin, Our Canvas.",
    description: "Begin your next piece with a considered conversation.",
    buttonLabel: "Book an Appointment",
    buttonUrl: "/booking",
  },
};

async function resolvePublic(snapshot: AboutContentFields) {
  return snapshot;
}

export const getPublicAbout: RequestHandler = async (_request, response, next) => {
  try {
    const page = await PageContentModel.findOne({ pageKey: "about", isPublished: true }).lean();
    if (!page?.publishedSnapshot) throw new HttpError(404, "About page is not published.");
    response.json({
      success: true,
      data: {
        content: await resolvePublic({
          ...DEFAULT_ABOUT,
          ...(page.publishedSnapshot as AboutContentFields),
          home: {
            hero: {
              ...DEFAULT_ABOUT.home.hero,
              ...(page.publishedSnapshot as AboutContentFields).home?.hero,
            },
            location: {
              ...DEFAULT_ABOUT.home.location,
              ...(page.publishedSnapshot as AboutContentFields).home?.location,
            },
          },
          founderSection: {
            ...DEFAULT_ABOUT.founderSection,
            ...(page.publishedSnapshot as AboutContentFields).founderSection,
          },
        }),
      },
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
          ? {
              ...page,
              home: {
                hero: { ...DEFAULT_ABOUT.home.hero, ...page.home?.hero },
                location: { ...DEFAULT_ABOUT.home.location, ...page.home?.location },
              },
              story: {
                ...page.story,
                signature: page.story?.signature ?? DEFAULT_ABOUT.story.signature,
              },
              studioSpace: { ...page.studioSpace, images: page.studioSpace?.images ?? [] },
              founderSection: {
                ...DEFAULT_ABOUT.founderSection,
                ...page.founderSection,
              },
              pageKey: undefined,
              publishedSnapshot: undefined,
            }
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
    const serializedPage = JSON.parse(JSON.stringify(page.toObject())) as Record<string, unknown>;
    const content = aboutContentSchema.parse({
      ...serializedPage,
      founderSection: {
        ...DEFAULT_ABOUT.founderSection,
        ...(serializedPage.founderSection as Record<string, unknown> | undefined),
      },
      home: {
        hero: {
          ...DEFAULT_ABOUT.home.hero,
          ...(serializedPage.home as Record<string, any> | undefined)?.hero,
        },
        location: {
          ...DEFAULT_ABOUT.home.location,
          ...(serializedPage.home as Record<string, any> | undefined)?.location,
        },
      },
      story: {
        ...(serializedPage.story as Record<string, unknown>),
        signature:
          (serializedPage.story as Record<string, unknown> | undefined)?.signature ??
          DEFAULT_ABOUT.story.signature,
      },
      studioSpace: {
        ...(serializedPage.studioSpace as Record<string, unknown>),
        images: (serializedPage.studioSpace as Record<string, unknown> | undefined)?.images ?? [],
      },
    });
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

export const uploadAdminSectionImage: RequestHandler = async (request, response, next) => {
  try {
    if (!request.file) throw new HttpError(400, "Select an image.");
    const section = String(request.params.section || "section");
    const uploaded = await uploadPageSectionImage(request.file, section);
    const oldPublicId = String(request.body.oldPublicId || "");
    if (oldPublicId.startsWith("local-small-tattoo/page-sections/")) {
      await deleteCloudinaryImage(oldPublicId);
    }
    response.status(201).json({
      success: true,
      data: { image: { ...uploaded, alt: String(request.body.alt || "").slice(0, 200) } },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminSectionImage: RequestHandler = async (request, response, next) => {
  try {
    const publicId = String(request.body.publicId || "");
    if (!publicId.startsWith("local-small-tattoo/page-sections/")) {
      throw new HttpError(400, "Invalid section image.");
    }
    await deleteCloudinaryImage(publicId);
    response.json({ success: true, message: "Section image deleted.", data: { publicId } });
  } catch (error) {
    next(error);
  }
};
