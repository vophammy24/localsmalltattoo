import { useState } from "react";
import type { GalleryItem } from "../types/gallery";
import { GalleryCard } from "./GalleryCard";
import { GalleryLightbox } from "./GalleryLightbox";
import { useTouchActivation } from "../../../components/common/useTouchActivation";

export function GalleryGrid({
  items,
  className = "",
}: {
  items: GalleryItem[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const { activeKey, shouldRunAction } = useTouchActivation();
  return (
    <>
      <div className={`gallery-grid${className ? ` ${className}` : ""}`}>
        {items.map((item, index) => (
          <GalleryCard
            key={item._id}
            item={item}
            isTouchActive={activeKey === item._id}
            onActivate={() => {
              if (shouldRunAction(item._id)) setOpen(index);
            }}
          />
        ))}
      </div>
      {open !== null ? (
        <GalleryLightbox
          items={items}
          index={open}
          onChange={setOpen}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  );
}
