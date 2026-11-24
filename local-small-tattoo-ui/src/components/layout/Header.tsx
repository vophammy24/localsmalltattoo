import { SITE_CONFIG } from "../../config/siteConfig";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { navigationItems } from "../../data/navigation";
import { BrandLogo } from "../common/BrandLogo";

const headerNavigationItems = navigationItems.flatMap((item) =>
  item.href === "/gallery" ? [item, { label: "Artist", href: "/artists" }] : [item],
);

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const businessName = SITE_CONFIG.businessName;
  const phoneNumber = SITE_CONFIG.contact.phone;
  const phoneHref = `tel:${phoneNumber.replace(/\s/g, "")}`;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.body.classList.toggle("menu-open", isMenuOpen);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner page-shell">
          <div className="site-header__identity">
            <Link className="site-header__brand" to="/" aria-label={`${businessName} home`}>
              <BrandLogo />
            </Link>
            <span className="site-header__brand-name">{businessName}</span>
            <a className="site-header__phone site-header__phone--mobile" href={phoneHref}>
              {phoneNumber}
            </a>
          </div>

          <nav className="site-header__desktop-nav" aria-label="Primary navigation">
            {headerNavigationItems
              .filter((item) => item.href !== "/booking")
              .map((item) => (
                <NavLink
                  key={item.href}
                  className={({ isActive }: { isActive: boolean }) =>
                    `site-header__nav-link${isActive ? " is-active" : ""}`
                  }
                  end={item.href === "/"}
                  to={item.href}
                >
                  {item.label}
                </NavLink>
              ))}
          </nav>

          <a className="site-header__phone site-header__phone--desktop" href={phoneHref}>
            {phoneNumber}
          </a>

          <div className="site-header__actions">
            <button
              className="menu-button"
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <span
                className={`menu-button__icon${isMenuOpen ? " is-open" : ""}`}
                aria-hidden="true"
              >
                <i />
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </header>

      <aside
        id="mobile-navigation"
        className={`mobile-menu${isMenuOpen ? " is-open" : ""}`}
        aria-hidden={!isMenuOpen}
      >
        <div className="mobile-menu__inner page-shell">
          <nav className="mobile-menu__nav" aria-label="Mobile navigation">
            {headerNavigationItems.map((item, index) => (
              <NavLink
                key={item.href}
                className={({ isActive }: { isActive: boolean }) =>
                  `mobile-menu__link${isActive ? " is-active" : ""}`
                }
                end={item.href === "/"}
                tabIndex={isMenuOpen ? 0 : -1}
                to={item.href}
                onClick={item.href === "/artists" ? () => setIsMenuOpen(false) : undefined}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mobile-menu__footer">
            <p>{"A private tattoo studio in Da Nang."}</p>
            <a href={phoneHref}>{phoneNumber}</a>
          </div>
        </div>
      </aside>
    </>
  );
}
