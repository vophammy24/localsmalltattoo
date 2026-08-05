import { useBusinessSettings } from "../businessSettings/BusinessSettingsContext";
import { useTattooStyles } from "../tattooStyles/hooks/useTattooStyles";

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
  const { settings } = useBusinessSettings();
  const { data: styles } = useTattooStyles();
  const items = [
    ...styles.map((style) => style.name),
    settings?.address.city,
    settings?.businessName,
  ].filter((item): item is string => Boolean(item));
  if (!items.length) return null;
  return (
    <div className="marquee" aria-label="Tattoo styles available at the studio">
      <div className="marquee__track">
        <TickerGroup items={items} />
        <TickerGroup items={items} />
      </div>
    </div>
  );
}
