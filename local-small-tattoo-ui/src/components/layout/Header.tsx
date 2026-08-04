import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { navigationItems } from "../../data/navigation";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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
          <Link className="site-header__brand" to="/" aria-label="Local Small Tattoo home">
            Local Small Tattoo
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
            <p>Fine-line atelier in Da Nang, Vietnam.</p>
            <a href="tel:+84000000000">+84 000 000 000</a>
          </div>
        </div>
      </aside>
    </>
  );
}
