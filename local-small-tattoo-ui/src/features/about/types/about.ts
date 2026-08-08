export type SectionImage = { url: string; publicId: string; alt: string };

export interface AboutContent {
  version: number;
  isPublished?: boolean;
  home: {
    hero: {
      isVisible: boolean;
      headingLines: string[];
      subtitle: string;
      buttonLabel: string;
      buttonUrl: string;
      image?: SectionImage;
    };
    location: {
      isVisible: boolean;
      heading: string;
      description: string;
      image?: SectionImage;
    };
  };
  hero: {
    isVisible: boolean;
    heading: string;
    description: string;
    image?: SectionImage;
    primaryCtaLabel: string;
    primaryCtaUrl: string;
  };
  story: {
    isVisible: boolean;
    label: string;
    heading: string;
    paragraphs: string[];
    signature: string;
    primaryImage?: SectionImage;
    secondaryImage?: SectionImage;
  };
  mission: {
    isVisible: boolean;
    heading: string;
    description: string;
    values: { title: string; description: string; displayOrder: number }[];
    image?: SectionImage;
  };
  studioSpace: {
    isVisible: boolean;
    heading: string;
    description: string;
    images: SectionImage[];
  };
  founderSection: {
    isVisible: boolean;
    name: string;
    role: string;
    heading: string;
    paragraphs: string[];
    signature: string;
    image?: SectionImage;
  };
  finalCta: {
    isVisible: boolean;
    heading: string;
    description: string;
    buttonLabel: string;
    buttonUrl: string;
    image?: SectionImage;
  };
  updatedAt?: string;
  publishedAt?: string;
}
