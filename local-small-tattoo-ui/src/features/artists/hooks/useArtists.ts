import { useEffect, useState } from "react";
import { getArtists } from "../api/artistApi";
import type { Artist } from "../types/artist";

export function useArtists(query = "") {
  const [data, setData] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getArtists(query)
      .then((artists) => active && setData(artists))
      .catch((reason: Error) => active && setError(reason.message))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [query]);
  return { data, isLoading, error };
}
