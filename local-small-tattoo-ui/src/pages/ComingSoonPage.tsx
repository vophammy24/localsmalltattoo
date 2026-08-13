import { useLocation } from "react-router";
import { ButtonLink } from "../components/common/ButtonLink";
import { Seo } from "../components/seo/Seo";

const pageTitles: Record<string, string> = {
  "/booking": "Reserve Your Session.",
  "/styles": "Tattoo Styles.",
  "/about": "Our Studio. Our Story.",
  "/gallery": "Selected Work.",
  "/contact": "Visit the Atelier.",
};

export function ComingSoonPage() {
  const { pathname } = useLocation();
  const normalizedPath = pathname;
  const title = pageTitles[normalizedPath] ?? "Page Not Found.";

  return (
    <section className="placeholder-page">
      <Seo
        title="Page Not Found | Local Small Tattoo"
        description="The requested page could not be found."
        path={pathname}
        noIndex
      />
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
