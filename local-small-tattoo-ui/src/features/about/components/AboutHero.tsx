import { Link } from "react-router";
import type { AboutContent } from "../types/about";
import { PageHero } from "../../../components/common/PageHero";
export function AboutHero({ content }: { content: AboutContent["hero"] }) {
  return (
    <PageHero
      className={`about-cms-hero${content.image ? " page-hero--media has-image" : ""}`}
      title={content.heading}
      description={content.description}
      style={
        content.image
          ? {
              backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.88), rgba(0,0,0,.3)), url(${content.image.url})`,
            }
          : undefined
      }
    >
      {content.primaryCtaLabel && content.primaryCtaUrl ? (
        <Link className="button" to={content.primaryCtaUrl}>
          {content.primaryCtaLabel}
        </Link>
      ) : null}
    </PageHero>
  );
}
