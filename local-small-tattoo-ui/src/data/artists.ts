export interface StaticArtist {
  id: string;
  name: string;
  yearsOfExperience: number;
  introduction: string;
  portrait?: `/images/artists/${string}`;
  imageAlt: string;
}

export const ARTISTS: StaticArtist[] = [
  {
    id: "artist-01",
    name: "Thuan Ink",
    yearsOfExperience: 8,
    introduction: "A great tattoo is not only about how it looks, but also about how you feel while getting it. So come as you are, bring your story, and let’s make something meaningful together.",
    portrait: "/images/artists/artist-01.webp",
    imageAlt: "Portrait of Thuan Ink",
  },
  {
    id: "artist-02",
    name: "Lam Art",
    yearsOfExperience: 6,
    introduction: "See every client as an opportunity to create, every tattoo as a responsibility, and every day in this profession as a chance to become a better version of yourself.",
    portrait: "/images/artists/artist-02.webp",
    imageAlt: "Portrait of Lam Art",
  },
];