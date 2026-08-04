const tickerItems = [
  "Fineline ",
  "Ornamental ",
  "Blackwork ",
  "Old School / American ",
  "Japanese ",
  "Realism ",
  "Da Nang City ",
  "Local Small Tattoo ",
  "Fineline ",
  "Ornamental ",
  "Blackwork ",
  "Old School / American ",
  "Japanese ",
  "Realism ",
  "Da Nang City ",
  "Local Small Tattoo ",
];

function TickerGroup() {
  return (
    <div className="marquee__group" aria-hidden="true">
      {tickerItems.map((item) => (
        <span key={item}>{item} · </span>
      ))}
    </div>
  );
}

export function MarqueeTicker() {
  return (
    <div className="marquee" aria-label="Tattoo styles available at the studio">
      <div className="marquee__track">
        <TickerGroup />
        <TickerGroup />
      </div>
    </div>
  );
}
