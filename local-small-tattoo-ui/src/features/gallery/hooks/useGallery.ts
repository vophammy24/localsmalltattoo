import { useEffect, useState } from "react";
import { getGallery } from "../api/galleryApi";
import type { GalleryPageData } from "../types/gallery";

export function useGallery(query = "") {
  const [data, setData] = useState<GalleryPageData>({
    items: [],
    pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");
    getGallery(query)
      .then((result) => active && setData(result))
      .catch((reason: Error) => active && setError(reason.message))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [query]);
  return { data, isLoading, error };
}
