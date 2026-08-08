import { Link } from "react-router";
import type { AboutContent } from "../types/about";
export function AboutFinalCta({ content }: { content: AboutContent["finalCta"] }) {
  return (
    <section
      className={`about-final-cta${content.image ? " has-image" : ""}`}
      style={
        content.image
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,.62), rgba(0,0,0,.84)), url(${content.image.url})`,
            }
          : undefined
      }
    >
      <h2>{content.heading}</h2>
      {content.description ? <p>{content.description}</p> : null}
      <Link className="button" to={content.buttonUrl}>
        {content.buttonLabel}
      </Link>
    </section>
  );
}
