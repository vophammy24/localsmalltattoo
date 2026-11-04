export function ReviewSource({ url }: { url: string }) {
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.port ||
      !(
        (["google.com", "www.google.com"].includes(parsed.hostname) &&
          (parsed.pathname === "/maps" || parsed.pathname.startsWith("/maps/"))) ||
        ["maps.google.com", "maps.app.goo.gl"].includes(parsed.hostname) ||
        (parsed.hostname === "goo.gl" && parsed.pathname.startsWith("/maps/"))
      )
    )
      return null;
  } catch {
    return null;
  }
  return (
    <a
      className="review-card__source"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => event.stopPropagation()}
    >
      View on Google Maps &#8599;
    </a>
  );
}
