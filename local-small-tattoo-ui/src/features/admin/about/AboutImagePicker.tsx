import type { GalleryItem } from "../../gallery/types/gallery";
export function AboutImagePicker({
  items,
  selectedIds,
  multiple = false,
  onChange,
}: {
  items: GalleryItem[];
  selectedIds: string[];
  multiple?: boolean;
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="admin-about-picker">
      {items.map((item) => {
        const selected = selectedIds.includes(item._id);
        return (
          <button
            type="button"
            className={selected ? "is-selected" : ""}
            key={item._id}
            onClick={() =>
              onChange(
                multiple
                  ? selected
                    ? selectedIds.filter((id) => id !== item._id)
                    : [...selectedIds, item._id]
                  : selected
                    ? []
                    : [item._id],
              )
            }
          >
            <img src={item.image.url} alt={item.image.alt} />
            <span>{selected ? "Selected" : item.title || item.image.alt}</span>
            {!item.isPublished ? <i>Draft image</i> : null}
          </button>
        );
      })}
    </div>
  );
}
