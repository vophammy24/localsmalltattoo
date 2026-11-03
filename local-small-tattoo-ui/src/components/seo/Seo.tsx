import { SITE_CONFIG } from "../../config/siteConfig";
import { SITE_ASSETS } from "../../config/siteAssets";
const SITE_URL = SITE_CONFIG.siteUrl;
const DEFAULT_IMAGE = `${SITE_URL}${SITE_ASSETS.logo}`;

type SeoProps = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
};

export function Seo({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  noIndex = false,
  structuredData,
}: SeoProps) {
  const canonical = new URL(path, SITE_URL).toString();

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {structuredData ? (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      ) : null}
    </>
  );
}

export { SITE_URL };
