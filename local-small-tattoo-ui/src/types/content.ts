export type NavItem = {
  label: string;
  href: string;
};

export type TattooStyle = {
  id: string;
  index: string;
  name: string;
  slug: string;
  image: string;
  description: string;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  relativeDate: string;
};

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  size: "portrait" | "square" | "landscape";
};
