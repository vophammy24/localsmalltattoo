import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { navigationItems } from "../../data/navigation";
import { useBusinessSettings } from "../../features/businessSettings/BusinessSettingsContext";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useBusinessSettings();

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
          <Link
            className="site-header__brand"
            to="/"
            aria-label={`${settings?.businessName ?? "Local Small Tattoo"} home`}
          >
            {settings?.logo ? (
              <img src={settings.logo.url} alt={settings.logo.alt} />
            ) : (
              settings?.shortName || settings?.businessName || "Local Small Tattoo"
            )}
          </Link>

          <nav className="site-header__desktop-nav" aria-label="Primary navigation">
            {navigationItems
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
            {navigationItems.map((item, index) => (
              <NavLink
                key={item.href}
                className={({ isActive }: { isActive: boolean }) =>
                  `mobile-menu__link${isActive ? " is-active" : ""}`
                }
                end={item.href === "/"}
                tabIndex={isMenuOpen ? 0 : -1}
                to={item.href}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mobile-menu__footer">
            <p>{settings?.description ?? "A private tattoo studio in Da Nang."}</p>
            <a href={`tel:${settings?.contact.phoneNumber.replace(/\s/g, "") ?? ""}`}>
              {settings?.contact.phoneNumber ?? ""}
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
