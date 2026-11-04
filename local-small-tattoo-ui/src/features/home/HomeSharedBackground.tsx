import type { ReactNode, CSSProperties } from "react";
import { SITE_ASSETS } from "../../config/siteAssets";
export function HomeSharedBackground({ children }: { children: ReactNode }) {
  const style = {
    "--home-photo": 'url("' + SITE_ASSETS.heroHome + '")',
  } as CSSProperties;
  return (
    <>
      <div className="home-shared-background" style={style}>
        <link rel="preload" as="image" href={SITE_ASSETS.heroHome} fetchPriority="high" />
        <div className="home-shared-background__media" aria-hidden="true" />
        {children}
      </div>
      <div className="home-background-seam" aria-hidden="true" />
    </>
  );
}
