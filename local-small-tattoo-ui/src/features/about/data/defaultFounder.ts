import type { AboutContent } from "../types/about";

export const DEFAULT_FOUNDER_SECTION: AboutContent["founderSection"] = {
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
};

export function withDefaultFounder(content: AboutContent): AboutContent {
  const defaultHome: AboutContent["home"] = {
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
  };
  return {
    ...content,
    home: {
      hero: { ...defaultHome.hero, ...content.home?.hero },
      location: { ...defaultHome.location, ...content.home?.location },
    },
    story: { ...content.story, signature: content.story?.signature ?? "Inking Our Story." },
    studioSpace: { ...content.studioSpace, images: content.studioSpace?.images ?? [] },
    founderSection: {
      ...DEFAULT_FOUNDER_SECTION,
      ...content.founderSection,
      paragraphs: content.founderSection?.paragraphs ?? DEFAULT_FOUNDER_SECTION.paragraphs,
    },
  };
}
