import { useEffect, useState } from "react";
import { getArtist } from "../api/artistApi";
import type { Artist } from "../types/artist";

export function useArtist(slug?: string) {
  const [data, setData] = useState<Artist>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!slug) return;
    let active = true;
    setIsLoading(true);
    getArtist(slug)
      .then((artist) => active && setData(artist))
      .catch((reason: Error) => active && setError(reason.message))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);
  return { data, isLoading, error };
}
