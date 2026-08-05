import { extractGoogleMapsEmbedUrl } from "../api/businessSettingsApi";
export function GoogleMapEmbed({ url, title }: { url: string; title: string }) {
  const embedUrl = extractGoogleMapsEmbedUrl(url);
  if (!embedUrl.startsWith("https://"))
    return <div className="google-map__empty">Location is currently unavailable.</div>;
  return (
    <div className="google-map">
      <iframe
        src={embedUrl}
        title={`${title} location`}
        loading="lazy"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
