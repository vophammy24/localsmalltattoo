import { useEffect, useId, useState } from "react";
import { useLocation } from "react-router";
import { useBusinessSettings } from "../../features/businessSettings/BusinessSettingsContext";
import { BrandLogo } from "./BrandLogo";

const INTRO_SESSION_KEY = "lst-home-intro-viewed";
const INTRO_DURATION = 5_000;

export function WebsiteIntro() {
  const { pathname } = useLocation();
  const { settings } = useBusinessSettings();
  const pathId = useId().replaceAll(":", "");
  const [isVisible, setIsVisible] = useState(
    () => pathname === "/" && sessionStorage.getItem(INTRO_SESSION_KEY) !== "true",
  );

  useEffect(() => {
    if (!isVisible) return;
    sessionStorage.setItem(INTRO_SESSION_KEY, "true");
    document.body.classList.add("website-intro-open");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const close = () => setIsVisible(false);
    const timer = window.setTimeout(close, reducedMotion ? 800 : INTRO_DURATION);
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("website-intro-open");
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const businessName = settings?.businessName || "Local Small Tattoo";
  const orbitText =
    "Local Small Tattoo Danang • Local Small Tattoo Danang • Local Small Tattoo Danang • ";

  return (
    <div className="website-intro" role="status" aria-label={`Opening ${businessName}`}>
      <div className="website-intro__mark">
        <svg className="website-intro__orbit" viewBox="0 0 240 240" aria-hidden="true">
          <defs>
            <path id={pathId} d="M 120,120 m -88,0 a 88,88 0 1,1 176,0 a 88,88 0 1,1 -176,0" />
          </defs>
          <text>
            <textPath href={`#${pathId}`} startOffset="0%">
              {orbitText}
            </textPath>
          </text>
        </svg>
        <div className="website-intro__logo">
          <BrandLogo />
        </div>
      </div>
    </div>
  );
}
