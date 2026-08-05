import { useState } from "react";

const TOUCH_QUERY = "(hover: none), (pointer: coarse)";

export function useTouchActivation() {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  function shouldRunAction(key: string) {
    if (!window.matchMedia(TOUCH_QUERY).matches) return true;
    if (activeKey === key) {
      setActiveKey(null);
      return true;
    }
    setActiveKey(key);
    return false;
  }

  return { activeKey, shouldRunAction, clearTouchActivation: () => setActiveKey(null) };
}
