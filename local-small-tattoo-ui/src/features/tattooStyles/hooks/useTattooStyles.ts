import { useEffect, useState } from "react";
import { getTattooStyles } from "../api/tattooStyleApi";
import type { TattooStyle } from "../types/tattooStyle";

export function useTattooStyles(featured = false) {
  const [data, setData] = useState<TattooStyle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getTattooStyles(featured)
      .then((styles) => {
        if (active) setData(styles);
      })
      .catch((reason: Error) => {
        if (active) setError(reason.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [featured]);

  return { data, isLoading, error };
}
