import { useLocation } from "react-router";
import { ButtonLink } from "../components/common/ButtonLink";

const pageTitles: Record<string, string> = {
  "/booking": "Reserve Your Session.",
  "/styles": "Tattoo Styles.",
  "/about": "Our Studio. Our Story.",
  "/artists": "Artists of Precision.",
  "/gallery": "Selected Work.",
  "/contact": "Visit the Atelier.",
};

export function ComingSoonPage() {
  const { pathname } = useLocation();
  const normalizedPath = pathname.startsWith("/artists/") ? "/artists" : pathname;
  const title = pageTitles[normalizedPath] ?? "Page Not Found.";

  return (
    <section className="placeholder-page">
      <div className="page-shell placeholder-page__inner">
        <h1>{title}</h1>
        <p>
          This route is ready in the UI architecture. Its detailed page will be implemented in the
          next development phase.
        </p>
        <ButtonLink to="/">Back to home</ButtonLink>
      </div>
    </section>
  );
}
