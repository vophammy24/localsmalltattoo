import { SITE_CONFIG } from "../../config/siteConfig";

function TickerGroup({ items }: { items: string[] }) {
  return (
    <div className="marquee__group" aria-hidden="true">
      {items.map((item, index) => (
        <span key={`${item}-${index}`}> {item} · </span>
      ))}
    </div>
  );
}

export function MarqueeTicker() {
  const items = [SITE_CONFIG.businessName, SITE_CONFIG.address.city];
  if (!items.length) return null;
  return (
    <div className="marquee" aria-label="Tattoo styles available at the studio">
      <div className="marquee__track">
        <TickerGroup items={items} />
        <TickerGroup items={items} />
        <TickerGroup items={items} />
        <TickerGroup items={items} />
        <TickerGroup items={items} />
        <TickerGroup items={items} />
        <TickerGroup items={items} />
        <TickerGroup items={items} />
        <TickerGroup items={items} />
        <TickerGroup items={items} />
        <TickerGroup items={items} />
        <TickerGroup items={items} />
      </div>
    </div>
  );
}
