import type { TattooStyle } from "../../tattooStyles/types/tattooStyle";

export function GalleryFilters({
  type,
  style,
  styles,
  onChange,
}: {
  type: string;
  style: string;
  styles: TattooStyle[];
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="gallery-filters">
      <label>
        Type
        <select value={type} onChange={(event) => onChange("type", event.target.value)}>
          <option value="">All work</option>
          <option value="TATTOO_WORK">Tattoo work</option>
          <option value="CUSTOMER_PHOTO">Customers</option>
          <option value="STUDIO_PHOTO">Studio</option>
        </select>
      </label>
      <label>
        Style
        <select value={style} onChange={(event) => onChange("style", event.target.value)}>
          <option value="">All styles</option>
          {styles.map((item) => (
            <option value={item.slug} key={item._id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
