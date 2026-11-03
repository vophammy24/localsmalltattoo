import { useState } from "react";
import { SITE_ASSETS } from "../../config/siteAssets";
import { SITE_CONFIG } from "../../config/siteConfig";
export function BrandLogo() {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span>{SITE_CONFIG.businessName}</span>
  ) : (
    <img
      src={SITE_ASSETS.logo}
      alt={SITE_CONFIG.businessName}
      width={160}
      height={160}
      onError={() => setFailed(true)}
    />
  );
}
