import { useEffect, useState } from "react";
import { getAbout } from "../api/aboutApi";
import type { AboutContent } from "../types/about";
export function useAboutPage() {
  const [data, setData] = useState<AboutContent>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getAbout()
      .then((value) => active && setData(value))
      .catch((reason: Error) => active && setError(reason.message))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);
  return { data, isLoading, error };
}
