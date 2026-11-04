import { useEffect, useState } from "react";
import { formatRelativeReviewDate } from "../../../utils/formatRelativeReviewDate";
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
export function ReviewDate({ value }: { value: string }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const update = () => tick((n) => n + 1);
    listeners.add(update);
    timer ??= setInterval(() => listeners.forEach((listener) => listener()), 60000);
    return () => {
      listeners.delete(update);
      if (!listeners.size) {
        clearInterval(timer);
        timer = undefined;
      }
    };
  }, []);
  const label = formatRelativeReviewDate(value);
  return label ? <time dateTime={value}>{label}</time> : null;
}
